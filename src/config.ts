// ── Frontend Config ─────────────────────────────────────────────────────────────

export const API_BASE = (window.location.hostname === 'localhost' && window.location.port !== '8080')
    ? 'http://localhost:8080'
    : '';

// A cache buster string evaluated once per page load to ensure background
// images refresh when the user reloads the application.
export const SESSION_CACHE_BUSTER = `?t=${Date.now()}`;
