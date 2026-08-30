import { MathLesson } from '../types';
import { SAMPLE_LESSONS } from '../data/sampleLessons';

const DB_NAME = 'bai_giang_toan_db';
const DB_VERSION = 1;
const STORE_NAME = 'lessons_store';
const LOCAL_STORAGE_KEY = 'mathslide_lessons_v2';
const INITIALIZED_KEY = 'mathslide_initialized_v2';
const DELETED_IDS_KEY = 'mathslide_deleted_lesson_ids_v2';

// Helper to get deleted lesson IDs
export function getDeletedLessonIds(): Set<string> {
  try {
    const raw = localStorage.getItem(DELETED_IDS_KEY);
    if (raw) {
      const arr = JSON.parse(raw);
      if (Array.isArray(arr)) {
        return new Set(arr);
      }
    }
  } catch {}
  return new Set();
}

// Helper to record a deleted lesson ID
export function recordDeletedLessonId(id: string) {
  const set = getDeletedLessonIds();
  set.add(id);
  try {
    localStorage.setItem(DELETED_IDS_KEY, JSON.stringify(Array.from(set)));
  } catch {}
}

// Helper to un-record a deleted lesson ID when recreated
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

// Master Storage Service
export const StorageService = {
  // Load initial lessons with multi-tier fallback: Server -> IndexedDB -> localStorage -> Samples
  async loadAllLessons(): Promise<{ lessons: MathLesson[]; source: 'server' | 'indexedDB' | 'localStorage' | 'default' }> {
    const deletedIds = getDeletedLessonIds();

    // 1. Check if user already has local IndexedDB or LocalStorage
    let localData: MathLesson[] = [];
    try {
      const idbList = await getLessonsFromIndexedDB();
      if (Array.isArray(idbList) && idbList.length > 0) {
        localData = idbList.filter((l) => !deletedIds.has(l.id));
      }
    } catch {}

    if (localData.length === 0) {
      try {
        const localStr = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (localStr) {
          const parsed = JSON.parse(localStr);
          if (Array.isArray(parsed) && parsed.length > 0) {
            localData = parsed.filter((l) => !deletedIds.has(l.id));
          }
        }
      } catch {}
    }

    const isUserInitialized = localStorage.getItem(INITIALIZED_KEY) === 'true';

    // 2. Try fetching from server
    try {
      const res = await fetch('/api/sync-load-lessons');
      if (res.ok) {
        const data = await res.json();
        const serverLessonsList: MathLesson[] = Array.isArray(data) ? data : (data.lessons || []);
        const serverDeletedIds: string[] = Array.isArray(data.deletedIds) ? data.deletedIds : [];
        
        // Sync server deleted ids to local deleted ids
        serverDeletedIds.forEach((id) => {
          deletedIds.add(id);
          recordDeletedLessonId(id);
        });

        const activeServerLessons = serverLessonsList.filter((l) => !deletedIds.has(l.id));

        // If the user has already initialized the app before, respect their deletions and local edits
        if (isUserInitialized) {
          const localMap = new Map(localData.map((l) => [l.id, l]));
          const serverMap = new Map(activeServerLessons.map((l) => [l.id, l]));
          const mergedMap = new Map<string, MathLesson>();

          // Add active local items (prefer server if server is strictly newer)
          localMap.forEach((lVal, key) => {
            if (!deletedIds.has(key)) {
              const sVal = serverMap.get(key);
              if (sVal && (sVal.updatedAt || 0) > (lVal.updatedAt || 0)) {
                mergedMap.set(key, sVal);
              } else {
                mergedMap.set(key, lVal);
              }
            }
          });

          // Also bring in any brand new server lessons not present locally (unless deleted)
          serverMap.forEach((sVal, key) => {
            if (!localMap.has(key) && !deletedIds.has(key)) {
              mergedMap.set(key, sVal);
            }
          });

          const mergedList = Array.from(mergedMap.values()).sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
          await saveAllLessonsToIndexedDB(mergedList);
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(mergedList));
          return { lessons: mergedList, source: 'server' };
        }

        // First time initialization
        if (activeServerLessons.length > 0) {
          await saveAllLessonsToIndexedDB(activeServerLessons);
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(activeServerLessons));
          localStorage.setItem(INITIALIZED_KEY, 'true');
          return { lessons: activeServerLessons, source: 'server' };
        }
      }
    } catch (err) {
      console.warn('Cannot reach cloud server (offline mode):', err);
    }

    // 3. If server was unreachable, use localData if available
    if (localData.length > 0) {
      return { lessons: localData, source: 'indexedDB' };
    }

    // If already initialized and user deleted all lessons, keep it empty
    if (isUserInitialized) {
      return { lessons: [], source: 'indexedDB' };
    }

    // 4. Default Seed on first visit
    const initialSeed = SAMPLE_LESSONS.filter((l) => !deletedIds.has(l.id));
    await saveAllLessonsToIndexedDB(initialSeed);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(initialSeed));
    localStorage.setItem(INITIALIZED_KEY, 'true');
    return { lessons: initialSeed, source: 'default' };
  },

  // Save single lesson to local and sync to cloud
  async saveLesson(lesson: MathLesson, allLessons: MathLesson[]): Promise<{ isSynced: boolean }> {
    unrecordDeletedLessonId(lesson.id);

    const updatedLesson = {
      ...lesson,
      updatedAt: Date.now(),
    };

    // Update list
    const idx = allLessons.findIndex((l) => l.id === updatedLesson.id);
    let nextLessons: MathLesson[];
    if (idx >= 0) {
      nextLessons = [...allLessons];
      nextLessons[idx] = updatedLesson;
    } else {
      nextLessons = [updatedLesson, ...allLessons];
    }

    // 1. Immediately persist locally (IndexedDB + localStorage)
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(nextLessons));
      localStorage.setItem(INITIALIZED_KEY, 'true');
      await saveLessonToIndexedDB(updatedLesson);
    } catch (err) {
      console.error('Local save error:', err);
    }

    // 2. Sync with cloud backend
    let isSynced = false;
    try {
      const res = await fetch('/api/sync-save-lesson', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedLesson),
      });
      if (res.ok) {
        isSynced = true;
      }
    } catch (err) {
      console.warn('Offline: Saved locally, will sync when online', err);
      isSynced = false;
    }

    return { isSynced };
  },

  // Delete lesson permanently
  async deleteLesson(lessonId: string, remainingLessons: MathLesson[]): Promise<void> {
    // 1. Mark as deleted in tombstone registry
    recordDeletedLessonId(lessonId);

    // 2. Update local state immediately
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(remainingLessons));
      localStorage.setItem(INITIALIZED_KEY, 'true');
      await saveAllLessonsToIndexedDB(remainingLessons);
      await deleteLessonFromIndexedDB(lessonId);
    } catch (err) {
      console.error('Error deleting locally:', err);
    }

    // 3. Sync deletion to server
    try {
      await fetch(`/api/sync-delete-lesson/${lessonId}`, { method: 'DELETE' });
    } catch (err) {
      console.warn('Offline: Deleted locally, server will sync later', err);
    }
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
    
    // Clear tombstone for imported lessons
    parsed.forEach((l: MathLesson) => {
      if (l && l.id) {
        unrecordDeletedLessonId(l.id);
      }
    });

    await saveAllLessonsToIndexedDB(parsed);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(parsed));
    localStorage.setItem(INITIALIZED_KEY, 'true');
    
    // Sync all to server
    for (const lesson of parsed) {
      try {
        await fetch('/api/sync-save-lesson', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(lesson),
        });
      } catch {}
    }

    return parsed;
  },
};
