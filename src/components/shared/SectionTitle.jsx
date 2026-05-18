import { styles } from '../../theme/styles.js';

export const SectionTitle = ({ title, subtitle }) => (
  <div style={styles.sectionTitle}>
    <div style={styles.sectionTitleBar} />
    <div>
      <div style={styles.sectionTitleMain}>{title}</div>
      {subtitle && <div style={styles.sectionTitleSub}>{subtitle}</div>}
    </div>
  </div>
);
