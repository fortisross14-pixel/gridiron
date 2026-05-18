import { useState, useEffect, useRef } from 'react';
import { styles } from '../theme/styles.js';
import { COLORS } from '../theme/colors.js';
import { listSaves, deleteSave, timeAgo, exportSave, importSave, SLOT_COUNT } from '../state/saves.js';

// ─── HOME PAGE ───────────────────────────────────────────────────────────
// Shown when the app first loads. Lists 3 save slots and lets the user
// either continue an existing league, create a new one, or import a backup.
export const HomePage = ({ onLoad, onNew }) => {
  const [slots, setSlots] = useState([]);
  const [newSlotIdx, setNewSlotIdx] = useState(null);
  const [newName, setNewName] = useState('');
  const [importTargetIdx, setImportTargetIdx] = useState(null);
  const [importError, setImportError] = useState('');
  const importInputRef = useRef(null);

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

  const triggerImport = (slotIdx) => {
    setImportTargetIdx(slotIdx);
    setImportError('');
    // Reset value so the same file can be re-selected.
    if (importInputRef.current) importInputRef.current.value = '';
    importInputRef.current?.click();
  };

  const handleImportFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file || importTargetIdx === null) return;
    // If slot is non-empty, confirm overwrite.
    if (slots[importTargetIdx] && !confirm(`Slot ${importTargetIdx + 1} already has a save. Overwrite it?`)) {
      setImportTargetIdx(null);
      return;
    }
    const result = await importSave(importTargetIdx, file);
    if (result.ok) {
      refresh();
      setImportError('');
    } else {
      setImportError(result.error);
    }
    setImportTargetIdx(null);
  };

  return (
    <div style={styles.app}>
      <style>{`* { box-sizing: border-box; } body { margin: 0; }`}</style>
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '80px 28px 40px' }}>
        {/* HERO */}
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 12,
            padding: '6px 14px', borderRadius: 20,
            background: 'rgba(213,10,10,0.08)',
            border: `1px solid rgba(213,10,10,0.25)`,
            marginBottom: 24,
            fontSize: 11, letterSpacing: 2, color: COLORS.accent, fontWeight: 700,
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: COLORS.accent }} />
            NFL SEASON SIMULATOR
          </div>
          <div style={{
            fontFamily: "'Bebas Neue'", fontSize: 88, letterSpacing: 6,
            lineHeight: 0.95, color: COLORS.text,
          }}>
            GRIDIRON
          </div>
          <div style={{
            fontSize: 12, letterSpacing: 3, color: COLORS.textMute, marginTop: 12,
            fontWeight: 600,
          }}>
            PICK A LEAGUE TO CONTINUE OR START A NEW ONE
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
                  style={{
                    ...styles.detailCard,
                    padding: 24,
                    minHeight: 180,
                    border: `2px dashed ${COLORS.borderMute}`,
                    background: 'transparent',
                    boxShadow: 'none',
                    display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center',
                    gap: 12,
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = COLORS.accent;
                    e.currentTarget.style.background = 'rgba(213,10,10,0.04)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = COLORS.borderMute;
                    e.currentTarget.style.background = 'transparent';
                  }}
                >
                  <div style={{
                    fontSize: 11, letterSpacing: 2, color: COLORS.textMute, fontWeight: 700,
                  }}>SLOT {idx + 1}</div>
                  <button
                    onClick={() => setNewSlotIdx(idx)}
                    style={{
                      background: 'none', border: 'none',
                      fontSize: 24, color: COLORS.accent, fontWeight: 700,
                      cursor: 'pointer', fontFamily: "'Bebas Neue'", letterSpacing: 2,
                    }}
                  >+ NEW LEAGUE</button>
                  <button
                    onClick={() => triggerImport(idx)}
                    style={{
                      background: 'none', border: 'none',
                      fontSize: 11, color: COLORS.textMute, letterSpacing: 1.5,
                      cursor: 'pointer', textDecoration: 'underline', fontWeight: 600,
                    }}
                  >or import a backup</button>
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

                {/* ACTION BUTTONS — top-right, stop click bubbling */}
                <div style={{
                  position: 'absolute', top: 10, right: 10,
                  display: 'flex', gap: 6,
                }}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      exportSave(idx);
                    }}
                    style={{
                      background: 'transparent',
                      border: `1px solid ${COLORS.borderMute}`,
                      color: COLORS.textMute,
                      width: 28, height: 28, padding: 0,
                      borderRadius: 6, cursor: 'pointer',
                      fontSize: 14, lineHeight: 1,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = COLORS.info;
                      e.currentTarget.style.color = COLORS.info;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = COLORS.borderMute;
                      e.currentTarget.style.color = COLORS.textMute;
                    }}
                    title="Export this league as a backup file"
                  >⬇</button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(idx, slot.name);
                    }}
                    style={{
                      background: 'transparent',
                      border: `1px solid ${COLORS.borderMute}`,
                      color: COLORS.textMute,
                      width: 28, height: 28, padding: 0,
                      borderRadius: 6, cursor: 'pointer',
                      fontFamily: "'Oswald'", fontSize: 13, lineHeight: 1,
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
              </div>
            );
          })}
        </div>

        {/* IMPORT ERROR TOAST */}
        {importError && (
          <div style={{
            marginTop: 16, padding: 12,
            background: 'rgba(220,38,38,0.08)',
            border: `1px solid ${COLORS.danger}`,
            borderRadius: 8,
            color: COLORS.danger,
            fontSize: 13, fontWeight: 600,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <span><strong>Import failed:</strong> {importError}</span>
            <button onClick={() => setImportError('')} style={{
              background: 'none', border: 'none', color: COLORS.danger,
              fontSize: 18, cursor: 'pointer', padding: '0 8px', lineHeight: 1,
            }}>✕</button>
          </div>
        )}

        {/* HIDDEN FILE INPUT — triggered by Import buttons */}
        <input
          ref={importInputRef}
          type="file"
          accept="application/json,.json"
          onChange={handleImportFile}
          style={{ display: 'none' }}
        />

        <div style={{
          marginTop: 32, textAlign: 'center', fontSize: 11, color: COLORS.textMute,
          letterSpacing: 1, lineHeight: 1.7,
        }}>
          Saves are stored in this browser. Clearing site data will erase them.<br/>
          <strong style={{ color: COLORS.text }}>Add to Home Screen</strong> for the most durable storage,
          or use ⬇ to export a backup.
        </div>
      </div>
    </div>
  );
};
