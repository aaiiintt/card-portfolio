import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { PORT } from './config.js';
import apiRouter from './routes/api.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

const app = express();

// ── Security Headers & Globals ──────────────────────────────────────────────
app.use(helmet({
    contentSecurityPolicy: false, // Vite/React requires inline scripts in dev/build
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" }, // Allow Vite (5173) to load images from Express (8080)
}));
app.use(cors());
// 1mb payload limit prevents basic Denial of Service
app.use(express.json({ limit: '1mb' }));

// ── API Router ────────────────────────────────────────────────────────────────
app.use('/api', apiRouter);

// ── Static Files ─────────────────────────────────────────────────────────────
const adminHtml = join(__dirname, '../public/admin/index.html');
app.get(/^\/admin(\/.*)?$/, (_req, res) => res.sendFile(adminHtml));

const distDir = join(__dirname, '../dist');
const publicDir = join(__dirname, '../public');
app.use(express.static(publicDir));
app.use(express.static(distDir));

// React SPA fallback
app.get('*', (_req, res) => res.sendFile(join(distDir, 'index.html')));

// ── Start ─────────────────────────────────────────────────────────────────────
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
