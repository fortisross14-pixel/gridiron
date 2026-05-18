import { useState } from 'react';
import { styles } from '../../theme/styles.js';
import { COLORS, RARITY_COLOR } from '../../theme/colors.js';
import { SectionTitle } from '../shared/SectionTitle.jsx';
import { RARITY_MULT } from '../../engine/constants.js';

// ─── PLAYER ROW (used in Roster view) ────────────────────────────────────
const PlayerRow = ({ player, onClick }) => {
  const stats = player.currentSeason || {};
  const renderStats = () => {
    if (player.position === 'QB')                            return `${stats.passYds || 0} yds · ${stats.passTd || 0} TD`;
    if (player.position === 'WR' || player.position === 'TE') return `${stats.recYds || 0} yds · ${stats.recTd || 0} TD`;
    if (player.position === 'RB')                            return `${stats.rushYds || 0} rush yds · ${stats.rushTd || 0} TD`;
    if (player.position === 'DE')                            return `${stats.sacks || 0} sacks · ${stats.tackles || 0} tkl`;
    if (player.position === 'CB')                            return `${stats.ints || 0} INT · ${stats.tackles || 0} tkl`;
    if (player.position === 'K/P')                           return `${stats.fgm || 0}/${stats.fga || 0} FG`;
    return '';
  };
  return (
    <div onClick={onClick}
         style={{ ...styles.playerRow, borderLeftColor: player.teamColor || COLORS.borderMute }}>
      <div style={{
        ...styles.rarityBadge, background: RARITY_COLOR[player.rarity],
        minWidth: 64, textAlign: 'center',
      }}>{player.rarity}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 15, fontWeight: 700 }}>{player.name}</div>
        <div style={{ fontSize: 11, opacity: 0.6 }}>{player.position} · {player.teamId || 'FA'}</div>
      </div>
      <div style={{ textAlign: 'right', fontSize: 12, fontFamily: "'JetBrains Mono'" }}>
        <div>{renderStats()}</div>
        <div style={{ opacity: 0.5, fontSize: 10 }}>Y{player.yearsIn + 1}/{player.career}</div>
      </div>
    </div>
  );
};

// ─── ROSTER VIEW ─────────────────────────────────────────────────────────
const RosterView = ({ league, freeAgents, onSelectPlayer }) => {
  const [posFilter, setPosFilter] = useState('ALL');
  const [sortKey, setSortKey]     = useState('auto');
  const [showFA, setShowFA]       = useState(false);

  const teamPlayers = league.flatMap(t => {
    const all = [t.roster.qb, ...t.roster.stars].filter(Boolean);
    return all.map(p => ({ ...p, teamId: t.id, teamColor: t.color, teamName: t.name, teamCity: t.city }));
  });
  const faPlayers = freeAgents.stars.map(p => ({
    ...p, teamId: null, teamColor: COLORS.borderMute, teamName: 'Free Agent', teamCity: 'FA',
  }));
  const allPlayers = showFA ? [...teamPlayers, ...faPlayers] : teamPlayers;

  const positions = ['ALL', 'QB', 'WR', 'RB', 'TE', 'DE', 'CB', 'K/P'];
  const filtered = posFilter === 'ALL'
    ? allPlayers
    : allPlayers.filter(p => p.position === posFilter);

  const sortOptions =
    posFilter === 'QB'                          ? ['passYds', 'passTd', 'w', 'rarity']
    : (posFilter === 'WR' || posFilter === 'TE') ? ['recYds', 'recTd', 'rec', 'rarity']
    : posFilter === 'RB'                         ? ['rushYds', 'rushTd', 'recYds', 'rarity']
    : posFilter === 'DE'                         ? ['sacks', 'tackles', 'ff', 'rarity']
    : posFilter === 'CB'                         ? ['ints', 'tackles', 'pd', 'rarity']
    : posFilter === 'K/P'                        ? ['fgm', 'fga', 'rarity']
    : ['rarity', 'auto'];

  const sorted = [...filtered].sort((a, b) => {
    if (sortKey === 'rarity' || sortKey === 'auto' || !sortKey)
      return RARITY_MULT[b.rarity] - RARITY_MULT[a.rarity];
    return (b.currentSeason?.[sortKey] || 0) - (a.currentSeason?.[sortKey] || 0);
  });

  const chip = (selected, onClick, label) => (
    <button onClick={onClick} style={{
      ...styles.chip,
      background: selected ? COLORS.accent : 'transparent',
      color: selected ? COLORS.accentText : COLORS.textMute,
    }}>{label}</button>
  );

  return (
    <>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
        <span style={{ fontSize: 11, letterSpacing: 1.5, opacity: 0.6, alignSelf: 'center' }}>POSITION</span>
        {positions.map(p => chip(posFilter === p, () => { setPosFilter(p); setSortKey('auto'); }, p))}
      </div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
        <span style={{ fontSize: 11, letterSpacing: 1.5, opacity: 0.6, alignSelf: 'center' }}>SORT</span>
        {sortOptions.map(k => chip(sortKey === k, () => setSortKey(k), k.toUpperCase()))}
        <button onClick={() => setShowFA(!showFA)} style={{
          ...styles.chip,
          background: showFA ? '#3b82f6' : 'transparent',
          color: showFA ? '#fff' : COLORS.textMute,
          marginLeft: 'auto',
        }}>{showFA ? '✓ INCLUDE FREE AGENTS' : 'INCLUDE FREE AGENTS'}</button>
      </div>

      <div style={styles.starGrid}>
        {sorted.slice(0, 100).map(p => (
          <PlayerRow key={p.id} player={p} onClick={() => onSelectPlayer(p.id)} />
        ))}
      </div>
      {sorted.length > 100 && (
        <div style={{ opacity: 0.5, fontSize: 12, marginTop: 12, textAlign: 'center' }}>
          Showing top 100 of {sorted.length}
        </div>
      )}
    </>
  );
};

