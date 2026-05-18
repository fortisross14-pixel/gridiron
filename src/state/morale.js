// Morale shifts after each game based on opponent strength and result.
// Returns the new morale value (clamped 50-99).
export const updateMorale = (team, opp, won, scoreDiff, isDivisional) => {
  const oppMomentum = opp.legacy.value * 2 + opp.current.value;
  const myMomentum  = team.legacy.value * 2 + team.current.value;
  let delta = 0;
  if (won) {
    delta = 2;
    if (oppMomentum > myMomentum + 3) delta += 3;
    if (isDivisional && oppMomentum > myMomentum) delta += 2;
    if (scoreDiff > 14) delta += 1;
  } else {
    delta = -2;
    if (oppMomentum < myMomentum - 3) delta -= 3;
    if (isDivisional && oppMomentum < myMomentum) delta -= 2;
    if (scoreDiff > 14) delta -= 1;
  }
  return Math.max(50, Math.min(99, team.stats.morale + delta));
};
