import { COLORS } from '../../theme/colors.js';

export const Stat = ({ label, value, big }) => (
  <div>
    <div style={{ fontSize: 10, letterSpacing: 1.5, opacity: 0.6 }}>{label}</div>
    <div style={{
      fontSize: big ? 32 : 18,
      fontWeight: 800,
      marginTop: 2,
      fontFamily: "'JetBrains Mono'",
    }}>{value}</div>
  </div>
);

export const SkillBar = ({ label, value, accent = '#3b82f6' }) => (
  <div style={{ marginBottom: 10 }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
      <span style={{ opacity: 0.8 }}>{label}</span>
      <span style={{ fontWeight: 700 }}>{value}</span>
    </div>
    <div style={{ height: 6, background: COLORS.border, borderRadius: 3, overflow: 'hidden' }}>
      <div style={{
        height: '100%',
        width: `${Math.min(100, value)}%`,
        background: accent,
        transition: 'width 0.4s',
      }} />
    </div>
  </div>
);
