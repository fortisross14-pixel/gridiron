import {
  STAR_RATING_BOOST, STAR_GAME_YARD_BONUS, BONUS_TD_PROB, BONUS_FG_PROB,
  DEFENDER_GAME_BONUS, COACH_RARITY_MULT,
} from './constants.js';

// ─── COACH BONUSES ───────────────────────────────────────────────────────
// A coach contributes both rating boosts and game-level effects according
// to specialty × rarity.
export const coachBonuses = (coach) => {
  const b = {
    passAtk: 0, runAtk: 0, passDef: 0, runDef: 0, stAtk: 0, stDef: 0,
    passYdsPerGame: 0, runYdsPerGame: 0,
    bonusTdProb: 0, bonusFgProb: 0,
    extraSacksPerGame: 0, extraIntsPerGame: 0,
    physical: 0, morale: 0,
  };
  if (!coach) return b;
  const m = COACH_RARITY_MULT[coach.rarity];
  switch (coach.specialty) {
    case 'All-Around':
      b.passAtk += 1.5 * m; b.runAtk += 1.5 * m;
      b.passDef += 1.5 * m; b.runDef += 1.5 * m;
      b.stAtk += 1 * m; b.stDef += 1 * m;
      b.physical += 1 * m; b.morale += 1 * m;
      break;
    case 'Offensive Mastermind':
      b.passAtk += 3 * m; b.runAtk += 3 * m;
      b.passYdsPerGame += 6 * m; b.runYdsPerGame += 4 * m;
      b.bonusTdProb += 0.04 * m;
      break;
    case 'Passing Guru':
      b.passAtk += 5 * m;
      b.passYdsPerGame += 12 * m;
      b.bonusTdProb += 0.06 * m;
      break;
    case 'Run Game Architect':
      b.runAtk += 5 * m;
      b.runYdsPerGame += 9 * m;
      b.bonusTdProb += 0.04 * m;
      break;
    case 'Defensive Mastermind':
      b.passDef += 3 * m; b.runDef += 3 * m;
      b.extraSacksPerGame += 0.1 * m; b.extraIntsPerGame += 0.05 * m;
      break;
    case 'Pass Rush Specialist':
      b.passDef += 5 * m;
      b.extraSacksPerGame += 0.25 * m;
      break;
    case 'Secondary Specialist':
      b.passDef += 5 * m;
      b.extraIntsPerGame += 0.12 * m;
      break;
    case 'Motivator':
      b.physical += 4 * m; b.morale += 4 * m;
      b.passAtk += 1 * m; b.runAtk += 1 * m;
      b.passDef += 1 * m; b.runDef += 1 * m;
      break;
    case 'Special Teams Wizard':
      b.stAtk += 5 * m; b.stDef += 5 * m;
      b.bonusFgProb += 0.10 * m;
      break;
  }
  return b;
};

