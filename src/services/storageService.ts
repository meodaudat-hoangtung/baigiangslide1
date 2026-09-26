import { MathLesson } from '../types';
import { SAMPLE_LESSONS } from '../data/sampleLessons';
import { FirestoreService } from './firestoreService';

const DB_NAME = 'bai_giang_toan_db';
const DB_VERSION = 1;
const STORE_NAME = 'lessons_store';
const LOCAL_STORAGE_KEY = 'mathslide_lessons_v2';
const LEGACY_LOCAL_STORAGE_KEY = 'mathslide_lessons_v1';
const INITIALIZED_KEY = 'mathslide_initialized_v2';
const DELETED_IDS_KEY = 'mathslide_deleted_lesson_ids_v2';
const LEGACY_DELETED_IDS_KEY = 'mathslide_deleted_lesson_ids_v1';
const WORKSPACE_STATE_KEY = 'mathslide_workspace_state_v2';

// Cross-tab instant broadcast channel
const syncChannel: BroadcastChannel | null =
  typeof window !== 'undefined' && 'BroadcastChannel' in window
    ? new BroadcastChannel('mathslide_realtime_sync_v3')
    : null;

export function subscribeLocalBroadcast(
  onEvent: (event: { type: string; payload: any; timestamp: number }) => void
): () => void {
  if (!syncChannel) return () => {};
  const handler = (e: MessageEvent) => {
    if (e.data && e.data.type) {
      onEvent(e.data);
    }
  };
  syncChannel.addEventListener('message', handler);
  return () => syncChannel.removeEventListener('message', handler);
}

export function emitLocalBroadcast(type: string, payload: any) {
  try {
    syncChannel?.postMessage({ type, payload, timestamp: Date.now() });
  } catch {}
}

// Helper to get deleted lesson IDs (unifies v2 and legacy v1 tombstones)
export function getDeletedLessonIds(): Set<string> {
  const result = new Set<string>();
  try {
    const rawV2 = localStorage.getItem(DELETED_IDS_KEY);
    if (rawV2) {
      const arr = JSON.parse(rawV2);
      if (Array.isArray(arr)) arr.forEach((id) => id && result.add(id));
    }
    const rawV1 = localStorage.getItem(LEGACY_DELETED_IDS_KEY);
    if (rawV1) {
      const arr1 = JSON.parse(rawV1);
      if (Array.isArray(arr1)) arr1.forEach((id) => id && result.add(id));
    }
  } catch {}
  return result;
}

// Helper to record a deleted lesson ID
export function recordDeletedLessonId(id: string) {
  const set = getDeletedLessonIds();
  set.add(id);
  try {
    localStorage.setItem(DELETED_IDS_KEY, JSON.stringify(Array.from(set)));
  } catch {}
}

// Helper to un-record a deleted lesson ID when explicitly recreated
export function unrecordDeletedLessonId(id: string) {
  const set = getDeletedLessonIds();
  if (set.has(id)) {
    set.delete(id);
    try {
      localStorage.setItem(DELETED_IDS_KEY, JSON.stringify(Array.from(set)));
    } catch {}
  }
}

// Native IndexedDB helper for maximum reliability & zero external dependencies
function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB is not supported in this browser'));
      return;
    }
    const request = window.indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = (event: any) => {
      const db = event.target.result as IDBDatabase;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// Get all lessons from IndexedDB
export async function getLessonsFromIndexedDB(): Promise<MathLesson[]> {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.getAll();
      req.onsuccess = () => {
        const results = req.result as MathLesson[];
        resolve(Array.isArray(results) ? results : []);
      };
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('IndexedDB read failed, fallback to localStorage:', err);
    return [];
  }
}

// Save a lesson to IndexedDB
export async function saveLessonToIndexedDB(lesson: MathLesson): Promise<void> {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.put(lesson);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('IndexedDB write failed:', err);
  }
}

// Delete a lesson from IndexedDB
export async function deleteLessonFromIndexedDB(lessonId: string): Promise<void> {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.delete(lessonId);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('IndexedDB delete failed:', err);
  }
}

// Save all lessons to IndexedDB
export async function saveAllLessonsToIndexedDB(lessons: MathLesson[]): Promise<void> {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      store.clear();
      lessons.forEach((l) => store.put(l));
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.warn('IndexedDB bulk write failed:', err);
  }
}

