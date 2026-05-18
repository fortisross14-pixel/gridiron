import { useState, useEffect } from 'react';
import { styles } from '../../theme/styles.js';
import { COLORS, readableTextOn } from '../../theme/colors.js';
import { SectionTitle } from '../shared/SectionTitle.jsx';
import { PreviewTeamRow } from '../shared/PreviewTeamRow.jsx';
import { PlayoffsView } from '../offseason/PlayoffsView.jsx';
import { REGULAR_SEASON_WEEKS } from '../../engine/constants.js';

// ─── HIGHLIGHTS MODAL ────────────────────────────────────────────────────
const HIGHLIGHT_KIND_STYLE = {
  LEGACY_UPSET:       { bg: '#FEF3C7', border: '#F59E0B', label: '⚡ Upset' },
  POSITION_UPSET:     { bg: '#FEF3C7', border: '#F59E0B', label: '⚡ Upset' },
  SEASON_RECORD:      { bg: '#DBEAFE', border: '#2563EB', label: '📊 Season Record' },
  HISTORICAL_RECORD:  { bg: '#FCE7F3', border: '#9333EA', label: '🏆 All-Time Record' },
  CLINCH:             { bg: '#DCFCE7', border: '#16A34A', label: '🎟 Clinched' },
  LAST_GAME:          { bg: '#FEE2E2', border: '#DC2626', label: '🌇 Career End' },
};

const HighlightsModal = ({ weekNumber, highlights, onClose }) => {
  // Group by kind for cleaner display.
  const byKind = {};
  highlights.forEach(h => {
    byKind[h.kind] = byKind[h.kind] || [];
    byKind[h.kind].push(h);
  });
  const order = ['LEGACY_UPSET', 'POSITION_UPSET', 'HISTORICAL_RECORD',
                 'SEASON_RECORD', 'CLINCH', 'LAST_GAME'];

  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0,
      background: 'rgba(15,23,42,0.55)',
      display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
      zIndex: 200, padding: '8vh 16px',
      backdropFilter: 'blur(4px)',
    }}>
      <div onClick={(e) => e.stopPropagation()} style={{
        background: COLORS.panel,
        borderRadius: 12,
        padding: 28,
        maxWidth: 640, width: '100%',
        maxHeight: '80vh', overflowY: 'auto',
        boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
          <div>
            <div style={{ fontSize: 11, letterSpacing: 3, color: COLORS.textMute, fontWeight: 700 }}>
              WEEK {weekNumber}
            </div>
            <div style={{ fontFamily: "'Bebas Neue'", fontSize: 36, letterSpacing: 2, lineHeight: 1, marginTop: 4 }}>
              HIGHLIGHTS
            </div>
          </div>
          <button onClick={onClose} style={{
            background: 'none', border: `1px solid ${COLORS.borderMute}`,
            color: COLORS.textMute, width: 32, height: 32, padding: 0,
            borderRadius: 6, cursor: 'pointer', fontSize: 18, lineHeight: 1,
          }}>✕</button>
        </div>

        {highlights.length === 0 ? (
          <div style={{ padding: 24, textAlign: 'center', color: COLORS.textMute }}>
            Nothing remarkable happened this week.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {order.flatMap(kind => (byKind[kind] || []).map((h, idx) => {
              const stl = HIGHLIGHT_KIND_STYLE[h.kind];
              return (
                <div key={`${kind}-${idx}`} style={{
                  display: 'flex', gap: 12,
                  padding: '10px 14px',
                  background: stl.bg,
                  borderLeft: `4px solid ${stl.border}`,
                  borderRadius: 6,
                  fontSize: 13,
                  color: COLORS.text,
                }}>
                  <div style={{
                    fontSize: 10, letterSpacing: 1, fontWeight: 700,
                    color: stl.border, minWidth: 110,
                  }}>{stl.label}</div>
                  <div style={{ flex: 1 }}>{h.text}</div>
                </div>
              );
            }))}
          </div>
        )}
      </div>
    </div>
  );
};

