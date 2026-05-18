import { styles } from '../../theme/styles.js';
import { COLORS } from '../../theme/colors.js';

export const NavBtn = ({ active, onClick, children }) => (
  <button onClick={onClick} style={{
    ...styles.navBtn,
    background:  active ? COLORS.accent : 'transparent',
    color:       active ? COLORS.accentText : COLORS.text,
    borderColor: active ? COLORS.accent : COLORS.borderMute,
  }}>{children}</button>
);

export const Header = ({ seasonNum, saveName, tab, setTab, hasPlayoffs, inOffseason,
                         onLeagueClick, onHomeClick }) => (
  <header style={styles.header}>
    <div style={styles.headerLeft}>
      <div style={styles.logo} onClick={onHomeClick} title="Back to leagues">
        <span style={styles.logoMark}>●</span>
        <span style={styles.logoText}>GRIDIRON</span>
        <span style={styles.logoSub}>SIMULATOR</span>
      </div>
      {saveName && (
        <div onClick={onLeagueClick} style={{
          fontSize: 13, letterSpacing: 1.5, opacity: 0.7, cursor: 'pointer',
          padding: '4px 10px', border: `1px solid ${COLORS.border}`, borderRadius: 3,
        }} title="League home">
          {saveName}
        </div>
      )}
      <div style={styles.seasonBadge}>
        <span style={{ fontSize: 10, letterSpacing: 2, opacity: 0.7 }}>SEASON</span>
        <span style={{ fontSize: 28, fontWeight: 900, lineHeight: 1 }}>{seasonNum}</span>
      </div>
    </div>
    {!inOffseason && (
      <nav style={styles.nav}>
        <NavBtn active={tab === 'weekly'}    onClick={() => setTab('weekly')}>
          {hasPlayoffs ? 'Playoffs' : 'Weekly'}
        </NavBtn>
        <NavBtn active={tab === 'standings'} onClick={() => setTab('standings')}>Standings</NavBtn>
        <NavBtn active={tab === 'stars'}     onClick={() => setTab('stars')}>Stars</NavBtn>
        <NavBtn active={tab === 'teams'}     onClick={() => setTab('teams')}>Teams</NavBtn>
        <NavBtn active={tab === 'history'}   onClick={() => setTab('history')}>History</NavBtn>
      </nav>
    )}
  </header>
);
