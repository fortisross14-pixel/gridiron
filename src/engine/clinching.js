// ─── PLAYOFF CLINCHING ───────────────────────────────────────────────────
// A team has clinched a playoff spot when their current wins exceed the
// maximum possible wins of the 8th seed in their conference.
//
// This is conservative — it only reports "x" once a team is mathematically
// guaranteed to make the 7-seed playoffs no matter the remaining games.
//
// Returns a Set<teamId> of clinched team IDs.

import { REGULAR_SEASON_WEEKS, PLAYOFF_SEEDS_PER_CONF } from './constants.js';

export const clinchedTeams = (league, currentWeek) => {
  // Games remaining for each team. Each team plays each week, so:
  const gamesPlayed = (t) => t.record.w + t.record.l + t.record.t;
  const gamesLeft   = (t) => REGULAR_SEASON_WEEKS - gamesPlayed(t);

  const clinched = new Set();

  // Process each conference independently.
  ['AFC', 'NFC'].forEach(conf => {
    const confTeams = league.filter(t => t.conf === conf);
    // Sort by current wins desc, then by pf-pa desc (standard tiebreaker).
    const sorted = [...confTeams].sort((a, b) =>
      b.record.w - a.record.w ||
      (b.record.pf - b.record.pa) - (a.record.pf - a.record.pa)
    );

    // For each team, check: is their current wins greater than the
    // best-case wins of every team ranked PLAYOFF_SEEDS_PER_CONF+1 and below?
    // If yes, they cannot be passed — they're in.
    sorted.forEach((team, idx) => {
      if (idx >= PLAYOFF_SEEDS_PER_CONF) return; // Can't clinch from below the seed line.
      // Need to verify they're guaranteed above the cutoff.
      // Test: for every team NOT in the top-7, can they reach this team's wins?
      const myWins = team.record.w;
      const myGamesLeft = gamesLeft(team);
      // Worst case for me: lose all remaining. Best case for them: win all.
      // If even the 8th seed's best case can't catch my worst case, I'm in.
      const eighthSeed = sorted[PLAYOFF_SEEDS_PER_CONF];
      if (!eighthSeed) {
        clinched.add(team.id);
        return;
      }
      const theirMaxWins = eighthSeed.record.w + gamesLeft(eighthSeed);
      // I clinch if my worst-case wins (current wins) is still > 8th's best case,
      // OR if my current wins are equal but I have a tiebreaker advantage AND
      // they can't pull ahead. Simpler: require strict >.
      if (myWins > theirMaxWins) {
        clinched.add(team.id);
      }
    });
  });

  return clinched;
};
