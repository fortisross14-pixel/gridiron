import { styles } from '../../theme/styles.js';
import { RARITY_COLOR } from '../../theme/colors.js';
import { COACH_SPECIALTY_COLOR } from '../../data/specialties.js';

export const PlayerCard = ({ player, onClick }) => (
  <div
    onClick={onClick}
    style={{ ...styles.playerCard, borderColor: RARITY_COLOR[player.rarity], cursor: 'pointer' }}
  >
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <div>
        <div style={{ fontSize: 10, letterSpacing: 2, opacity: 0.6 }}>
          {player.kind === 'Coach' ? 'HEAD COACH' : player.position}
        </div>
        <div style={{ fontSize: 18, fontWeight: 800, marginTop: 2 }}>{player.name}</div>
        {player.kind === 'Coach' && player.specialty && (
          <div style={{
            fontSize: 10, fontWeight: 700, marginTop: 4,
            color: COACH_SPECIALTY_COLOR[player.specialty] || '#9CA3AF',
            textTransform: 'uppercase', letterSpacing: 1,
          }}>
            {player.specialty}
          </div>
        )}
      </div>
      <div style={{ ...styles.rarityBadge, background: RARITY_COLOR[player.rarity] }}>
        {player.rarity}
      </div>
    </div>
    <div style={{ marginTop: 12, fontSize: 11, opacity: 0.6 }}>
      Year {player.yearsIn + 1} of {player.career}
    </div>
  </div>
);
