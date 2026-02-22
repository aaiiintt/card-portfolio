export const getDeepColor = (hex?: string, fallback = '#000000') => {
    if (!hex || !hex.startsWith('#') || hex.length !== 7) return fallback;
    const r = Math.max(0, parseInt(hex.slice(1, 3), 16) - 40);
    const g = Math.max(0, parseInt(hex.slice(3, 5), 16) - 40);
    const b = Math.max(0, parseInt(hex.slice(5, 7), 16) - 40);
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
};

export const getContrastTextColor = (hex?: string, fallback = 'var(--dark)') => {
    if (!hex || !hex.startsWith('#') || hex.length !== 7) return fallback;
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    // YIQ equation from W3C for perceived brightness
    const yiq = (r * 299 + g * 587 + b * 114) / 1000;
    return yiq >= 128 ? fallback : '#ffffff';
};
