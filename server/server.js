import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import fs from 'fs';
import fileUpload from 'express-fileupload';
import path from 'path'
import { fileURLToPath } from 'url'

// นำเข้า routes ทั้งหมด
import authRoutes from './routes/auth.js';
import commonRoutes from './routes/common.js';
import hrRoutes from './routes/hr.js';
import hrExtras from './routes/hr.extras.js';
import committeeRoutes from './routes/committee.js';
import committeeExtras from './routes/committee.extras.js';
import evaluatedRoutes from './routes/evaluated.js';
import evaluatedExtras from './routes/evaluated.extras.js';
import reportsRoutes from './routes/reports.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.join(__dirname, '.env') })

const app = express();

// Middleware พื้นฐาน
app.use(cors());
app.use(helmet());
app.use(express.json({ limit: '10mb' }));
app.use(fileUpload());

// จัดการโฟลเดอร์อัปโหลด
const UP = process.env.UPLOAD_DIR || 'uploads';
if (!fs.existsSync(UP)) fs.mkdirSync(UP);
app.use('/uploads', express.static(UP));

// API Routes
app.get('/', (req, res) => res.json({ ok: true, name: 'PES Plus API' }));
app.use('/api/auth', authRoutes);
app.use('/api/common', commonRoutes);
app.use('/api/hr', hrRoutes, hrExtras);
app.use('/api/admin', hrRoutes, hrExtras);
app.use('/api/committee', committeeRoutes, committeeExtras);
app.use('/api/evaluator', committeeRoutes, committeeExtras);
app.use('/api/evaluated', evaluatedRoutes, evaluatedExtras);
app.use('/api/evaluatee', evaluatedRoutes, evaluatedExtras);
app.use('/api/reports', reportsRoutes);

// Debug route (remove in prod)
app.get('/__debug/db', async (req, res) => {
  try {
    const mysql = await import('mysql2/promise');
    const db = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASS || '',
      database: process.env.DB_NAME || 'personnel_eval',
    });
    const [[dbName]] = await db.query('SELECT DATABASE() AS db');
    const [users] = await db.query(
      'SELECT id,email,role FROM users ORDER BY id LIMIT 20'
    );
    res.json({ db: dbName.db, users });
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log('PES Plus API http://localhost:' + port));

process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err)
})
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err)
})
app.use((err, req, res, next) => {
  console.error('Express Error:', err)
  res.status(500).json({ status: 'fail', message: 'Internal server error' })
})
