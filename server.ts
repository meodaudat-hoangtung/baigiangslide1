import express from 'express';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { analyzeMathTextbookAndGenerate, ImageInput } from './server/mathGemini.js';
import { SAMPLE_LESSONS } from './src/data/sampleLessons.js';
import { MathLesson } from './src/types.js';

dotenv.config();

const app = express();
const PORT = 3000;

// High payload limit for image uploads (base64 scanned textbook pages)
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Persistent disk file path for lessons
const DATA_DIR = path.join(process.cwd(), 'persisted_data');
const LESSONS_FILE = path.join(DATA_DIR, 'lessons.json');
const DELETED_IDS_FILE = path.join(DATA_DIR, 'deleted_ids.json');
const WORKSPACE_STATE_FILE = path.join(DATA_DIR, 'workspace_state.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  try {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  } catch (e) {
    console.error('Could not create data dir:', e);
  }
}

// In-memory / server-persisted cloud storage for teacher lessons
const serverLessonDatabase: Map<string, MathLesson> = new Map();
const deletedIdsSet: Set<string> = new Set();
let serverWorkspaceState: {
  activeLessonId?: string;
  activeTab?: 'slides' | 'questions' | 'library';
  activeSlideIndex?: number;
  zoomLevel?: number;
  updatedAt: number;
} = {
  updatedAt: 0,
};

// Connected SSE clients for instant real-time cross-tab/cross-device push
const sseClients = new Set<express.Response>();

function broadcastRealtimeEvent(type: string, payload: any) {
  const data = JSON.stringify({ type, payload, timestamp: Date.now() });
  sseClients.forEach((client) => {
    try {
      client.write(`data: ${data}\n\n`);
    } catch {
      sseClients.delete(client);
    }
  });
}

// Helper to save server database to disk
function saveDatabaseToDisk() {
  try {
    const list = Array.from(serverLessonDatabase.values()).filter((l) => !deletedIdsSet.has(l.id));
    fs.writeFileSync(LESSONS_FILE, JSON.stringify(list, null, 2), 'utf-8');
    fs.writeFileSync(DELETED_IDS_FILE, JSON.stringify(Array.from(deletedIdsSet), null, 2), 'utf-8');
    fs.writeFileSync(WORKSPACE_STATE_FILE, JSON.stringify(serverWorkspaceState, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to write database to disk:', err);
  }
}

// Helper to load server database from disk on boot
function loadDatabaseFromDisk() {
  try {
    if (fs.existsSync(WORKSPACE_STATE_FILE)) {
      const wsRaw = fs.readFileSync(WORKSPACE_STATE_FILE, 'utf-8');
      const parsedWs = JSON.parse(wsRaw);
      if (parsedWs && typeof parsedWs === 'object') {
        serverWorkspaceState = parsedWs;
      }
    }
  } catch {}

  try {
    // 1. Load deleted IDs list first
    if (fs.existsSync(DELETED_IDS_FILE)) {
      const deletedData = fs.readFileSync(DELETED_IDS_FILE, 'utf-8');
      const parsedDeleted: string[] = JSON.parse(deletedData);
      if (Array.isArray(parsedDeleted)) {
        parsedDeleted.forEach((id) => deletedIdsSet.add(id));
      }
    }

    // 2. Load lessons from disk
    if (fs.existsSync(LESSONS_FILE)) {
      const fileData = fs.readFileSync(LESSONS_FILE, 'utf-8');
      const list: MathLesson[] = JSON.parse(fileData);
      if (Array.isArray(list)) {
        list.forEach((l) => {
          if (!deletedIdsSet.has(l.id)) {
            serverLessonDatabase.set(l.id, l);
          }
        });
        console.log(`[Storage] Loaded ${serverLessonDatabase.size} active lessons from disk database.`);
        return;
      }
    }
  } catch (err) {
    console.warn('[Storage] Error loading from disk:', err);
  }
}

loadDatabaseFromDisk();

// API Routes
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    hasApiKey: !!process.env.GEMINI_API_KEY,
    totalLessons: serverLessonDatabase.size,
  });
});

// Real-Time Server-Sent Events (SSE) stream
app.get('/api/events', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();

  sseClients.add(res);
  res.write(`data: ${JSON.stringify({ type: 'connected', timestamp: Date.now() })}\n\n`);

  const keepAlive = setInterval(() => {
    try {
      res.write(`: ping\n\n`);
    } catch {
      clearInterval(keepAlive);
      sseClients.delete(res);
    }
  }, 25000);

  req.on('close', () => {
    clearInterval(keepAlive);
    sseClients.delete(res);
  });
});

app.get('/api/sample-lessons', (req, res) => {
  res.json(SAMPLE_LESSONS);
});

