import crypto from 'crypto';
import { ADMIN_PASSWORD } from '../config.js';

// In-memory token store
const validTokens = new Set();

export const loginHandler = (req, res) => {
    const { password } = req.body;
    if (password === ADMIN_PASSWORD) {
        const token = crypto.randomBytes(32).toString('hex');
        validTokens.add(token);
        res.json({ token });
    } else {
        res.status(401).json({ error: 'Wrong password' });
    }
};

export const requireAuth = (req, res, next) => {
    const auth = req.headers.authorization || '';
    const token = auth.replace('Bearer ', '');
    if (validTokens.has(token)) return next();
    res.status(401).json({ error: 'Unauthorised' });
};
