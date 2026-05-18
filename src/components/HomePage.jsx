import { useState, useEffect } from 'react';
import { styles } from '../theme/styles.js';
import { COLORS } from '../theme/colors.js';
import { listSaves, deleteSave, timeAgo, SLOT_COUNT } from '../state/saves.js';

// ─── HOME PAGE ───────────────────────────────────────────────────────────
// Shown when the app first loads. Lists 3 save slots and lets the user
// either continue an existing league or create a new one.
export const HomePage = ({ onLoad, onNew }) => {
  const [slots, setSlots] = useState([]);
  const [newSlotIdx, setNewSlotIdx] = useState(null); // which slot is being created
  const [newName, setNewName] = useState('');

  const refresh = () => setSlots(listSaves());
  useEffect(() => { refresh(); }, []);

  const handleDelete = (slotIdx, slotName) => {
    if (!confirm(`Delete "${slotName}"? This can't be undone.`)) return;
    deleteSave(slotIdx);
    refresh();
  };

  const handleCreate = () => {
    const name = newName.trim();
    if (!name) return;
    onNew(newSlotIdx, name);
    setNewSlotIdx(null);
    setNewName('');
  };

  return (
    <div style={styles.app}>
      <style>{`* { box-sizing: border-box; } body { margin: 0; }`}</style>
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '60px 28px' }}>
        {/* HERO */}
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <div style={{
            color: COLORS.accent, fontSize: 36, marginBottom: 8,
          }}>●</div>
          <div style={{
            fontFamily: "'Bebas Neue'", fontSize: 64, letterSpacing: 6,
            lineHeight: 1, color: COLORS.text,
          }}>
            GRIDIRON
          </div>
          <div style={{ fontSize: 14, letterSpacing: 5, opacity: 0.5, marginTop: 8 }}>
            SEASON SIMULATOR
          </div>
        </div>

        {/* SLOT GRID */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: 16,
        }}>
          {Array.from({ length: SLOT_COUNT }).map((_, idx) => {
            const raw  = slots[idx];
            // Flatten the saved blob into the shape this UI expects.
            const slot = raw && {
              ...(raw.meta || {}),
              savedAt:      raw.savedAt,
              incompatible: raw.schemaVersion !== 1,
            };
            // Empty slot — show "+ New League" or the name-input form.
            if (!raw) {
              if (newSlotIdx === idx) {
                return (
                  <div key={idx} style={{
                    ...styles.detailCard, padding: 24,
                    borderColor: COLORS.accent,
                  }}>
                    <div style={{
                      fontSize: 11, letterSpacing: 2, opacity: 0.6, marginBottom: 12,
                    }}>SLOT {idx + 1} · NEW LEAGUE</div>
                    <input
                      autoFocus
                      type="text"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleCreate();
                        if (e.key === 'Escape') { setNewSlotIdx(null); setNewName(''); }
                      }}
                      placeholder="Name your league..."
                      maxLength={32}
                      style={{
                        width: '100%', padding: '10px 12px',
                        background: COLORS.bg,
                        border: `1px solid ${COLORS.borderMute}`,
                        borderRadius: 3,
                        color: COLORS.text,
                        fontFamily: "'Oswald'", fontSize: 16,
                        marginBottom: 12,
                      }}
                    />
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button
                        onClick={handleCreate}
                        disabled={!newName.trim()}
                        style={{
                          ...styles.bigBtn, flex: 1, fontSize: 14, padding: '10px 14px',
                          opacity: newName.trim() ? 1 : 0.4,
                          cursor: newName.trim() ? 'pointer' : 'not-allowed',
                        }}
                      >CREATE</button>
                      <button
                        onClick={() => { setNewSlotIdx(null); setNewName(''); }}
                        style={{ ...styles.backBtn, margin: 0, padding: '10px 14px' }}
                      >CANCEL</button>
                    </div>
                  </div>
                );
              }
              return (
                <div
                  key={idx}
                  onClick={() => setNewSlotIdx(idx)}
                  style={{
                    ...styles.detailCard,
                    padding: 24,
                    minHeight: 180,
                    cursor: 'pointer',
                    border: `2px dashed ${COLORS.borderMute}`,
                    background: 'transparent',
                    display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center',
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = COLORS.accent;
                    e.currentTarget.style.background = 'rgba(34,197,94,0.04)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = COLORS.borderMute;
                    e.currentTarget.style.background = 'transparent';
                  }}
                >
                  <div style={{
                    fontSize: 11, letterSpacing: 2, opacity: 0.5, marginBottom: 8,
                  }}>SLOT {idx + 1}</div>
                  <div style={{
                    fontSize: 28, color: COLORS.accent, fontWeight: 300,
                  }}>+ NEW LEAGUE</div>
                </div>
              );
            }

            // Incompatible (schema mismatch) — let user delete only.
            if (slot.incompatible) {
              return (
                <div key={idx} style={{
                  ...styles.detailCard, padding: 24, minHeight: 180,
                  borderColor: COLORS.warning,
                }}>
                  <div style={{ fontSize: 11, letterSpacing: 2, opacity: 0.6 }}>
                    SLOT {idx + 1} · INCOMPATIBLE
                  </div>
                  <div style={{ fontSize: 13, opacity: 0.7, marginTop: 12 }}>
                    This save is from an older version and can't be loaded.
                  </div>
                  <button
                    onClick={() => handleDelete(idx, slot.name || `Slot ${idx + 1}`)}
                    style={{ ...styles.backBtn, marginTop: 16 }}
                  >DELETE</button>
                </div>
              );
            }

            // Populated slot — show metadata, click to load.
            return (
              <div
                key={idx}
                style={{
                  ...styles.detailCard,
                  padding: 0,
                  minHeight: 180,
                  cursor: 'pointer',
                  borderLeft: `4px solid ${COLORS.accent}`,
                  position: 'relative',
                  transition: 'all 0.15s',
                  overflow: 'hidden',
                }}
                onClick={() => onLoad(idx)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div style={{ padding: 20 }}>
                  <div style={{
                    fontSize: 10, letterSpacing: 2, opacity: 0.5, marginBottom: 6,
                  }}>SLOT {idx + 1}</div>
                  <div style={{
                    fontFamily: "'Bebas Neue'", fontSize: 28, letterSpacing: 1,
                    lineHeight: 1.1, marginBottom: 14,
                    color: COLORS.text,
                  }}>{slot.name}</div>

                  <div style={{ display: 'flex', gap: 16, marginBottom: 12, fontSize: 12 }}>
                    <div>
                      <div style={{ opacity: 0.5, fontSize: 10, letterSpacing: 1 }}>SEASON</div>
                      <div style={{ fontFamily: "'JetBrains Mono'", fontSize: 18, fontWeight: 700 }}>
                        {slot.seasonNum}
                      </div>
                    </div>
                    <div>
                      <div style={{ opacity: 0.5, fontSize: 10, letterSpacing: 1 }}>WEEK</div>
                      <div style={{ fontFamily: "'JetBrains Mono'", fontSize: 18, fontWeight: 700 }}>
                        {slot.phase || `${slot.currentWeek}/16`}
                      </div>
                    </div>
                    {slot.championships > 0 && (
                      <div>
                        <div style={{ opacity: 0.5, fontSize: 10, letterSpacing: 1 }}>RINGS</div>
                        <div style={{
                          fontFamily: "'JetBrains Mono'", fontSize: 18, fontWeight: 700,
                          color: COLORS.warning,
                        }}>
                          🏆 {slot.championships}
                        </div>
                      </div>
                    )}
                  </div>

                  <div style={{ fontSize: 11, opacity: 0.5 }}>
                    Last played {timeAgo(slot.savedAt)}
                  </div>
                </div>

                {/* DELETE BUTTON — stops click bubbling to the load action */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(idx, slot.name);
                  }}
                  style={{
                    position: 'absolute',
                    top: 10, right: 10,
                    background: 'transparent',
                    border: `1px solid ${COLORS.borderMute}`,
                    color: COLORS.textMute,
                    width: 24, height: 24, padding: 0,
                    borderRadius: 3, cursor: 'pointer',
                    fontFamily: "'Oswald'", fontSize: 12, lineHeight: 1,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = COLORS.danger;
                    e.currentTarget.style.color = COLORS.danger;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = COLORS.borderMute;
                    e.currentTarget.style.color = COLORS.textMute;
                  }}
                  title="Delete this league"
                >✕</button>
              </div>
            );
          })}
        </div>

        <div style={{
          marginTop: 32, textAlign: 'center', fontSize: 11, opacity: 0.4, letterSpacing: 1,
        }}>
          Saves are stored in this browser. Clearing site data will erase them.
        </div>
      </div>
    </div>
  );
};
