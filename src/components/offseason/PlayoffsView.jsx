import { styles } from '../../theme/styles.js';
import { COLORS } from '../../theme/colors.js';
import { SectionTitle } from '../shared/SectionTitle.jsx';

const ROUND_LABELS = {
  wildcard:   'WILD CARD',
  divisional: 'DIVISIONAL',
  conference: 'CONFERENCE CHAMPIONSHIPS',
  superbowl:  'SUPER BOWL',
  done:       'SEASON COMPLETE',
};

export const PlayoffsView = ({ playoffs, league, simRound, simState, onStartOffseason }) => {
  const findT = id => league.find(t => t.id === id);
  const { seeds, round, results } = playoffs;
  const roundLabel = ROUND_LABELS[round];

  return (
    <div>
      <SectionTitle title="POSTSEASON" subtitle={roundLabel} />
      {round !== 'done' && !simState && (
        <button onClick={simRound} style={styles.bigBtn}>▶ SIMULATE {roundLabel}</button>
      )}
      {round === 'done' && (
        <button onClick={onStartOffseason} style={styles.bigBtn}>→ BEGIN OFFSEASON</button>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 20 }}>
        {['AFC', 'NFC'].map(conf => (
          <div key={conf} style={styles.detailCard}>
            <h4 style={styles.detailH4}>{conf} SEEDS</h4>
            {seeds[conf].map((t, i) => (
              <div key={t.id} style={{
                display: 'flex', justifyContent: 'space-between',
                padding: '6px 0', borderBottom: `1px solid ${COLORS.border}`,
              }}>
                <span>
                  <b>{i + 1}</b> · {t.city} {t.name}{' '}
                  {i === 0 && <span style={{ color: COLORS.accent, fontSize: 10 }}>BYE</span>}
                </span>
                <span style={{ opacity: 0.6 }}>{t.record.w}-{t.record.l}</span>
              </div>
            ))}
          </div>
        ))}
      </div>

      {simState && (
        <div style={{ marginTop: 24 }}>
          <h3 style={styles.weekHeader}>LIVE · Q{simState.quarter}</h3>
          <div style={styles.gameGrid}>
            {simState.matches.map((m, i) => {
              const h = findT(m.home.id);
              const a = findT(m.away.id);
              const live = simState.liveScores[i];
              return (
                <div key={i} style={{
                  ...styles.gameCard,
                  borderColor: i === simState.current ? COLORS.accent : COLORS.border,
                }}>
                  <div style={styles.gameTeamRow}>
                    <span style={{ ...styles.gameTeamDot, background: h.color }} />
                    <span style={styles.gameTeamLabel}>{h.id}</span>
                    <span style={styles.gameScore}>{live.h}</span>
                  </div>
                  <div style={styles.gameTeamRow}>
                    <span style={{ ...styles.gameTeamDot, background: a.color }} />
                    <span style={styles.gameTeamLabel}>{a.id}</span>
                    <span style={styles.gameScore}>{live.a}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {!simState && Object.entries(results).map(([rname, rresults]) => (
        <div key={rname} style={{ marginTop: 24 }}>
          <h3 style={styles.weekHeader}>{rname.toUpperCase()}</h3>
          <div style={styles.gameGrid}>
            {rresults.map((r, i) => (
              <div key={i} style={styles.gameCard}>
                <div style={styles.gameTeamRow}>
                  <span style={{ ...styles.gameTeamDot, background: r.winner.color }} />
                  <span style={styles.gameTeamLabel}>{r.winner.city} {r.winner.name}</span>
                  <span style={styles.gameScore}>{Math.max(r.result.homeScore, r.result.awayScore)}</span>
                </div>
                <div style={{ ...styles.gameTeamRow, opacity: 0.55 }}>
                  <span style={{ ...styles.gameTeamDot, background: r.loser.color }} />
                  <span style={styles.gameTeamLabel}>{r.loser.city} {r.loser.name}</span>
                  <span style={styles.gameScore}>{Math.min(r.result.homeScore, r.result.awayScore)}</span>
                </div>
                <div style={styles.gameMvp}>
                  <span style={{ opacity: 0.5 }}>MVP</span> {r.result.mvp}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};