// ─── AGGREGATE TEAM BONUSES ──────────────────────────────────────────────
// Sums all rating boosts, per-game yard bonuses, and scoring probabilities
// from QB + stars + coach. Consumed by simulateGame.
export const aggregateBonuses = (team) => {
  const out = {
    passAtk: 0, runAtk: 0, passDef: 0, runDef: 0, stAtk: 0, stDef: 0,
    physical: 0, morale: 0,
    passYdsPerGame: 0, runYdsPerGame: 0,
    bonusTdRolls: [],          // array of [p1, p2] tuples
    bonusFgProbs: [],          // array of single probabilities
    extraSacksPerGame: 0, extraIntsPerGame: 0,
  };
  // QB
  if (team.roster.qb) {
    const qb = team.roster.qb;
    out.passAtk         += STAR_RATING_BOOST.QB[qb.rarity];
    out.passYdsPerGame  += STAR_GAME_YARD_BONUS.QB[qb.rarity];
    out.bonusTdRolls.push(BONUS_TD_PROB.QB[qb.rarity]);
  }
  // Stars
  team.roster.stars.forEach(s => {
    const boost = STAR_RATING_BOOST[s.position];
    const yardBonus = STAR_GAME_YARD_BONUS[s.position];
    switch (s.position) {
      case 'WR':
        out.passAtk        += boost[s.rarity];
        out.passYdsPerGame += yardBonus[s.rarity];
        out.bonusTdRolls.push(BONUS_TD_PROB.WR[s.rarity]);
        break;
      case 'TE':
        out.passAtk        += boost[s.rarity];
        out.runAtk         += Math.round(boost[s.rarity] * 0.3);
        out.passYdsPerGame += yardBonus[s.rarity];
        out.bonusTdRolls.push(BONUS_TD_PROB.TE[s.rarity]);
        break;
      case 'RB':
        out.runAtk         += boost[s.rarity];
        out.runYdsPerGame  += yardBonus[s.rarity];
        out.bonusTdRolls.push(BONUS_TD_PROB.RB[s.rarity]);
        break;
      case 'DE':
        out.passDef           += boost[s.rarity];
        out.runDef            += Math.round(boost[s.rarity] * 0.5);
        out.extraSacksPerGame += DEFENDER_GAME_BONUS.DE[s.rarity].sacksPerGame;
        break;
      case 'CB':
        out.passDef          += boost[s.rarity];
        out.extraIntsPerGame += DEFENDER_GAME_BONUS.CB[s.rarity].intsPerGame;
        break;
      case 'K/P':
        out.stAtk += boost[s.rarity]; out.stDef += boost[s.rarity];
        out.bonusFgProbs.push(BONUS_FG_PROB[s.rarity]);
        break;
    }
  });
  // Coach
  if (team.roster.coach) {
    const c = coachBonuses(team.roster.coach);
    out.passAtk += c.passAtk; out.runAtk += c.runAtk;
    out.passDef += c.passDef; out.runDef += c.runDef;
    out.stAtk += c.stAtk;     out.stDef += c.stDef;
    out.physical += c.physical; out.morale += c.morale;
    out.passYdsPerGame += c.passYdsPerGame;
    out.runYdsPerGame  += c.runYdsPerGame;
    out.extraSacksPerGame += c.extraSacksPerGame;
    out.extraIntsPerGame  += c.extraIntsPerGame;
    if (c.bonusTdProb > 0) out.bonusTdRolls.push([c.bonusTdProb, 0]);
    if (c.bonusFgProb > 0) out.bonusFgProbs.push(c.bonusFgProb);
  }
  return out;
};

