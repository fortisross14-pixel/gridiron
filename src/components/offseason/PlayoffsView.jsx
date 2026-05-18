import { useState } from 'react';
import { styles } from '../../theme/styles.js';
import { COLORS, RARITY_COLOR, rarityStyle, readableTextOn } from '../../theme/colors.js';
import { SectionTitle } from '../shared/SectionTitle.jsx';
import { PreviewTeamRow } from '../shared/PreviewTeamRow.jsx';

const ROUND_LABELS = {
  wildcard:   'WILD CARD',
  divisional: 'DIVISIONAL',
  conference: 'CONFERENCE',
  superbowl:  'SUPER BOWL',
  done:       'SEASON COMPLETE',
};

// ─── PRE-GAME PREVIEW (in popup) ─────────────────────────────────────────
// Shows pre-game info: records, team stats, momentum, stars side-by-side.
const PreGamePanel = ({ home, away }) => {
  const StatPair = ({ label, h, a, hi }) => (
    <tr>
      <td style={{ ...styles.tdNum, fontWeight: hi === 'h' ? 800 : 400, color: hi === 'h' ? home.color : undefined }}>{h}</td>
      <td style={{ ...styles.td, textAlign: 'center', fontSize: 10, letterSpacing: 1.5, opacity: 0.5 }}>{label}</td>
      <td style={{ ...styles.tdNum, fontWeight: hi === 'a' ? 800 : 400, color: hi === 'a' ? away.color : undefined, textAlign: 'left' }}>{a}</td>
    </tr>
  );
  const hMom = home.legacy.value * 2 + home.current.value;
  const aMom = away.legacy.value * 2 + away.current.value;
  const hpf = home.teamSeasonStats?.pf || 0;
  const apf = away.teamSeasonStats?.pf || 0;
  const hpa = home.teamSeasonStats?.pa || 0;
  const apa = away.teamSeasonStats?.pa || 0;
  const hpassYds = home.teamSeasonStats?.passYdsFor || 0;
  const apassYds = away.teamSeasonStats?.passYdsFor || 0;
  const hrunYds = home.teamSeasonStats?.runYdsFor || 0;
  const arunYds = away.teamSeasonStats?.runYdsFor || 0;

  const StarRow = ({ p, side }) => {
    if (!p) return null;
    return (
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '6px 8px',
        borderRadius: 4,
        fontSize: 12,
        flexDirection: side === 'a' ? 'row-reverse' : 'row',
      }}>
        <div style={{ ...styles.rarityBadge, ...rarityStyle(p.rarity), fontSize: 9 }}>{p.rarity}</div>
        <div style={{ flex: 1, minWidth: 0, textAlign: side === 'a' ? 'right' : 'left' }}>
          <div style={{ fontWeight: 700, fontSize: 12, lineHeight: 1.1 }}>{p.name}</div>
          <div style={{ fontSize: 10, color: COLORS.textMute }}>{p.position}</div>
        </div>
      </div>
    );
  };

  return (
    <div>
      {/* Records line */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 8px', marginBottom: 14 }}>
        <div style={{ flex: 1, textAlign: 'right' }}>
          <div style={{ fontSize: 10, letterSpacing: 1.5, color: COLORS.textMute }}>SEASON</div>
          <div style={{ fontFamily: "'JetBrains Mono'", fontSize: 22, fontWeight: 800 }}>
            {home.record.w}-{home.record.l}{home.record.t > 0 ? `-${home.record.t}` : ''}
          </div>
        </div>
        <div style={{ width: 1, height: 36, background: COLORS.border, margin: '0 18px' }} />
        <div style={{ flex: 1, textAlign: 'left' }}>
          <div style={{ fontSize: 10, letterSpacing: 1.5, color: COLORS.textMute }}>SEASON</div>
          <div style={{ fontFamily: "'JetBrains Mono'", fontSize: 22, fontWeight: 800 }}>
            {away.record.w}-{away.record.l}{away.record.t > 0 ? `-${away.record.t}` : ''}
          </div>
        </div>
      </div>

      {/* Team stats comparison table */}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 14 }}>
        <thead>
          <tr>
            <th style={{ ...styles.thNum, color: home.color }}>{home.id}</th>
            <th style={{ ...styles.th, textAlign: 'center', opacity: 0.5 }}>STAT</th>
            <th style={{ ...styles.thNum, color: away.color, textAlign: 'left' }}>{away.id}</th>
          </tr>
        </thead>
        <tbody>
          <StatPair label="POINTS FOR"    h={hpf} a={apf}  hi={hpf > apf ? 'h' : apf > hpf ? 'a' : null} />
          <StatPair label="POINTS AGAINST" h={hpa} a={apa} hi={hpa < apa ? 'h' : apa < hpa ? 'a' : null} />
          <StatPair label="PASS YDS"      h={hpassYds} a={apassYds} hi={hpassYds > apassYds ? 'h' : apassYds > hpassYds ? 'a' : null} />
          <StatPair label="RUSH YDS"      h={hrunYds} a={arunYds}    hi={hrunYds > arunYds ? 'h' : arunYds > hrunYds ? 'a' : null} />
          <StatPair label="LEGACY"        h={`${home.legacy.tier} +${home.legacy.value}`} a={`${away.legacy.tier} +${away.legacy.value}`} />
          <StatPair label="MOMENTUM"      h={hMom} a={aMom} hi={hMom > aMom ? 'h' : aMom > hMom ? 'a' : null} />
        </tbody>
      </table>

      {/* Stars compared */}
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6,
        borderTop: `1px solid ${COLORS.border}`, paddingTop: 12,
      }}>
        <div>
          <div style={{
            fontSize: 10, letterSpacing: 2, color: home.color, fontWeight: 700, marginBottom: 6,
          }}>{home.id} STARS</div>
          <StarRow p={home.roster.qb}    side="h" />
          {home.roster.stars.map(s => <StarRow key={s.id} p={s} side="h" />)}
        </div>
        <div>
          <div style={{
            fontSize: 10, letterSpacing: 2, color: away.color, fontWeight: 700, marginBottom: 6,
            textAlign: 'right',
          }}>{away.id} STARS</div>
          <StarRow p={away.roster.qb}    side="a" />
          {away.roster.stars.map(s => <StarRow key={s.id} p={s} side="a" />)}
        </div>
      </div>
    </div>
  );
};

