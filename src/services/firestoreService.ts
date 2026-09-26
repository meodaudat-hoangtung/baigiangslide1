import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  where,
  serverTimestamp,
  writeBatch
} from 'firebase/firestore';
import {
  signInWithPopup,
  signOut as fbSignOut,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { db, auth, googleProvider } from './firebase';
import { AppUser, UserRole, UserStatus, MathLesson } from '../types';

// Admin email configured from user metadata
export const SUPER_ADMIN_EMAIL = 'meodau.dat@gmail.com';
export const DEFAULT_ADMIN_PASSWORD = 'Admin@123456';

const USERS_COLLECTION = 'users';
const LESSONS_COLLECTION = 'lessons';
const LESSON_CHUNKS_COLLECTION = 'lesson_chunks';
const DELETED_LESSONS_COLLECTION = 'deleted_lessons';
const CONFIG_COLLECTION = 'app_config';
const ADMIN_CONFIG_DOC = 'admin_auth';
const WORKSPACE_STATE_DOC = 'workspace_state';
const SESSION_KEY = 'toan_active_user_session';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Deep strip undefined fields so Firestore never rejects an object
function cleanFirestoreData<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

const MAX_DOC_CHARS = 650000; // Safe margin below Firestore 1MB limit

async function resolveChunkedLesson(rawData: any): Promise<MathLesson | null> {
  if (!rawData || !rawData.id) return null;
  if (!rawData.isChunked || !rawData.chunkCount) {
    return rawData as MathLesson;
  }
  try {
    const chunkPromises: Promise<any>[] = [];
    for (let i = 0; i < rawData.chunkCount; i++) {
      chunkPromises.push(getDoc(doc(db, LESSON_CHUNKS_COLLECTION, `${rawData.id}_part_${i}`)));
    }
    const chunkSnaps = await Promise.all(chunkPromises);
    let fullJson = '';
    for (const snap of chunkSnaps) {
      if (!snap.exists()) return null;
      fullJson += snap.data()?.data || '';
    }
    return JSON.parse(fullJson) as MathLesson;
  } catch (err) {
    console.warn('Error reassembling chunked lesson:', err);
    return null;
  }
}

export const FirestoreService = {
  // -------------------------------------------------------------
  // Admin Master Password Management
  // -------------------------------------------------------------

  async getAdminPassword(): Promise<string> {
    try {
      const configRef = doc(db, CONFIG_COLLECTION, ADMIN_CONFIG_DOC);
      const snap = await getDoc(configRef);
      if (snap.exists() && snap.data()?.password) {
        return snap.data().password;
      }
      // Initialize default password in Firestore
      await setDoc(configRef, {
        password: DEFAULT_ADMIN_PASSWORD,
        updatedAt: Date.now(),
        updatedBy: 'system'
      }, { merge: true });
      return DEFAULT_ADMIN_PASSWORD;
    } catch (err) {
      console.warn('Error reading admin password from Firestore, fallback to local/default:', err);
      return localStorage.getItem('cached_admin_password') || DEFAULT_ADMIN_PASSWORD;
    }
  },

  async setAdminPassword(newPassword: string): Promise<void> {
    if (!newPassword || newPassword.trim().length < 4) {
      throw new Error('Mật khẩu Quản trị viên phải có ít nhất 4 ký tự.');
    }
    const cleanPw = newPassword.trim();
    const configRef = doc(db, CONFIG_COLLECTION, ADMIN_CONFIG_DOC);
    await setDoc(configRef, {
      password: cleanPw,
      updatedAt: Date.now(),
      updatedBy: 'admin'
    }, { merge: true });
    localStorage.setItem('cached_admin_password', cleanPw);
  },

  subscribeAdminPassword(onUpdate: (password: string) => void) {
    const configRef = doc(db, CONFIG_COLLECTION, ADMIN_CONFIG_DOC);
    return onSnapshot(
      configRef,
      (snap) => {
        if (snap.exists() && snap.data()?.password) {
          const pw = snap.data().password as string;
          try {
            localStorage.setItem('cached_admin_password', pw);
          } catch {}
          onUpdate(pw);
        }
      },
      (err) => {
        console.warn('subscribeAdminPassword error:', err);
      }
    );
  },

  async verifyAdminLogin(passwordInput: string): Promise<AppUser> {
    const currentAdminPassword = await this.getAdminPassword();
    if (passwordInput.trim() !== currentAdminPassword) {
      throw new Error('Mật khẩu Quản trị viên (ADMIN) không chính xác!');
    }

    const adminUser: AppUser = {
      uid: 'admin_master_root',
      email: SUPER_ADMIN_EMAIL,
      username: 'admin',
      displayName: 'Quản Trị (ADMIN)',
      role: 'admin',
      status: 'active',
      createdAt: Date.now(),
      lastLoginAt: Date.now(),
      bio: 'Người quản trị cao nhất của hệ thống'
    };

    localStorage.setItem(SESSION_KEY, JSON.stringify(adminUser));
    return adminUser;
  },

  async verifyMemberLogin(usernameOrEmail: string, passwordInput: string): Promise<AppUser> {
    const cleanIdent = usernameOrEmail.trim().toLowerCase();
    const cleanPw = passwordInput.trim();

    if (!cleanIdent || !cleanPw) {
      throw new Error('Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu.');
    }

    // Query members from Firestore
    const membersSnap = await getDocs(collection(db, USERS_COLLECTION));
    let matchedUser: AppUser | null = null;

    membersSnap.forEach((docSnap) => {
      const u = docSnap.data() as AppUser;
      const uEmail = (u.email || '').trim().toLowerCase();
      const uName = (u.username || '').trim().toLowerCase();

      if (uEmail === cleanIdent || uName === cleanIdent) {
        if (u.password === cleanPw) {
          matchedUser = { ...u, uid: docSnap.id };
        }
      }
    });

    if (!matchedUser) {
      throw new Error('Tên đăng nhập hoặc mật khẩu không chính xác.');
    }

    const user = matchedUser as AppUser;
    if (user.status === 'blocked') {
      throw new Error('Tài khoản của bạn đã bị Quản trị viên tạm khóa. Vui lòng liên hệ Admin để mở khóa.');
    }

    // Update lastLoginAt
    try {
      await updateDoc(doc(db, USERS_COLLECTION, user.uid), {
        lastLoginAt: Date.now()
      });
    } catch {}

    user.lastLoginAt = Date.now();
    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    return user;
  },

  getCurrentSession(): AppUser | null {
    try {
      const saved = localStorage.getItem(SESSION_KEY);
      if (!saved) return null;
      return JSON.parse(saved) as AppUser;
    } catch {
      return null;
    }
  },

  clearSession(): void {
    localStorage.removeItem(SESSION_KEY);
  },

  // Sign in with Google Popup
  async loginWithGoogle(): Promise<AppUser | null> {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const fbUser = result.user;
      const user = await this.syncUserProfile(fbUser);
      localStorage.setItem(SESSION_KEY, JSON.stringify(user));
      return user;
    } catch (error: any) {
      console.error('Firebase login error:', error);
      throw error;
    }
  },

  // Sign out
  async logout(): Promise<void> {
    this.clearSession();
    await fbSignOut(auth).catch(() => {});
  },

  // -------------------------------------------------------------
  // Member Management by Admin
  // -------------------------------------------------------------

  async createMemberAccount(params: {
    username: string;
    password: string;
    email: string;
    phone: string;
    displayName: string;
    role?: UserRole;
    status?: UserStatus;
    notes?: string;
  }): Promise<AppUser> {
    const cleanUsername = params.username.trim().toLowerCase();
    const cleanEmail = params.email.trim().toLowerCase();
    const cleanPhone = params.phone.trim();
    const cleanPw = params.password.trim();
    const cleanName = params.displayName.trim() || 'Thành viên Giáo viên';

    if (!cleanUsername) throw new Error('Vui lòng nhập Tên đăng nhập.');
    if (!cleanPw) throw new Error('Vui lòng nhập Mật khẩu cho thành viên.');
    if (!cleanEmail) throw new Error('Vui lòng nhập Gmail của thành viên.');
    if (!cleanPhone) throw new Error('Vui lòng nhập Số điện thoại của thành viên.');

    // Check if username already exists
    const qUsername = query(collection(db, USERS_COLLECTION), where('username', '==', cleanUsername));
    const existSnap = await getDocs(qUsername);
    if (!existSnap.empty) {
      throw new Error(`Tên đăng nhập "${cleanUsername}" đã tồn tại. Vui lòng chọn tên đăng nhập khác.`);
    }

    const newUid = 'mem_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6);
    const userRef = doc(db, USERS_COLLECTION, newUid);

    const newMember: AppUser = {
      uid: newUid,
      username: cleanUsername,
      password: cleanPw,
      email: cleanEmail,
      phone: cleanPhone,
      displayName: cleanName,
      role: params.role || 'member',
      status: params.status || 'active',
      createdAt: Date.now(),
      lastLoginAt: 0,
      createdBy: 'admin',
      notes: params.notes || '',
      bio: 'Thành viên được cấp tài khoản bởi Quản trị viên'
    };

    await setDoc(userRef, newMember);
    return newMember;
  },

  async updateMemberAccount(uid: string, data: Partial<AppUser>): Promise<void> {
    const userRef = doc(db, USERS_COLLECTION, uid);
    await updateDoc(userRef, {
      ...data,
      updatedAt: Date.now()
    });
  },

  async deleteMember(targetUid: string): Promise<void> {
    const userRef = doc(db, USERS_COLLECTION, targetUid);
    await deleteDoc(userRef);
  },

  async updateMemberRole(targetUid: string, role: UserRole): Promise<void> {
    const userRef = doc(db, USERS_COLLECTION, targetUid);
    await updateDoc(userRef, { role });
  },

  async updateMemberStatus(targetUid: string, status: UserStatus): Promise<void> {
    const userRef = doc(db, USERS_COLLECTION, targetUid);
    await updateDoc(userRef, { status });
  },

  // Sync / create user profile on Firestore
  async syncUserProfile(fbUser: FirebaseUser): Promise<AppUser> {
    const userRef = doc(db, USERS_COLLECTION, fbUser.uid);
    const snap = await getDoc(userRef);

    const isSuperAdmin = fbUser.email?.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase();

    if (snap.exists()) {
      const existing = snap.data() as AppUser;
      const updatedUser: AppUser = {
        ...existing,
        displayName: fbUser.displayName || existing.displayName || 'Giáo viên',
        photoURL: fbUser.photoURL || existing.photoURL || '',
        lastLoginAt: Date.now(),
        // Super admin email is always kept as admin & active
        role: isSuperAdmin ? 'admin' : existing.role,
        status: isSuperAdmin ? 'active' : existing.status,
      };

      await updateDoc(userRef, {
        displayName: updatedUser.displayName,
        photoURL: updatedUser.photoURL,
        lastLoginAt: updatedUser.lastLoginAt,
        role: updatedUser.role,
        status: updatedUser.status,
      }).catch((e) => console.warn('Could not update user doc:', e));

      return updatedUser;
    } else {
      // First time user registration in Firestore
      const newUser: AppUser = {
        uid: fbUser.uid,
        email: fbUser.email || '',
        displayName: fbUser.displayName || 'Giáo viên Toán',
        photoURL: fbUser.photoURL || '',
        role: isSuperAdmin ? 'admin' : 'member',
        status: isSuperAdmin ? 'active' : 'active', // default to active member
        createdAt: Date.now(),
        lastLoginAt: Date.now(),
        schoolName: '',
        bio: 'Giáo viên bộ môn Toán'
      };

      await setDoc(userRef, newUser);
      return newUser;
    }
  },

  // Listen to Auth State changes & fetch Firestore user profile
  onUserAuthChange(callback: (user: AppUser | null, loading: boolean) => void) {
    return onAuthStateChanged(auth, async (fbUser) => {
      if (!fbUser) {
        callback(null, false);
        return;
      }
      try {
        const userRef = doc(db, USERS_COLLECTION, fbUser.uid);
        const snap = await getDoc(userRef);
        if (snap.exists()) {
          const user = snap.data() as AppUser;
          // Verify super admin role guarantee
          if (fbUser.email?.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase() && user.role !== 'admin') {
            user.role = 'admin';
            user.status = 'active';
            await updateDoc(userRef, { role: 'admin', status: 'active' }).catch(() => {});
          }
          callback(user, false);
        } else {
          const synced = await this.syncUserProfile(fbUser);
          callback(synced, false);
        }
      } catch (err) {
        console.error('Error fetching user profile:', err);
        // Fallback user object if firestore fails
        const fallbackUser: AppUser = {
          uid: fbUser.uid,
          email: fbUser.email || '',
          displayName: fbUser.displayName || 'Giáo viên',
          photoURL: fbUser.photoURL || '',
          role: fbUser.email?.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase() ? 'admin' : 'member',
          status: 'active',
          createdAt: Date.now(),
          lastLoginAt: Date.now()
        };
        callback(fallbackUser, false);
      }
    });
  },

  // Realtime subscription for all members (Admin only)
  subscribeMembers(onUpdate: (users: AppUser[]) => void) {
    const q = query(collection(db, USERS_COLLECTION), orderBy('lastLoginAt', 'desc'));
    return onSnapshot(q, (snapshot) => {
      const list: AppUser[] = [];
      snapshot.forEach((d) => {
        list.push(d.data() as AppUser);
      });
      onUpdate(list);
    }, (err) => {
      console.warn('subscribeMembers snapshot error:', err);
    });
  },

  // Realtime subscription for a specific logged-in user document
  subscribeUserDoc(uid: string, onUpdate: (user: AppUser | null, isDeleted: boolean) => void) {
    if (!uid || uid === 'admin_master_root') {
      return () => {};
    }
    const userRef = doc(db, USERS_COLLECTION, uid);
    return onSnapshot(
      userRef,
      (snap) => {
        if (!snap.exists()) {
          onUpdate(null, true);
          return;
        }
        const data = snap.data() as AppUser;
        onUpdate({ ...data, uid: snap.id }, false);
      },
      (err) => {
        console.warn('subscribeUserDoc error:', err);
      }
    );
  },

  // Add new member manually by email (pre-approved)
  async addManualMember(email: string, displayName: string, role: UserRole = 'member'): Promise<void> {
    const tempUid = 'pre_' + Math.random().toString(36).substring(2, 10);
    const userRef = doc(db, USERS_COLLECTION, tempUid);
    const newMember: AppUser = {
      uid: tempUid,
      email: email.trim().toLowerCase(),
      displayName: displayName.trim() || 'Thành viên mới',
      role,
      status: 'active',
      createdAt: Date.now(),
      lastLoginAt: 0,
      bio: 'Thành viên được chỉ định bởi Quản trị viên'
    };
    await setDoc(userRef, newMember);
  },


  // -------------------------------------------------------------
  // Lesson & Global Workspace Real-Time Synchronization
  // -------------------------------------------------------------

  // Listen to lessons live from Firestore (across all tabs, incognito, devices & locations)
  subscribeLessons(onUpdate: (lessons: MathLesson[], removedIds: string[]) => void) {
    const q = query(collection(db, LESSONS_COLLECTION), orderBy('updatedAt', 'desc'));
    return onSnapshot(
      q,
      async (snapshot) => {
        const removedIds: string[] = [];
        snapshot.docChanges().forEach((change) => {
          if (change.type === 'removed' && change.doc.id) {
            removedIds.push(change.doc.id);
          }
        });
        const rawDocs: any[] = [];
        snapshot.forEach((d) => {
          rawDocs.push(d.data());
        });
        const resolved = await Promise.all(rawDocs.map((r) => resolveChunkedLesson(r)));
        const validList = resolved.filter((l): l is MathLesson => l !== null && !!l.id);
        onUpdate(validList, removedIds);
      },
      (err) => {
        console.warn('subscribeLessons error:', err);
      }
    );
  },

  // Listen to deleted lesson tombstones in real time
  subscribeDeletedLessons(onUpdate: (deletedIds: string[]) => void) {
    return onSnapshot(
      collection(db, DELETED_LESSONS_COLLECTION),
      (snapshot) => {
        const ids: string[] = [];
        snapshot.forEach((d) => {
          if (d.id) ids.push(d.id);
        });
        onUpdate(ids);
      },
      (err) => {
        console.warn('subscribeDeletedLessons error:', err);
      }
    );
  },

  // Fetch all deleted lesson IDs from Firestore
  async fetchDeletedLessonsFromFirestore(): Promise<string[]> {
    try {
      const snap = await getDocs(collection(db, DELETED_LESSONS_COLLECTION));
      const ids: string[] = [];
      snap.forEach((d) => {
        if (d.id) ids.push(d.id);
      });
      return ids;
    } catch (err) {
      console.warn('fetchDeletedLessonsFromFirestore error:', err);
      return [];
    }
  },

  // Save lesson to Firestore (with automatic chunking if > 650KB)
  async saveLessonToFirestore(lesson: MathLesson): Promise<void> {
    const cleanLesson = cleanFirestoreData(lesson);
    const serialized = JSON.stringify(cleanLesson);
    const lessonRef = doc(db, LESSONS_COLLECTION, cleanLesson.id);

    if (serialized.length <= MAX_DOC_CHARS) {
      await setDoc(lessonRef, { ...cleanLesson, isChunked: false, chunkCount: 0 });
    } else {
      const chunks: string[] = [];
      for (let i = 0; i < serialized.length; i += MAX_DOC_CHARS) {
        chunks.push(serialized.slice(i, i + MAX_DOC_CHARS));
      }
      const batch = writeBatch(db);
      chunks.forEach((chunkStr, idx) => {
        const chunkRef = doc(db, LESSON_CHUNKS_COLLECTION, `${cleanLesson.id}_part_${idx}`);
        batch.set(chunkRef, {
          lessonId: cleanLesson.id,
          index: idx,
          data: chunkStr,
          updatedAt: cleanLesson.updatedAt || Date.now(),
        });
      });
      batch.set(lessonRef, {
        id: cleanLesson.id,
        title: cleanLesson.title,
        grade: cleanLesson.grade,
        chapter: cleanLesson.chapter,
        createdAt: cleanLesson.createdAt || Date.now(),
        updatedAt: cleanLesson.updatedAt || Date.now(),
        slides: [],
        questions: [],
        isChunked: true,
        chunkCount: chunks.length,
      });
      await batch.commit();
    }

    // Remove tombstone if exists (only when explicitly created/saved)
    try {
      const tombstoneRef = doc(db, DELETED_LESSONS_COLLECTION, cleanLesson.id);
      await deleteDoc(tombstoneRef);
    } catch {}
  },

  // Delete lesson permanently from Firestore & record permanent tombstone
  async deleteLessonFromFirestore(lessonId: string): Promise<void> {
    // 1. Record permanent tombstone FIRST so all listeners immediately know it's deleted
    const tombstoneRef = doc(db, DELETED_LESSONS_COLLECTION, lessonId);
    await setDoc(tombstoneRef, { deletedAt: Date.now(), id: lessonId });

    // 2. Delete main lesson document
    const lessonRef = doc(db, LESSONS_COLLECTION, lessonId);
    try {
      const snap = await getDoc(lessonRef);
      if (snap.exists() && snap.data()?.chunkCount) {
        const count = snap.data().chunkCount as number;
        for (let i = 0; i < count; i++) {
          await deleteDoc(doc(db, LESSON_CHUNKS_COLLECTION, `${lessonId}_part_${i}`)).catch(() => {});
        }
      }
    } catch {}
    await deleteDoc(lessonRef);
  },

  // Fetch all lessons from Firestore
  async fetchLessonsFromFirestore(): Promise<MathLesson[]> {
    const q = query(collection(db, LESSONS_COLLECTION), orderBy('updatedAt', 'desc'));
    const snap = await getDocs(q);
    const rawDocs: any[] = [];
    snap.forEach((d) => {
      rawDocs.push(d.data());
    });
    const resolved = await Promise.all(rawDocs.map((r) => resolveChunkedLesson(r)));
    return resolved.filter((l): l is MathLesson => l !== null && !!l.id);
  },

  // Save global workspace state (active lesson, active tab, slide index, zoom, seed status)
  async saveWorkspaceState(state: {
    activeLessonId?: string;
    activeTab?: 'slides' | 'questions' | 'library';
    activeSlideIndex?: number;
    zoomLevel?: number;
    isSeeded?: boolean;
    updatedAt?: number;
  }): Promise<void> {
    try {
      const ref = doc(db, CONFIG_COLLECTION, WORKSPACE_STATE_DOC);
      await setDoc(
        ref,
        cleanFirestoreData({
          ...state,
          updatedAt: state.updatedAt || Date.now(),
        }),
        { merge: true }
      );
    } catch (err) {
      console.warn('saveWorkspaceState error:', err);
    }
  },

  async getWorkspaceState(): Promise<{
    activeLessonId?: string;
    activeTab?: 'slides' | 'questions' | 'library';
    activeSlideIndex?: number;
    zoomLevel?: number;
    isSeeded?: boolean;
    updatedAt?: number;
  } | null> {
    try {
      const ref = doc(db, CONFIG_COLLECTION, WORKSPACE_STATE_DOC);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        return snap.data() as any;
      }
      return null;
    } catch {
      return null;
    }
  },

  subscribeWorkspaceState(
    onUpdate: (state: {
      activeLessonId?: string;
      activeTab?: 'slides' | 'questions' | 'library';
      activeSlideIndex?: number;
      zoomLevel?: number;
      isSeeded?: boolean;
      updatedAt?: number;
    }) => void
  ) {
    const ref = doc(db, CONFIG_COLLECTION, WORKSPACE_STATE_DOC);
    return onSnapshot(
      ref,
      (snap) => {
        if (snap.exists()) {
          onUpdate(snap.data() as any);
        }
      },
      (err) => {
        console.warn('subscribeWorkspaceState error:', err);
      }
    );
  },
};