// ─── DESCRIBE PLAYER / COACH EFFECTS (for UI) ────────────────────────────
// Returns an array of human-readable strings describing what this entity
// contributes to its team. Used in the "TEAM EFFECTS" card on detail pages.
export const describePlayerEffects = (player) => {
  if (!player) return [];
  const out = [];
  if (player.kind === 'Coach') {
    const m = COACH_RARITY_MULT[player.rarity] || 1;
    const sig = (x) => Math.round(x);
    switch (player.specialty) {
      case 'All-Around':
        if (sig(1.5*m) > 0) out.push(`+${sig(1.5*m)} to all attack & defense ratings`);
        if (sig(1*m)   > 0) out.push(`+${sig(1*m)} Physical, +${sig(1*m)} Morale`);
        break;
      case 'Offensive Mastermind':
        out.push(`+${sig(3*m)} Pass Atk, +${sig(3*m)} Run Atk`);
        out.push(`+${sig(6*m)} pass yds/game, +${sig(4*m)} rush yds/game`);
        out.push(`+${(0.04*m*100).toFixed(0)}% bonus TD/game`);
        break;
      case 'Passing Guru':
        out.push(`+${sig(5*m)} Pass Atk`);
        out.push(`+${sig(12*m)} pass yds/game`);
        out.push(`+${(0.06*m*100).toFixed(0)}% bonus TD/game`);
        break;
      case 'Run Game Architect':
        out.push(`+${sig(5*m)} Run Atk`);
        out.push(`+${sig(9*m)} rush yds/game`);
        out.push(`+${(0.04*m*100).toFixed(0)}% bonus TD/game`);
        break;
      case 'Defensive Mastermind':
        out.push(`+${sig(3*m)} Pass Def, +${sig(3*m)} Run Def`);
        out.push(`+${(0.1*m).toFixed(2)} sacks/game, +${(0.05*m).toFixed(2)} INTs/game`);
        break;
      case 'Pass Rush Specialist':
        out.push(`+${sig(5*m)} Pass Def`);
        out.push(`+${(0.25*m).toFixed(2)} sacks/game`);
        break;
      case 'Secondary Specialist':
        out.push(`+${sig(5*m)} Pass Def`);
        out.push(`+${(0.12*m).toFixed(2)} INTs/game`);
        break;
      case 'Motivator':
        out.push(`+${sig(4*m)} Physical, +${sig(4*m)} Morale`);
        out.push(`+${sig(1*m)} to all ratings (off & def)`);
        break;
      case 'Special Teams Wizard':
        out.push(`+${sig(5*m)} ST Atk, +${sig(5*m)} ST Def`);
        out.push(`+${(0.10*m*100).toFixed(0)}% bonus FG/game`);
        break;
    }
    return out;
  }
  // Players
  const r = player.rarity;
  if (player.kind === 'QB' || player.position === 'QB') {
    const rb = STAR_RATING_BOOST.QB[r];
    const yb = STAR_GAME_YARD_BONUS.QB[r];
    if (rb > 0) out.push(`+${rb} Pass Atk rating`);
    if (yb > 0) out.push(`+${yb} pass yds/game (team)`);
    const [p1, p2] = BONUS_TD_PROB.QB[r];
    if (p1 > 0) out.push(`${Math.round(p1*100)}% chance +1 TD/game${p2 > 0 ? `, ${Math.round(p2*100)}% +2 TD` : ''}`);
    return out;
  }
  switch (player.position) {
    case 'WR': {
      const rb = STAR_RATING_BOOST.WR[r];
      const yb = STAR_GAME_YARD_BONUS.WR[r];
      if (rb > 0) out.push(`+${rb} Pass Atk rating`);
      if (yb > 0) out.push(`+${yb} pass yds/game (team)`);
      const [p1, p2] = BONUS_TD_PROB.WR[r];
      if (p1 > 0) out.push(`${Math.round(p1*100)}% chance +1 TD/game${p2 > 0 ? `, ${Math.round(p2*100)}% +2 TD` : ''}`);
      break;
    }
    case 'TE': {
      const rb = STAR_RATING_BOOST.TE[r];
      const yb = STAR_GAME_YARD_BONUS.TE[r];
      if (rb > 0) out.push(`+${rb} Pass Atk, +${Math.round(rb*0.3)} Run Atk`);
      if (yb > 0) out.push(`+${yb} pass yds/game (team)`);
      const [p1] = BONUS_TD_PROB.TE[r];
      if (p1 > 0) out.push(`${Math.round(p1*100)}% chance +1 TD/game`);
      break;
    }
    case 'RB': {
      const rb = STAR_RATING_BOOST.RB[r];
      const yb = STAR_GAME_YARD_BONUS.RB[r];
      if (rb > 0) out.push(`+${rb} Run Atk rating`);
      if (yb > 0) out.push(`+${yb} rush yds/game (team)`);
      const [p1, p2] = BONUS_TD_PROB.RB[r];
      if (p1 > 0) out.push(`${Math.round(p1*100)}% chance +1 TD/game${p2 > 0 ? `, ${Math.round(p2*100)}% +2 TD` : ''}`);
      break;
    }
    case 'DE': {
      const rb = STAR_RATING_BOOST.DE[r];
      if (rb > 0) out.push(`+${rb} Pass Def, +${Math.round(rb*0.5)} Run Def`);
      out.push(`+${DEFENDER_GAME_BONUS.DE[r].sacksPerGame.toFixed(2)} sacks/game`);
      break;
    }
    case 'CB': {
      const rb = STAR_RATING_BOOST.CB[r];
      if (rb > 0) out.push(`+${rb} Pass Def rating`);
      out.push(`+${DEFENDER_GAME_BONUS.CB[r].intsPerGame.toFixed(2)} INTs/game`);
      break;
    }
    case 'K/P': {
      const rb = STAR_RATING_BOOST['K/P'][r];
      if (rb > 0) out.push(`+${rb} ST Atk, +${rb} ST Def`);
      const fg = BONUS_FG_PROB[r];
      if (fg > 0) out.push(`${Math.round(fg*100)}% chance bonus FG/game`);
      break;
    }
  }
  return out;
};
