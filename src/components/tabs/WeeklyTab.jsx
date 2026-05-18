import { styles } from '../../theme/styles.js';
import { COLORS } from '../../theme/colors.js';
import { SectionTitle } from '../shared/SectionTitle.jsx';
import { PreviewTeamRow } from '../shared/PreviewTeamRow.jsx';
import { PlayoffsView } from '../offseason/PlayoffsView.jsx';
import { REGULAR_SEASON_WEEKS } from '../../engine/constants.js';

export const WeeklyTab = ({
  currentWeek, weekResults, schedule, league, simulateWeek,
  hasPlayoffs, playoffs, simRound, simState, onStartOffseason,
  weekUiState, revealCount, goToNextWeek, onSelectGame,
}) => {
  const findT = id => league.find(t => t.id === id);
  const allWeeks = Object.keys(weekResults).map(Number).sort((a, b) => b - a);

  if (hasPlayoffs) {
    return (
      <PlayoffsView playoffs={playoffs} league={league} simRound={simRound} simState={simState}
                    onStartOffseason={onStartOffseason} />
    );
  }

  // Live conference seeding (1-16) from current records.
  const confSeed = (teamId) => {
    const team = findT(teamId);
    const conf = [...league.filter(t => t.conf === team.conf)]
      .sort((a, b) => b.record.w - a.record.w || (b.record.pf - b.record.pa) - (a.record.pf - a.record.pa));
    return conf.findIndex(t => t.id === teamId) + 1;
  };

  const upcomingGames = currentWeek <= REGULAR_SEASON_WEEKS ? schedule[currentWeek - 1] : null;
  const showPreview = (weekUiState === 'preview' || weekUiState === 'simulating' || weekUiState === 'done')
    && upcomingGames;
  const currentWeekResults = (weekUiState === 'simulating' || weekUiState === 'done')
    ? (weekResults[currentWeek] || weekResults[currentWeek - 1])
    : null;

  return (
    <div>
      <SectionTitle
        title="WEEKLY"
        subtitle={currentWeek <= REGULAR_SEASON_WEEKS
          ? `Week ${currentWeek} of ${REGULAR_SEASON_WEEKS}`
          : 'Regular Season Complete'}
      />

      {/* PRIMARY ACTION BUTTON — pinned at top */}
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
          ▶ GO TO WEEK {currentWeek}
        </button>
      )}

      {/* PREVIEW / LIVE-SIM AREA */}
      {showPreview && (
        <div style={{ marginTop: 20 }}>
          <h3 style={styles.weekHeader}>
            {(weekUiState === 'simulating' || weekUiState === 'done')
              ? `WEEK ${currentWeekResults?.[0]?.week || currentWeek - 1}`
              : `WEEK ${currentWeek} MATCHUPS`}
          </h3>
          <div style={styles.gameGrid}>
            {(weekUiState === 'preview' ? upcomingGames : (currentWeekResults || [])).map((g, i) => {
              const isResult = weekUiState === 'simulating' || weekUiState === 'done';
              const revealed = isResult && i < revealCount;
              const home = findT(g.home);
              const away = findT(g.away);
              const hSeed = confSeed(home.id);
              const aSeed = confSeed(away.id);
              const hWon = isResult && revealed && g.homeScore > g.awayScore;
              const aWon = isResult && revealed && g.awayScore > g.homeScore;
              return (
                <div
                  key={i}
                  onClick={() => revealed ? onSelectGame({ week: g.week, gameIdx: i }) : null}
                  style={{
                    ...styles.gameCard,
                    cursor: revealed ? 'pointer' : 'default',
                    opacity: isResult && !revealed ? 0.35 : 1,
                    borderColor: isResult && i === revealCount - 1 ? COLORS.accent : COLORS.border,
                    transition: 'all 0.3s',
                  }}
                >
                  <PreviewTeamRow team={home} seed={hSeed}
                                  score={revealed ? g.homeScore : null}
                                  isWinner={hWon}
                                  showSeed={!isResult || !revealed} />
                  <PreviewTeamRow team={away} seed={aSeed}
                                  score={revealed ? g.awayScore : null}
                                  isWinner={aWon}
                                  showSeed={!isResult || !revealed} />
                  {revealed && (
                    <div style={styles.gameMvp}>
                      <span style={{ opacity: 0.5 }}>MVP</span> {g.mvp}
                    </div>
                  )}
                  {!isResult && (
                    <div style={{ ...styles.gameMvp, fontSize: 10, opacity: 0.4, letterSpacing: 1 }}>
                      {home.div === away.div && home.conf === away.conf
                        ? 'DIVISIONAL'
                        : 'INTER-CONFERENCE'}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* HISTORICAL WEEKS (excluding the week currently in preview/sim) */}
      {allWeeks
        .filter(w => weekUiState === 'done' ? w !== (currentWeek - 1) : true)
        .map(wk => (
          <div key={wk} style={{ marginTop: 28 }}>
            <h3 style={styles.weekHeader}>WEEK {wk}</h3>
            <div style={styles.gameGrid}>
              {weekResults[wk].map((g, i) => {
                const h = findT(g.home);
                const a = findT(g.away);
                const hWon = g.homeScore > g.awayScore;
                const aWon = g.awayScore > g.homeScore;
                return (
                  <div key={i} onClick={() => onSelectGame({ week: wk, gameIdx: i })}
                       style={{ ...styles.gameCard, cursor: 'pointer' }}>
                    <PreviewTeamRow team={h} score={g.homeScore} isWinner={hWon} />
                    <PreviewTeamRow team={a} score={g.awayScore} isWinner={aWon} />
                    <div style={styles.gameMvp}>
                      <span style={{ opacity: 0.5 }}>MVP</span> {g.mvp}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
    </div>
  );
};
