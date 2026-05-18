// ─── COLOR TOKENS ────────────────────────────────────────────────────────
// White-dominant NFL palette: clean white background, light grey panels,
// dark navy text, NFL red as primary action, NFL blue as secondary.

export const COLORS = {
  // Surface layers (white → light grey progression)
  bg:          '#F4F5F7',  // app background — soft off-white
  panel:       '#FFFFFF',  // card/panel surface
  panelDeep:   '#F9FAFB',  // nested panel / striped table rows

  // Borders & dividers
  border:      '#E5E7EB',  // hairline borders
  borderMute:  '#D1D5DB',  // softer borders, inactive controls

  // Text
  text:        '#0F172A',  // primary text — near-black navy
  textMute:    '#64748B',  // secondary text — slate grey
  textOnDark:  '#FFFFFF',  // text used on team-color blocks

  // Primary action — NFL red
  accent:      '#D50A0A',
  accentText:  '#FFFFFF',
  accentHover: '#B30606',

  // Secondary accent — NFL blue (used for info, selected secondary states)
  info:        '#013369',  // NFL deep blue
  infoLight:   '#1E40AF',  // NFL bright blue
  infoText:    '#FFFFFF',

  // Status
  success:     '#16A34A',  // win green
  warning:     '#F59E0B',
  danger:      '#DC2626',  // loss red (different from accent red)
};

// Player rarity colors — kept saturated for badge legibility on white.
export const RARITY_COLOR = {
  Common:   '#9CA3AF',
  Uncommon: '#10B981',
  Rare:     '#2563EB',
  Epic:     '#9333EA',
  Legend:   '#F59E0B',
};

// Best text color for legibility on each rarity background.
export const RARITY_TEXT_ON = {
  Common:   '#FFFFFF',
  Uncommon: '#FFFFFF',
  Rare:     '#FFFFFF',
  Epic:     '#FFFFFF',
  Legend:   '#0F172A',
};

// Convenience: returns the style overrides for a rarity badge.
// Use as: <span style={{ ...styles.rarityBadge, ...rarityStyle(rarity) }}>
export const rarityStyle = (rarity) => ({
  background: RARITY_COLOR[rarity],
  color: RARITY_TEXT_ON[rarity],
});

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
  const L = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return L > 0.55 ? '#0F172A' : '#FFFFFF';
};
