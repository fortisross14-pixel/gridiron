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

// ─── STATS LEADERBOARD ────────────────────────────────────────────────────
// Ranks teams by current-season cumulative stats.
const STAT_COLUMNS = [
  { key: 'pf',              label: 'PTS FOR',          accessor: t => t.teamSeasonStats.pf },
  { key: 'pa',              label: 'PTS AGAINST',      accessor: t => t.teamSeasonStats.pa,             ascending: true },
  { key: 'diff',            label: 'POINT DIFF',       accessor: t => t.teamSeasonStats.pf - t.teamSeasonStats.pa },
  { key: 'passYdsFor',      label: 'PASS YDS',         accessor: t => t.teamSeasonStats.passYdsFor },
  { key: 'runYdsFor',       label: 'RUSH YDS',         accessor: t => t.teamSeasonStats.runYdsFor },
  { key: 'passYdsAgainst',  label: 'PASS YDS ALLOWED', accessor: t => t.teamSeasonStats.passYdsAgainst, ascending: true },
  { key: 'runYdsAgainst',   label: 'RUSH YDS ALLOWED', accessor: t => t.teamSeasonStats.runYdsAgainst,  ascending: true },
  { key: 'tdFor',           label: 'TDs SCORED',       accessor: t => t.teamSeasonStats.tdFor },
  { key: 'sacks',           label: 'SACKS',            accessor: t => t.teamSeasonStats.sacks },
  { key: 'ints',            label: 'INTs',             accessor: t => t.teamSeasonStats.ints },
];

const StatsLeaderboard = ({ league, onSelectTeam }) => {
  const [statKey, setStatKey] = useState('pf');
  const col = STAT_COLUMNS.find(c => c.key === statKey);
  const sorted = [...league].sort((a, b) => {
    const av = col.accessor(a);
    const bv = col.accessor(b);
    return col.ascending ? av - bv : bv - av;
  });
  const max = Math.max(1, ...sorted.map(t => Math.abs(col.accessor(t))));

  return (
    <div>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
        <span style={{ fontSize: 11, letterSpacing: 1.5, opacity: 0.6, alignSelf: 'center', marginRight: 4 }}>RANK BY</span>
        {STAT_COLUMNS.map(c => (
          <button key={c.key} onClick={() => setStatKey(c.key)} style={{
            ...styles.chip,
            background: statKey === c.key ? COLORS.accent : 'transparent',
            color:      statKey === c.key ? COLORS.accentText : COLORS.textMute,
          }}>{c.label}</button>
        ))}
      </div>

      <div style={{ display: 'grid', gap: 8 }}>
        {sorted.map((t, i) => {
          const value = col.accessor(t);
          const pct = Math.max(0.03, Math.abs(value) / max);
          const rankColor = i === 0 ? '#FBBF24' : i === 1 ? '#A5ACAF' : i === 2 ? '#B87333' : COLORS.textMute;
          return (
            <div key={t.id} onClick={() => onSelectTeam(t.id)} style={{
              position: 'relative',
              background: COLORS.panel,
              border: `1px solid ${COLORS.border}`,
              borderLeft: `4px solid ${t.color}`,
              borderRadius: 8,
              padding: '12px 16px',
              cursor: 'pointer',
              overflow: 'hidden',
            }}>
              <div style={{
                position: 'absolute', top: 0, left: 0, bottom: 0,
                width: `${pct * 100}%`,
                background: `linear-gradient(90deg, ${t.color}44 0%, ${t.color}11 100%)`,
                pointerEvents: 'none',
              }} />
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{
                  fontFamily: "'JetBrains Mono'", fontSize: 18, fontWeight: 900,
                  color: rankColor, minWidth: 28,
                }}>{i + 1}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: "'Bebas Neue'", fontSize: 20, letterSpacing: 1 }}>
                    {t.city.toUpperCase()} {t.name.toUpperCase()}
                  </div>
                  <div style={{ fontSize: 10, letterSpacing: 1.5, opacity: 0.5 }}>
                    {t.div} · {t.record.w}-{t.record.l}
                  </div>
                </div>
                <div style={{
                  fontFamily: "'JetBrains Mono'", fontSize: 24, fontWeight: 800,
                  color: value < 0 ? COLORS.danger : COLORS.text,
                }}>
                  {value > 0 && col.key === 'diff' ? '+' : ''}{value}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ─── MAIN TEAMS TAB ───────────────────────────────────────────────────────
export const TeamsTab = ({ league, onSelectTeam }) => {
  const [view, setView] = useState('ratings');
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

  const viewBtn = (key, label) => (
    <button onClick={() => setView(key)} style={{
      ...styles.chip, padding: '8px 16px', fontSize: 12,
      background: view === key ? COLORS.accent : 'transparent',
      color:      view === key ? COLORS.accentText : COLORS.textMute,
    }}>{label}</button>
  );

  return (
    <div>
      <SectionTitle title="TEAMS"
        subtitle={view === 'ratings' ? 'Ratings · Momentum · Legacy' : 'Season Stats Leaderboard'} />

      <div style={{ display: 'flex', gap: 8, marginBottom: 18 }}>
        {viewBtn('ratings', 'RATINGS')}
        {viewBtn('stats',   'STATS')}
      </div>

      {view === 'ratings' ? (
        <>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 14 }}>
            <span style={{ fontSize: 11, letterSpacing: 1.5, opacity: 0.6, alignSelf: 'center' }}>SORT</span>
            {sortBtns.map(([k, l]) => (
              <button key={k} onClick={() => setSortKey(k)} style={{
                ...styles.chip,
                background: sortKey === k ? COLORS.accent : 'transparent',
                color:      sortKey === k ? COLORS.accentText : COLORS.textMute,
              }}>{l}</button>
            ))}
          </div>
          <div style={styles.teamGrid}>
            {sorted.map((t, i) => (
              <TeamCard key={t.id} team={t} rank={i + 1} onClick={() => onSelectTeam(t.id)} />
            ))}
          </div>
        </>
      ) : (
        <StatsLeaderboard league={league} onSelectTeam={onSelectTeam} />
      )}
    </div>
  );
};
