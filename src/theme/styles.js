import { COLORS } from './colors.js';

// All inline-style presets live here. UI components import this object and
// reference styles.<key>. To restyle visually, change values here.

export const styles = {
  app: {
    minHeight: '100vh',
    background: COLORS.bg,
    color: COLORS.text,
    fontFamily: "'Oswald', sans-serif",
    backgroundImage:
      'radial-gradient(circle at 20% 0%, rgba(34, 197, 94, 0.08) 0%, transparent 50%), ' +
      'radial-gradient(circle at 80% 100%, rgba(59, 130, 246, 0.06) 0%, transparent 50%)',
  },
  header: {
    padding: '20px 28px',
    borderBottom: `1px solid ${COLORS.border}`,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 16,
  },
  headerLeft: { display: 'flex', alignItems: 'center', gap: 24 },
  logo:       { display: 'flex', alignItems: 'baseline', gap: 8, cursor: 'pointer' },
  logoMark:   { color: COLORS.accent, fontSize: 24 },
  logoText:   { fontFamily: "'Bebas Neue'", fontSize: 28, letterSpacing: 3 },
  logoSub:    { fontSize: 11, letterSpacing: 4, opacity: 0.5 },
  seasonBadge: {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    padding: '4px 14px', border: `1px solid ${COLORS.accent}`, borderRadius: 4,
  },
  nav:    { display: 'flex', gap: 8, flexWrap: 'wrap' },
  navBtn: {
    padding: '8px 16px',
    fontFamily: "'Oswald', sans-serif",
    fontSize: 13,
    letterSpacing: 1.5,
    fontWeight: 600,
    border: `1px solid ${COLORS.borderMute}`,
    borderRadius: 3,
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  main: { padding: '24px 28px', maxWidth: 1400, margin: '0 auto' },
  sectionTitle:     { display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 },
  sectionTitleBar:  { width: 6, height: 36, background: COLORS.accent },
  sectionTitleMain: { fontFamily: "'Bebas Neue'", fontSize: 32, letterSpacing: 2, lineHeight: 1 },
  sectionTitleSub:  { fontSize: 12, letterSpacing: 2, opacity: 0.5, marginTop: 4 },
  chip: {
    padding: '5px 12px', fontSize: 11, fontFamily: "'JetBrains Mono'",
    letterSpacing: 1, border: `1px solid ${COLORS.borderMute}`, borderRadius: 2, cursor: 'pointer',
  },
  teamGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: 14,
  },
  teamCard: {
    background: COLORS.panel,
    border: `1px solid ${COLORS.border}`,
    borderLeft: `4px solid ${COLORS.borderMute}`,
    borderRadius: 4,
    padding: 16,
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  teamCardTop:  { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 },
  teamCardCity: { fontSize: 11, letterSpacing: 2, opacity: 0.5 },
  teamCardName: { fontFamily: "'Bebas Neue'", fontSize: 24, letterSpacing: 1, lineHeight: 1, marginTop: 2 },
  rankBadge: {
    fontFamily: "'JetBrains Mono'", fontSize: 11, padding: '3px 8px',
    background: COLORS.border, borderRadius: 2, opacity: 0.7,
  },
  recordLine: { display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 10 },
  recordBig:  { fontFamily: "'JetBrains Mono'", fontSize: 22, fontWeight: 700 },
  recordSub:  { fontSize: 11, opacity: 0.5, letterSpacing: 1 },
  statRow:    { display: 'flex', gap: 6, marginBottom: 10, flexWrap: 'wrap' },
  tierPill: {
    fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 2,
    color: COLORS.bg, letterSpacing: 0.5,
  },
  momentumBar: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
    padding: '8px 0 0', borderTop: `1px solid ${COLORS.border}`,
  },
  bigBtn: {
    padding: '14px 28px',
    background: COLORS.accent,
    color: COLORS.accentText,
    border: 'none',
    borderRadius: 4,
    fontFamily: "'Bebas Neue'",
    fontSize: 22,
    letterSpacing: 2,
    cursor: 'pointer',
    transition: 'all 0.2s',
    width: '100%',
    fontWeight: 700,
    boxShadow: '0 4px 12px rgba(34,197,94,0.25)',
  },
  backBtn: {
    background: 'none', border: `1px solid ${COLORS.borderMute}`, color: COLORS.textMute,
    padding: '6px 14px', fontFamily: "'Oswald'", fontSize: 12, letterSpacing: 1.5,
    cursor: 'pointer', marginBottom: 16, borderRadius: 2,
  },
  teamHeader: {
    padding: 32, borderRadius: 6, marginBottom: 24, color: '#fff',
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
  },
  detailGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 },
  detailCard: { background: COLORS.panel, border: `1px solid ${COLORS.border}`, borderRadius: 4, padding: 20 },
  detailH4: {
    margin: 0, marginBottom: 14, fontFamily: "'Bebas Neue'", fontSize: 18,
    letterSpacing: 2, color: COLORS.accent, borderBottom: `1px solid ${COLORS.border}`, paddingBottom: 8,
  },
  rosterGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 },
  playerCard: {
    background: COLORS.bg, border: '2px solid', borderRadius: 4, padding: 14,
  },
  rarityBadge: {
    fontSize: 10, fontWeight: 700, padding: '3px 7px', borderRadius: 2,
    color: COLORS.bg, letterSpacing: 0.5, display: 'inline-block',
  },
  weekHeader: {
    fontFamily: "'Bebas Neue'", fontSize: 22, letterSpacing: 3,
    color: COLORS.accent, marginTop: 0, marginBottom: 12,
    borderBottom: `1px solid ${COLORS.border}`, paddingBottom: 6,
  },
  gameGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 10 },
  gameCard: {
    background: COLORS.panel, border: `1px solid ${COLORS.border}`, borderRadius: 3, padding: 12,
  },
  gameTeamRow:   { display: 'flex', alignItems: 'center', gap: 8, padding: '4px 0' },
  gameTeamDot:   { width: 8, height: 8, borderRadius: 1 },
  gameTeamLabel: { flex: 1, fontSize: 13, letterSpacing: 0.5 },
  gameScore:     { fontFamily: "'JetBrains Mono'", fontSize: 18, fontWeight: 700 },
  gameMvp: {
    fontSize: 11, letterSpacing: 1, marginTop: 6,
    borderTop: `1px solid ${COLORS.border}`, paddingTop: 6,
  },
  offGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 },
  faRow: {
    display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0',
    borderBottom: `1px solid ${COLORS.border}`, fontSize: 13,
  },
  tradeRow: {
    display: 'flex', alignItems: 'center', gap: 16, padding: 12,
    borderBottom: `1px solid ${COLORS.border}`,
  },
  tradeSide: { flex: 1, fontSize: 13 },
  standingsTable: { width: '100%', borderCollapse: 'collapse', fontSize: 13 },
  th:    { textAlign: 'left',  padding: '6px 8px', fontSize: 11, letterSpacing: 1, opacity: 0.5, fontWeight: 600 },
  thNum: { textAlign: 'right', padding: '6px 8px', fontSize: 11, letterSpacing: 1, opacity: 0.5, fontWeight: 600 },
  standingRow: { cursor: 'pointer', transition: 'background 0.15s' },
  td:    { padding: '6px 8px', borderTop: `1px solid ${COLORS.border}` },
  tdNum: { padding: '6px 8px', borderTop: `1px solid ${COLORS.border}`, textAlign: 'right', fontFamily: "'JetBrains Mono'" },
  teamDot: { display: 'inline-block', width: 8, height: 8, borderRadius: 1, marginRight: 8 },
  starGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: 10 },
  playerRow: {
    display: 'flex', alignItems: 'center', gap: 12, padding: 12,
    background: COLORS.panel, border: `1px solid ${COLORS.border}`,
    borderLeft: `4px solid ${COLORS.borderMute}`,
    borderRadius: 4, cursor: 'pointer', transition: 'all 0.15s',
  },
};

export const globalCSS = `
  * { box-sizing: border-box; }
  body { margin: 0; }
`;
