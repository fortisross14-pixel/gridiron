import { useState } from 'react';
import { styles } from '../../theme/styles.js';
import { COLORS, RARITY_COLOR, rgba, readableTextOn } from '../../theme/colors.js';
import { Stat, SkillBar } from '../shared/Stat.jsx';
import { PlayerCard } from '../shared/PlayerCard.jsx';
import { RARITY_DEDUCT } from '../../engine/constants.js';

// ─── TEAM SCHEDULE ─────────────────────────────────────────────────────
const TeamSchedule = ({ team, weekResults, onSelectGame }) => {
  const games = [];
  Object.keys(weekResults || {}).sort((a, b) => Number(a) - Number(b)).forEach(weekKey => {
    weekResults[weekKey].forEach((g, idx) => {
      if (g.home === team.id || g.away === team.id) {
        const isHome = g.home === team.id;
        const oppId = isHome ? g.away : g.home;
        const myScore  = isHome ? g.homeScore : g.awayScore;
        const oppScore = isHome ? g.awayScore : g.homeScore;
        const result = myScore > oppScore ? 'W' : myScore < oppScore ? 'L' : 'T';
        games.push({ week: Number(weekKey), gameIdx: idx, oppId, isHome, myScore, oppScore, result });
      }
    });
  });

  if (games.length === 0) {
    return <div style={{ opacity: 0.5, padding: 12, fontSize: 13 }}>No games played yet this season.</div>;
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 8 }}>
      {games.map(g => (
        <div key={`${g.week}-${g.gameIdx}`}
             onClick={() => onSelectGame({ week: g.week, gameIdx: g.gameIdx })}
             style={{
               padding: '10px 12px',
               background: COLORS.bg,
               border: `1px solid ${COLORS.border}`,
               borderLeft: `4px solid ${
                 g.result === 'W' ? COLORS.accent
                 : g.result === 'L' ? COLORS.danger
                 : COLORS.textMute
               }`,
               borderRadius: 3, cursor: 'pointer', fontSize: 12,
             }}>
          <div style={{ fontSize: 10, letterSpacing: 1, opacity: 0.5 }}>W{g.week}</div>
          <div style={{ marginTop: 2, fontWeight: 700 }}>
            {g.isHome ? '' : '@ '}{g.oppId}
          </div>
          <div style={{ marginTop: 2, fontFamily: "'JetBrains Mono'" }}>
            <span style={{
              color: g.result === 'W' ? COLORS.accent
                   : g.result === 'L' ? COLORS.danger
                   : COLORS.textMute,
              fontWeight: 700,
            }}>{g.result}</span>{' '}{g.myScore}-{g.oppScore}
          </div>
        </div>
      ))}
    </div>
  );
};

// ─── TEAM STAT TABLE ───────────────────────────────────────────────────
const TeamStatTable = ({ stats }) => (
  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 14, marginTop: 8 }}>
    <Stat label="GAMES"            value={stats.gp || 0} />
    <Stat label="POINTS FOR"       value={stats.pf || 0} />
    <Stat label="POINTS AGAINST"   value={stats.pa || 0} />
    <Stat label="PASS YDS FOR"     value={stats.passYdsFor || 0} />
    <Stat label="PASS YDS AGAINST" value={stats.passYdsAgainst || 0} />
    <Stat label="RUSH YDS FOR"     value={stats.runYdsFor || 0} />
    <Stat label="RUSH YDS AGAINST" value={stats.runYdsAgainst || 0} />
    <Stat label="TDs"              value={stats.tdFor || 0} />
    <Stat label="FGs"              value={stats.fgFor || 0} />
    <Stat label="SACKS"            value={stats.sacks || 0} />
    <Stat label="INTs"             value={stats.ints || 0} />
  </div>
);

