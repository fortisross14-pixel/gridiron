import { readableTextOn } from '../../theme/colors.js';

// NFL-graphic-style team row: solid color tile (with team abbr) + name + score.
export const PreviewTeamRow = ({ team, seed, score, isWinner, showSeed }) => {
  const tileColor = team.color;
  const tileText  = readableTextOn(tileColor);
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '6px 0',
      opacity: score != null && !isWinner ? 0.45 : 1,
      transition: 'opacity 0.3s',
    }}>
      <div style={{
        background: tileColor,
        color: tileText,
        width: 40, height: 40,
        borderRadius: 6,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: "'Bebas Neue'", fontSize: 16, letterSpacing: 0.5,
        fontWeight: 700,
        flexShrink: 0,
      }}>{team.id}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: "'Bebas Neue'", fontSize: 18, letterSpacing: 1, lineHeight: 1.1 }}>
          {team.name.toUpperCase()}
        </div>
        {showSeed && (
          <div style={{ fontSize: 10, opacity: 0.55, marginTop: 2, letterSpacing: 1 }}>
            {team.conf} {seed} · {team.record.w}-{team.record.l}
            {team.record.t > 0 ? `-${team.record.t}` : ''}
          </div>
        )}
      </div>
      {score != null && (
        <span style={{
          fontFamily: "'JetBrains Mono'", fontSize: 22, fontWeight: 800,
          color: isWinner ? '#FBBF24' : undefined,
        }}>
          {isWinner && <span style={{ marginRight: 4, fontSize: 14 }}>▸</span>}
          {score}
        </span>
      )}
    </div>
  );
};
