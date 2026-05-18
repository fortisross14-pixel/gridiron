// ─── COLOR TOKENS ────────────────────────────────────────────────────────
// Centralized palette so visual tweaks live in one place.

export const COLORS = {
  bg:          '#0a0e1a',  // app background
  panel:       '#11151f',  // card/panel surface
  panelDeep:   '#0e1320',  // nested panel
  border:      '#1a1f2e',  // hairline borders
  borderMute:  '#374151',  // softer borders / inactive controls
  text:        '#e5e7eb',  // primary text
  textMute:    '#9ca3af',  // secondary text
  accent:      '#22c55e',  // green primary action
  accentText:  '#0a0e1a',  // text on accent (inverse)
  warning:     '#fbbf24',
  danger:      '#ef4444',
};

// Player rarity colors — used for badges and card borders.
export const RARITY_COLOR = {
  Common:   '#9CA3AF',
  Uncommon: '#34D399',
  Rare:     '#60A5FA',
  Epic:     '#C084FC',
  Legend:   '#FBBF24',
};

// Convert hex color to rgba with alpha.
export const rgba = (hex, alpha) => {
  const h = hex.replace('#', '');
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

// Pick readable text color (black or white) for a given background hex.
export const readableTextOn = (hex) => {
  const h = hex.replace('#', '');
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  // Perceived luminance.
  const L = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return L > 0.55 ? '#0a0e1a' : '#ffffff';
};