// ─── POST-GAME RESULT (in popup) ─────────────────────────────────────────
// Shows team-stat-vs-team-stat boxscore (game stats, not season).
const PostGamePanel = ({ home, away, result }) => {
  const Pair = ({ label, h, a, hi }) => (
    <tr>
      <td style={{ ...styles.tdNum, fontSize: 16, fontWeight: 800,
        color: hi === 'h' ? COLORS.accent : undefined }}>{h}</td>
      <td style={{ ...styles.td, textAlign: 'center', fontSize: 10, letterSpacing: 1.5, opacity: 0.55 }}>{label}</td>
      <td style={{ ...styles.tdNum, fontSize: 16, fontWeight: 800, textAlign: 'left',
        color: hi === 'a' ? COLORS.accent : undefined }}>{a}</td>
    </tr>
  );
  const rows = [
    ['POINTS',      result.homeScore, result.awayScore],
    ['TDs',         result.homeStats?.tds || 0, result.awayStats?.tds || 0],
    ['FGs',         result.homeStats?.fgs || 0, result.awayStats?.fgs || 0],
    ['PASS YDS',    result.homeYards?.pass || 0, result.awayYards?.pass || 0],
    ['RUSH YDS',    result.homeYards?.run  || 0, result.awayYards?.run  || 0],
    ['SACKS',       result.sacksA || 0, result.sacksB || 0],
    ['INTs',        result.intsA  || 0, result.intsB  || 0],
    ['POSSESSION',  `${result.possA || 30}:00`, `${result.possB || 30}:00`],
  ];

  return (
    <div>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={{ ...styles.thNum, color: home.color }}>{home.id}</th>
            <th style={{ ...styles.th, textAlign: 'center', opacity: 0.5 }}>STAT</th>
            <th style={{ ...styles.thNum, color: away.color, textAlign: 'left' }}>{away.id}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(([label, h, a]) => (
            <Pair key={label} label={label} h={h} a={a}
              hi={typeof h === 'number' && typeof a === 'number' && h !== a ? (h > a ? 'h' : 'a') : null} />
          ))}
        </tbody>
      </table>
      <div style={{
        marginTop: 14, padding: 10, background: COLORS.panelDeep, borderRadius: 6,
        fontSize: 13, textAlign: 'center',
      }}>
        <span style={{ opacity: 0.55, letterSpacing: 1.5, fontSize: 10 }}>MVP </span>
        <span style={{ fontWeight: 800 }}>{result.mvp}</span>
      </div>
    </div>
  );
};