// ─── LEADERBOARD VIEW ─────────────────────────────────────────────────────
// "Top Rushing Yards"-style display: pick a stat, see top 20 ranked.
const LEADERBOARD_STATS = [
  { key: 'passYds',  label: 'PASSING YDS',     positions: ['QB'],          fmt: v => `${v} yds` },
  { key: 'passTd',   label: 'PASSING TDs',     positions: ['QB'],          fmt: v => `${v} TD` },
  { key: 'rushYds',  label: 'RUSHING YDS',     positions: ['RB','QB'],     fmt: v => `${v} yds` },
  { key: 'rushTd',   label: 'RUSHING TDs',     positions: ['RB','QB'],     fmt: v => `${v} TD` },
  { key: 'recYds',   label: 'RECEIVING YDS',   positions: ['WR','TE','RB'],fmt: v => `${v} yds` },
  { key: 'recTd',    label: 'RECEIVING TDs',   positions: ['WR','TE','RB'],fmt: v => `${v} TD` },
  { key: 'rec',      label: 'RECEPTIONS',      positions: ['WR','TE','RB'],fmt: v => `${v} REC` },
  { key: 'sacks',    label: 'SACKS',           positions: ['DE'],          fmt: v => `${v}` },
  { key: 'ints',     label: 'INTERCEPTIONS',   positions: ['CB'],          fmt: v => `${v} INT` },
  { key: 'tackles',  label: 'TACKLES',         positions: ['DE','CB'],     fmt: v => `${v}` },
  { key: 'fgm',      label: 'FIELD GOALS',     positions: ['K/P'],         fmt: v => `${v} FG` },
];