// Load all synced lessons & workspace state
app.get('/api/sync-load-lessons', (req, res) => {
  const lessons = Array.from(serverLessonDatabase.values())
    .filter((l) => !deletedIdsSet.has(l.id))
    .sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
  res.json({
    lessons,
    deletedIds: Array.from(deletedIdsSet),
    workspaceState: serverWorkspaceState,
  });
});

// Workspace state endpoints
app.get('/api/workspace-state', (req, res) => {
  res.json(serverWorkspaceState);
});

app.post('/api/workspace-state', (req, res) => {
  try {
    const incoming = req.body;
    if (incoming && typeof incoming === 'object') {
      serverWorkspaceState = {
        ...serverWorkspaceState,
        ...incoming,
        updatedAt: incoming.updatedAt || Date.now(),
      };
      saveDatabaseToDisk();
      broadcastRealtimeEvent('workspace:updated', serverWorkspaceState);
    }
    res.json({ success: true, workspaceState: serverWorkspaceState });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Lỗi cập nhật trạng thái' });
  }
});

// Sync deleted IDs from Firestore to Server
app.post('/api/sync-deleted-ids', (req, res) => {
  try {
    const { deletedIds } = req.body;
    let changed = false;
    const newlyDeleted: string[] = [];
    if (Array.isArray(deletedIds)) {
      deletedIds.forEach((id: string) => {
        if (id && (!deletedIdsSet.has(id) || serverLessonDatabase.has(id))) {
          deletedIdsSet.add(id);
          serverLessonDatabase.delete(id);
          newlyDeleted.push(id);
          changed = true;
        }
      });
    }
    if (changed) {
      saveDatabaseToDisk();
      newlyDeleted.forEach((id) => {
        broadcastRealtimeEvent('lesson:deleted', { id });
      });
    }
    res.json({ success: true, deletedIds: Array.from(deletedIdsSet) });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Save or sync a lesson
app.post('/api/sync-save-lesson', (req, res) => {
  try {
    const lesson: MathLesson = req.body;
    if (!lesson || !lesson.id) {
      return res.status(400).json({ error: 'Dữ liệu bài giảng không hợp lệ' });
    }
    const isReconcileOnly = req.query.reconcile === 'true';
    // If reconcile mode and this lesson was already deleted, reject resurrection!
    if (isReconcileOnly && deletedIdsSet.has(lesson.id)) {
      return res.json({ success: false, ignored: true, reason: 'deleted' });
    }
    // If explicitly saved/created by user, un-delete it if it was previously marked deleted
    if (!isReconcileOnly) {
      deletedIdsSet.delete(lesson.id);
    }
    lesson.updatedAt = lesson.updatedAt || Date.now();
    const existing = serverLessonDatabase.get(lesson.id);
    if (!existing || (lesson.updatedAt || 0) >= (existing.updatedAt || 0)) {
      serverLessonDatabase.set(lesson.id, lesson);
      saveDatabaseToDisk();
      broadcastRealtimeEvent('lesson:saved', lesson);
    }
    res.json({ success: true, lesson, syncedAt: lesson.updatedAt });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Không thể lưu bài giảng' });
  }
});

// Delete a synced lesson permanently
app.delete('/api/sync-delete-lesson/:id', (req, res) => {
  try {
    const id = req.params.id;
    if (!id) {
      return res.status(400).json({ error: 'Mã bài giảng không hợp lệ' });
    }
    serverLessonDatabase.delete(id);
    deletedIdsSet.add(id);
    saveDatabaseToDisk();
    broadcastRealtimeEvent('lesson:deleted', { id });
    console.log(`[Storage] Permanently deleted lesson ${id} from server & recorded tombstone.`);
    res.json({ success: true, deletedId: id });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Không thể xóa bài giảng' });
  }
});

// Main AI analysis endpoint
app.post('/api/analyze-math-lesson', async (req, res) => {
  try {
    const { images, config, additionalNotes } = req.body;

    if (!images || !Array.isArray(images) || images.length === 0) {
      return res.status(400).json({ error: 'Vui lòng tải lên ít nhất một hình ảnh trang sách giáo khoa.' });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        error: 'Chưa cấu hình GEMINI_API_KEY trên máy chủ. Vui lòng cấu hình khóa API trong mục Settings > Secrets.',
      });
    }

    const generatedLesson = await analyzeMathTextbookAndGenerate(images as ImageInput[], config, additionalNotes);

    // Auto-save to cloud storage and disk
    serverLessonDatabase.set(generatedLesson.id, generatedLesson);
    saveDatabaseToDisk();

    res.json({
      success: true,
      lesson: generatedLesson,
    });
  } catch (err: any) {
    console.error('Error in /api/analyze-math-lesson:', err);
    res.status(500).json({
      error: err.message || 'Đã xảy ra lỗi khi phân tích hình ảnh sách giáo khoa và tạo bài giảng.',
    });
  }
});

async function startServer() {
  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`MathSlide AI Server running on http://localhost:${PORT}`);
  });
}

startServer();