// ─── GAME POPUP ──────────────────────────────────────────────────────────
const GamePopup = ({
  match, gameResult, gameIdx, league, simState, onPlay, onClose, onNext, hasNext,
}) => {
  const home = league.find(t => t.id === match.home.id);
  const away = league.find(t => t.id === match.away.id);

  const isLive = simState?.gameIdx === gameIdx;
  const isDone = !!gameResult;
  // Show post-game when sim is complete AND not currently animating.
  const showPostGame = isDone && !isLive;
  // Live scores during animation.
  const liveH = isLive ? simState.live.h : (gameResult?.result.homeScore || 0);
  const liveA = isLive ? simState.live.a : (gameResult?.result.awayScore || 0);

  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.55)',
      display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
      zIndex: 200, padding: '4vh 16px',
      backdropFilter: 'blur(4px)',
    }}>
      <div onClick={(e) => e.stopPropagation()} style={{
        background: COLORS.panel,
        borderRadius: 12,
        padding: 24,
        maxWidth: 640, width: '100%',
        maxHeight: '92vh', overflowY: 'auto',
        boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
      }}>
        {/* Sticky action row at top */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          marginBottom: 16, gap: 12, flexWrap: 'wrap',
        }}>
          {!isDone && !isLive && (
            <button onClick={() => onPlay(gameIdx)} style={{
              ...styles.bigBtn, flex: 1, minWidth: 160, fontSize: 18, padding: '12px 20px',
            }}>▶ PLAY GAME</button>
          )}
          {isLive && (
            <div style={{
              flex: 1, padding: '12px 20px',
              background: COLORS.panelDeep, borderRadius: 8,
              fontFamily: "'Bebas Neue'", fontSize: 18, letterSpacing: 2,
              color: COLORS.textMute, textAlign: 'center',
            }}>◌ Q{simState.quarter} / 4</div>
          )}
          {showPostGame && hasNext && (
            <button onClick={onNext} style={{
              ...styles.bigBtn, flex: 1, minWidth: 160, fontSize: 16, padding: '12px 20px',
            }}>NEXT GAME →</button>
          )}
          {showPostGame && !hasNext && (
            <div style={{
              flex: 1, padding: '12px 20px',
              background: COLORS.success, color: 'white',
              borderRadius: 8, fontFamily: "'Bebas Neue'", fontSize: 16, letterSpacing: 2,
              textAlign: 'center', fontWeight: 700,
            }}>✓ ROUND COMPLETE</div>
          )}
          <button onClick={onClose} style={{
            background: 'transparent', border: `1px solid ${COLORS.borderMute}`,
            color: COLORS.textMute, width: 40, height: 40, padding: 0,
            borderRadius: 8, cursor: 'pointer', fontSize: 18,
          }}>✕</button>
        </div>

        {/* Scoreline header */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12,
          padding: '16px 12px',
          background: COLORS.panelDeep, borderRadius: 10,
          marginBottom: 16,
        }}>
          <div style={{ flex: 1, textAlign: 'right', borderRight: `4px solid ${home.color}`, paddingRight: 12 }}>
            <div style={{ fontSize: 10, letterSpacing: 2, color: COLORS.textMute, fontWeight: 700 }}>
              {home.city.toUpperCase()}
            </div>
            <div style={{ fontFamily: "'Bebas Neue'", fontSize: 26, letterSpacing: 1, lineHeight: 1 }}>
              {home.name.toUpperCase()}
            </div>
          </div>
          <div style={{
            fontFamily: "'JetBrains Mono'", fontSize: 38, fontWeight: 900,
            color: showPostGame && liveH > liveA ? COLORS.accent : COLORS.text,
          }}>{liveH}</div>
          <div style={{ fontSize: 16, opacity: 0.3 }}>—</div>
          <div style={{
            fontFamily: "'JetBrains Mono'", fontSize: 38, fontWeight: 900,
            color: showPostGame && liveA > liveH ? COLORS.accent : COLORS.text,
          }}>{liveA}</div>
          <div style={{ flex: 1, borderLeft: `4px solid ${away.color}`, paddingLeft: 12 }}>
            <div style={{ fontSize: 10, letterSpacing: 2, color: COLORS.textMute, fontWeight: 700 }}>
              {away.city.toUpperCase()}
            </div>
            <div style={{ fontFamily: "'Bebas Neue'", fontSize: 26, letterSpacing: 1, lineHeight: 1 }}>
              {away.name.toUpperCase()}
            </div>
          </div>
        </div>

        {/* Body: pre-game or post-game */}
        {!isDone && !isLive && <PreGamePanel home={home} away={away} />}
        {isLive && <PreGamePanel home={home} away={away} />}
        {showPostGame && <PostGamePanel home={home} away={away} result={gameResult.result} />}
      </div>
    </div>
  );
};

