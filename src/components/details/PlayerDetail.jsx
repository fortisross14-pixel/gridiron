import { useState } from 'react';
import { styles } from '../../theme/styles.js';
import { COLORS, RARITY_COLOR, readableTextOn } from '../../theme/colors.js';
import { COACH_SPECIALTY_COLOR } from '../../data/specialties.js';
import { Stat } from '../shared/Stat.jsx';
import { describePlayerEffects } from '../../engine/bonuses.js';

export const PlayerDetail = ({ player, league, onBack }) => {
  const [statView, setStatView] = useState('current');
  if (!player) return <div>Player not found.</div>;
  const team = league.find(t => t.id === player.currentTeamId);
  const teamColors = team?.colors || { primary: team?.color || '#374151', secondary: '#374151' };
  const headerTextColor = readableTextOn(teamColors.primary);

  const renderStatBlock = (stats) => {
    if (!stats) return null;
    const items = [];
    items.push(['GP', stats.gp || 0]);
    items.push(['W-L', `${stats.w || 0}-${stats.l || 0}`]);
    if (player.position === 'QB') {
      items.push(['PASS YDS', stats.passYds || 0]);
      items.push(['PASS TD',  stats.passTd  || 0]);
      items.push(['INT',      stats.passInt || 0]);
      items.push(['RUSH YDS', stats.rushYds || 0]);
      items.push(['RUSH TD',  stats.rushTd  || 0]);
    } else if (player.position === 'WR' || player.position === 'TE') {
      items.push(['REC',      stats.rec    || 0]);
      items.push(['REC YDS',  stats.recYds || 0]);
      items.push(['REC TD',   stats.recTd  || 0]);
    } else if (player.position === 'RB') {
      items.push(['RUSH YDS', stats.rushYds || 0]);
      items.push(['RUSH TD',  stats.rushTd  || 0]);
      items.push(['REC',      stats.rec     || 0]);
      items.push(['REC YDS',  stats.recYds  || 0]);
    } else if (player.position === 'DE') {
      items.push(['SACKS',    stats.sacks   || 0]);
      items.push(['TACKLES',  stats.tackles || 0]);
      items.push(['FF',       stats.ff      || 0]);
    } else if (player.position === 'CB') {
      items.push(['INT',      stats.ints    || 0]);
      items.push(['TACKLES',  stats.tackles || 0]);
      items.push(['PD',       stats.pd      || 0]);
    } else if (player.position === 'K/P') {
      items.push(['FGM',      stats.fgm     || 0]);
      items.push(['FGA',      stats.fga     || 0]);
      items.push(['XPM',      stats.xpm     || 0]);
      items.push(['PUNTS',    stats.punts   || 0]);
    }
    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: 14, marginTop: 12 }}>
        {items.map(([l, v]) => <Stat key={l} label={l} value={v} />)}
      </div>
    );
  };

  const stats = statView === 'current' ? player.currentSeason : player.career_stats;
  const effects = describePlayerEffects(player);
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

      {/* HEADER — uses team primary/secondary gradient */}
      <div style={{
        position: 'relative',
        padding: '32px 36px', borderRadius: 12, marginBottom: 20,
        color: headerTextColor,
        background: `linear-gradient(135deg, ${teamColors.primary}, ${teamColors.secondary})`,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        overflow: 'hidden',
        boxShadow: '0 8px 24px rgba(0,0,0,0.35)',
      }}>
        <div>
          <div style={{ fontSize: 12, letterSpacing: 3, opacity: 0.85, fontWeight: 600 }}>
            {player.kind === 'Coach' ? 'HEAD COACH' : player.position} · {team ? `${team.city.toUpperCase()} ${team.name.toUpperCase()}` : 'FREE AGENT'}
          </div>
          <div style={{
            fontFamily: "'Bebas Neue'", fontSize: 56, letterSpacing: 1, marginTop: 6,
            lineHeight: 0.95,
          }}>
            {player.name.toUpperCase()}
          </div>
          <div style={{ marginTop: 12 }}>
            <span style={{ ...styles.rarityBadge, background: RARITY_COLOR[player.rarity] }}>{player.rarity}</span>
            <span style={{ marginLeft: 12, opacity: 0.85, fontSize: 13 }}>
              YEAR {player.yearsIn + 1} OF {player.career}
            </span>
            {player.kind === 'Coach' && player.specialty && (
              <span style={{
                marginLeft: 12, padding: '5px 12px', borderRadius: 12,
                background: COACH_SPECIALTY_COLOR[player.specialty] || '#9CA3AF',
                fontSize: 10, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase',
                color: '#0a0e1a',
              }}>
                {player.specialty}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* TEAM EFFECTS — what this player contributes */}
      {effects.length > 0 && (
        <div style={styles.detailCard}>
          <h4 style={styles.detailH4}>TEAM EFFECTS</h4>
          <div style={{ marginTop: 8 }}>
            {effects.map((e, i) => (
              <div key={i} style={{
                padding: '6px 0', fontSize: 13,
                borderBottom: i < effects.length - 1 ? `1px solid ${COLORS.border}` : 'none',
              }}>
                <span style={{ color: COLORS.accent, marginRight: 8 }}>▸</span>{e}
              </div>
            ))}
          </div>
          <div style={{
            marginTop: 12, padding: 10, background: COLORS.panelDeep,
            borderRadius: 4, fontSize: 11, opacity: 0.6,
          }}>
            {player.kind === 'Coach'
              ? `Specialty "${player.specialty}" scales with coach rarity (${player.rarity}).`
              : `Bonuses scale with player rarity (${player.rarity}). ${
                  ['QB','WR','TE','RB'].includes(player.position)
                    ? 'Epic and Legend offensive players also have a chance for bonus TDs each game.'
                    : ''
                }`}
          </div>
        </div>
      )}

      <div style={{ ...styles.detailCard, marginTop: 16 }}>
        <h4 style={styles.detailH4}>STATS</h4>
        <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
          {subTabBtn('current',   'CURRENT SEASON')}
          {subTabBtn('by-season', 'BY SEASON')}
          {subTabBtn('career',    'CAREER')}
        </div>
        {statView !== 'by-season' && renderStatBlock(stats)}
        {statView === 'by-season' && (
          player.bySeason.length === 0
            ? <div style={{ opacity: 0.5, padding: 12 }}>No completed seasons yet.</div>
            : (
              <table style={styles.standingsTable}>
                <thead>
                  <tr>
                    <th style={styles.thNum}>SZN</th>
                    <th style={styles.thNum}>TEAM</th>
                    <th style={styles.thNum}>GP</th>
                    <th style={styles.thNum}>W-L</th>
                    {player.position === 'QB' && <>
                      <th style={styles.thNum}>P-YDS</th><th style={styles.thNum}>P-TD</th><th style={styles.thNum}>INT</th>
                    </>}
                    {(player.position === 'WR' || player.position === 'TE') && <>
                      <th style={styles.thNum}>REC</th><th style={styles.thNum}>YDS</th><th style={styles.thNum}>TD</th>
                    </>}
                    {player.position === 'RB' && <>
                      <th style={styles.thNum}>R-YDS</th><th style={styles.thNum}>R-TD</th><th style={styles.thNum}>REC</th>
                    </>}
                    {player.position === 'DE' && <>
                      <th style={styles.thNum}>SACKS</th><th style={styles.thNum}>TKL</th>
                    </>}
                    {player.position === 'CB' && <>
                      <th style={styles.thNum}>INT</th><th style={styles.thNum}>TKL</th>
                    </>}
                    {player.position === 'K/P' && <>
                      <th style={styles.thNum}>FGM</th><th style={styles.thNum}>FGA</th>
                    </>}
                  </tr>
                </thead>
                <tbody>
                  {player.bySeason.map((s, i) => (
                    <tr key={i}>
                      <td style={styles.tdNum}>{s.seasonNum}</td>
                      <td style={styles.tdNum}>{s.teamId}</td>
                      <td style={styles.tdNum}>{s.stats.gp}</td>
                      <td style={styles.tdNum}>{s.stats.w}-{s.stats.l}</td>
                      {player.position === 'QB' && <>
                        <td style={styles.tdNum}>{s.stats.passYds}</td>
                        <td style={styles.tdNum}>{s.stats.passTd}</td>
                        <td style={styles.tdNum}>{s.stats.passInt}</td>
                      </>}
                      {(player.position === 'WR' || player.position === 'TE') && <>
                        <td style={styles.tdNum}>{s.stats.rec}</td>
                        <td style={styles.tdNum}>{s.stats.recYds}</td>
                        <td style={styles.tdNum}>{s.stats.recTd}</td>
                      </>}
                      {player.position === 'RB' && <>
                        <td style={styles.tdNum}>{s.stats.rushYds}</td>
                        <td style={styles.tdNum}>{s.stats.rushTd}</td>
                        <td style={styles.tdNum}>{s.stats.rec}</td>
                      </>}
                      {player.position === 'DE' && <>
                        <td style={styles.tdNum}>{s.stats.sacks}</td>
                        <td style={styles.tdNum}>{s.stats.tackles}</td>
                      </>}
                      {player.position === 'CB' && <>
                        <td style={styles.tdNum}>{s.stats.ints}</td>
                        <td style={styles.tdNum}>{s.stats.tackles}</td>
                      </>}
                      {player.position === 'K/P' && <>
                        <td style={styles.tdNum}>{s.stats.fgm}</td>
                        <td style={styles.tdNum}>{s.stats.fga}</td>
                      </>}
                    </tr>
                  ))}
                </tbody>
              </table>
            )
        )}
      </div>
    </div>
  );
};
