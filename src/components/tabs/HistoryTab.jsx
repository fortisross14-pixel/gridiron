import { styles } from '../../theme/styles.js';
import { COLORS, RARITY_COLOR, rarityStyle } from '../../theme/colors.js';
import { SectionTitle } from '../shared/SectionTitle.jsx';

const labelStyle = { fontSize: 10, letterSpacing: 2, opacity: 0.5 };

const HistoryAward = ({ label, children }) => (
  <div>
    <div style={labelStyle}>{label}</div>
    <div style={{ fontSize: 14, marginTop: 4 }}>{children}</div>
  </div>
);

export const HistoryTab = ({ history }) => (
  <div>
    <SectionTitle title="LEAGUE HISTORY" subtitle={`${history.length} seasons completed`} />
    {history.length === 0 && (
      <div style={{ ...styles.detailCard, textAlign: 'center', padding: 40, opacity: 0.5 }}>
        Complete a full season to start building history.
      </div>
    )}
    {[...history].reverse().map(entry => (
      <div key={entry.season} style={{ ...styles.detailCard, marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 16 }}>
          <span style={{ fontFamily: "'Bebas Neue'", fontSize: 36, letterSpacing: 2, color: COLORS.accent }}>
            S{entry.season}
          </span>
          {entry.sbWinner && (
            <span style={{ fontSize: 14, letterSpacing: 1, opacity: 0.7 }}>
              SUPER BOWL {entry.season}
            </span>
          )}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
          {entry.sbWinner && (
            <div>
              <div style={labelStyle}>🏆 CHAMPION</div>
              <div style={{
                fontFamily: "'Bebas Neue'", fontSize: 24, letterSpacing: 1,
                color: entry.sbWinner.color, marginTop: 4,
              }}>
                {entry.sbWinner.city} {entry.sbWinner.name}
              </div>
            </div>
          )}
          {entry.sbLoser && (
            <div>
              <div style={labelStyle}>RUNNER-UP</div>
              <div style={{
                fontFamily: "'Bebas Neue'", fontSize: 20, letterSpacing: 1,
                marginTop: 4, opacity: 0.85,
              }}>
                {entry.sbLoser.city} {entry.sbLoser.name}
              </div>
            </div>
          )}
          {entry.afcChamp && (
            <HistoryAward label="AFC CHAMP">{entry.afcChamp.city} {entry.afcChamp.name}</HistoryAward>
          )}
          {entry.nfcChamp && (
            <HistoryAward label="NFC CHAMP">{entry.nfcChamp.city} {entry.nfcChamp.name}</HistoryAward>
          )}
          {entry.offMvp && (
            <HistoryAward label="OFFENSIVE MVP">
              {entry.offMvp.name} <span style={{ opacity: 0.6, fontSize: 11 }}>{entry.offMvp.position} · {entry.offMvp.teamId}</span>
            </HistoryAward>
          )}
          {entry.defMvp && (
            <HistoryAward label="DEFENSIVE MVP">
              {entry.defMvp.name} <span style={{ opacity: 0.6, fontSize: 11 }}>{entry.defMvp.position} · {entry.defMvp.teamId}</span>
            </HistoryAward>
          )}
          {entry.offRookie && (
            <HistoryAward label="OFF. ROOKIE OF THE YEAR">
              {entry.offRookie.name} <span style={{ opacity: 0.6, fontSize: 11 }}>{entry.offRookie.position} · {entry.offRookie.teamId}</span>
            </HistoryAward>
          )}
          {entry.defRookie && (
            <HistoryAward label="DEF. ROOKIE OF THE YEAR">
              {entry.defRookie.name} <span style={{ opacity: 0.6, fontSize: 11 }}>{entry.defRookie.position} · {entry.defRookie.teamId}</span>
            </HistoryAward>
          )}
          {entry.draftPick1 && (
            <HistoryAward label="#1 DRAFT PICK">
              {entry.draftPick1.name}{' '}
              <span style={{ ...styles.rarityBadge, ...rarityStyle(entry.draftPick1.rarity), fontSize: 9 }}>
                {entry.draftPick1.rarity}
              </span>
              <span style={{ opacity: 0.6, fontSize: 11 }}> · {entry.draftPick1.position} · {entry.draftPick1.teamId}</span>
            </HistoryAward>
          )}
        </div>
      </div>
    ))}
  </div>
);
