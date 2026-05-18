// ─── PLAYOFF CLINCHING ───────────────────────────────────────────────────
// A team clinches a playoff berth via one of:
//   1) DIVISION CLINCH — guaranteed to win their division regardless of
//      remaining games. Their current wins exceed the best-case wins of
//      every other team in their division.
//   2) WILD-CARD CLINCH — even if they don't win the division, they're
//      guaranteed to be in the top-7 of their conference. Their current
//      wins exceed the best-case wins of all teams not currently in the
//      top-7 of the conference standings.
//
// Returns a Set<teamId> of clinched team IDs.

import { REGULAR_SEASON_WEEKS, PLAYOFF_SEEDS_PER_CONF } from './constants.js';

export const clinchedTeams = (league, currentWeek) => {
  const gamesPlayed = (t) => t.record.w + t.record.l + t.record.t;
  const gamesLeft   = (t) => REGULAR_SEASON_WEEKS - gamesPlayed(t);
  const maxWins     = (t) => t.record.w + gamesLeft(t);

  const clinched = new Set();

  ['AFC', 'NFC'].forEach(conf => {
    const confTeams = league.filter(t => t.conf === conf);

    // ── DIVISION CLINCH ────────────────────────────────────────────
    const byDiv = {};
    confTeams.forEach(t => {
      byDiv[t.div] = byDiv[t.div] || [];
      byDiv[t.div].push(t);
    });
    Object.values(byDiv).forEach(divTeams => {
      divTeams.forEach(team => {
        // Strictly more wins than every other div team's best case.
        const winsDiv = divTeams.every(other =>
          other.id === team.id || team.record.w > maxWins(other)
        );
        if (winsDiv) clinched.add(team.id);
      });
    });

    // ── WILD-CARD CLINCH ───────────────────────────────────────────
    // Current top-7 by record; anyone with current wins greater than the
    // best-case wins of the 8th seed (and below) is in.
    const sorted = [...confTeams].sort((a, b) =>
      b.record.w - a.record.w ||
      (b.record.pf - b.record.pa) - (a.record.pf - a.record.pa)
    );
    const outOfPlayoffs = sorted.slice(PLAYOFF_SEEDS_PER_CONF);
    sorted.slice(0, PLAYOFF_SEEDS_PER_CONF).forEach(team => {
      const safe = outOfPlayoffs.every(other => team.record.w > maxWins(other));
      if (safe) clinched.add(team.id);
    });
  });

  return clinched;
};
