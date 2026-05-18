import { styles } from '../../theme/styles.js';

export const PreviewTeamRow = ({ team, seed, score, isWinner, showSeed }) => (
  <div style={{ ...styles.gameTeamRow, opacity: score != null && !isWinner ? 0.55 : 1 }}>
    <span style={{ ...styles.gameTeamDot, background: team.color }} />
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ fontSize: 13, letterSpacing: 0.5 }}>{team.id} {team.name}</div>
      {showSeed && (
        <div style={{ fontSize: 10, opacity: 0.55, marginTop: 1 }}>
          {team.conf} {seed} · {team.record.w}-{team.record.l}
          {team.record.t > 0 ? `-${team.record.t}` : ''}
        </div>
      )}
    </div>
    {score != null && <span style={styles.gameScore}>{score}</span>}
  </div>
);
