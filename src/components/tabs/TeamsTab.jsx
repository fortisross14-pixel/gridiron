import { useState } from 'react';
import { styles } from '../../theme/styles.js';
import { COLORS } from '../../theme/colors.js';
import { SectionTitle } from '../shared/SectionTitle.jsx';

const LEGACY_COLORS = {
  'Best Ever':  '#FBBF24',
  'Classics':   '#C084FC',
  'Historical': '#60A5FA',
  'Normal':     '#9CA3AF',
};
const CURRENT_COLORS = {
  'Dynasty':   '#22c55e',
  'Candidate': '#84cc16',
  'Mid':       '#eab308',
  'Low':       '#f97316',
  'Bottom':    '#ef4444',
};

const TeamCard = ({ team, rank, onClick }) => {
  const momentum = team.legacy.value * 2 + team.current.value;
  return (
    <div style={{ ...styles.teamCard, borderLeftColor: team.color }} onClick={onClick}>
      <div style={styles.teamCardTop}>
        <div>
          <div style={styles.teamCardCity}>{team.city}</div>
          <div style={styles.teamCardName}>{team.name}</div>
        </div>
        <div style={styles.rankBadge}>#{rank}</div>
      </div>
      <div>
        <div style={styles.recordLine}>
          <span style={styles.recordBig}>
            {team.record.w}-{team.record.l}{team.record.t > 0 ? `-${team.record.t}` : ''}
          </span>
          <span style={styles.recordSub}>{team.div} · {team.conf}</span>
        </div>
        <div style={styles.statRow}>
          <span style={{ ...styles.tierPill, background: LEGACY_COLORS[team.legacy.tier] }}>
            {team.legacy.tier} +{team.legacy.value}
          </span>
          <span style={{ ...styles.tierPill, background: CURRENT_COLORS[team.current.tier] }}>
            {team.current.tier} +{team.current.value}
          </span>
        </div>
        <div style={styles.momentumBar}>
          <span style={{ fontSize: 10, letterSpacing: 1.5, opacity: 0.6 }}>MOMENTUM</span>
          <span style={{ fontSize: 22, fontWeight: 900 }}>{momentum}</span>
        </div>
      </div>
    </div>
  );
};

export const TeamsTab = ({ league, onSelectTeam }) => {
  const [sortKey, setSortKey] = useState('momentum');
  const teams = league.map(t => ({
    ...t,
    momentum: t.legacy.value * 2 + t.current.value,
    avg: Math.round((t.stats.passAtk + t.stats.runAtk + t.stats.passDef + t.stats.runDef
                   + t.stats.stAtk + t.stats.stDef + t.stats.physical) / 7),
  }));
  const sorted = [...teams].sort((a, b) => {
    if (sortKey === 'momentum') return b.momentum - a.momentum;
    if (sortKey === 'avg')      return b.avg - a.avg;
    if (sortKey === 'passAtk')  return b.stats.passAtk - a.stats.passAtk;
    if (sortKey === 'runAtk')   return b.stats.runAtk - a.stats.runAtk;
    if (sortKey === 'passDef')  return b.stats.passDef - a.stats.passDef;
    if (sortKey === 'runDef')   return b.stats.runDef - a.stats.runDef;
    if (sortKey === 'physical') return b.stats.physical - a.stats.physical;
    if (sortKey === 'morale')   return b.stats.morale - a.stats.morale;
    return a.name.localeCompare(b.name);
  });

  const sortBtns = [
    ['momentum', 'MOMENTUM'], ['avg', 'AVG'], ['passAtk', 'P-ATK'],
    ['runAtk', 'R-ATK'],      ['passDef', 'P-DEF'], ['runDef', 'R-DEF'],
    ['physical', 'PHYS'],     ['morale', 'MOR'],
  ];

  return (
    <div>
      <SectionTitle title="TEAMS" subtitle="Ratings · Momentum · Legacy" />
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 14 }}>
        <span style={{ fontSize: 11, letterSpacing: 1.5, opacity: 0.6, alignSelf: 'center' }}>SORT</span>
        {sortBtns.map(([k, l]) => (
          <button key={k} onClick={() => setSortKey(k)} style={{
            ...styles.chip,
            background: sortKey === k ? COLORS.accent : 'transparent',
            color: sortKey === k ? COLORS.accentText : COLORS.textMute,
          }}>{l}</button>
        ))}
      </div>
      <div style={styles.teamGrid}>
        {sorted.map((t, i) => (
          <TeamCard key={t.id} team={t} rank={i + 1} onClick={() => onSelectTeam(t.id)} />
        ))}
      </div>
    </div>
  );
};
