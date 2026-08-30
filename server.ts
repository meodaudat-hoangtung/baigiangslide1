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

// Helper to save server database to disk
function saveDatabaseToDisk() {
  try {
    const list = Array.from(serverLessonDatabase.values());
    fs.writeFileSync(LESSONS_FILE, JSON.stringify(list, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to write database to disk:', err);
  }
}

// Helper to load server database from disk on boot
function loadDatabaseFromDisk() {
  try {
    if (fs.existsSync(LESSONS_FILE)) {
      const fileData = fs.readFileSync(LESSONS_FILE, 'utf-8');
      const list: MathLesson[] = JSON.parse(fileData);
      if (Array.isArray(list) && list.length > 0) {
        list.forEach((l) => serverLessonDatabase.set(l.id, l));
        console.log(`[Storage] Loaded ${list.length} lessons from disk database.`);
        return;
      }
    }
  } catch (err) {
    console.warn('[Storage] Error loading from disk, seeding defaults:', err);
  }

  // Seed with sample lessons if no disk file existed
  SAMPLE_LESSONS.forEach((l) => {
    serverLessonDatabase.set(l.id, l);
  });
  saveDatabaseToDisk();
  console.log(`[Storage] Seeded ${SAMPLE_LESSONS.length} initial lessons to disk.`);
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
  const lessons = Array.from(serverLessonDatabase.values()).sort((a, b) => b.updatedAt - a.updatedAt);
  res.json(lessons);
});

// Save or sync a lesson
app.post('/api/sync-save-lesson', (req, res) => {
  try {
    const lesson: MathLesson = req.body;
    if (!lesson || !lesson.id) {
      return res.status(400).json({ error: 'Dữ liệu bài giảng không hợp lệ' });
    }
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
  const id = req.params.id;
  if (serverLessonDatabase.has(id)) {
    serverLessonDatabase.delete(id);
    saveDatabaseToDisk();
    res.json({ success: true, deletedId: id });
  } else {
    res.status(404).json({ error: 'Bài giảng không tồn tại' });
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