// ─── PLAYOFF MATCHUP CARD ────────────────────────────────────────────────
const MatchupCard = ({ match, gameResult, league, isLive, onClick }) => {
  const home = league.find(t => t.id === match.home.id);
  const away = league.find(t => t.id === match.away.id);
  const isDone = !!gameResult;
  const hWon = isDone && gameResult.result.homeScore > gameResult.result.awayScore;
  const aWon = isDone && gameResult.result.awayScore > gameResult.result.homeScore;

  return (
    <div onClick={onClick} style={{
      ...styles.gameCard,
      cursor: 'pointer',
      borderColor: isLive ? COLORS.accent : isDone ? COLORS.success : COLORS.border,
      borderWidth: isLive || isDone ? 2 : 1,
    }}>
      <PreviewTeamRow team={home}
                      score={isDone ? gameResult.result.homeScore : 0}
                      isWinner={hWon}
                      showSeed={!isDone}
                      recordAfter={isDone ? null : null} />
      <PreviewTeamRow team={away}
                      score={isDone ? gameResult.result.awayScore : 0}
                      isWinner={aWon}
                      showSeed={!isDone}
                      recordAfter={isDone ? null : null} />
      <div style={{
        marginTop: 8, paddingTop: 6, borderTop: `1px solid ${COLORS.border}`,
        fontSize: 10, letterSpacing: 1.5, color: isDone ? COLORS.success : isLive ? COLORS.accent : COLORS.textMute,
        fontWeight: 700, textAlign: 'center',
      }}>
        {isLive ? 'LIVE'
         : isDone ? `FINAL · MVP ${gameResult.result.mvp}`
         : 'CLICK TO PLAY'}
      </div>
    </div>
  );
};

