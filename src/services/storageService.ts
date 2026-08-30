import { MathLesson } from '../types';
import { SAMPLE_LESSONS } from '../data/sampleLessons';

const DB_NAME = 'bai_giang_toan_db';
const DB_VERSION = 1;
const STORE_NAME = 'lessons_store';
const LOCAL_STORAGE_KEY = 'mathslide_lessons_v2';
const INITIALIZED_KEY = 'mathslide_initialized_v2';

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
    // 1. Check if user already has local IndexedDB or LocalStorage
    let localData: MathLesson[] = [];
    try {
      localData = await getLessonsFromIndexedDB();
    } catch {}

    if (localData.length === 0) {
      try {
        const localStr = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (localStr) {
          const parsed = JSON.parse(localStr);
          if (Array.isArray(parsed) && parsed.length > 0) {
            localData = parsed;
          }
        }
      } catch {}
    }

    // 2. Try fetching from server
    try {
      const res = await fetch('/api/sync-load-lessons');
      if (res.ok) {
        const serverLessons: MathLesson[] = await res.json();
        if (Array.isArray(serverLessons) && serverLessons.length > 0) {
          // If local has more recent edits, preserve them
          if (localData.length > 0) {
            const serverMap = new Map(serverLessons.map((l) => [l.id, l]));
            const localMap = new Map(localData.map((l) => [l.id, l]));
            
            // Merge: choose the newer version based on updatedAt
            const mergedMap = new Map<string, MathLesson>();
            serverMap.forEach((sVal, key) => mergedMap.set(key, sVal));
            localMap.forEach((lVal, key) => {
              const existing = mergedMap.get(key);
              if (!existing || (lVal.updatedAt || 0) >= (existing.updatedAt || 0)) {
                mergedMap.set(key, lVal);
              }
            });
            const mergedList = Array.from(mergedMap.values()).sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
            await saveAllLessonsToIndexedDB(mergedList);
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(mergedList));
            localStorage.setItem(INITIALIZED_KEY, 'true');
            return { lessons: mergedList, source: 'server' };
          }

          // First time or clean sync
          await saveAllLessonsToIndexedDB(serverLessons);
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(serverLessons));
          localStorage.setItem(INITIALIZED_KEY, 'true');
          return { lessons: serverLessons, source: 'server' };
        }
      }
    } catch (err) {
      console.warn('Cannot reach cloud server (offline mode):', err);
    }

    // 3. If server was unreachable, use localData if available
    if (localData.length > 0) {
      return { lessons: localData, source: 'indexedDB' };
    }

    // 4. Default Seed if first ever visit
    const initialSeed = [...SAMPLE_LESSONS];
    await saveAllLessonsToIndexedDB(initialSeed);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(initialSeed));
    localStorage.setItem(INITIALIZED_KEY, 'true');
    return { lessons: initialSeed, source: 'default' };
  },

  // Save single lesson to local and sync to cloud
  async saveLesson(lesson: MathLesson, allLessons: MathLesson[]): Promise<{ isSynced: boolean }> {
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

  // Delete lesson
  async deleteLesson(lessonId: string, remainingLessons: MathLesson[]): Promise<void> {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(remainingLessons));
      await deleteLessonFromIndexedDB(lessonId);
    } catch (err) {
      console.error('Error deleting locally:', err);
    }

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
    await saveAllLessonsToIndexedDB(parsed);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(parsed));
    
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
