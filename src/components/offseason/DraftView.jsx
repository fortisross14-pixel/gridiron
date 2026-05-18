import { styles } from '../../theme/styles.js';
import { RARITY_COLOR, rarityStyle } from '../../theme/colors.js';
import { SectionTitle } from '../shared/SectionTitle.jsx';
import { makePlayer } from '../../engine/factory.js';
import { rand, choice, generateRarity } from '../../engine/random.js';
import { RARITY_MULT, RARITY_DEDUCT } from '../../engine/constants.js';
import { STAR_POSITIONS } from '../../data/teams.js';

export const DraftView = ({ data, setData, league, setLeague, freeAgents, setFreeAgents, onComplete }) => {
  const { draftOrder, qbPool, starPool, picks } = data;

  const runDraft = () => {
    let qbs   = [...qbPool];
    let stars = [...starPool];
    const newPicks = [];
    let workingLeague = league.map(t => ({ ...t, roster: { ...t.roster, stars: [...t.roster.stars] } }));
    const rarityRank = ['Legend', 'Epic', 'Rare', 'Uncommon', 'Common'];
    const bestOf = (pool) => {
      for (const r of rarityRank) {
        const found = pool.find(p => p.rarity === r);
        if (found) return found;
      }
      return pool[0];
    };

    // Round 1: each team picks once based on draft order (worst record first).
    draftOrder.forEach(t => {
      const team = workingLeague.find(x => x.id === t.id);
      if (!team.roster.qb && qbs.length > 0) {
        const pick = bestOf(qbs);
        qbs = qbs.filter(p => p.id !== pick.id);
        team.roster.qb = { ...pick, teamId: team.id };
        newPicks.push({ team: t.id, player: pick, round: 1 });
      } else if (stars.length > 0) {
        const pick = bestOf(stars);
        stars = stars.filter(p => p.id !== pick.id);
        team.roster.stars.push({ ...pick, teamId: team.id });
        newPicks.push({ team: t.id, player: pick, round: 1 });
      }
    });

    // Fill missing slots (each team needs QB + 2 stars).
    let safety = 100;
    while (safety-- > 0) {
      const needy = workingLeague.filter(t => !t.roster.qb || t.roster.stars.length < 2);
      if (needy.length === 0) break;
      needy.forEach(team => {
        if (!team.roster.qb) {
          let pick;
          if (qbs.length > 0) {
            pick = bestOf(qbs);
            qbs = qbs.filter(p => p.id !== pick.id);
          } else {
            // Try FA pool for a QB
            const faQbs = freeAgents.stars.filter(p => p.position === 'QB' || p.kind === 'QB');
            if (faQbs.length > 0) {
              const faPick = faQbs.sort((a, b) => RARITY_MULT[b.rarity] - RARITY_MULT[a.rarity])[0];
              pick = faPick;
              setFreeAgents(prev => ({ ...prev, stars: prev.stars.filter(p => p.id !== faPick.id) }));
            } else {
              pick = makePlayer('QB', generateRarity('qb'), 'QB', { teamId: team.id });
            }
          }
          team.roster.qb = { ...pick, teamId: team.id };
          newPicks.push({ team: team.id, player: pick, round: 2 });
        } else if (team.roster.stars.length < 2) {
          let pick;
          if (stars.length > 0) {
            pick = bestOf(stars);
            stars = stars.filter(p => p.id !== pick.id);
          } else {
            const faSorted = [...freeAgents.stars].sort((a, b) => RARITY_MULT[b.rarity] - RARITY_MULT[a.rarity]);
            pick = faSorted.length > 0
              ? faSorted[0]
              : makePlayer('Star', generateRarity('star'), choice(STAR_POSITIONS), { teamId: team.id });
          }
          team.roster.stars.push({ ...pick, teamId: team.id });
          newPicks.push({ team: team.id, player: pick, round: 2 });
        }
      });
    }

    // Trim teams with >2 stars — push extras back to FA pool.
    workingLeague = workingLeague.map(t => {
      if (t.roster.stars.length > 2) {
        const sorted = [...t.roster.stars].sort((a, b) => RARITY_DEDUCT[b.rarity] - RARITY_DEDUCT[a.rarity]);
        const keep    = sorted.slice(0, 2);
        const dropped = sorted.slice(2);
        setFreeAgents(prev => ({ ...prev, stars: [...prev.stars, ...dropped.map(s => ({ ...s, teamId: null }))] }));
        return { ...t, roster: { ...t.roster, stars: keep } };
      }
      return t;
    });

    // Hire coaches if missing — from coach FA pool.
    workingLeague = workingLeague.map(t => {
      if (!t.roster.coach) {
        const coachPool = [...freeAgents.coaches].sort((a, b) => RARITY_MULT[b.rarity] - RARITY_MULT[a.rarity]);
        const hire = coachPool[0] || makePlayer('Coach', generateRarity('coach'), 'HC');
        if (coachPool[0]) {
          setFreeAgents(prev => ({ ...prev, coaches: prev.coaches.filter(c => c.id !== hire.id) }));
        }
        return { ...t, roster: { ...t.roster, coach: { ...hire, teamId: t.id } } };
      }
      return t;
    });

    // Replenish FA pool with veterans (yearsIn 1-6).
    const newFAStars = [];
    for (let i = 0; i < 25; i++) {
      newFAStars.push(makePlayer('Star', generateRarity('fa-star'), choice(STAR_POSITIONS), { yearsIn: rand(1, 6) }));
    }
    const newFACoaches = [];
    for (let i = 0; i < 5; i++) {
      newFACoaches.push(makePlayer('Coach', generateRarity('fa-coach'), 'HC', { yearsIn: rand(1, 6) }));
    }
    setFreeAgents(prev => ({
      stars:   [...prev.stars,   ...newFAStars],
      coaches: [...prev.coaches, ...newFACoaches],
    }));

    setLeague(workingLeague);
    setData({ ...data, picks: newPicks, workingLeague });
  };

  return (
    <div>
      <SectionTitle title="OFFSEASON" subtitle="STEP 5 · DRAFT" />
      {picks.length === 0 ? (
        <button onClick={runDraft} style={styles.bigBtn}>▶ RUN DRAFT</button>
      ) : (
        <>
          <div style={styles.detailCard}>
            <h4 style={styles.detailH4}>DRAFT RESULTS ({picks.length} picks)</h4>
            {picks.map((p, i) => (
              <div key={i} style={styles.faRow}>
                <span style={{ fontSize: 11, opacity: 0.5, width: 24 }}>#{i + 1}</span>
                <span style={{ width: 40, opacity: 0.7 }}>{p.team}</span>
                <span style={{ ...styles.rarityBadge, ...rarityStyle(p.player.rarity), fontSize: 9 }}>
                  {p.player.rarity}
                </span>
                <span style={{ flex: 1 }}>
                  {p.player.name} <span style={{ opacity: 0.5 }}>({p.player.position})</span>
                </span>
              </div>
            ))}
          </div>
          <button onClick={() => onComplete(league, picks[0])} style={styles.bigBtn}>
            → START NEXT SEASON
          </button>
        </>
      )}
    </div>
  );
};