// Master Storage Service - Cloud Authoritative (Firestore + Express Server)
export const StorageService = {
  // Load initial lessons & global workspace state from authoritative Cloud (Firestore + Server)
  async loadAllLessons(): Promise<{
    lessons: MathLesson[];
    activeLessonId?: string;
    activeTab?: 'slides' | 'questions' | 'library';
    activeSlideIndex?: number;
    zoomLevel?: number;
    source: 'cloud' | 'indexedDB' | 'localStorage' | 'default';
  }> {
    const globalDeletedIds = getDeletedLessonIds();

    // 1. Query Firestore, Express Server, and Local IndexedDB in parallel for 100% cross-device, cross-tab consistency
    const [
      serverResult,
      firestoreLessonsResult,
      firestoreDeletedResult,
      firestoreWorkspaceResult,
      idbLessonsResult,
    ] = await Promise.allSettled([
      fetch('/api/sync-load-lessons').then(async (r) => (r.ok ? r.json() : null)),
      FirestoreService.fetchLessonsFromFirestore(),
      FirestoreService.fetchDeletedLessonsFromFirestore(),
      FirestoreService.getWorkspaceState(),
      getLessonsFromIndexedDB(),
    ]);

    let cloudReached = false;
    let serverLessons: MathLesson[] = [];
    let serverDeletedIds: string[] = [];
    let serverWorkspaceState: {
      activeLessonId?: string;
      activeTab?: 'slides' | 'questions' | 'library';
      activeSlideIndex?: number;
      zoomLevel?: number;
      updatedAt?: number;
    } | null = null;

    if (serverResult.status === 'fulfilled' && serverResult.value) {
      cloudReached = true;
      const data = serverResult.value;
      serverLessons = Array.isArray(data) ? data : data.lessons || [];
      serverDeletedIds = Array.isArray(data.deletedIds) ? data.deletedIds : [];
      if (data.workspaceState) {
        serverWorkspaceState = data.workspaceState;
      }
    }

    let firestoreLessons: MathLesson[] = [];
    if (firestoreLessonsResult.status === 'fulfilled') {
      cloudReached = true;
      firestoreLessons = firestoreLessonsResult.value || [];
    }

    let firestoreDeletedIds: string[] = [];
    if (firestoreDeletedResult.status === 'fulfilled') {
      firestoreDeletedIds = firestoreDeletedResult.value || [];
    }

    let firestoreWorkspaceState: {
      activeLessonId?: string;
      activeTab?: 'slides' | 'questions' | 'library';
      activeSlideIndex?: number;
      zoomLevel?: number;
      isSeeded?: boolean;
      updatedAt?: number;
    } | null = null;
    if (firestoreWorkspaceResult.status === 'fulfilled' && firestoreWorkspaceResult.value) {
      firestoreWorkspaceState = firestoreWorkspaceResult.value;
    }

    // 2. Unify all deleted lesson tombstones across Server, Firestore, and Local
    serverDeletedIds.forEach((id) => {
      globalDeletedIds.add(id);
      recordDeletedLessonId(id);
    });
    firestoreDeletedIds.forEach((id) => {
      globalDeletedIds.add(id);
      recordDeletedLessonId(id);
    });

    // Ensure Server, Firestore, and Local IndexedDB have identical tombstone sets
    if (globalDeletedIds.size > 0) {
      const allDeletedArray = Array.from(globalDeletedIds);
      fetch('/api/sync-deleted-ids', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deletedIds: allDeletedArray }),
      }).catch(() => {});

      const fsDeletedSet = new Set(firestoreDeletedIds);
      allDeletedArray.forEach((delId) => {
        if (!fsDeletedSet.has(delId)) {
          FirestoreService.deleteLessonFromFirestore(delId).catch(() => {});
        }
        deleteLessonFromIndexedDB(delId).catch(() => {});
      });
    }

    // 3. If Cloud (Firestore or Server) was reached, merge authoritatively by newest updatedAt
    if (cloudReached) {
      const mergedMap = new Map<string, MathLesson>();
      const fsMap = new Map<string, MathLesson>();
      const srvMap = new Map<string, MathLesson>();

      firestoreLessons.forEach((l) => {
        if (l && l.id && !globalDeletedIds.has(l.id)) {
          fsMap.set(l.id, l);
          mergedMap.set(l.id, l);
        } else if (l && l.id && globalDeletedIds.has(l.id)) {
          // Purge any lingering deleted doc in Firestore
          FirestoreService.deleteLessonFromFirestore(l.id).catch(() => {});
        }
      });

      serverLessons.forEach((sVal) => {
        if (sVal && sVal.id && !globalDeletedIds.has(sVal.id)) {
          srvMap.set(sVal.id, sVal);
          const existingFs = mergedMap.get(sVal.id);
          if (!existingFs || (sVal.updatedAt || 0) > (existingFs.updatedAt || 0)) {
            mergedMap.set(sVal.id, sVal);
          }
        }
      });

      // Also inspect local IndexedDB / localStorage for any user-created/edited lessons (> 1700000000000) not yet pushed to Cloud
      const localCandidates: MathLesson[] = [];
      if (idbLessonsResult.status === 'fulfilled' && Array.isArray(idbLessonsResult.value)) {
        localCandidates.push(...idbLessonsResult.value);
      }
      try {
        const lsV2 = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (lsV2) {
          const parsedV2 = JSON.parse(lsV2);
          if (Array.isArray(parsedV2)) localCandidates.push(...parsedV2);
        }
        const lsV1 = localStorage.getItem(LEGACY_LOCAL_STORAGE_KEY);
        if (lsV1) {
          const parsedV1 = JSON.parse(lsV1);
          if (Array.isArray(parsedV1)) localCandidates.push(...parsedV1);
        }
      } catch {}

      localCandidates.forEach((locVal) => {
        if (
          locVal &&
          locVal.id &&
          !globalDeletedIds.has(locVal.id) &&
          (locVal.updatedAt || 0) > 1700000000000
        ) {
          const existing = mergedMap.get(locVal.id);
          if (!existing || (locVal.updatedAt || 0) > (existing.updatedAt || 0)) {
            mergedMap.set(locVal.id, locVal);
          }
        }
      });

      // Reconcile differences between Firestore and Express Server in background so all tiers are 100% identical
      mergedMap.forEach((authoritativeLesson, id) => {
        const fsLesson = fsMap.get(id);
        const srvLesson = srvMap.get(id);

        if (!fsLesson || (authoritativeLesson.updatedAt || 0) > (fsLesson.updatedAt || 0)) {
          FirestoreService.saveLessonToFirestore(authoritativeLesson).catch(() => {});
        }
        if (!srvLesson || (authoritativeLesson.updatedAt || 0) > (srvLesson.updatedAt || 0)) {
          fetch('/api/sync-save-lesson?reconcile=true', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(authoritativeLesson),
          }).catch(() => {});
        }
      });

      const mergedList = Array.from(mergedMap.values()).sort(
        (a, b) => (b.updatedAt || 0) - (a.updatedAt || 0)
      );

      // Update local caches to strictly mirror the authoritative cloud state
      try {
        await saveAllLessonsToIndexedDB(mergedList);
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(mergedList));
        localStorage.setItem(INITIALIZED_KEY, 'true');
      } catch {}

      // Determine authoritative workspace state across Firestore & Server
      const fsWsTime = firestoreWorkspaceState?.updatedAt || 0;
      const srvWsTime = serverWorkspaceState?.updatedAt || 0;
      const authWs = fsWsTime >= srvWsTime ? firestoreWorkspaceState : serverWorkspaceState;

      let activeLessonId = authWs?.activeLessonId;
      if (activeLessonId && globalDeletedIds.has(activeLessonId)) {
        activeLessonId = undefined;
      }

      return {
        lessons: mergedList,
        activeLessonId,
        activeTab: authWs?.activeTab,
        activeSlideIndex: authWs?.activeSlideIndex,
        zoomLevel: authWs?.zoomLevel,
        source: 'cloud',
      };
    }

    // 4. Offline Fallback ONLY when both Firestore and Server are unreachable
    let localData: MathLesson[] = [];
    try {
      const idbList = await getLessonsFromIndexedDB();
      if (Array.isArray(idbList) && idbList.length > 0) {
        localData = idbList.filter((l) => !globalDeletedIds.has(l.id));
      }
    } catch {}

    if (localData.length === 0) {
      try {
        const localStr = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (localStr) {
          const parsed = JSON.parse(localStr);
          if (Array.isArray(parsed) && parsed.length > 0) {
            localData = parsed.filter((l) => !globalDeletedIds.has(l.id));
          }
        }
      } catch {}
    }

    if (localData.length > 0) {
      return { lessons: localData, source: 'indexedDB' };
    }

    const isUserInitialized = localStorage.getItem(INITIALIZED_KEY) === 'true';
    if (isUserInitialized) {
      return { lessons: [], source: 'indexedDB' };
    }

    const initialSeed = SAMPLE_LESSONS.filter((l) => !globalDeletedIds.has(l.id));
    await saveAllLessonsToIndexedDB(initialSeed);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(initialSeed));
    localStorage.setItem(INITIALIZED_KEY, 'true');
    return { lessons: initialSeed, source: 'default' };
  },

  // Save single lesson to local and immediately sync to all cloud & real-time channels
  async saveLesson(lesson: MathLesson, allLessons: MathLesson[]): Promise<{ isSynced: boolean }> {
    unrecordDeletedLessonId(lesson.id);

    const updatedLesson: MathLesson = {
      ...lesson,
      updatedAt: Date.now(),
    };

    const idx = allLessons.findIndex((l) => l.id === updatedLesson.id);
    let nextLessons: MathLesson[];
    if (idx >= 0) {
      nextLessons = [...allLessons];
      nextLessons[idx] = updatedLesson;
    } else {
      nextLessons = [updatedLesson, ...allLessons];
    }

    // 1. Immediately persist locally & broadcast to other tabs on same browser
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(nextLessons));
      localStorage.setItem(INITIALIZED_KEY, 'true');
      emitLocalBroadcast('lesson:saved', updatedLesson);
      await saveLessonToIndexedDB(updatedLesson);
    } catch (err) {
      console.error('Local save error:', err);
    }

    // 2. Sync with both Express Server & Firebase Firestore in parallel
    let isSynced = false;
    try {
      const [serverRes, fsRes] = await Promise.allSettled([
        fetch('/api/sync-save-lesson', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedLesson),
        }),
        FirestoreService.saveLessonToFirestore(updatedLesson),
      ]);

      if (
        (serverRes.status === 'fulfilled' && serverRes.value.ok) ||
        fsRes.status === 'fulfilled'
      ) {
        isSynced = true;
      }
    } catch (err) {
      console.warn('Offline: Saved locally, will sync when online', err);
      isSynced = false;
    }

    return { isSynced };
  },

  // Delete lesson permanently & irreversibly across all storage tiers, tabs, and devices
  async deleteLesson(lessonId: string, remainingLessons: MathLesson[]): Promise<void> {
    // 1. Mark as permanently deleted in tombstone registry
    recordDeletedLessonId(lessonId);
    emitLocalBroadcast('lesson:deleted', { id: lessonId });

    // 2. Update local state immediately
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(remainingLessons));
      localStorage.setItem(INITIALIZED_KEY, 'true');
      await deleteLessonFromIndexedDB(lessonId);
      await saveAllLessonsToIndexedDB(remainingLessons);
    } catch (err) {
      console.error('Error deleting locally:', err);
    }

    // 3. Permanently delete from both Express Server & Firebase Firestore
    try {
      await Promise.allSettled([
        fetch(`/api/sync-delete-lesson/${lessonId}`, { method: 'DELETE' }),
        FirestoreService.deleteLessonFromFirestore(lessonId),
      ]);
    } catch (err) {
      console.warn('Offline: Deleted locally, server will sync later', err);
    }
  },

  // Sync active workspace state (selected lesson, activeTab, slideIndex, zoomLevel) across all devices & tabs
  async syncWorkspaceState(state: {
    activeLessonId?: string;
    activeTab?: 'slides' | 'questions' | 'library';
    activeSlideIndex?: number;
    zoomLevel?: number;
  }) {
    let existing: any = {};
    try {
      const raw = localStorage.getItem(WORKSPACE_STATE_KEY);
      if (raw) existing = JSON.parse(raw) || {};
    } catch {}
    const payload = {
      ...existing,
      ...state,
      updatedAt: Date.now(),
    };
    try {
      localStorage.setItem(WORKSPACE_STATE_KEY, JSON.stringify(payload));
    } catch {}
    emitLocalBroadcast('workspace:updated', payload);
    await Promise.allSettled([
      fetch('/api/workspace-state', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }),
      FirestoreService.saveWorkspaceState(payload),
    ]);
  },

  // Export full database backup as JSON
  exportBackup(lessons: MathLesson[]) {
    const dataStr = JSON.stringify(lessons, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `BaiGiangToanTHPT_Backup_${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  },

  // Import JSON backup
  async importBackup(jsonString: string): Promise<MathLesson[]> {
    const parsed = JSON.parse(jsonString);
    if (!Array.isArray(parsed)) {
      throw new Error('Định dạng tệp sao lưu không hợp lệ (cần danh sách bài giảng JSON)');
    }

    const now = Date.now();
    const stamped = parsed.map((l: MathLesson, idx: number) => {
      if (l && l.id) {
        unrecordDeletedLessonId(l.id);
      }
      return {
        ...l,
        updatedAt: now - idx,
      };
    });

    await saveAllLessonsToIndexedDB(stamped);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(stamped));
    localStorage.setItem(INITIALIZED_KEY, 'true');

    await Promise.allSettled(
      stamped.map((lesson) =>
        Promise.allSettled([
          fetch('/api/sync-save-lesson', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(lesson),
          }),
          FirestoreService.saveLessonToFirestore(lesson),
        ])
      )
    );

    return stamped;
  },
};
