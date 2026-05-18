import { TEAMS, STAR_POSITIONS } from '../data/teams.js';
import { FIRST, LAST, COACH_LAST } from '../data/names.js';
import { COACH_SPECIALTIES } from '../data/specialties.js';
import { rand, choice, shuffle, uid, generateRarity } from './random.js';
import { RARITY_DEDUCT, RANDOM_INITIAL_YEARS_MAX } from './constants.js';
import { emptyStatLine, emptyTeamSeasonStats } from '../state/stats.js';

// ─── PLAYER FACTORY ──────────────────────────────────────────────────────
// Creates a single player or coach. yearsIn can be passed to backdate a
// veteran (the initial league pool uses this so year 1 has veterans).
export const makePlayer = (kind, rarity, position, opts = {}) => {
  const name = kind === 'Coach'
    ? `Coach ${choice(COACH_LAST)}`
    : `${choice(FIRST)} ${choice(LAST)}`;
  const pos = position || (kind === 'QB' ? 'QB' : kind === 'Coach' ? 'HC' : choice(STAR_POSITIONS));
  const career = opts.career || rand(8, 12);
  const yearsIn = opts.yearsIn !== undefined ? Math.min(opts.yearsIn, career - 1) : 0;
  const player = {
    id: uid(),
    name,
    kind,
    rarity,
    position: pos,
    career,
    yearsIn,
    debutSeason: opts.debutSeason || (1 - yearsIn),
    teamId: opts.teamId || null,
    teamHistory: [],
    currentSeason: emptyStatLine(pos),
    bySeason: [],
    career_stats: emptyStatLine(pos),
  };
  if (kind === 'Coach') {
    player.specialty = opts.specialty || choice(COACH_SPECIALTIES);
  }
  return player;
};

// ─── LEGACY & CURRENT MOMENTUM TIERS ────────────────────────────────────
export const assignLegacy = (rankedIds) => {
  const out = {};
  rankedIds.forEach((id, i) => {
    if (i < 4)       out[id] = { tier: 'Best Ever',   value: 4 };
    else if (i < 12) out[id] = { tier: 'Classics',    value: 3 };
    else if (i < 20) out[id] = { tier: 'Historical',  value: 2 };
    else             out[id] = { tier: 'Normal',      value: 1 };
  });
  return out;
};

export const CURRENT_TIERS = [
  { tier: 'Dynasty',   value: 12, count: 4 },
  { tier: 'Candidate', value: 8,  count: 8 },
  { tier: 'Mid',       value: 6,  count: 8 },
  { tier: 'Low',       value: 4,  count: 8 },
  { tier: 'Bottom',    value: 2,  count: 4 },
];

export const assignRandomCurrent = () => {
  const shuffled = shuffle(TEAMS.map(t => t.id));
  const out = {};
  let idx = 0;
  CURRENT_TIERS.forEach(({ tier, value, count }) => {
    for (let i = 0; i < count; i++) {
      out[shuffled[idx++]] = { tier, value };
    }
  });
  return out;
};

// ─── INITIAL TEAM CREATION ──────────────────────────────────────────────
// At league start, give players varied yearsIn so we don't have an all-rookie league.
const randomInitialYearsIn = () => rand(0, RANDOM_INITIAL_YEARS_MAX);

export const createInitialTeam = (base, legacy, current) => {
  const qb    = makePlayer('QB',    generateRarity('qb'),    'QB',  { teamId: base.id, yearsIn: randomInitialYearsIn() });
  const coach = makePlayer('Coach', generateRarity('coach'), 'HC',  { teamId: base.id, yearsIn: randomInitialYearsIn() });
  const star1Pos = choice(STAR_POSITIONS);
  let   star2Pos = choice(STAR_POSITIONS);
  while (star2Pos === star1Pos) star2Pos = choice(STAR_POSITIONS);
  const star1 = makePlayer('Star', generateRarity('star'), star1Pos, { teamId: base.id, yearsIn: randomInitialYearsIn() });
  const star2 = makePlayer('Star', generateRarity('star'), star2Pos, { teamId: base.id, yearsIn: randomInitialYearsIn() });

  const baseStats = {
    passAtk: rand(66, 74), runAtk: rand(66, 74),
    passDef: rand(66, 74), runDef: rand(66, 74),
    stAtk: rand(66, 74),   stDef: rand(66, 74),
    physical: rand(66, 74), morale: 70,
  };

  return {
    ...base,
    legacy: legacy[base.id],
    current: current[base.id],
    roster: { qb, coach, stars: [star1, star2] },
    stats: baseStats,
    record: { w: 0, l: 0, t: 0, pf: 0, pa: 0 },
    teamSeasonStats: emptyTeamSeasonStats(),
    teamBySeason: [],
    teamCareerStats: emptyTeamSeasonStats(),
    playoffResult: null,
  };
};

// Distribute leftover momentum points (×6) across the 7 mutable team stats.
// momentumRemaining is stored on the team so the UI can show it.
export const applyMomentumBoost = (team) => {
  const totalMomentum = team.legacy.value * 2 + team.current.value;
  const used = RARITY_DEDUCT[team.roster.qb.rarity]
    + RARITY_DEDUCT[team.roster.coach.rarity]
    + team.roster.stars.reduce((s, p) => s + RARITY_DEDUCT[p.rarity], 0);
  const remaining = totalMomentum - used;
  const t = { ...team, stats: { ...team.stats } };
  t.momentumRemaining = remaining;
  let pool = remaining * 6;
  const fields = ['passAtk','runAtk','passDef','runDef','stAtk','stDef','physical'];
  while (pool !== 0) {
    const f = choice(fields);
    if (pool > 0) { t.stats[f] += 1; pool -= 1; }
    else          { t.stats[f] -= 1; pool += 1; }
  }
  return t;
};

// ─── FREE AGENT POOL ────────────────────────────────────────────────────
// Initial pool: ~130 stars + 12 QBs + 40 coaches, all with random yearsIn.
export const initialFreeAgents = () => {
  const stars = [];
  for (let i = 0; i < 130; i++) {
    stars.push(makePlayer('Star', generateRarity('fa-star'), choice(STAR_POSITIONS),
      { yearsIn: rand(0, RANDOM_INITIAL_YEARS_MAX) }));
  }
  for (let i = 0; i < 12; i++) {
    stars.push(makePlayer('QB', generateRarity('fa-star'), 'QB',
      { yearsIn: rand(0, RANDOM_INITIAL_YEARS_MAX) }));
  }
  const coaches = [];
  for (let i = 0; i < 40; i++) {
    coaches.push(makePlayer('Coach', generateRarity('fa-coach'), 'HC',
      { yearsIn: rand(0, RANDOM_INITIAL_YEARS_MAX) }));
  }
  return { stars, coaches };
};