// ─── MAIN PLAYOFFS VIEW ──────────────────────────────────────────────────
export const PlayoffsView = ({
  playoffs, league, simState,
  prepareRound, simulatePlayoffGame, advancePlayoffRound,
  onStartOffseason,
}) => {
  const [openGameIdx, setOpenGameIdx] = useState(null);

  const { seeds, round, results, pendingMatches, gameResults } = playoffs;
  const roundLabel = ROUND_LABELS[round] || round;

  const matches = pendingMatches || [];
  const completedCount = (gameResults || []).filter(Boolean).length;
  const allDone = matches.length > 0 && completedCount === matches.length;

  // When a game is open, close it automatically when sim is in progress AND it's not the open one.
  // (Otherwise click another card to switch.)

  const handlePlay = async (idx) => {
    await simulatePlayoffGame(idx);
    // Stay open to show post-game.
  };
  const handleNext = () => {
    if (openGameIdx === null) return;
    // Find next unsimmed game.
    const nextIdx = matches.findIndex((_, i) => i > openGameIdx && !gameResults?.[i]);
    if (nextIdx >= 0) {
      setOpenGameIdx(nextIdx);
    } else {
      // No more unsimmed games — close.
      setOpenGameIdx(null);
    }
  };

  return (
    <div>
      <SectionTitle title="POSTSEASON" subtitle={roundLabel} />

      {/* DONE — show offseason CTA */}
      {round === 'done' && (
        <button onClick={onStartOffseason} style={styles.bigBtn}>→ BEGIN OFFSEASON</button>
      )}

      {/* NOT YET STARTED — show "go to round" */}
      {round !== 'done' && !pendingMatches && (
        <button onClick={prepareRound} style={styles.bigBtn}>
          ▶ GO TO {roundLabel}
        </button>
      )}

      {/* ROUND IN PROGRESS — show match cards + advance button */}
      {pendingMatches && (
        <>
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            marginTop: 16, marginBottom: 12, flexWrap: 'wrap', gap: 8,
          }}>
            <h3 style={{ ...styles.weekHeader, margin: 0, paddingBottom: 0, borderBottom: 'none' }}>
              {roundLabel}
            </h3>
            <span style={{ fontSize: 12, letterSpacing: 1.5, color: COLORS.textMute, fontWeight: 700 }}>
              {completedCount}/{matches.length} games played
            </span>
          </div>
          <div style={styles.gameGrid}>
            {matches.map((m, i) => (
              <MatchupCard
                key={i}
                match={m}
                gameResult={gameResults?.[i]}
                league={league}
                isLive={simState?.gameIdx === i}
                onClick={() => setOpenGameIdx(i)}
              />
            ))}
          </div>
          {allDone && (
            <button onClick={advancePlayoffRound} style={{
              ...styles.bigBtn, marginTop: 16,
            }}>
              {round === 'superbowl' ? '🏆 CROWN CHAMPION' : `→ MOVE TO ${ROUND_LABELS[
                round === 'wildcard' ? 'divisional'
                : round === 'divisional' ? 'conference'
                : 'superbowl'
              ]}`}
            </button>
          )}
        </>
      )}

      {/* SEEDS REFERENCE */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 24 }}>
        {['AFC', 'NFC'].map(conf => (
          <div key={conf} style={styles.detailCard}>
            <h4 style={styles.detailH4}>{conf} SEEDS</h4>
            {seeds[conf].map((t, i) => (
              <div key={t.id} style={{
                display: 'flex', justifyContent: 'space-between',
                padding: '6px 0', borderBottom: `1px solid ${COLORS.border}`,
                fontSize: 13,
              }}>
                <span>
                  <b>{i + 1}</b> · {t.city} {t.name}
                  {i === 0 && <span style={{ color: COLORS.warning, fontSize: 10, marginLeft: 6 }}>BYE</span>}
                </span>
                <span style={{ color: COLORS.textMute }}>{t.record.w}-{t.record.l}</span>
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* PRIOR ROUND RESULTS */}
      {Object.entries(results).map(([rname, rresults]) => (
        <div key={rname} style={{ marginTop: 24 }}>
          <h3 style={styles.weekHeader}>{ROUND_LABELS[rname]}</h3>
          <div style={styles.gameGrid}>
            {rresults.map((r, i) => (
              <div key={i} style={styles.gameCard}>
                <PreviewTeamRow team={r.winner}
                                score={Math.max(r.result.homeScore, r.result.awayScore)}
                                isWinner={true} />
                <PreviewTeamRow team={r.loser}
                                score={Math.min(r.result.homeScore, r.result.awayScore)}
                                isWinner={false} />
                <div style={styles.gameMvp}>
                  <span style={{ opacity: 0.5 }}>MVP</span> {r.result.mvp}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* GAME POPUP */}
      {openGameIdx !== null && pendingMatches?.[openGameIdx] && (
        <GamePopup
          match={pendingMatches[openGameIdx]}
          gameResult={gameResults?.[openGameIdx]}
          gameIdx={openGameIdx}
          league={league}
          simState={simState}
          onPlay={handlePlay}
          onClose={() => setOpenGameIdx(null)}
          onNext={handleNext}
          hasNext={matches.some((_, i) => i > openGameIdx && !gameResults?.[i])}
        />
      )}
    </div>
  );
};