// ─── WEEK SLICER ─────────────────────────────────────────────────────────
const WeekSlicer = ({ selectedWeek, setSelectedWeek, completedWeeks }) => {
  if (completedWeeks.length === 0) return null;
  const min = Math.min(...completedWeeks);
  const max = Math.max(...completedWeeks);
  const canPrev = selectedWeek > min;
  const canNext = selectedWeek < max;
  const arrowBtn = (enabled, onClick, label) => (
    <button onClick={onClick} disabled={!enabled} style={{
      width: 36, height: 36, borderRadius: 8,
      background: enabled ? COLORS.panel : 'transparent',
      border: `1px solid ${enabled ? COLORS.borderMute : COLORS.border}`,
      color: enabled ? COLORS.text : COLORS.borderMute,
      cursor: enabled ? 'pointer' : 'not-allowed',
      fontSize: 16, fontWeight: 800,
    }}>{label}</button>
  );

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 8,
      marginBottom: 16, flexWrap: 'wrap',
    }}>
      {arrowBtn(canPrev, () => setSelectedWeek(selectedWeek - 1), '‹')}
      <div style={{
        display: 'flex', gap: 6, flexWrap: 'wrap', flex: 1, justifyContent: 'center',
      }}>
        {completedWeeks.map(w => (
          <button key={w} onClick={() => setSelectedWeek(w)} style={{
            minWidth: 44, height: 36, padding: '0 12px',
            borderRadius: 8, cursor: 'pointer',
            background: selectedWeek === w ? COLORS.accent : COLORS.panel,
            color: selectedWeek === w ? COLORS.accentText : COLORS.text,
            border: `1px solid ${selectedWeek === w ? COLORS.accent : COLORS.borderMute}`,
            fontFamily: "'Oswald'", fontSize: 13, fontWeight: 700, letterSpacing: 1,
          }}>W{w}</button>
        ))}
      </div>
      {arrowBtn(canNext, () => setSelectedWeek(selectedWeek + 1), '›')}
    </div>
  );
};

// ─── GAME CARD (with W-L badges) ─────────────────────────────────────────
const GameCard = ({ game, league, isLive, isRevealed, isPreview, onClick }) => {
  const findT = id => league.find(t => t.id === id);
  const h = findT(game.home);
  const a = findT(game.away);
  const hWon = !isPreview && isRevealed && game.homeScore > game.awayScore;
  const aWon = !isPreview && isRevealed && game.awayScore > game.homeScore;

  // Use the snapshot W/L if available, else fall back to current.
  const hRec = game.homeRecordAfter || h.record;
  const aRec = game.awayRecordAfter || a.record;

  return (
    <div
      onClick={() => isRevealed ? onClick({ week: game.week, gameIdx: game.gameIdx }) : null}
      style={{
        ...styles.gameCard,
        cursor: isRevealed ? 'pointer' : 'default',
        opacity: !isPreview && !isRevealed ? 0.35 : 1,
        borderColor: isLive ? COLORS.accent : COLORS.border,
        transition: 'all 0.3s',
      }}
    >
      <PreviewTeamRow team={h}
                      score={isRevealed ? game.homeScore : null}
                      isWinner={hWon}
                      recordAfter={isRevealed ? hRec : null}
                      showSeed={isPreview} />
      <PreviewTeamRow team={a}
                      score={isRevealed ? game.awayScore : null}
                      isWinner={aWon}
                      recordAfter={isRevealed ? aRec : null}
                      showSeed={isPreview} />
      {isRevealed && (
        <div style={styles.gameMvp}>
          <span style={{ opacity: 0.5 }}>MVP</span> {game.mvp}
        </div>
      )}
      {isPreview && (
        <div style={{ ...styles.gameMvp, fontSize: 10, opacity: 0.4, letterSpacing: 1 }}>
          {h.div === a.div && h.conf === a.conf ? 'DIVISIONAL' : 'INTER-CONFERENCE'}
        </div>
      )}
    </div>
  );
};

