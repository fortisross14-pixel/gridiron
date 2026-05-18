// ─── LEADERBOARDS (long-form records) ────────────────────────────────────
// Maintains top-5 lists for player stats across three scopes:
//   - perGame   : single-game performances
//   - perSeason : single-season totals
//   - perCareer : lifetime totals
//
// Also tracks team trophy counts and accumulated stats across all seasons.
//
// Stored on the save as { playerRecords, teamRecords }.

export const TOP_N = 5;

// Stats we track for player leaderboards. Each has a position-set and label.
export const PLAYER_STAT_DEFS = [
  { key: 'passYds', label: 'Passing Yards',     positions: ['QB'] },
  { key: 'passTd',  label: 'Passing TDs',       positions: ['QB'] },
  { key: 'passInt', label: 'Interceptions Thrown', positions: ['QB'], lowerIsBetter: false },
  { key: 'rushYds', label: 'Rushing Yards',     positions: ['RB', 'QB'] },
  { key: 'rushTd',  label: 'Rushing TDs',       positions: ['RB', 'QB'] },
  { key: 'recYds',  label: 'Receiving Yards',   positions: ['WR', 'TE', 'RB'] },
  { key: 'recTd',   label: 'Receiving TDs',     positions: ['WR', 'TE', 'RB'] },
  { key: 'rec',     label: 'Receptions',        positions: ['WR', 'TE', 'RB'] },
  { key: 'sacks',   label: 'Sacks',             positions: ['DE'] },
  { key: 'tackles', label: 'Tackles',           positions: ['DE', 'CB'] },
  { key: 'ints',    label: 'Interceptions',     positions: ['CB'] },
  { key: 'pd',      label: 'Passes Defended',   positions: ['CB'] },
  { key: 'fgm',     label: 'Field Goals Made',  positions: ['K/P'] },
];

// Empty player records bag: per-stat × per-scope top-N arrays.
export const emptyPlayerRecords = () => {
  const out = {};
  PLAYER_STAT_DEFS.forEach(({ key }) => {
    out[key] = { perGame: [], perSeason: [], perCareer: [] };
  });
  return out;
};

// Empty team records: per-teamId trophy/total counters.
export const emptyTeamRecords = (teamIds = []) => {
  const out = {};
  teamIds.forEach(id => {
    out[id] = {
      divisionTitles: 0,
      conferenceTitles: 0,
      superBowls: 0,
      superBowlAppearances: 0,
      playoffAppearances: 0,
      playoffWins: 0,
      totalRegularWins: 0,
      totalRegularLosses: 0,
      totalPlayoffWins: 0,
      seasonsPlayed: 0,
      bestSeasonWins: 0,
      bestSeasonNum: null,
    };
  });
  return out;
};

// Insert a candidate into a sorted top-N leaderboard.
// Mutates and returns the same array; keeps it sorted descending by value.
// If the candidate ties the bottom entry, it's appended; the array is then
// trimmed to TOP_N items (ties at the cutoff favor whoever was there first).
export const insertTopN = (board, candidate) => {
  if (candidate.value == null || candidate.value <= 0) return board;
  // If board is full and candidate doesn't even tie the lowest, skip.
  if (board.length >= TOP_N && candidate.value < board[board.length - 1].value) return board;
  board.push(candidate);
  board.sort((a, b) => b.value - a.value);
  // Trim, but allow up to TOP_N entries (no extras for ties).
  if (board.length > TOP_N) board.length = TOP_N;
  return board;
};

// Build a candidate for a per-game record.
export const gameCandidate = ({ player, position, teamId, value, season, week, opponent }) => ({
  scope: 'perGame',
  playerId: player.id,
  playerName: player.name,
  position,
  teamId,
  value,
  season,
  week,
  opponent,
});

// Build a candidate for a per-season record (post-season totals).
export const seasonCandidate = ({ player, position, teamId, value, season }) => ({
  scope: 'perSeason',
  playerId: player.id,
  playerName: player.name,
  position,
  teamId,
  value,
  season,
});

// Build a candidate for a career record (lifetime totals).
export const careerCandidate = ({ player, position, teamId, value, throughSeason }) => ({
  scope: 'perCareer',
  playerId: player.id,
  playerName: player.name,
  position,
  teamId,
  value,
  throughSeason,
});

// Walks all players in a league + game's stat lines and inserts per-game records.
// Returns the next playerRecords (new object, but reuses inner arrays for speed).
export const ingestGameRecords = ({ playerRecords, game, league, season, week }) => {
  const next = { ...playerRecords };
  const collect = (team, lines) => {
    const allP = [team.roster.qb, ...team.roster.stars].filter(Boolean);
    const opp = team.id === game.home ? game.away : game.home;
    lines.forEach(line => {
      const p = allP.find(x => x.id === line.id);
      if (!p) return;
      PLAYER_STAT_DEFS.forEach(({ key, positions }) => {
        if (!positions.includes(p.position)) return;
        const value = line.statDelta?.[key] || 0;
        if (value <= 0) return;
        const cand = gameCandidate({
          player: p, position: p.position, teamId: team.id,
          value, season, week, opponent: opp,
        });
        // Mutate the array in-place; insertTopN handles sort + trim.
        const board = next[key] ? next[key] : (next[key] = { perGame: [], perSeason: [], perCareer: [] });
        board.perGame = insertTopN([...board.perGame], cand);
      });
    });
  };
  const home = league.find(t => t.id === game.home);
  const away = league.find(t => t.id === game.away);
  if (home) collect(home, game.playerStatsHome || []);
  if (away) collect(away, game.playerStatsAway || []);
  return next;
};

