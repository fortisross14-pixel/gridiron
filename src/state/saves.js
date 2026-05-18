// Three-slot autosave system backed by localStorage.
//
// Each slot stores a single JSON blob:
//   { schemaVersion, meta, state, savedAt }
//
//   meta  — small summary used to render the home page card without
//           parsing the full state (name, season, week, championships, phase)
//   state — the full serializable league snapshot
//
// Bump SAVE_SCHEMA_VERSION when the engine state shape changes in a way
// that would break old saves. Older saves still appear on the home page
// but flagged as incompatible (delete-only).

export const SAVE_SCHEMA_VERSION = 1;
export const SLOT_COUNT = 3;
const KEY = (slot) => `nfl-sim:slot:${slot}`;

// Return all slots in order; null where empty or unreadable.
export const listSaves = () => {
  const out = [];
  for (let i = 0; i < SLOT_COUNT; i++) out.push(readSlot(i));
  return out;
};

const readSlot = (slot) => {
  try {
    const raw = localStorage.getItem(KEY(slot));
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

// Returns the full state (or null if slot empty/incompatible).
export const loadSave = (slot) => {
  const data = readSlot(slot);
  if (!data) return null;
  if (data.schemaVersion !== SAVE_SCHEMA_VERSION) return null;
  return data.state;
};

// Write a snapshot. Meta is the small home-page summary; state is full.
// Silently swallows QuotaExceededError so writes never crash the app.
export const writeSave = (slot, meta, state) => {
  try {
    const payload = {
      schemaVersion: SAVE_SCHEMA_VERSION,
      meta,
      state,
      savedAt: Date.now(),
    };
    localStorage.setItem(KEY(slot), JSON.stringify(payload));
    return true;
  } catch (err) {
    console.warn(`[saves] failed to write slot ${slot}:`, err);
    return false;
  }
};

export const deleteSave = (slot) => {
  try {
    localStorage.removeItem(KEY(slot));
    return true;
  } catch {
    return false;
  }
};

// Human-readable "5 minutes ago", "2 hours ago", "yesterday", "3 days ago".
export const timeAgo = (ts) => {
  if (!ts) return '';
  const seconds = Math.floor((Date.now() - ts) / 1000);
  if (seconds < 60)  return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60)  return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24)    return `${hours} hour${hours === 1 ? '' : 's'} ago`;
  const days = Math.floor(hours / 24);
  if (days === 1)    return 'yesterday';
  if (days < 30)     return `${days} days ago`;
  const months = Math.floor(days / 30);
  if (months < 12)   return `${months} month${months === 1 ? '' : 's'} ago`;
  return `${Math.floor(months / 12)} year${months >= 24 ? 's' : ''} ago`;
};