// ─── TEAM COLOR PALETTE STRIP ──────────────────────────────────────────
// Shows primary/secondary/tertiary swatches and their hex codes.
const TeamColorStrip = ({ team }) => {
  const c = team.colors || { primary: team.color, secondary: '#374151', tertiary: '#9ca3af' };
  const swatch = (label, hex) => (
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{
        height: 40, background: hex, borderRadius: 3,
        border: `1px solid ${COLORS.border}`,
      }} />
      <div style={{ fontSize: 9, letterSpacing: 1.5, opacity: 0.55, marginTop: 4 }}>{label}</div>
      <div style={{ fontSize: 11, fontFamily: "'JetBrains Mono'" }}>{hex}</div>
    </div>
  );
  return (
    <div style={{ display: 'flex', gap: 8 }}>
      {swatch('PRIMARY',   c.primary)}
      {swatch('SECONDARY', c.secondary)}
      {swatch('TERTIARY',  c.tertiary)}
    </div>
  );
};

// ─── TEAM DETAIL ───────────────────────────────────────────────────────
export const TeamDetail = ({ team, onBack, onPlayerClick, weekResults, onSelectGame }) => {
  const [statView, setStatView] = useState('current');
  const momentum = team.legacy.value * 2 + team.current.value;
  const used =
      RARITY_DEDUCT[team.roster.qb?.rarity    || 'Common']
    + RARITY_DEDUCT[team.roster.coach?.rarity || 'Common']
    + team.roster.stars.reduce((s, p) => s + RARITY_DEDUCT[p.rarity], 0);

  const statsToShow = statView === 'current' ? team.teamSeasonStats
    : statView === 'career' ? team.teamCareerStats
    : null;

  const c = team.colors || { primary: team.color, secondary: '#374151', tertiary: '#9ca3af' };
  // Use the secondary color as the gradient endpoint for a richer header.
  const headerTextColor = readableTextOn(c.primary);

  const subTabBtn = (key, label) => (
    <button onClick={() => setStatView(key)} style={{
      ...styles.chip,
      background: statView === key ? COLORS.accent : 'transparent',
      color:      statView === key ? COLORS.accentText : COLORS.textMute,
    }}>{label}</button>
  );

  return (
    <div>
      <button onClick={onBack} style={styles.backBtn}>← BACK</button>

      {/* HEADER: primary→secondary gradient with tertiary accent stripe */}
      <div style={{
        position: 'relative',
        padding: 32, borderRadius: 6, marginBottom: 16,
        color: headerTextColor,
        background: `linear-gradient(135deg, ${c.primary} 0%, ${c.secondary} 100%)`,
        overflow: 'hidden',
      }}>
        {/* Tertiary accent stripe across the top edge */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: 4,
          background: c.tertiary,
        }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 13, letterSpacing: 3, opacity: 0.8 }}>{team.city.toUpperCase()}</div>
            <div style={{
              fontSize: 56, fontWeight: 900, lineHeight: 1, letterSpacing: -2,
              fontFamily: "'Bebas Neue'",
            }}>
              {team.name.toUpperCase()}
            </div>
            <div style={{ marginTop: 8, fontSize: 14, opacity: 0.85 }}>
              {team.div} Division · {team.conf}
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{
              fontSize: 64, fontWeight: 900, lineHeight: 1, fontFamily: "'Bebas Neue'",
            }}>
              {team.record.w}-{team.record.l}{team.record.t > 0 ? `-${team.record.t}` : ''}
            </div>
            <div style={{ fontSize: 13, opacity: 0.85, marginTop: 4 }}>RECORD</div>
          </div>
        </div>
      </div>

      {/* TEAM COLORS STRIP */}
      <div style={{ ...styles.detailCard, marginBottom: 16 }}>
        <h4 style={styles.detailH4}>TEAM COLORS</h4>
        <TeamColorStrip team={team} />
      </div>

      {/* SCHEDULE */}
      <div style={{ ...styles.detailCard, marginBottom: 16 }}>
        <h4 style={styles.detailH4}>SCHEDULE</h4>
        <TeamSchedule team={team} weekResults={weekResults} onSelectGame={onSelectGame} />
      </div>

      <div style={styles.detailGrid}>
        <div style={styles.detailCard}>
          <h4 style={styles.detailH4}>MOMENTUM</h4>
          <div style={{ display: 'flex', gap: 24, marginTop: 12 }}>
            <Stat label="LEGACY"  value={`${team.legacy.tier} +${team.legacy.value}`} />
            <Stat label="CURRENT" value={`${team.current.tier} +${team.current.value}`} />
            <Stat label="TOTAL"   value={momentum} big />
          </div>
          <div style={{ marginTop: 16, padding: 12, background: COLORS.border, borderRadius: 6, fontSize: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ opacity: 0.6 }}>Spent on roster</span><span>{used} pts</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
              <span style={{ opacity: 0.6 }}>Boost remaining (×6)</span>
              <span style={{ color: momentum - used >= 0 ? COLORS.accent : COLORS.danger }}>
                {momentum - used >= 0 ? '+' : ''}{(momentum - used) * 6}
              </span>
            </div>
          </div>
        </div>

        <div style={styles.detailCard}>
          <h4 style={styles.detailH4}>TEAM SKILLS</h4>
          {/* Use team colors for skill bars: primary for offense, secondary for defense */}
          <SkillBar label="Pass Attack"        value={team.stats.passAtk}  accent={c.primary} />
          <SkillBar label="Run Attack"         value={team.stats.runAtk}   accent={c.primary} />
          <SkillBar label="Pass Defense"       value={team.stats.passDef}  accent={c.secondary} />
          <SkillBar label="Run Defense"        value={team.stats.runDef}   accent={c.secondary} />
          <SkillBar label="Special Teams Atk"  value={team.stats.stAtk}    accent={c.tertiary} />
          <SkillBar label="Special Teams Def"  value={team.stats.stDef}    accent={c.tertiary} />
          <SkillBar label="Physical"           value={team.stats.physical} accent="#f97316" />
          <SkillBar label="Morale"             value={team.stats.morale}   accent={COLORS.accent} />
        </div>

        <div style={{ ...styles.detailCard, gridColumn: 'span 2' }}>
          <h4 style={styles.detailH4}>TEAM STATS</h4>
          <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
            {subTabBtn('current',  'CURRENT SEASON')}
            {subTabBtn('by-season','BY SEASON')}
            {subTabBtn('career',   'CAREER')}
          </div>
          {statView !== 'by-season' && statsToShow && <TeamStatTable stats={statsToShow} />}
          {statView === 'by-season' && (
            team.teamBySeason.length === 0
              ? <div style={{ opacity: 0.5, padding: 12 }}>No completed seasons yet.</div>
              : (
                <table style={styles.standingsTable}>
                  <thead>
                    <tr>
                      <th style={styles.thNum}>SZN</th>
                      <th style={styles.thNum}>W-L</th>
                      <th style={styles.thNum}>PF</th>
                      <th style={styles.thNum}>PA</th>
                      <th style={styles.thNum}>PASS YDS</th>
                      <th style={styles.thNum}>RUSH YDS</th>
                      <th style={styles.th}>RESULT</th>
                    </tr>
                  </thead>
                  <tbody>
                    {team.teamBySeason.map((s, i) => (
                      <tr key={i}>
                        <td style={styles.tdNum}>{s.seasonNum}</td>
                        <td style={styles.tdNum}>{s.record.w}-{s.record.l}</td>
                        <td style={styles.tdNum}>{s.record.pf}</td>
                        <td style={styles.tdNum}>{s.record.pa}</td>
                        <td style={styles.tdNum}>{s.stats.passYdsFor}</td>
                        <td style={styles.tdNum}>{s.stats.runYdsFor}</td>
                        <td style={styles.td}>{(s.playoffResult || 'missed').replace(/_/g, ' ')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )
          )}
        </div>

        <div style={{ ...styles.detailCard, gridColumn: 'span 2' }}>
          <h4 style={styles.detailH4}>ROSTER</h4>
          <div style={styles.rosterGrid}>
            <PlayerCard player={team.roster.coach} onClick={() => onPlayerClick(team.roster.coach.id)} />
            <PlayerCard player={team.roster.qb}    onClick={() => onPlayerClick(team.roster.qb.id)} />
            {team.roster.stars.map(s => (
              <PlayerCard key={s.id} player={s} onClick={() => onPlayerClick(s.id)} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
