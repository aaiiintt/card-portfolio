import { API_BASE } from '../config';

/**
 * Resolves a media path string safely to a full absolute URL targeting the
 * local Express backend or the remote Cloud Run environment, ensuring
 * that any paths without a scheme are properly constructed.
 */
export const resolveMedia = (path?: string) => {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `${API_BASE}${cleanPath}`;
};
