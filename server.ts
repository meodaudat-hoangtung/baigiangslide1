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

// Helper to save server database to disk
function saveDatabaseToDisk() {
  try {
    const list = Array.from(serverLessonDatabase.values());
    fs.writeFileSync(LESSONS_FILE, JSON.stringify(list, null, 2), 'utf-8');
    fs.writeFileSync(DELETED_IDS_FILE, JSON.stringify(Array.from(deletedIdsSet), null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to write database to disk:', err);
  }
}

// Helper to load server database from disk on boot
function loadDatabaseFromDisk() {
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
    console.warn('[Storage] Error loading from disk, seeding defaults:', err);
  }

  // Seed with sample lessons ONLY if no lessons.json file ever existed
  SAMPLE_LESSONS.forEach((l) => {
    if (!deletedIdsSet.has(l.id)) {
      serverLessonDatabase.set(l.id, l);
    }
  });
  saveDatabaseToDisk();
  console.log(`[Storage] Initialized database with ${serverLessonDatabase.size} lessons.`);
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

app.get('/api/sample-lessons', (req, res) => {
  res.json(SAMPLE_LESSONS);
});

// Load all synced lessons
app.get('/api/sync-load-lessons', (req, res) => {
  const lessons = Array.from(serverLessonDatabase.values())
    .filter((l) => !deletedIdsSet.has(l.id))
    .sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
  res.json({
    lessons,
    deletedIds: Array.from(deletedIdsSet),
  });
});

// Save or sync a lesson
app.post('/api/sync-save-lesson', (req, res) => {
  try {
    const lesson: MathLesson = req.body;
    if (!lesson || !lesson.id) {
      return res.status(400).json({ error: 'Dữ liệu bài giảng không hợp lệ' });
    }
    // If the user explicitly saved/created this lesson, un-delete it if was previously marked deleted
    deletedIdsSet.delete(lesson.id);
    lesson.updatedAt = Date.now();
    serverLessonDatabase.set(lesson.id, lesson);
    saveDatabaseToDisk();
    res.json({ success: true, lesson, syncedAt: lesson.updatedAt });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Không thể lưu bài giảng' });
  }
});

// Delete a synced lesson
app.delete('/api/sync-delete-lesson/:id', (req, res) => {
  try {
    const id = req.params.id;
    if (!id) {
      return res.status(400).json({ error: 'Mã bài giảng không hợp lệ' });
    }
    serverLessonDatabase.delete(id);
    deletedIdsSet.add(id);
    saveDatabaseToDisk();
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
