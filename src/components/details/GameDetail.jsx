import { styles } from '../../theme/styles.js';
import { COLORS, RARITY_COLOR } from '../../theme/colors.js';

const GameStatLine = ({ player, stats, onClick }) => {
  const renderStat = () => {
    if (player.position === 'QB')                            return `${stats.passYds || 0} PY · ${stats.passTd || 0} TD · ${stats.passInt || 0} INT · ${stats.rushYds || 0} RY`;
    if (player.position === 'WR' || player.position === 'TE') return `${stats.rec || 0} REC · ${stats.recYds || 0} YDS · ${stats.recTd || 0} TD`;
    if (player.position === 'RB')                            return `${stats.rushYds || 0} RY · ${stats.rushTd || 0} TD · ${stats.rec || 0}/${stats.recYds || 0} REC`;
    if (player.position === 'DE')                            return `${stats.sacks || 0} SACK · ${stats.tackles || 0} TKL · ${stats.ff || 0} FF`;
    if (player.position === 'CB')                            return `${stats.ints || 0} INT · ${stats.tackles || 0} TKL · ${stats.pd || 0} PD`;
    if (player.position === 'K/P')                           return `${stats.fgm || 0}/${stats.fga || 0} FG · ${stats.xpm || 0} XP`;
    if (player.kind === 'Coach')                              return stats.w ? 'W' : 'L';
    return '';
  };
  return (
    <div onClick={onClick} style={{
      display: 'flex', alignItems: 'center', gap: 10, padding: '8px 4px',
      borderBottom: `1px solid ${COLORS.border}`, cursor: 'pointer', fontSize: 12,
    }}>
      <span style={{ ...styles.rarityBadge, background: RARITY_COLOR[player.rarity], fontSize: 9 }}>
        {player.position === 'HC' ? 'HC' : player.position}
      </span>
      <span style={{ flex: 1, fontWeight: 600 }}>{player.name}</span>
      <span style={{ fontFamily: "'JetBrains Mono'", opacity: 0.85 }}>{renderStat()}</span>
    </div>
  );
};

