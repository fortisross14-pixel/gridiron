import { useState } from 'react';
import { styles } from '../../theme/styles.js';
import { COLORS, RARITY_COLOR } from '../../theme/colors.js';
import { SectionTitle } from '../shared/SectionTitle.jsx';
import { RARITY_MULT } from '../../engine/constants.js';

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

export const StarsTab = ({ league, freeAgents, onSelectPlayer }) => {
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
    <div>
      <SectionTitle title="STARS"
                    subtitle={`${sorted.length} players · ${posFilter === 'ALL' ? 'all positions' : posFilter}`} />
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
    </div>
  );
};
