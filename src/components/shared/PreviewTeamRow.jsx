import { readableTextOn, COLORS } from '../../theme/colors.js';

// NFL-graphic-style team row: solid color tile + name + record + score.
//
// Two display modes:
//   - Preview (showSeed=true): shows pre-game seed and W-L
//   - Result (recordAfter set): shows post-game W-L next to the team name
export const PreviewTeamRow = ({ team, seed, score, isWinner, showSeed, recordAfter }) => {
  const tileColor = team.color;
  const tileText  = readableTextOn(tileColor);

  // Format record string for display.
  const fmtRec = (r) => `${r.w}-${r.l}${r.t > 0 ? `-${r.t}` : ''}`;
  const recString = recordAfter ? fmtRec(recordAfter)
    : showSeed ? fmtRec(team.record)
    : null;

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '6px 0',
      opacity: score != null && !isWinner ? 0.5 : 1,
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
        <div style={{
          fontFamily: "'Bebas Neue'", fontSize: 18, letterSpacing: 1,
          lineHeight: 1.1, color: COLORS.text,
        }}>
          {team.name.toUpperCase()}
        </div>
        {recString && (
          <div style={{
            fontSize: 10, color: COLORS.textMute, marginTop: 2, letterSpacing: 1,
            fontWeight: 600,
          }}>
            {showSeed && seed ? `${team.conf} ${seed} · ` : ''}{recString}
          </div>
        )}
      </div>
      {score != null && (
        <span style={{
          fontFamily: "'JetBrains Mono'", fontSize: 22, fontWeight: 800,
          color: isWinner ? COLORS.warning : COLORS.text,
        }}>
          {isWinner && <span style={{ marginRight: 4, fontSize: 14 }}>▸</span>}
          {score}
        </span>
      )}
    </div>
  );
};
