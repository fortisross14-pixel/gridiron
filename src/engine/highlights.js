// ─── PER-WEEK HIGHLIGHTS ─────────────────────────────────────────────────
// Given the state of the league BEFORE a week's games + the simulation
// results for that week, produce a list of highlight events.
//
// Highlight types:
//   - LEGACY_UPSET — winner has total momentum >= 5 less than loser's
//   - POSITION_UPSET — winner's pre-game conference seed was >6 spots below loser's
//   - SEASON_RECORD — broke a current-season single-game high
//   - HISTORICAL_RECORD — set or tied an all-time single-game high
//   - CLINCH — team first guaranteed a playoff berth this week
//   - LAST_GAME — Legend/Epic player played their final game (eliminated + final career year)
//
// Each highlight is { kind, text, week }. Kept text-based for the popup UI.

import { TRACKED_STATS, checkRecords, updateRecords } from './records.js';
import { clinchedTeams } from './clinching.js';
import { RARITY_MULT, REGULAR_SEASON_WEEKS } from './constants.js';

const totalMomentum = (t) => t.legacy.value * 2 + t.current.value;

// Compute conference seed (1-16) for a team given a sorted standings.
// Used to detect "position upsets".
const seedByConf = (league) => {
  const seeds = {};
  ['AFC', 'NFC'].forEach(conf => {
    const sorted = [...league.filter(t => t.conf === conf)].sort((a, b) =>
      b.record.w - a.record.w ||
      (b.record.pf - b.record.pa) - (a.record.pf - a.record.pa)
    );
    sorted.forEach((t, i) => { seeds[t.id] = i + 1; });
  });
  return seeds;
};

// Pull all player stat lines for a game, keyed by player id.
const playerLinesForGame = (game, league) => {
  const out = [];
  const home = league.find(t => t.id === game.home);
  const away = league.find(t => t.id === game.away);
  const collect = (team, lines) => {
    const allP = [team.roster.qb, team.roster.coach, ...team.roster.stars].filter(Boolean);
    lines.forEach(line => {
      const p = allP.find(x => x.id === line.id);
      if (p) out.push({ player: p, statLine: line.statDelta, team });
    });
  };
  collect(home, game.playerStatsHome || []);
  collect(away, game.playerStatsAway || []);
  return out;
};

// Find players whose career ends after this week. Two cases:
//   1) Regular season ended (week === REGULAR_SEASON_WEEKS) for a team
//      that did NOT make the playoffs.
//   2) Playoff loss in any round (caller passes playoffElim).
// playoffElim: optional Set<teamId> of teams just eliminated in playoffs.
const findLastGamePlayers = ({
  league, week, isRegularSeasonFinale, playoffElim, willMakePlayoffs,
}) => {
  const out = [];
  league.forEach(team => {
    let isEliminated = false;
    if (playoffElim && playoffElim.has(team.id)) isEliminated = true;
    else if (isRegularSeasonFinale && !willMakePlayoffs.has(team.id)) isEliminated = true;
    if (!isEliminated) return;
    const players = [team.roster.qb, ...team.roster.stars].filter(Boolean);
    players.forEach(p => {
      // Final year of career = yearsIn + 1 === career (they'll retire in offseason).
      if (p.yearsIn + 1 < p.career) return;
      // Only Legend/Epic warrant a highlight.
      if (RARITY_MULT[p.rarity] < 3) return;
      out.push({ player: p, team });
    });
  });
  return out;
};