export const GameDetail = ({ game, week, league, onBack, onPlayerClick, onTeamClick }) => {
  if (!game) {
    return (
      <div>
        <button onClick={onBack} style={styles.backBtn}>← BACK</button>
        <div style={{ ...styles.detailCard, opacity: 0.5, textAlign: 'center', padding: 40 }}>
          Game data not found.
        </div>
      </div>
    );
  }
  const findT = id => league.find(t => t.id === id);
  const home = findT(game.home);
  const away = findT(game.away);
  const homeWon = game.homeScore > game.awayScore;

  const weekLabel = typeof week === 'string' && week.startsWith('P-')
    ? week.replace('P-', '').toUpperCase()
    : `WEEK ${week}`;

  const buildPlayerDisplay = (teamObj, statLines) => {
    const playerMap = new Map();
    const allRoster = [teamObj.roster.qb, teamObj.roster.coach, ...teamObj.roster.stars].filter(Boolean);
    allRoster.forEach(p => playerMap.set(p.id, p));
    return statLines
      .map(line => ({ player: playerMap.get(line.id), stats: line.statDelta }))
      .filter(x => x.player);
  };
  const homePlayers = buildPlayerDisplay(home, game.playerStatsHome || []);
  const awayPlayers = buildPlayerDisplay(away, game.playerStatsAway || []);

  const boxRows = [
    ['POINTS',      game.homeScore,           game.awayScore],
    ['PASS YDS',    game.homeYards?.pass || 0, game.awayYards?.pass || 0],
    ['RUSH YDS',    game.homeYards?.run  || 0, game.awayYards?.run  || 0],
    ['ST YDS',      game.homeYards?.st   || 0, game.awayYards?.st   || 0],
    ['TDs',         game.homeStats?.tds  || 0, game.awayStats?.tds  || 0],
    ['FGs',         game.homeStats?.fgs  || 0, game.awayStats?.fgs  || 0],
    ['SACKS',       game.sacksA || 0,          game.sacksB || 0],
    ['INTs FORCED', game.intsA  || 0,          game.intsB  || 0],
    ['POSSESSION',  `${game.possA || 30}:00`,  `${game.possB || 30}:00`],
  ];

  return (
    <div>
      <button onClick={onBack} style={styles.backBtn}>← BACK</button>

      {/* SCORELINE HEADER */}
      <div style={{
        background: COLORS.panel, border: `1px solid ${COLORS.border}`,
        borderRadius: 6, padding: 24, marginBottom: 16,
      }}>
        <div style={{ fontSize: 11, letterSpacing: 3, opacity: 0.5, marginBottom: 12 }}>{weekLabel}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div onClick={() => onTeamClick(home.id)} style={{
            flex: 1, cursor: 'pointer',
            borderLeft: `5px solid ${home.color}`, paddingLeft: 14,
            opacity: homeWon ? 1 : 0.55,
          }}>
            <div style={{ fontSize: 12, letterSpacing: 2, opacity: 0.7 }}>{home.city.toUpperCase()}</div>
            <div style={{ fontFamily: "'Bebas Neue'", fontSize: 38, letterSpacing: 1, lineHeight: 1 }}>
              {home.name.toUpperCase()}
            </div>
            <div style={{ fontSize: 11, opacity: 0.5, marginTop: 4 }}>{home.record.w}-{home.record.l}</div>
          </div>
          <div style={{
            fontFamily: "'JetBrains Mono'", fontSize: 56, fontWeight: 900,
            color: homeWon ? COLORS.accent : COLORS.textMute,
          }}>{game.homeScore}</div>
          <div style={{ fontSize: 20, opacity: 0.3, margin: '0 8px' }}>—</div>
          <div style={{
            fontFamily: "'JetBrains Mono'", fontSize: 56, fontWeight: 900,
            color: !homeWon ? COLORS.accent : COLORS.textMute,
          }}>{game.awayScore}</div>
          <div onClick={() => onTeamClick(away.id)} style={{
            flex: 1, cursor: 'pointer',
            borderRight: `5px solid ${away.color}`, paddingRight: 14,
            textAlign: 'right', opacity: !homeWon ? 1 : 0.55,
          }}>
            <div style={{ fontSize: 12, letterSpacing: 2, opacity: 0.7 }}>{away.city.toUpperCase()}</div>
            <div style={{ fontFamily: "'Bebas Neue'", fontSize: 38, letterSpacing: 1, lineHeight: 1 }}>
              {away.name.toUpperCase()}
            </div>
            <div style={{ fontSize: 11, opacity: 0.5, marginTop: 4 }}>{away.record.w}-{away.record.l}</div>
          </div>
        </div>
        <div style={{ marginTop: 16, padding: 10, background: COLORS.bg, borderRadius: 4, fontSize: 13 }}>
          <span style={{ opacity: 0.5, marginRight: 8 }}>MVP</span>
          <span style={{ fontWeight: 700 }}>{game.mvp}</span>
        </div>
      </div>

      {/* BOXSCORE */}
      <div style={styles.detailCard}>
        <h4 style={styles.detailH4}>BOXSCORE</h4>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ ...styles.thNum, color: home.color }}>{home.id}</th>
              <th style={{ ...styles.th, textAlign: 'center', opacity: 0.5 }}>STAT</th>
              <th style={{ ...styles.thNum, color: away.color, textAlign: 'left' }}>{away.id}</th>
            </tr>
          </thead>
          <tbody>
            {boxRows.map(([label, h, a]) => (
              <tr key={label}>
                <td style={{ ...styles.tdNum, fontSize: 16, fontWeight: 700 }}>{h}</td>
                <td style={{ ...styles.td, textAlign: 'center', fontSize: 11, letterSpacing: 1.5, opacity: 0.6 }}>
                  {label}
                </td>
                <td style={{ ...styles.tdNum, fontSize: 16, fontWeight: 700, textAlign: 'left' }}>{a}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* STAR PLAYER STAT LINES */}
      <div style={{ ...styles.detailGrid, marginTop: 16 }}>
        <div style={styles.detailCard}>
          <h4 style={{ ...styles.detailH4, color: home.color }}>{home.id} STARS</h4>
          {homePlayers.length === 0 && <div style={{ opacity: 0.5 }}>No data</div>}
          {homePlayers.map((pd, i) => (
            <GameStatLine key={i} player={pd.player} stats={pd.stats} onClick={() => onPlayerClick(pd.player.id)} />
          ))}
        </div>
        <div style={styles.detailCard}>
          <h4 style={{ ...styles.detailH4, color: away.color }}>{away.id} STARS</h4>
          {awayPlayers.length === 0 && <div style={{ opacity: 0.5 }}>No data</div>}
          {awayPlayers.map((pd, i) => (
            <GameStatLine key={i} player={pd.player} stats={pd.stats} onClick={() => onPlayerClick(pd.player.id)} />
          ))}
        </div>
      </div>
    </div>
  );
};
