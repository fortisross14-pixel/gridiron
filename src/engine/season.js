// ─── SEASON SCHEDULE ─────────────────────────────────────────────────────
// Round-robin generator for 32 teams over 16 weeks (no byes).
// Algorithm: rotation method — fix team 0, rotate others.
export const generateSchedule = (teams) => {
  const ids = teams.map(t => t.id);
  const n = ids.length;
  const rounds = [];
  const arr = [...ids];
  for (let r = 0; r < n - 1; r++) {
    const round = [];
    for (let i = 0; i < n / 2; i++) {
      const home = arr[i];
      const away = arr[n - 1 - i];
      if (r % 2 === 0) round.push({ home, away });
      else            round.push({ home: away, away: home });
    }
    rounds.push(round);
    arr.splice(1, 0, arr.pop());
  }
  return rounds.slice(0, 16);
};

// ─── PLAYOFF SEEDING ─────────────────────────────────────────────────────
// 7 seeds per conference: 4 division winners + 3 wild cards.
// Tiebreakers: wins, then point differential.
export const seedPlayoffs = (teamsList) => {
  const byConf = { AFC: [], NFC: [] };
  teamsList.forEach(t => byConf[t.conf].push(t));
  const seedConf = (confTeams) => {
    const byDiv = {};
    confTeams.forEach(t => {
      byDiv[t.div] = byDiv[t.div] || [];
      byDiv[t.div].push(t);
    });
    const divWinners = Object.values(byDiv).map(divTeams =>
      [...divTeams].sort((a, b) =>
        b.record.w - a.record.w ||
        (b.record.pf - b.record.pa) - (a.record.pf - a.record.pa)
      )[0]
    );
    divWinners.sort((a, b) =>
      b.record.w - a.record.w ||
      (b.record.pf - b.record.pa) - (a.record.pf - a.record.pa)
    );
    const remaining = confTeams.filter(t => !divWinners.find(d => d.id === t.id));
    remaining.sort((a, b) =>
      b.record.w - a.record.w ||
      (b.record.pf - b.record.pa) - (a.record.pf - a.record.pa)
    );
    return [...divWinners, ...remaining.slice(0, 3)];
  };
  return { AFC: seedConf(byConf.AFC), NFC: seedConf(byConf.NFC) };
};

// ─── HELPER: find player anywhere in the league ──────────────────────────
// Returns a copy of the player with currentTeamId attached, or null.
export const findPlayerById = (league, freeAgents, id) => {
  for (const t of league) {
    if (t.roster.qb?.id === id)    return { ...t.roster.qb,    currentTeamId: t.id };
    if (t.roster.coach?.id === id) return { ...t.roster.coach, currentTeamId: t.id };
    const s = t.roster.stars.find(p => p.id === id);
    if (s) return { ...s, currentTeamId: t.id };
  }
  const faStar  = freeAgents?.stars?.find(p => p.id === id);
  if (faStar)  return { ...faStar,  currentTeamId: null };
  const faCoach = freeAgents?.coaches?.find(p => p.id === id);
  if (faCoach) return { ...faCoach, currentTeamId: null };
  return null;
};

// ─── HELPER: rotate "current momentum" tier swaps each offseason ────────
// Each adjacent tier pair swaps one randomly chosen team.
export const rotateCurrent = (league) => {
  const byTier = { Dynasty: [], Candidate: [], Mid: [], Low: [], Bottom: [] };
  league.forEach(t => byTier[t.current.tier].push(t.id));
  const tiers = ['Dynasty', 'Candidate', 'Mid', 'Low', 'Bottom'];
  for (let i = 0; i < tiers.length - 1; i++) {
    const a = byTier[tiers[i]][Math.floor(Math.random() * byTier[tiers[i]].length)];
    const b = byTier[tiers[i + 1]][Math.floor(Math.random() * byTier[tiers[i + 1]].length)];
    if (!a || !b) continue;
    byTier[tiers[i]]     = byTier[tiers[i]].filter(x => x !== a).concat(b);
    byTier[tiers[i + 1]] = byTier[tiers[i + 1]].filter(x => x !== b).concat(a);
  }
  const out = {};
  const valueMap = { Dynasty: 12, Candidate: 8, Mid: 6, Low: 4, Bottom: 2 };
  tiers.forEach(tier => {
    byTier[tier].forEach(id => { out[id] = { tier, value: valueMap[tier] }; });
  });
  return out;
};