// Apply a game result to a temporary record snapshot so we can detect
// game-by-game records as we walk the week.
//
// Returns { highlights, seasonRecords, careerRecords } — caller commits.
export const computeWeekHighlights = ({
  weekNumber,
  weekResults,           // array of game-result objects from simulateGame
  preWeekLeague,         // league snapshot BEFORE this week's games (for seeding/momentum)
  postWeekLeague,        // league snapshot AFTER this week's games (for clinching)
  prevClinched,          // Set<teamId> already clinched before this week
  seasonRecords,         // current season record bag
  careerRecords,         // all-time record bag
  seasonNum,
  playoffElim,           // optional Set for playoff weeks
  isRegularSeasonFinale, // boolean: was this the last regular-season week?
  willMakePlayoffs,      // optional Set<teamId> determined post-finale
}) => {
  const highlights = [];
  const seeds = seedByConf(preWeekLeague);

  let nextSeasonRecords = { ...seasonRecords };
  let nextCareerRecords = { ...careerRecords };

  // Walk each game in the week.
  weekResults.forEach(game => {
    const winner = preWeekLeague.find(t => t.id ===
      (game.homeScore > game.awayScore ? game.home : game.away));
    const loser = preWeekLeague.find(t => t.id ===
      (game.homeScore > game.awayScore ? game.away : game.home));
    if (!winner || !loser) return;
    if (game.homeScore === game.awayScore) return; // ties — skip upset checks

    // 1) LEGACY UPSET — total momentum gap >= 5 with the upset.
    const wMom = totalMomentum(winner);
    const lMom = totalMomentum(loser);
    if (lMom - wMom >= 5) {
      highlights.push({
        kind: 'LEGACY_UPSET',
        text: `LEGACY UPSET: ${winner.id} (${wMom}) defeated ${loser.id} (${lMom})`,
        week: weekNumber,
      });
    }

    // 2) POSITION UPSET — seed gap > 6.
    const wSeed = seeds[winner.id];
    const lSeed = seeds[loser.id];
    if (wSeed && lSeed && wSeed - lSeed > 6) {
      highlights.push({
        kind: 'POSITION_UPSET',
        text: `POSITION UPSET: ${winner.id} (${wSeed}) defeated ${loser.id} (${lSeed})`,
        week: weekNumber,
      });
    }

    // 3) RECORDS — check each player line.
    const lines = playerLinesForGame(game, preWeekLeague);
    lines.forEach(({ player, statLine, team }) => {
      const opp = team.id === game.home ? game.away : game.home;
      const recs = checkRecords({
        player: { ...player, teamId: team.id },
        position: player.position,
        statLine,
        season: seasonNum,
        week: weekNumber,
        opponent: opp,
        seasonRecords: nextSeasonRecords,
        careerRecords: nextCareerRecords,
      });
      // Group records: prefer the higher-tier message (historical over season for same stat).
      // Filter out silent (first-ever) career records — they track but don't fire.
      const visibleCareerRecs = recs.filter(r => r.scope === 'career' && !r.silent);
      const seasonRecs = recs.filter(r => r.scope === 'season'
        && !visibleCareerRecs.find(c => c.key === r.key));

      visibleCareerRecs.forEach(r => {
        const verb = r.tied ? 'tying most in history' : 'highest in history';
        highlights.push({
          kind: 'HISTORICAL_RECORD',
          text: `HISTORICAL RECORD: ${r.holder.name} had ${r.value} ${r.label} vs ${r.opponent}, ${verb}${r.tied ? '' : ` (prev ${r.prev})`}`,
          week: weekNumber,
        });
      });
      seasonRecs.forEach(r => {
        highlights.push({
          kind: 'SEASON_RECORD',
          text: `SEASON RECORD: ${r.holder.name} had ${r.value} ${r.label} vs ${r.opponent}, highest this season${r.prev > 0 ? ` (prev ${r.prev})` : ''}`,
          week: weekNumber,
        });
      });

      // Commit BOTH season and career updates from this player.
      // updateRecords skips ties for career.
      const committed = updateRecords(recs, nextSeasonRecords, nextCareerRecords);
      nextSeasonRecords = committed.seasonRecords;
      nextCareerRecords = committed.careerRecords;
    });
  });

  // 4) CLINCHES — teams that became clinched THIS week (not before).
  const nowClinched = clinchedTeams(postWeekLeague, weekNumber);
  nowClinched.forEach(teamId => {
    if (prevClinched && prevClinched.has(teamId)) return;
    highlights.push({
      kind: 'CLINCH',
      text: `${teamId} clinches a playoff spot`,
      week: weekNumber,
    });
  });

  // 5) LAST-GAME players (Legend/Epic finishing their career).
  if (isRegularSeasonFinale || playoffElim) {
    const lasts = findLastGamePlayers({
      league: postWeekLeague, week: weekNumber,
      isRegularSeasonFinale, playoffElim, willMakePlayoffs: willMakePlayoffs || new Set(),
    });
    lasts.forEach(({ player, team }) => {
      // Find their game in this week to name an opponent.
      const game = weekResults.find(g => g.home === team.id || g.away === team.id);
      const oppId = game ? (game.home === team.id ? game.away : game.home) : null;
      highlights.push({
        kind: 'LAST_GAME',
        text: `${player.name} (${player.rarity}) was eliminated${oppId ? ` against ${oppId}` : ''} and played his last game ever`,
        week: weekNumber,
      });
    });
  }

  return {
    highlights,
    seasonRecords: nextSeasonRecords,
    careerRecords: nextCareerRecords,
    clinched: nowClinched,
  };
};