// ─── MAIN WEEKLY TAB ─────────────────────────────────────────────────────
export const WeeklyTab = ({
  currentWeek, weekResults, weekHighlights, schedule, league, simulateWeek,
  hasPlayoffs, playoffs, simRound, simState, onStartOffseason,
  weekUiState, revealCount, goToNextWeek, onSelectGame,
}) => {
  // Completed weeks (sorted ascending).
  const completedWeeks = Object.keys(weekResults).map(Number).sort((a, b) => a - b);
  const latestCompleted = completedWeeks.length > 0 ? Math.max(...completedWeeks) : null;

  // Which week is selected for viewing. Defaults to the latest completed.
  const [selectedWeek, setSelectedWeek] = useState(latestCompleted);
  const [showHighlights, setShowHighlights] = useState(false);

  // When a new week completes, auto-advance the slicer to it.
  useEffect(() => {
    if (latestCompleted !== null && (selectedWeek === null || latestCompleted > selectedWeek)) {
      setSelectedWeek(latestCompleted);
    }
  }, [latestCompleted]);

  if (hasPlayoffs) {
    return (
      <PlayoffsView playoffs={playoffs} league={league} simRound={simRound} simState={simState}
                    onStartOffseason={onStartOffseason} />
    );
  }

  const upcomingGames = currentWeek <= REGULAR_SEASON_WEEKS ? schedule[currentWeek - 1] : null;

  // Decide what to show in the games area.
  // During preview/simulating/done of CURRENT week, show that.
  // Otherwise, show the selected past week.
  const showCurrentSim = weekUiState === 'preview' || weekUiState === 'simulating' || weekUiState === 'done';
  const viewWeek = showCurrentSim ? (weekUiState === 'preview' ? currentWeek : currentWeek - 1) : selectedWeek;
  const viewWeekGames =
    weekUiState === 'preview' ? upcomingGames :
    viewWeek === null ? null :
    (weekResults[viewWeek] || null);

  const isLivePreview = weekUiState === 'preview';
  const isSimulating  = weekUiState === 'simulating';
  const viewHighlights = (viewWeek !== null && !isLivePreview)
    ? (weekHighlights?.[viewWeek] || []) : [];

  return (
    <div>
      <SectionTitle
        title="WEEKLY"
        subtitle={currentWeek <= REGULAR_SEASON_WEEKS
          ? `Week ${currentWeek} of ${REGULAR_SEASON_WEEKS}`
          : 'Regular Season Complete'}
      />

      {/* PRIMARY ACTION ROW: simulate/continue + highlights button */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 240 }}>
          {currentWeek <= REGULAR_SEASON_WEEKS && weekUiState === 'idle' && (
            <button onClick={goToNextWeek} style={styles.bigBtn}>
              ▶ GO TO WEEK {currentWeek}
            </button>
          )}
          {currentWeek <= REGULAR_SEASON_WEEKS && weekUiState === 'preview' && (
            <button onClick={simulateWeek} style={styles.bigBtn}>
              ▶ SIMULATE WEEK {currentWeek}
            </button>
          )}
          {weekUiState === 'simulating' && (
            <div style={{ ...styles.bigBtn, opacity: 0.5, cursor: 'wait' }}>
              ◌ SIMULATING... {revealCount}/{upcomingGames?.length || 16}
            </div>
          )}
          {weekUiState === 'done' && currentWeek <= REGULAR_SEASON_WEEKS && (
            <button onClick={goToNextWeek} style={styles.bigBtn}>
              ▶ CONTINUE TO WEEK {currentWeek}
            </button>
          )}
        </div>
        {/* HIGHLIGHTS BUTTON */}
        <button
          onClick={() => setShowHighlights(true)}
          disabled={viewWeek === null || isLivePreview}
          style={{
            padding: '0 22px',
            background: viewHighlights.length > 0 ? COLORS.info : 'transparent',
            color: viewHighlights.length > 0 ? COLORS.infoText : COLORS.textMute,
            border: `2px solid ${viewHighlights.length > 0 ? COLORS.info : COLORS.borderMute}`,
            borderRadius: 8,
            fontFamily: "'Bebas Neue'", fontSize: 18, letterSpacing: 2,
            cursor: viewWeek === null || isLivePreview ? 'not-allowed' : 'pointer',
            fontWeight: 700,
            display: 'flex', alignItems: 'center', gap: 8,
            opacity: viewWeek === null || isLivePreview ? 0.4 : 1,
            minHeight: 56,
          }}
        >
          ★ HIGHLIGHTS
          {viewHighlights.length > 0 && (
            <span style={{
              background: 'rgba(255,255,255,0.3)', padding: '2px 8px', borderRadius: 10,
              fontSize: 12, fontFamily: "'Oswald'",
            }}>{viewHighlights.length}</span>
          )}
        </button>
      </div>

      {/* WEEK SLICER — only when there ARE completed weeks and not actively prev/simulating */}
      {!isLivePreview && !isSimulating && completedWeeks.length > 0 && (
        <WeekSlicer
          selectedWeek={selectedWeek}
          setSelectedWeek={setSelectedWeek}
          completedWeeks={completedWeeks}
        />
      )}

      {/* WEEK HEADER ABOVE GAMES */}
      {viewWeekGames && (
        <h3 style={styles.weekHeader}>
          {isLivePreview ? `WEEK ${currentWeek} — MATCHUPS`
           : isSimulating ? `WEEK ${currentWeek} — LIVE`
           : `WEEK ${viewWeek}`}
        </h3>
      )}

      {/* GAMES GRID */}
      {viewWeekGames && (
        <div style={styles.gameGrid}>
          {viewWeekGames.map((g, i) => {
            const isRevealed = isLivePreview ? false
              : isSimulating ? (i < revealCount)
              : true;
            const isLive = isSimulating && i === revealCount - 1;
            return (
              <GameCard key={i}
                        game={isLivePreview ? { ...g, week: currentWeek, gameIdx: i } : g}
                        league={league}
                        isLive={isLive}
                        isRevealed={isRevealed}
                        isPreview={isLivePreview}
                        onClick={onSelectGame} />
            );
          })}
        </div>
      )}

      {!viewWeekGames && !isLivePreview && (
        <div style={{
          ...styles.detailCard, textAlign: 'center', padding: 40,
          color: COLORS.textMute,
        }}>
          No games to display yet. Simulate Week 1 to start.
        </div>
      )}

      {showHighlights && (
        <HighlightsModal
          weekNumber={viewWeek}
          highlights={viewHighlights}
          onClose={() => setShowHighlights(false)}
        />
      )}
    </div>
  );
};
