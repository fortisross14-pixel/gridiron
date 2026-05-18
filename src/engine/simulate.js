import { rand } from './random.js';
import { aggregateBonuses } from './bonuses.js';
import {
  RARITY_MULT, PASS_BASE_PER_MIN, RUSH_BASE_PER_MIN, ST_BASE_PER_MIN,
  MATCHUP_SENSITIVITY, YARD_NOISE, POSS_NOISE,
  PASS_TD_THRESHOLD, RUSH_TD_THRESHOLD, FG_THRESHOLD, FG_MAKE_RATE,
  SCORE_CAP_COMBINED, SCORE_CAP_INDIVIDUAL,
} from './constants.js';

// ─── GAME SIMULATION ─────────────────────────────────────────────────────
//
// Pipeline:
//   1. Effective Ratings  → team base stats + bonuses
//   2. Possession Time    → 60 min split weighted by physical/morale/overall
//   3. Yardage            → per-minute base × matchup multiplier + star bonus
//   4. Base Scoring       → TDs from yard thresholds + Epic/Legend bonus rolls
//   5. Normalize          → cap & scale extreme scores
//
// Returns full game result WITH per-player stat lines.

export const simulateGame = (teamA, teamB) => {
  const bA = aggregateBonuses(teamA);
  const bB = aggregateBonuses(teamB);

  // ── STAGE 1: EFFECTIVE RATINGS ───────────────────────────────────────
  const eff = (team, bonus) => ({
    passAtk: team.stats.passAtk + bonus.passAtk,
    runAtk:  team.stats.runAtk  + bonus.runAtk,
    passDef: team.stats.passDef + bonus.passDef,
    runDef:  team.stats.runDef  + bonus.runDef,
    stAtk:   team.stats.stAtk   + bonus.stAtk,
    stDef:   team.stats.stDef   + bonus.stDef,
    physical: team.stats.physical + bonus.physical,
    morale:   team.stats.morale   + bonus.morale,
  });
  const eA = eff(teamA, bA);
  const eB = eff(teamB, bB);

  // ── STAGE 2: POSSESSION TIME ─────────────────────────────────────────
  const possScore = (e) => {
    const other = (e.passAtk + e.runAtk + e.passDef + e.runDef + e.stAtk + e.stDef) / 6;
    return (e.physical * 1.0 + e.morale * 0.8 + other * 1.2) / 3;
  };
  const rA = possScore(eA) + rand(-POSS_NOISE, POSS_NOISE);
  const rB = possScore(eB) + rand(-POSS_NOISE, POSS_NOISE);
  let possA = Math.round((rA / (rA + rB)) * 60);
  possA = Math.max(22, Math.min(38, possA));
  const possB = 60 - possA;

  // ── STAGE 3: YARDAGE ─────────────────────────────────────────────────
  const computeYards = (poss, atk, def, basePerMin, starBonusPerGame) => {
    const matchupMult = 1 + (atk - def) / MATCHUP_SENSITIVITY;
    const baseYards   = poss * basePerMin * matchupMult;
    const scaledStarBonus = starBonusPerGame * (poss / 30);
    return Math.max(40, Math.round(baseYards + scaledStarBonus + rand(-YARD_NOISE, YARD_NOISE)));
  };
  const passYdsA = computeYards(possA, eA.passAtk, eB.passDef, PASS_BASE_PER_MIN, bA.passYdsPerGame);
  const runYdsA  = computeYards(possA, eA.runAtk,  eB.runDef,  RUSH_BASE_PER_MIN, bA.runYdsPerGame);
  const stYdsA   = computeYards(possA, eA.stAtk,   eB.stDef,   ST_BASE_PER_MIN,   0);
  const passYdsB = computeYards(possB, eB.passAtk, eA.passDef, PASS_BASE_PER_MIN, bB.passYdsPerGame);
  const runYdsB  = computeYards(possB, eB.runAtk,  eA.runDef,  RUSH_BASE_PER_MIN, bB.runYdsPerGame);
  const stYdsB   = computeYards(possB, eB.stAtk,   eA.stDef,   ST_BASE_PER_MIN,   0);

  // ── STAGE 4: BASE SCORING ────────────────────────────────────────────
  const computeBaseScoring = (passY, runY) => ({
    tds: Math.floor(passY / PASS_TD_THRESHOLD) + Math.floor(runY / RUSH_TD_THRESHOLD),
    fgAttempts: Math.floor((passY % PASS_TD_THRESHOLD + runY % RUSH_TD_THRESHOLD) / FG_THRESHOLD),
  });
  const baseA = computeBaseScoring(passYdsA, runYdsA);
  const baseB = computeBaseScoring(passYdsB, runYdsB);

  const rollBonusTds = (rolls) => {
    let bonus = 0;
    rolls.forEach(([p1, p2]) => {
      const r = Math.random();
      if (r < p2) bonus += 2;
      else if (r < p1 + p2) bonus += 1;
    });
    return bonus;
  };
  const bonusTdsA = rollBonusTds(bA.bonusTdRolls);
  const bonusTdsB = rollBonusTds(bB.bonusTdRolls);

  const rollBonusFgs = (probs) => probs.reduce((acc, p) => acc + (Math.random() < p ? 1 : 0), 0);
  const bonusFgsA = rollBonusFgs(bA.bonusFgProbs);
  const bonusFgsB = rollBonusFgs(bB.bonusFgProbs);

  const fgMakeRate = (team) => {
    const k = team.roster.stars.find(s => s.position === 'K/P');
    if (!k) return 0.78;
    return 0.75 + RARITY_MULT[k.rarity] * 0.025;
  };
  const fgsA = Math.round(baseA.fgAttempts * fgMakeRate(teamA)) + bonusFgsA;
  const fgsB = Math.round(baseB.fgAttempts * fgMakeRate(teamB)) + bonusFgsB;
  const fgaA = baseA.fgAttempts + bonusFgsA;
  const fgaB = baseB.fgAttempts + bonusFgsB;

  let tdsA = Math.max(0, baseA.tds + bonusTdsA);
  let tdsB = Math.max(0, baseB.tds + bonusTdsB);
  let pointsA = tdsA * 7 + fgsA * 3;
  let pointsB = tdsB * 7 + fgsB * 3;

  // ── STAGE 5: NORMALIZE ───────────────────────────────────────────────
  const combined = pointsA + pointsB;
  if (combined > SCORE_CAP_COMBINED) {
    const scale = SCORE_CAP_COMBINED / combined;
    pointsA = Math.round(pointsA * scale);
    pointsB = Math.round(pointsB * scale);
    if (pointsA < tdsA * 7) tdsA = Math.max(0, Math.floor(pointsA / 7));
    if (pointsB < tdsB * 7) tdsB = Math.max(0, Math.floor(pointsB / 7));
  }
  if (pointsA > SCORE_CAP_INDIVIDUAL && bonusTdsA < 2) pointsA = SCORE_CAP_INDIVIDUAL - rand(0, 3);
  if (pointsB > SCORE_CAP_INDIVIDUAL && bonusTdsB < 2) pointsB = SCORE_CAP_INDIVIDUAL - rand(0, 3);

  const finalTdsA = Math.min(tdsA + bonusTdsA, Math.floor(pointsA / 7));
  const finalFgsA = Math.max(0, Math.floor((pointsA - finalTdsA * 7) / 3));
  const finalTdsB = Math.min(tdsB + bonusTdsB, Math.floor(pointsB / 7));
  const finalFgsB = Math.max(0, Math.floor((pointsB - finalTdsB * 7) / 3));

  // ── DEFENSIVE STATS ──────────────────────────────────────────────────
  const computeSacks = (passDef, oppPassAtk, extra) =>
    Math.max(0, Math.round(Math.max(0, (passDef - oppPassAtk + 8) / 10) + extra + rand(-1, 1)));
  const computeInts = (passDef, oppPassAtk, extra) => {
    const base = Math.max(0, (passDef - oppPassAtk + 5) / 30);
    const total = base + extra;
    return Math.max(0, Math.round(total + (Math.random() < (total - Math.floor(total)) ? 1 : 0) - 1));
  };
  const sacksA = computeSacks(eA.passDef, eB.passAtk, bA.extraSacksPerGame);
  const sacksB = computeSacks(eB.passDef, eA.passAtk, bB.extraSacksPerGame);
  const intsA  = computeInts (eA.passDef, eB.passAtk, bA.extraIntsPerGame);
  const intsB  = computeInts (eB.passDef, eA.passAtk, bB.extraIntsPerGame);

  // ── BUILD PLAYER STAT LINES ──────────────────────────────────────────
  const winnerSide = pointsA >= pointsB ? 'A' : 'B';

  const buildPlayerLines = (team, yards, scoring, oppSacksOnUs, oppIntsOnUs, isWinner) => {
    const lines = [];
    const qb = team.roster.qb;
    const wr = team.roster.stars.find(s => s.position === 'WR');
    const te = team.roster.stars.find(s => s.position === 'TE');
    const rb = team.roster.stars.find(s => s.position === 'RB');
    const de = team.roster.stars.find(s => s.position === 'DE');
    const cb = team.roster.stars.find(s => s.position === 'CB');
    const k  = team.roster.stars.find(s => s.position === 'K/P');
    const W = { gp: 1, w: isWinner ? 1 : 0, l: isWinner ? 0 : 1 };

    // QB
    if (qb) {
      const passTd  = Math.round(scoring.tds * 0.65);
      const rushYds = rand(2, 18);
      const rushTd  = Math.random() < 0.12 ? 1 : 0;
      lines.push({ id: qb.id, position: 'QB', statDelta: {
        ...W, passYds: Math.round(yards.pass * 0.97), passTd,
        passInt: oppIntsOnUs, rushYds, rushTd
      }});
    }
    // WR
    if (wr) {
      const share = { Common: 0.18, Uncommon: 0.22, Rare: 0.26, Epic: 0.30, Legend: 0.34 }[wr.rarity];
      const recYds = Math.round(yards.pass * share);
      const recTd  = Math.round(scoring.tds * 0.55 * (share + 0.10));
      lines.push({ id: wr.id, position: 'WR', statDelta: {
        ...W, recYds, recTd, rec: Math.round(recYds / rand(11, 15))
      }});
    }
    // TE
    if (te) {
      const share = { Common: 0.08, Uncommon: 0.11, Rare: 0.14, Epic: 0.17, Legend: 0.20 }[te.rarity];
      const recYds = Math.round(yards.pass * share);
      const recTd  = Math.random() < (0.20 + RARITY_MULT[te.rarity] * 0.05) ? 1 : 0;
      lines.push({ id: te.id, position: 'TE', statDelta: {
        ...W, recYds, recTd, rec: Math.round(recYds / rand(9, 13))
      }});
    }
    // RB
    if (rb) {
      const share = { Common: 0.36, Uncommon: 0.44, Rare: 0.54, Epic: 0.64, Legend: 0.72 }[rb.rarity];
      const rushYds = Math.round(yards.run * share);
      const rushTd  = Math.round(scoring.tds * 0.25 * (share + 0.2));
      const recYds  = Math.round(yards.pass * 0.04);
      lines.push({ id: rb.id, position: 'RB', statDelta: {
        ...W, rushYds, rushTd, recYds, recTd: 0, rec: Math.round(recYds / 8)
      }});
    }
    // DE
    if (de) {
      const shareSacks = { Common: 0.30, Uncommon: 0.45, Rare: 0.55, Epic: 0.70, Legend: 0.80 }[de.rarity];
      lines.push({ id: de.id, position: 'DE', statDelta: {
        ...W, sacks: Math.round(oppSacksOnUs * shareSacks),
        tackles: rand(3, 7) + RARITY_MULT[de.rarity],
        ff: Math.random() < (0.05 + RARITY_MULT[de.rarity] * 0.02) ? 1 : 0
      }});
    }
    // CB
    if (cb) {
      const shareInts = { Common: 0.30, Uncommon: 0.45, Rare: 0.60, Epic: 0.72, Legend: 0.85 }[cb.rarity];
      lines.push({ id: cb.id, position: 'CB', statDelta: {
        ...W, ints: Math.round(oppIntsOnUs * shareInts),
        tackles: rand(2, 6) + Math.floor(RARITY_MULT[cb.rarity] / 2),
        pd: rand(0, 2) + Math.floor(RARITY_MULT[cb.rarity] / 2),
      }});
    }
    // K
    if (k) {
      lines.push({ id: k.id, position: 'K/P', statDelta: {
        ...W, fga: scoring.fga, fgm: scoring.fgm, xpm: scoring.tds, punts: rand(3, 7)
      }});
    }
    // Coach
    if (team.roster.coach) {
      lines.push({ id: team.roster.coach.id, position: 'HC', statDelta: W });
    }
    return lines;
  };

  const playerStatsA = buildPlayerLines(teamA,
    { pass: passYdsA, run: runYdsA, st: stYdsA },
    { tds: finalTdsA, fgs: finalFgsA, fga: fgaA, fgm: finalFgsA },
    sacksB, intsB, winnerSide === 'A');
  const playerStatsB = buildPlayerLines(teamB,
    { pass: passYdsB, run: runYdsB, st: stYdsB },
    { tds: finalTdsB, fgs: finalFgsB, fga: fgaB, fgm: finalFgsB },
    sacksA, intsA, winnerSide === 'B');

  // ── MVP ──────────────────────────────────────────────────────────────
  const winnerTeam = winnerSide === 'A' ? teamA : teamB;
  const winPassY   = winnerSide === 'A' ? passYdsA : passYdsB;
  const winRunY    = winnerSide === 'A' ? runYdsA  : runYdsB;
  let mvp;
  if (winPassY > winRunY * 1.6) {
    const wr = winnerTeam.roster.stars.find(s => s.position === 'WR');
    mvp = (wr && RARITY_MULT[wr.rarity] >= RARITY_MULT[winnerTeam.roster.qb.rarity]) ? wr : winnerTeam.roster.qb;
  } else if (winRunY > winPassY * 0.9) {
    const rb = winnerTeam.roster.stars.find(s => s.position === 'RB');
    mvp = (rb && RARITY_MULT[rb.rarity] >= 2) ? rb : winnerTeam.roster.qb;
  } else {
    mvp = winnerTeam.roster.qb;
  }

  return {
    home: teamA.id, away: teamB.id,
    homeScore: pointsA, awayScore: pointsB,
    homeYards: { pass: passYdsA, run: runYdsA, st: stYdsA },
    awayYards: { pass: passYdsB, run: runYdsB, st: stYdsB },
    sacksA, sacksB, intsA, intsB,
    homeStats: { pts: pointsA, tds: finalTdsA, fgs: finalFgsA },
    awayStats: { pts: pointsB, tds: finalTdsB, fgs: finalFgsB },
    possA, possB,
    mvp: mvp ? mvp.name : 'TBD',
    mvpId: mvp ? mvp.id : null,
    mvpTeam: winnerTeam.id,
    playerStatsHome: playerStatsA,
    playerStatsAway: playerStatsB,
  };
};
