import { useState } from 'react';
import { styles } from '../../theme/styles.js';
import { COLORS } from '../../theme/colors.js';
import { SectionTitle } from '../shared/SectionTitle.jsx';
import { clinchedTeams } from '../../engine/clinching.js';

// ─── CONFERENCE TITLE ROW ────────────────────────────────────────────────
const ConfHeader = ({ label }) => (
  <div style={{
    gridColumn: '1 / -1',
    fontFamily: "'Bebas Neue'", fontSize: 22, letterSpacing: 4,
    color: COLORS.text, fontWeight: 700,
    paddingTop: 8, paddingBottom: 4,
    borderBottom: `2px solid ${COLORS.accent}`,
    marginBottom: 4,
  }}>{label}</div>
);

// ─── DIVISION CARD ───────────────────────────────────────────────────────
const DivisionCard = ({ divLabel, teams, clinched, onSelectTeam }) => (
  <div style={styles.detailCard}>
    <h4 style={styles.detailH4}>{divLabel}</h4>
    <table style={styles.standingsTable}>
      <thead>
        <tr>
          <th style={styles.th}>Team</th>
          <th style={styles.thNum}>W</th>
          <th style={styles.thNum}>L</th>
          <th style={styles.thNum}>T</th>
          <th style={styles.thNum}>PF</th>
          <th style={styles.thNum}>PA</th>
          <th style={styles.thNum}>DIFF</th>
        </tr>
      </thead>
      <tbody>
        {teams.map(t => {
          const diff = t.record.pf - t.record.pa;
          const isClinched = clinched.has(t.id);
          return (
            <tr key={t.id} onClick={() => onSelectTeam(t.id)} style={styles.standingRow}>
              <td style={styles.td}>
                <span style={{ ...styles.teamDot, background: t.color }} />
                {t.city} {t.name}
                {isClinched && (
                  <span title="Clinched playoff berth" style={{
                    marginLeft: 6, fontSize: 9, fontWeight: 800,
                    color: COLORS.success, letterSpacing: 1,
                  }}>x</span>
                )}
              </td>
              <td style={styles.tdNum}>{t.record.w}</td>
              <td style={styles.tdNum}>{t.record.l}</td>
              <td style={{
                ...styles.tdNum,
                opacity: (t.record.t || 0) === 0 ? 0.3 : 1,
              }}>{t.record.t || 0}</td>
              <td style={styles.tdNum}>{t.record.pf}</td>
              <td style={styles.tdNum}>{t.record.pa}</td>
              <td style={{ ...styles.tdNum,
                color: diff >= 0 ? COLORS.success : COLORS.danger,
              }}>
                {diff > 0 ? '+' : ''}{diff}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  </div>
);

// ─── MAIN STANDINGS TAB ──────────────────────────────────────────────────
export const StandingsTab = ({ league, currentWeek, onSelectTeam }) => {
  const [subTab, setSubTab] = useState('division');
  const clinched = clinchedTeams(league, currentWeek);

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
        <>
          {/* AFC section */}
          <ConfHeader label="AFC" />
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
            gap: 16, marginBottom: 24,
          }}>
            {['AFC East', 'AFC North', 'AFC South', 'AFC West'].map(div => (
              byDiv[div] && (
                <DivisionCard key={div} divLabel={div} teams={byDiv[div]}
                              clinched={clinched} onSelectTeam={onSelectTeam} />
              )
            ))}
          </div>

          {/* NFC section */}
          <ConfHeader label="NFC" />
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
            gap: 16,
          }}>
            {['NFC East', 'NFC North', 'NFC South', 'NFC West'].map(div => (
              byDiv[div] && (
                <DivisionCard key={div} divLabel={div} teams={byDiv[div]}
                              clinched={clinched} onSelectTeam={onSelectTeam} />
              )
            ))}
          </div>

          {/* Clinched legend */}
          {clinched.size > 0 && (
            <div style={{
              marginTop: 16, fontSize: 11, color: COLORS.textMute, letterSpacing: 1,
            }}>
              <span style={{ color: COLORS.success, fontWeight: 800 }}>x</span> — clinched playoff berth
            </div>
          )}
        </>
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
                      <th style={styles.thNum}>W-L-T</th>
                      <th style={styles.thNum}>PF</th>
                      <th style={styles.thNum}>PA</th>
                      <th style={styles.thNum}>DIFF</th>
                    </tr>
                  </thead>
                  <tbody>
                    {confTeams.map((t, i) => {
                      const diff = t.record.pf - t.record.pa;
                      const isClinched = clinched.has(t.id);
                      return (
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
                            {i === 0 && <span style={{ marginLeft: 6, fontSize: 9, color: COLORS.warning, letterSpacing: 1 }}>★</span>}
                            {isClinched && (
                              <span title="Clinched playoff berth" style={{
                                marginLeft: 6, fontSize: 9, fontWeight: 800,
                                color: COLORS.success, letterSpacing: 1,
                              }}>x</span>
                            )}
                          </td>
                          <td style={styles.tdNum}>{t.record.w}-{t.record.l}{(t.record.t || 0) > 0 ? `-${t.record.t}` : ''}</td>
                          <td style={styles.tdNum}>{t.record.pf}</td>
                          <td style={styles.tdNum}>{t.record.pa}</td>
                          <td style={{ ...styles.tdNum,
                            color: diff >= 0 ? COLORS.success : COLORS.danger,
                          }}>
                            {diff > 0 ? '+' : ''}{diff}
                          </td>
                        </tr>
                      );
                    })}
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
