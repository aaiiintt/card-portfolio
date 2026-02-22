import { Storage } from '@google-cloud/storage';
import { fileURLToPath } from 'url';
import { dirname, join, extname } from 'path';
import crypto from 'crypto';
import multer from 'multer';
import { IS_LOCAL, BUCKET_NAME, DEFAULT_CONTENT } from '../config.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

// ── GCS client initializer ───────────────────────────────────────────────────
export const storage = IS_LOCAL ? null : new Storage();

// ── Multer (file uploads) configuration ─────────────────────────────────────────
const uploadsDir = join(__dirname, '../../public/uploads');

// Local disk storage — used in dev
const diskStorage = multer.diskStorage({
    destination: async (req, file, cb) => {
        const { mkdir } = await import('fs/promises');
        await mkdir(uploadsDir, { recursive: true });
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        const ext = extname(file.originalname).toLowerCase();
        const name = crypto.randomBytes(8).toString('hex') + ext;
        cb(null, name);
    },
});

// Memory storage — used in production (we stream to GCS)
const memStorage = multer.memoryStorage();

export const upload = multer({
    storage: IS_LOCAL ? diskStorage : memStorage,
    limits: { fileSize: 100 * 1024 * 1024 }, // 100 MB
    fileFilter: (_req, file, cb) => {
        const allowed = /jpeg|jpg|png|gif|webp|mp4|mov|webm/i;
        cb(null, allowed.test(extname(file.originalname)));
    },
});

// ── Read/Write Content Helpers ─────────────────────────────────────────────────
export async function readContent(section) {
    if (IS_LOCAL) {
        const { readFile } = await import('fs/promises');
        try {
            const raw = await readFile(join(__dirname, `../../src/content/${section}.json`), 'utf-8');
            return JSON.parse(raw);
        } catch {
            return DEFAULT_CONTENT[section] ?? {};
        }
    }
    const bucket = storage.bucket(BUCKET_NAME);
    const file = bucket.file(`${section}.json`);
    try {
        const [contents] = await file.download();
        return JSON.parse(contents.toString());
    } catch (err) {
        if (err.code === 404) return DEFAULT_CONTENT[section] ?? {};
        throw err;
    }
}

export async function writeContent(section, data) {
    if (IS_LOCAL) {
        const { writeFile } = await import('fs/promises');
        await writeFile(
            join(__dirname, `../../src/content/${section}.json`),
            JSON.stringify(data, null, 2),
            'utf-8'
        );
        return;
    }
    const bucket = storage.bucket(BUCKET_NAME);
    const file = bucket.file(`${section}.json`);
    await file.save(JSON.stringify(data, null, 2), {
        contentType: 'application/json',
        metadata: { cacheControl: 'no-cache' },
    });
}

// ── Upload Media Helper ────────────────────────────────────────────────────────
export async function uploadToGCS(prefix, filename, buffer, mimetype) {
    const bucket = storage.bucket(BUCKET_NAME);
    const gcsPath = `${prefix}/${filename}`;
    const gcsFile = bucket.file(gcsPath);
    await gcsFile.save(buffer, { contentType: mimetype, metadata: { cacheControl: 'public,max-age=31536000' } });
    await gcsFile.makePublic();
    return `https://storage.googleapis.com/${BUCKET_NAME}/${gcsPath}`;
}