const LeaderboardView = ({ league, onSelectPlayer }) => {
  const [statKey, setStatKey] = useState('passYds');
  const stat = LEADERBOARD_STATS.find(s => s.key === statKey);

  const all = league.flatMap(t => {
    const players = [t.roster.qb, ...t.roster.stars].filter(Boolean);
    return players.map(p => ({ ...p, teamId: t.id, teamColor: t.color, teamCity: t.city, teamName: t.name }));
  });
  const eligible = all.filter(p => stat.positions.includes(p.position));
  const sorted = [...eligible]
    .sort((a, b) => (b.currentSeason?.[statKey] || 0) - (a.currentSeason?.[statKey] || 0))
    .slice(0, 20);
  const max = Math.max(1, ...sorted.map(p => p.currentSeason?.[statKey] || 0));

  return (
    <div>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
        <span style={{ fontSize: 11, letterSpacing: 1.5, opacity: 0.6, alignSelf: 'center', marginRight: 4 }}>STAT</span>
        {LEADERBOARD_STATS.map(s => (
          <button key={s.key} onClick={() => setStatKey(s.key)} style={{
            ...styles.chip,
            background: statKey === s.key ? COLORS.accent : 'transparent',
            color:      statKey === s.key ? COLORS.accentText : COLORS.textMute,
          }}>{s.label}</button>
        ))}
      </div>

      <div style={{
        fontFamily: "'Bebas Neue'", fontSize: 28, letterSpacing: 3,
        color: COLORS.text, marginBottom: 16,
      }}>
        TOP {stat.label}
      </div>

      <div style={{ display: 'grid', gap: 6 }}>
        {sorted.map((p, i) => {
          const v = p.currentSeason?.[statKey] || 0;
          const pct = Math.max(0.04, v / max);
          const rankColor = i === 0 ? '#FBBF24' : i === 1 ? '#A5ACAF' : i === 2 ? '#B87333' : COLORS.textMute;
          return (
            <div key={p.id} onClick={() => onSelectPlayer(p.id)} style={{
              position: 'relative',
              background: COLORS.panel,
              border: `1px solid ${COLORS.border}`,
              borderLeft: `4px solid ${p.teamColor}`,
              borderRadius: 8,
              padding: '12px 16px',
              cursor: 'pointer',
              overflow: 'hidden',
            }}>
              <div style={{
                position: 'absolute', top: 0, left: 0, bottom: 0,
                width: `${pct * 100}%`,
                background: `linear-gradient(90deg, ${p.teamColor}44 0%, ${p.teamColor}11 100%)`,
                pointerEvents: 'none',
              }} />
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{
                  fontFamily: "'JetBrains Mono'", fontSize: 22, fontWeight: 900,
                  color: rankColor, minWidth: 32,
                }}>{i + 1}</div>
                <div style={{
                  ...styles.rarityBadge, background: RARITY_COLOR[p.rarity], fontSize: 9,
                }}>{p.rarity}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: "'Bebas Neue'", fontSize: 22, letterSpacing: 1, lineHeight: 1.1 }}>
                    {p.name.toUpperCase()}
                  </div>
                  <div style={{ fontSize: 10, letterSpacing: 1.5, opacity: 0.55 }}>
                    {p.position} · {p.teamId}
                  </div>
                </div>
                <div style={{
                  fontFamily: "'JetBrains Mono'", fontSize: 26, fontWeight: 800, color: COLORS.text,
                }}>{v}</div>
              </div>
            </div>
          );
        })}
        {sorted.length === 0 && (
          <div style={{ opacity: 0.5, padding: 20, textAlign: 'center' }}>
            No data yet — play some weeks to populate the leaderboard.
          </div>
        )}
      </div>
    </div>
  );
};

// ─── MAIN STARS TAB ───────────────────────────────────────────────────────
export const StarsTab = ({ league, freeAgents, onSelectPlayer }) => {
  const [view, setView] = useState('roster');

  const viewBtn = (key, label) => (
    <button onClick={() => setView(key)} style={{
      ...styles.chip, padding: '8px 16px', fontSize: 12,
      background: view === key ? COLORS.accent : 'transparent',
      color:      view === key ? COLORS.accentText : COLORS.textMute,
    }}>{label}</button>
  );

  return (
    <div>
      <SectionTitle title="STARS"
        subtitle={view === 'roster' ? 'Filter · Sort · Browse' : 'Top Performers'} />

      <div style={{ display: 'flex', gap: 8, marginBottom: 18 }}>
        {viewBtn('roster',     'ROSTER')}
        {viewBtn('leaderboard','LEADERBOARD')}
      </div>

      {view === 'roster' ? (
        <RosterView league={league} freeAgents={freeAgents} onSelectPlayer={onSelectPlayer} />
      ) : (
        <LeaderboardView league={league} onSelectPlayer={onSelectPlayer} />
      )}
    </div>
  );
};