// At season's end: walk all rosters, compare each player's full-season
// totals to the perSeason top-N and their career totals to perCareer.
//
// IMPORTANT: This must be called BEFORE archivePlayer resets currentSeason.
// Pass `careerThrough(player)` so we can compute lifetime including the
// just-finished season.
export const ingestSeasonRecords = ({ playerRecords, league, season }) => {
  let next = { ...playerRecords };
  Object.keys(next).forEach(k => {
    next[k] = {
      perGame:   [...(next[k].perGame || [])],
      perSeason: [...(next[k].perSeason || [])],
      perCareer: [...(next[k].perCareer || [])],
    };
  });
  league.forEach(team => {
    const players = [team.roster.qb, ...team.roster.stars].filter(Boolean);
    players.forEach(p => {
      const seasonTotals = p.currentSeason || {};
      // Build prospective career totals (career_stats + currentSeason).
      const careerSoFar = {};
      Object.keys(seasonTotals).forEach(k => {
        careerSoFar[k] = (p.career_stats?.[k] || 0) + (seasonTotals[k] || 0);
      });
      PLAYER_STAT_DEFS.forEach(({ key, positions }) => {
        if (!positions.includes(p.position)) return;
        const seasonValue = seasonTotals[key] || 0;
        const careerValue = careerSoFar[key] || 0;
        if (seasonValue > 0) {
          next[key].perSeason = insertTopN(next[key].perSeason, seasonCandidate({
            player: p, position: p.position, teamId: team.id,
            value: seasonValue, season,
          }));
        }
        if (careerValue > 0) {
          // Career records: keep only the highest per player so the board
          // shows distinct careers rather than a single player's progression.
          next[key].perCareer = next[key].perCareer.filter(e => e.playerId !== p.id);
          next[key].perCareer = insertTopN(next[key].perCareer, careerCandidate({
            player: p, position: p.position, teamId: team.id,
            value: careerValue, throughSeason: season,
          }));
        }
      });
    });
  });
  return next;
};

// Update team records at season end. Takes the team list, the season's
// playoff results, and the season number.
export const ingestTeamRecords = ({
  teamRecords, league, playoffs, season,
}) => {
  const next = { ...teamRecords };
  // Ensure every team has an entry.
  league.forEach(t => {
    if (!next[t.id]) {
      next[t.id] = {
        divisionTitles: 0, conferenceTitles: 0,
        superBowls: 0, superBowlAppearances: 0,
        playoffAppearances: 0, playoffWins: 0,
        totalRegularWins: 0, totalRegularLosses: 0,
        totalPlayoffWins: 0, seasonsPlayed: 0,
        bestSeasonWins: 0, bestSeasonNum: null,
      };
    }
  });

  // Division winners: per (conf, div), the team with most wins.
  const byDiv = {};
  league.forEach(t => {
    const key = `${t.conf} ${t.div}`;
    if (!byDiv[key] || t.record.w > byDiv[key].record.w) byDiv[key] = t;
  });
  Object.values(byDiv).forEach(t => {
    next[t.id] = { ...next[t.id], divisionTitles: next[t.id].divisionTitles + 1 };
  });

  // Conference + Super Bowl: read playoffs.results
  const sb = playoffs?.results?.superbowl?.[0];
  if (sb) {
    const winnerId = sb.winner.id;
    const loserId  = sb.loser.id;
    next[winnerId] = {
      ...next[winnerId],
      superBowls: next[winnerId].superBowls + 1,
      superBowlAppearances: next[winnerId].superBowlAppearances + 1,
    };
    next[loserId] = {
      ...next[loserId],
      superBowlAppearances: next[loserId].superBowlAppearances + 1,
    };
  }
  // Conference championships: SB participants each got their conference's title.
  (playoffs?.results?.conference || []).forEach(r => {
    next[r.winner.id] = {
      ...next[r.winner.id],
      conferenceTitles: next[r.winner.id].conferenceTitles + 1,
    };
  });

  // Playoff appearances: every team that played in wildcard or got a bye.
  const playoffParticipants = new Set();
  ['AFC', 'NFC'].forEach(c => {
    (playoffs?.seeds?.[c] || []).forEach(t => playoffParticipants.add(t.id));
  });
  // Plus #1 seeds who got byes — they're in seeds already, covered above.

  // Playoff wins: count wins per teamId across all rounds.
  const playoffWinCount = {};
  ['wildcard', 'divisional', 'conference', 'superbowl'].forEach(rname => {
    (playoffs?.results?.[rname] || []).forEach(r => {
      playoffWinCount[r.winner.id] = (playoffWinCount[r.winner.id] || 0) + 1;
    });
  });

  // Accumulate the per-season totals for each team.
  league.forEach(t => {
    const reg = next[t.id];
    const updates = {
      seasonsPlayed: reg.seasonsPlayed + 1,
      totalRegularWins:   reg.totalRegularWins   + t.record.w,
      totalRegularLosses: reg.totalRegularLosses + t.record.l,
      totalPlayoffWins:   reg.totalPlayoffWins   + (playoffWinCount[t.id] || 0),
      playoffAppearances: reg.playoffAppearances + (playoffParticipants.has(t.id) ? 1 : 0),
      playoffWins:        reg.playoffWins        + (playoffWinCount[t.id] || 0),
    };
    if (t.record.w > reg.bestSeasonWins) {
      updates.bestSeasonWins = t.record.w;
      updates.bestSeasonNum = season;
    }
    next[t.id] = { ...reg, ...updates };
  });

  return next;
};
