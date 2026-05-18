import { shuffle } from './random.js';
import { REGULAR_SEASON_WEEKS } from './constants.js';

// ─── NFL-STYLE 16-WEEK SCHEDULE ──────────────────────────────────────────
//
//   Weeks 1-3:   Divisional round 1 (3 games per team, vs each div rival)
//   Weeks 4-8:   5 same-conf, non-divisional games (rotation method)
//   Weeks 9-13:  5 inter-conference games (rotation method)
//   Weeks 14-16: Divisional round 2 (rematch, home/away flipped)
//
// Total: 6 div + 5 same-conf + 5 inter-conf = 16 games per team.
// No byes; every team plays every week.
//
// Rotation method: split teams into two arrays, pair by index. Shift one
// side by 1 each week to generate fresh matchups without repeats.

const CONFS = ['AFC', 'NFC'];
const DIVISIONS = ['East', 'North', 'South', 'West'];

// ─── DIVISIONAL ROUND-ROBIN ──────────────────────────────────────────────
// 4 teams (A B C D) play one full round-robin across 3 weeks:
//   Week 1: A-B, C-D
//   Week 2: A-C, B-D
//   Week 3: A-D, B-C
const divisionalPairings = (divTeams) => {
  if (divTeams.length !== 4) return [[], [], []];
  const [A, B, C, D] = divTeams;
  return [
    [{ home: A.id, away: B.id }, { home: C.id, away: D.id }],
    [{ home: A.id, away: C.id }, { home: B.id, away: D.id }],
    [{ home: A.id, away: D.id }, { home: B.id, away: C.id }],
  ];
};

const buildDivisionalSchedule = (teams) => {
  const byDiv = {};
  teams.forEach(t => {
    const k = `${t.conf} ${t.div}`;
    byDiv[k] = byDiv[k] || [];
    byDiv[k].push(t);
  });
  // Stable order within each division.
  Object.keys(byDiv).forEach(k =>
    byDiv[k].sort((a, b) => a.id.localeCompare(b.id))
  );

  const r1 = [[], [], []]; // weeks 1-3
  const r2 = [[], [], []]; // weeks 14-16
  Object.values(byDiv).forEach(divTeams => {
    const pairings = divisionalPairings(divTeams);
    pairings.forEach((weekPairs, idx) => {
      // Round 1: as-is.
      weekPairs.forEach(p => r1[idx].push(p));
      // Round 2: flip home/away. Rotate week index by +2 so a team's
      // 2nd matchup with a rival isn't a literal mirror of the 1st.
      const flipped = weekPairs.map(p => ({ home: p.away, away: p.home }));
      const r2Idx = (idx + 2) % 3;
      flipped.forEach(p => r2[r2Idx].push(p));
    });
  });
  return { r1, r2 };
};

// Deterministic seeded shuffle (so identical inputs across reloads
// produce the same schedule for a given season).
const seededShuffle = (arr, seed) => {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = (seed + i * 31) % (i + 1);
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
};

// ─── SAME-CONFERENCE BLOCK (5 weeks, rotation method) ────────────────────
// For each conference: split the 4 divisions into 2 sides of 2 divs (8
// teams per side). Pair sideA[i] vs sideB[(i + week) % 8]. Each team plays
// 5 distinct opponents from the other-side divisions over 5 weeks. Since
// sides are made of different divisions, no team plays a div rival.
const buildSameConfWeeks = (teams, seasonNum) => {
  const weeks = [[], [], [], [], []];
  CONFS.forEach((conf, confIdx) => {
    const confTeams = teams.filter(t => t.conf === conf);
    // Pick which 2 divisions go on side A; vary by season+conf.
    const divs = seededShuffle([...DIVISIONS], (seasonNum - 1) * 7 + confIdx * 3);
    const sideADivs = divs.slice(0, 2);
    const sideBDivs = divs.slice(2);

    const sideA = confTeams.filter(t => sideADivs.includes(t.div))
      .sort((a, b) => a.id.localeCompare(b.id));
    const sideB = confTeams.filter(t => sideBDivs.includes(t.div))
      .sort((a, b) => a.id.localeCompare(b.id));

    for (let week = 0; week < 5; week++) {
      for (let i = 0; i < 8; i++) {
        const j = (i + week) % 8;
        const homeIsA = (i + j + week) % 2 === 0;
        const home = homeIsA ? sideA[i].id : sideB[j].id;
        const away = homeIsA ? sideB[j].id : sideA[i].id;
        weeks[week].push({ home, away });
      }
    }
  });
  return weeks;
};

// ─── INTER-CONFERENCE BLOCK (5 weeks, rotation method) ───────────────────
// Sort AFC and NFC randomly per season. Week k: AFC[i] vs NFC[(i+k) % 16].
const buildInterConfWeeks = (teams, seasonNum) => {
  const afc = teams.filter(t => t.conf === 'AFC');
  const nfc = teams.filter(t => t.conf === 'NFC');
  const afcOrdered = seededShuffle(afc, (seasonNum - 1) * 11);
  const nfcOrdered = seededShuffle(nfc, (seasonNum - 1) * 13 + 1);

  const weeks = [[], [], [], [], []];
  for (let week = 0; week < 5; week++) {
    for (let i = 0; i < 16; i++) {
      const j = (i + week) % 16;
      const homeIsAFC = (i + j + week) % 2 === 0;
      const home = homeIsAFC ? afcOrdered[i].id : nfcOrdered[j].id;
      const away = homeIsAFC ? nfcOrdered[j].id : afcOrdered[i].id;
      weeks[week].push({ home, away });
    }
  }
  return weeks;
};

// ─── PUBLIC: GENERATE FULL 16-WEEK SCHEDULE ──────────────────────────────
export const generateSchedule = (teams, seasonNum = 1, _unused = null) => {
  const { r1, r2 } = buildDivisionalSchedule(teams);
  const sameConf  = buildSameConfWeeks(teams, seasonNum);
  const interConf = buildInterConfWeeks(teams, seasonNum);

  return [
    ...r1,         // weeks 1-3
    ...sameConf,   // weeks 4-8
    ...interConf,  // weeks 9-13
    ...r2,         // weeks 14-16
  ];
};

// ─── LEGACY HELPER (no longer used by scheduler; kept for compatibility) ──
export const standingsByDivisionPlace = (teams) => {
  const out = new Map();
  CONFS.forEach(conf => {
    DIVISIONS.forEach(div => {
      const inDiv = teams.filter(t => t.conf === conf && t.div === div)
        .sort((a, b) =>
          b.record.w - a.record.w ||
          (b.record.pf - b.record.pa) - (a.record.pf - a.record.pa)
        );
      inDiv.forEach((t, i) => out.set(t.id, i));
    });
  });
  return out;
};

// ─── PLAYOFF SEEDING ─────────────────────────────────────────────────────
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
