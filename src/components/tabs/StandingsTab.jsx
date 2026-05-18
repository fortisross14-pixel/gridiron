import { useState } from 'react';
import { styles } from '../../theme/styles.js';
import { COLORS } from '../../theme/colors.js';
import { SectionTitle } from '../shared/SectionTitle.jsx';

export const StandingsTab = ({ league, onSelectTeam }) => {
  const [subTab, setSubTab] = useState('division');

  // Group teams by "AFC East" etc.
  const byDiv = {};
  league.forEach(t => {
    const key = `${t.conf} ${t.div}`;
    byDiv[key] = byDiv[key] || [];
    byDiv[key].push(t);
  });
  Object.keys(byDiv).forEach(k =>
    byDiv[k].sort((a, b) =>
      b.record.w - a.record.w ||
      (b.record.pf - b.record.pa) - (a.record.pf - a.record.pa)
    )
  );

  const subTabBtn = (key, label) => (
    <button onClick={() => setSubTab(key)} style={{
      ...styles.chip, padding: '8px 16px', fontSize: 12,
      background: subTab === key ? COLORS.accent : 'transparent',
      color:      subTab === key ? COLORS.accentText : COLORS.textMute,
    }}>{label}</button>
  );

  return (
    <div>
      <SectionTitle title="STANDINGS" subtitle={subTab === 'division' ? 'By Division' : 'By Conference'} />
      <div style={{ display: 'flex', gap: 8, marginBottom: 18 }}>
        {subTabBtn('division', 'DIVISION')}
        {subTabBtn('conference', 'CONFERENCE')}
      </div>

      {subTab === 'division' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 16 }}>
          {Object.entries(byDiv).map(([div, teams]) => (
            <div key={div} style={styles.detailCard}>
              <h4 style={styles.detailH4}>{div}</h4>
              <table style={styles.standingsTable}>
                <thead>
                  <tr>
                    <th style={styles.th}>Team</th>
                    <th style={styles.thNum}>W</th>
                    <th style={styles.thNum}>L</th>
                    <th style={styles.thNum}>PF</th>
                    <th style={styles.thNum}>PA</th>
                    <th style={styles.thNum}>DIFF</th>
                  </tr>
                </thead>
                <tbody>
                  {teams.map(t => (
                    <tr key={t.id} onClick={() => onSelectTeam(t.id)} style={styles.standingRow}>
                      <td style={styles.td}>
                        <span style={{ ...styles.teamDot, background: t.color }} />
                        {t.city} {t.name}
                      </td>
                      <td style={styles.tdNum}>{t.record.w}</td>
                      <td style={styles.tdNum}>{t.record.l}</td>
                      <td style={styles.tdNum}>{t.record.pf}</td>
                      <td style={styles.tdNum}>{t.record.pa}</td>
                      <td style={{
                        ...styles.tdNum,
                        color: t.record.pf - t.record.pa >= 0 ? COLORS.accent : COLORS.danger
                      }}>
                        {t.record.pf - t.record.pa > 0 ? '+' : ''}{t.record.pf - t.record.pa}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      )}

      {subTab === 'conference' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          {['AFC', 'NFC'].map(conf => {
            const confTeams = [...league.filter(t => t.conf === conf)].sort((a, b) =>
              b.record.w - a.record.w ||
              (b.record.pf - b.record.pa) - (a.record.pf - a.record.pa)
            );
            return (
              <div key={conf} style={styles.detailCard}>
                <h4 style={styles.detailH4}>{conf}</h4>
                <table style={styles.standingsTable}>
                  <thead>
                    <tr>
                      <th style={styles.thNum}>#</th>
                      <th style={styles.th}>Team</th>
                      <th style={styles.thNum}>W-L</th>
                      <th style={styles.thNum}>PF</th>
                      <th style={styles.thNum}>PA</th>
                      <th style={styles.thNum}>DIFF</th>
                    </tr>
                  </thead>
                  <tbody>
                    {confTeams.map((t, i) => (
                      <tr key={t.id} onClick={() => onSelectTeam(t.id)} style={styles.standingRow}>
                        <td style={styles.tdNum}>
                          <span style={{
                            color: i < 7 ? COLORS.accent : COLORS.textMute,
                            fontWeight: 700,
                          }}>{i + 1}</span>
                        </td>
                        <td style={styles.td}>
                          <span style={{ ...styles.teamDot, background: t.color }} />
                          {t.city} {t.name}
                          {i === 0 && <span style={{ marginLeft: 6, fontSize: 9, color: '#FBBF24', letterSpacing: 1 }}>★</span>}
                        </td>
                        <td style={styles.tdNum}>{t.record.w}-{t.record.l}</td>
                        <td style={styles.tdNum}>{t.record.pf}</td>
                        <td style={styles.tdNum}>{t.record.pa}</td>
                        <td style={{
                          ...styles.tdNum,
                          color: t.record.pf - t.record.pa >= 0 ? COLORS.accent : COLORS.danger
                        }}>
                          {t.record.pf - t.record.pa > 0 ? '+' : ''}{t.record.pf - t.record.pa}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
