// All numeric knobs that govern player power and game simulation.
// Change a value here, run a season — observe.

export const RARITIES = ['Common', 'Uncommon', 'Rare', 'Epic', 'Legend'];

// Momentum cost per rarity (used when computing how much of a team's
// total momentum is "spent" on the roster vs. left over as stat boost).
export const RARITY_DEDUCT = { Common: 0, Uncommon: 1, Rare: 2, Epic: 3, Legend: 4 };

// Generic rarity weight — used in a few places for share scaling.
export const RARITY_MULT = { Common: 0, Uncommon: 1, Rare: 2, Epic: 3, Legend: 5 };

// ─── PLAYER BONUSES (per-game yard additions to TEAM totals) ───────────────
// A Legend WR adds 55 passing yards to his team's per-game pass yardage.
// Numbers calibrated so a Legend WR ends season near 1,400 receiving yards
// against avg opposition.
export const STAR_GAME_YARD_BONUS = {
  QB: { Common: 0, Uncommon: 10, Rare: 25, Epic: 45, Legend: 75 },
  WR: { Common: 0, Uncommon: 8,  Rare: 20, Epic: 35, Legend: 55 },
  TE: { Common: 0, Uncommon: 5,  Rare: 12, Epic: 20, Legend: 30 },
  RB: { Common: 0, Uncommon: 6,  Rare: 15, Epic: 25, Legend: 40 },
};

// ─── PLAYER BONUSES (direct rating boosts) ────────────────────────────────
// Added to base team skill (typical baseline 66-74). Non-linear at the top:
// Legend is much higher than Epic so star-laden teams really stand out.
export const STAR_RATING_BOOST = {
  QB:    { Common: 0, Uncommon: 3, Rare: 7, Epic: 14, Legend: 28 },
  WR:    { Common: 0, Uncommon: 2, Rare: 5, Epic: 10, Legend: 20 },
  TE:    { Common: 0, Uncommon: 1, Rare: 3, Epic: 5,  Legend: 10 },
  RB:    { Common: 0, Uncommon: 2, Rare: 5, Epic: 10, Legend: 19 },
  DE:    { Common: 0, Uncommon: 2, Rare: 6, Epic: 11, Legend: 22 },
  CB:    { Common: 0, Uncommon: 2, Rare: 7, Epic: 12, Legend: 23 },
  'K/P': { Common: 0, Uncommon: 1, Rare: 2, Epic: 4,  Legend: 8 },
};

// ─── BONUS TD PROBABILITIES (Epic / Legend offensive players only) ─────────
// Format: [prob of +1 TD this game, prob of +2 TDs this game]
export const BONUS_TD_PROB = {
  QB: { Common: [0, 0], Uncommon: [0, 0], Rare: [0, 0], Epic: [0.30, 0],    Legend: [0.55, 0.15] },
  WR: { Common: [0, 0], Uncommon: [0, 0], Rare: [0, 0], Epic: [0.25, 0],    Legend: [0.50, 0.10] },
  TE: { Common: [0, 0], Uncommon: [0, 0], Rare: [0, 0], Epic: [0.18, 0],    Legend: [0.35, 0]    },
  RB: { Common: [0, 0], Uncommon: [0, 0], Rare: [0, 0], Epic: [0.25, 0],    Legend: [0.45, 0.08] },
};

// Bonus FG probability for kicker (Epic / Legend only).
export const BONUS_FG_PROB = {
  Common: 0, Uncommon: 0, Rare: 0, Epic: 0.35, Legend: 0.60,
};

// ─── DEFENDER PER-GAME BONUSES ─────────────────────────────────────────────
// Direct contributions stacked on top of engine-generated team sacks/INTs.
// Legend DE: 1.0 sacks/game × 16 games = 16 sacks/season.
// Legend CB: 0.45 INTs/game × 16 games ≈ 7 INTs/season.
export const DEFENDER_GAME_BONUS = {
  DE: {
    Common:   { sacksPerGame: 0.10, tacklesPerGame: 3 },
    Uncommon: { sacksPerGame: 0.25, tacklesPerGame: 4 },
    Rare:     { sacksPerGame: 0.45, tacklesPerGame: 5 },
    Epic:     { sacksPerGame: 0.70, tacklesPerGame: 6 },
    Legend:   { sacksPerGame: 1.00, tacklesPerGame: 7 },
  },
  CB: {
    Common:   { intsPerGame: 0.06, tacklesPerGame: 3, pdPerGame: 0.5 },
    Uncommon: { intsPerGame: 0.13, tacklesPerGame: 3, pdPerGame: 0.8 },
    Rare:     { intsPerGame: 0.22, tacklesPerGame: 4, pdPerGame: 1.2 },
    Epic:     { intsPerGame: 0.32, tacklesPerGame: 4, pdPerGame: 1.6 },
    Legend:   { intsPerGame: 0.45, tacklesPerGame: 5, pdPerGame: 2.0 },
  },
};

// Coach specialty effects scale by coach rarity.
export const COACH_RARITY_MULT = { Common: 0.5, Uncommon: 1, Rare: 2, Epic: 3.5, Legend: 5 };

// ─── SIMULATION CONSTANTS ──────────────────────────────────────────────────
// Per-minute yard rates (calibrated so league avg team passing = ~220 yds,
// rushing = ~110 yds per game).
export const PASS_BASE_PER_MIN = 5.5;
export const RUSH_BASE_PER_MIN = 2.8;
export const ST_BASE_PER_MIN   = 1.6;

// Yard noise per game and possession noise per team. Lower = less variance,
// so talent shows through more clearly.
export const YARD_NOISE = 45;
export const POSS_NOISE = 3;

// Matchup multiplier sensitivity — lower = more sensitive to rating gaps.
// At 140, a 60-point rating gap creates a ~43% yardage advantage.
export const MATCHUP_SENSITIVITY = 140;

// Scoring thresholds: yards required for each TD / FG attempt.
export const PASS_TD_THRESHOLD = 95;
export const RUSH_TD_THRESHOLD = 70;
export const FG_THRESHOLD      = 45;
export const FG_MAKE_RATE      = 0.82;

// Normalize: cap combined score (both teams) and individual score.
export const SCORE_CAP_COMBINED   = 80;
export const SCORE_CAP_INDIVIDUAL = 45;

// ─── SEASON / ROSTER CONSTANTS ─────────────────────────────────────────────
export const REGULAR_SEASON_WEEKS = 16;
export const PLAYOFF_SEEDS_PER_CONF = 7;
export const RANDOM_INITIAL_YEARS_MAX = 8; // initial pool yearsIn = rand(0, 8)
