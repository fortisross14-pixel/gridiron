import { useState, useEffect, useRef } from 'react';
import { TEAMS, OFF_POSITIONS, DEF_POSITIONS } from './data/teams.js';
import { historyScore } from './data/history.js';
import {
  createInitialTeam, applyMomentumBoost, assignLegacy, assignRandomCurrent,
  initialFreeAgents,
} from './engine/factory.js';
import { simulateGame } from './engine/simulate.js';
import { generateSchedule, seedPlayoffs, findPlayerById, rotateCurrent } from './engine/season.js';
import { computeWeekHighlights } from './engine/highlights.js';
import {
  emptyPlayerRecords, emptyTeamRecords,
  ingestGameRecords, ingestSeasonRecords, ingestTeamRecords,
} from './engine/leaderboards.js';
import { updateMorale } from './state/morale.js';
import { addStats, emptyStatLine, emptyTeamSeasonStats } from './state/stats.js';
import { rand } from './engine/random.js';
import { REGULAR_SEASON_WEEKS } from './engine/constants.js';
import { writeSave, loadSave } from './state/saves.js';
import { styles, globalCSS } from './theme/styles.js';
import { COLORS } from './theme/colors.js';
import { Header }       from './components/shared/Header.jsx';
import { HomePage }     from './components/HomePage.jsx';
import { WeeklyTab }    from './components/tabs/WeeklyTab.jsx';
import { StandingsTab } from './components/tabs/StandingsTab.jsx';
import { StarsTab }     from './components/tabs/StarsTab.jsx';
import { TeamsTab }     from './components/tabs/TeamsTab.jsx';
import { HistoryTab }   from './components/tabs/HistoryTab.jsx';
import { GameDetail }   from './components/details/GameDetail.jsx';
import { TeamDetail }   from './components/details/TeamDetail.jsx';
import { PlayerDetail } from './components/details/PlayerDetail.jsx';
import { OffseasonView } from './components/offseason/OffseasonView.jsx';

export default function App() {
  // ── TOP-LEVEL MODE ──────────────────────────────────────────────────────
  // 'home' → HomePage (slot picker). 'playing' → full game.
  const [mode, setMode] = useState('home');

  // Which slot we're writing to. Null on the home screen.
  const [activeSlot, setActiveSlot] = useState(null);
  const [saveName,   setSaveName]   = useState('');

  // ── GAME STATE ──────────────────────────────────────────────────────────
  const [league,      setLeague]      = useState(null);
  const [freeAgents,  setFreeAgents]  = useState(null);
  const [schedule,    setSchedule]    = useState([]);
  const [currentWeek, setCurrentWeek] = useState(1);
  const [weekResults, setWeekResults] = useState({});
  const [seasonNum,   setSeasonNum]   = useState(1);
  const [history,     setHistory]     = useState([]);

  const [tab,                setTab]                = useState('weekly');
  const [selectedTeamId,     setSelectedTeamId]     = useState(null);
  const [selectedPlayerId,   setSelectedPlayerId]   = useState(null);
  const [selectedGame,       setSelectedGame]       = useState(null);

  const [weekUiState, setWeekUiState] = useState('idle');
  const [revealCount, setRevealCount] = useState(0);

  const [playoffs,         setPlayoffs]         = useState(null);
  const [playoffSimState,  setPlayoffSimState]  = useState(null);
  const [offseasonStep,    setOffseasonStep]    = useState(null);
  const [offseasonData,    setOffseasonData]    = useState(null);

  // Records (per-season high marks, all-time high marks)
  const [seasonRecords, setSeasonRecords] = useState({});
  const [careerRecords, setCareerRecords] = useState({});
  // Set of teamIds that have clinched a playoff berth this season (persisted)
  const [clinched, setClinched] = useState([]);
  // Highlights keyed by week number: { [weekNum]: [{ kind, text, week }, ...] }
  const [weekHighlights, setWeekHighlights] = useState({});
  // Long-form top-5 leaderboards for players (per-game/season/career) and teams.
  const [playerRecords, setPlayerRecords] = useState({});
  const [teamRecords,   setTeamRecords]   = useState({});

  // Set to true while loading a slot — suppresses autosave during hydration.
  const hydrating = useRef(false);

  // ── CREATE NEW LEAGUE ───────────────────────────────────────────────────
  // Season 1 starts with FLAT legacy (everyone "Normal" +1). Legacy gets
  // earned in subsequent seasons via assignLegacy() based on real results.
  const startNewLeague = (slotIdx, name) => {
    const flatLegacy = {};
    TEAMS.forEach(t => { flatLegacy[t.id] = { tier: 'Normal', value: 1 }; });
    const current = assignRandomCurrent();
    const teams   = TEAMS.map(t => createInitialTeam(t, flatLegacy, current)).map(applyMomentumBoost);
    setLeague(teams);
    setSchedule(generateSchedule(teams));
    setFreeAgents(initialFreeAgents());
    setCurrentWeek(1);
    setWeekResults({});
    setSeasonNum(1);
    setHistory([]);
    setTab('weekly');
    setSelectedTeamId(null);
    setSelectedPlayerId(null);
    setSelectedGame(null);
    setWeekUiState('idle');
    setRevealCount(0);
    setPlayoffs(null);
    setPlayoffSimState(null);
    setOffseasonStep(null);
    setOffseasonData(null);
    setSeasonRecords({});
    setCareerRecords({});
    setClinched([]);
    setWeekHighlights({});
    setPlayerRecords(emptyPlayerRecords());
    setTeamRecords(emptyTeamRecords(TEAMS.map(t => t.id)));
    setActiveSlot(slotIdx);
    setSaveName(name);
    setMode('playing');
  };

  // ── LOAD EXISTING SLOT ──────────────────────────────────────────────────
  const loadFromSlot = (slotIdx) => {
    const state = loadSave(slotIdx);
    if (!state) return;
    hydrating.current = true;
    setLeague(state.league);
    setFreeAgents(state.freeAgents);
    setSchedule(state.schedule);
    setCurrentWeek(state.currentWeek);
    setWeekResults(state.weekResults);
    setSeasonNum(state.seasonNum);
    setHistory(state.history);
    setTab(state.tab || 'weekly');
    setWeekUiState(state.weekUiState || 'idle');
    setRevealCount(0);
    setPlayoffs(state.playoffs || null);
    setOffseasonStep(state.offseasonStep || null);
    setOffseasonData(state.offseasonData || null);
    setSeasonRecords(state.seasonRecords || {});
    setCareerRecords(state.careerRecords || {});
    setClinched(state.clinched || []);
    setWeekHighlights(state.weekHighlights || {});
    setPlayerRecords(state.playerRecords || emptyPlayerRecords());
    setTeamRecords(state.teamRecords || emptyTeamRecords(TEAMS.map(t => t.id)));
    setSelectedTeamId(null);
    setSelectedPlayerId(null);
    setSelectedGame(null);
    setPlayoffSimState(null);
    setActiveSlot(slotIdx);
    setSaveName(state.saveName || `Slot ${slotIdx + 1}`);
    setMode('playing');
    // Clear the hydration flag after this render commits so autosave can resume.
    setTimeout(() => { hydrating.current = false; }, 0);
  };

  // ── RETURN TO HOME ──────────────────────────────────────────────────────
  const returnHome = () => {
    setMode('home');
    setActiveSlot(null);
    setSaveName('');
    setSelectedTeamId(null);
    setSelectedPlayerId(null);
    setSelectedGame(null);
  };

  // ── AUTOSAVE ────────────────────────────────────────────────────────────
  // Anytime meaningful state changes, write to the active slot.
  // Skipped during hydration and on the home page.
  useEffect(() => {
    if (mode !== 'playing') return;
    if (hydrating.current) return;
    if (activeSlot === null) return;
    if (!league || !freeAgents) return;

    const championships = history.filter(h => h.sbWinner).length;
    const phase = playoffs
      ? (playoffs.round === 'done'       ? 'OFFSEASON'
        : playoffs.round === 'superbowl'  ? 'SB'
        : playoffs.round === 'conference' ? 'CONF'
        : playoffs.round === 'divisional' ? 'DIV'
        : 'WC')
      : offseasonStep
        ? 'OFFSEASON'
        : currentWeek > REGULAR_SEASON_WEEKS
          ? 'END'
          : `${currentWeek}/${REGULAR_SEASON_WEEKS}`;

    const meta = { name: saveName, seasonNum, currentWeek, championships, phase };
    const state = {
      saveName,
      league, freeAgents, schedule,
      currentWeek, weekResults,
      seasonNum, history,
      tab, weekUiState,
      playoffs, offseasonStep, offseasonData,
      seasonRecords, careerRecords, clinched, weekHighlights,
      playerRecords, teamRecords,
    };
    writeSave(activeSlot, meta, state);
  }, [
    mode, activeSlot, saveName,
    league, freeAgents, schedule,
    currentWeek, weekResults,
    seasonNum, history,
    tab, weekUiState,
    playoffs, offseasonStep, offseasonData,
    seasonRecords, careerRecords, clinched, weekHighlights,
    playerRecords, teamRecords,
  ]);

  // ── HOME SCREEN ─────────────────────────────────────────────────────────
  if (mode === 'home') {
    return <HomePage onLoad={loadFromSlot} onNew={startNewLeague} />;
  }

  if (!league || !freeAgents) {
    return (
      <div style={{ padding: 40, color: COLORS.text, background: COLORS.bg, minHeight: '100vh' }}>
        Loading league...
      </div>
    );
  }

  // ── WEEK SIMULATION ─────────────────────────────────────────────────────
  const simulateWeek = async () => {
    if (currentWeek > REGULAR_SEASON_WEEKS) return;
    const weekGames = schedule[currentWeek - 1];
    const results = [];

    // Snapshot the league state BEFORE this week (for upset/seed analysis).
    const preWeekLeague = league;

    const updatedLeague = league.map(t => ({
      ...t,
      record:          { ...t.record },
      stats:           { ...t.stats },
      teamSeasonStats: { ...t.teamSeasonStats },
      roster: {
        ...t.roster,
        qb:    t.roster.qb    ? { ...t.roster.qb,    currentSeason: { ...t.roster.qb.currentSeason } }    : null,
        coach: t.roster.coach ? { ...t.roster.coach, currentSeason: { ...t.roster.coach.currentSeason } } : null,
        stars: t.roster.stars.map(s => ({ ...s, currentSeason: { ...s.currentSeason } })),
      },
    }));
    const findT = id => updatedLeague.find(t => t.id === id);

    const applyStatLines = (team, lines) => {
      lines.forEach(line => {
        const allP = [team.roster.qb, team.roster.coach, ...team.roster.stars].filter(Boolean);
        const player = allP.find(p => p.id === line.id);
        if (player) {
          player.currentSeason = addStats(player.currentSeason, line.statDelta);
        }
      });
    };

    weekGames.forEach(({ home, away }) => {
      const tH = findT(home);
      const tA = findT(away);
      const r = simulateGame(tH, tA);
      const isDiv = tH.div === tA.div && tH.conf === tA.conf;
      const homeWon = r.homeScore > r.awayScore;
      const tied    = r.homeScore === r.awayScore;
      if (tied)         { tH.record.t += 1; tA.record.t += 1; }
      else if (homeWon) { tH.record.w += 1; tA.record.l += 1; }
      else              { tH.record.l += 1; tA.record.w += 1; }
      tH.record.pf += r.homeScore; tH.record.pa += r.awayScore;
      tA.record.pf += r.awayScore; tA.record.pa += r.homeScore;
      // Snapshot W-L-T as of this game for the result-card display.
      r.homeRecordAfter = { w: tH.record.w, l: tH.record.l, t: tH.record.t };
      r.awayRecordAfter = { w: tA.record.w, l: tA.record.l, t: tA.record.t };
      results.push(r);

      tH.teamSeasonStats = addStats(tH.teamSeasonStats, {
        gp: 1, w: homeWon ? 1 : 0, l: !homeWon && !tied ? 1 : 0, t: tied ? 1 : 0,
        pf: r.homeScore, pa: r.awayScore,
        passYdsFor:     r.homeYards.pass, runYdsFor:     r.homeYards.run, stYdsFor:     r.homeYards.st,
        passYdsAgainst: r.awayYards.pass, runYdsAgainst: r.awayYards.run, stYdsAgainst: r.awayYards.st,
        tdFor: r.homeStats.tds, fgFor: r.homeStats.fgs,
        sacks: r.sacksA, ints: r.intsA,
      });
      tA.teamSeasonStats = addStats(tA.teamSeasonStats, {
        gp: 1, w: !homeWon && !tied ? 1 : 0, l: homeWon ? 1 : 0, t: tied ? 1 : 0,
        pf: r.awayScore, pa: r.homeScore,
        passYdsFor:     r.awayYards.pass, runYdsFor:     r.awayYards.run, stYdsFor:     r.awayYards.st,
        passYdsAgainst: r.homeYards.pass, runYdsAgainst: r.homeYards.run, stYdsAgainst: r.homeYards.st,
        tdFor: r.awayStats.tds, fgFor: r.awayStats.fgs,
        sacks: r.sacksB, ints: r.intsB,
      });

      applyStatLines(tH, r.playerStatsHome);
      applyStatLines(tA, r.playerStatsAway);

      const diff = Math.abs(r.homeScore - r.awayScore);
      tH.stats.morale = updateMorale(tH, tA,  homeWon,           diff, isDiv);
      tA.stats.morale = updateMorale(tA, tH, !homeWon && !tied,  diff, isDiv);
    });

    const taggedResults = results.map((r, idx) => ({ ...r, week: currentWeek, gameIdx: idx }));

    // ── HIGHLIGHTS ─────────────────────────────────────────────────────
    const wasFinale = currentWeek === REGULAR_SEASON_WEEKS;
    const prevClinchedSet = new Set(clinched);
    let willMakePlayoffs;
    if (wasFinale) {
      const seeds = seedPlayoffs(updatedLeague);
      willMakePlayoffs = new Set([...seeds.AFC, ...seeds.NFC].map(t => t.id));
    }
    const hl = computeWeekHighlights({
      weekNumber: currentWeek,
      weekResults: taggedResults,
      preWeekLeague, postWeekLeague: updatedLeague,
      prevClinched: prevClinchedSet,
      seasonRecords, careerRecords,
      seasonNum,
      isRegularSeasonFinale: wasFinale,
      willMakePlayoffs,
    });
    setSeasonRecords(hl.seasonRecords);
    setCareerRecords(hl.careerRecords);
    setWeekHighlights(prev => ({ ...prev, [currentWeek]: hl.highlights }));
    // Merge newly clinched into our persistent set.
    const merged = new Set([...prevClinchedSet, ...hl.clinched]);
    setClinched([...merged]);

    // Update per-game player leaderboards using each game's stat lines.
    let nextPlayerRecords = playerRecords;
    taggedResults.forEach(g => {
      nextPlayerRecords = ingestGameRecords({
        playerRecords: nextPlayerRecords,
        game: g, league: updatedLeague,
        season: seasonNum, week: currentWeek,
      });
    });
    setPlayerRecords(nextPlayerRecords);

    setWeekResults(prev => ({ ...prev, [currentWeek]: taggedResults }));
    setLeague(updatedLeague);
    // Skip the staggered reveal — show all results immediately.
    // Set revealCount to the full count so every card renders as "revealed".
    setRevealCount(taggedResults.length);
    setWeekUiState('done');
    const wasWeek = currentWeek;
    setCurrentWeek(currentWeek + 1);

    if (wasWeek === REGULAR_SEASON_WEEKS) {
      const seeds = seedPlayoffs(updatedLeague);
      [...seeds.AFC.slice(0, 1), ...seeds.NFC.slice(0, 1)].forEach(t => {
        const team = updatedLeague.find(x => x.id === t.id);
        team.stats.morale = Math.min(99, team.stats.morale + 6);
      });
      setPlayoffs({ seeds, round: 'wildcard', results: {} });
    }
  };

  const goToNextWeek = () => setWeekUiState('preview');

  // ── PLAYOFF MATCHUP BUILDER ─────────────────────────────────────────────
  // Returns the array of matches for the given round, given current seeds/results.
  const buildPlayoffMatches = (round, seeds, results) => {
    const matches = [];
    if (round === 'wildcard') {
      ['AFC', 'NFC'].forEach(conf => {
        matches.push({ conf, home: seeds[conf][1], away: seeds[conf][6] });
        matches.push({ conf, home: seeds[conf][2], away: seeds[conf][5] });
        matches.push({ conf, home: seeds[conf][3], away: seeds[conf][4] });
      });
    } else if (round === 'divisional') {
      ['AFC', 'NFC'].forEach(conf => {
        const advancing = results.wildcard.filter(r => r.conf === conf).map(r => r.winner);
        advancing.sort((a, b) =>
          seeds[conf].findIndex(s => s.id === a.id) - seeds[conf].findIndex(s => s.id === b.id));
        matches.push({ conf, home: seeds[conf][0], away: advancing[advancing.length - 1] });
        matches.push({ conf, home: advancing[0], away: advancing[1] });
      });
    } else if (round === 'conference') {
      ['AFC', 'NFC'].forEach(conf => {
        const advancing = results.divisional.filter(r => r.conf === conf).map(r => r.winner);
        advancing.sort((a, b) =>
          seeds[conf].findIndex(s => s.id === a.id) - seeds[conf].findIndex(s => s.id === b.id));
        matches.push({ conf, home: advancing[0], away: advancing[1] });
      });
    } else if (round === 'superbowl') {
      const afcChamp = results.conference.find(r => r.conf === 'AFC').winner;
      const nfcChamp = results.conference.find(r => r.conf === 'NFC').winner;
      matches.push({ conf: 'SB', home: afcChamp, away: nfcChamp });
    }
    return matches;
  };

  // ── PREPARE ROUND ──────────────────────────────────────────────────────
  // Called when user clicks "Go to <round>" — fills in pending matches.
  const prepareRound = () => {
    if (!playoffs) return;
    const { seeds, round, results, pendingMatches } = playoffs;
    if (pendingMatches) return; // Already prepared.
    if (round === 'done') return;
    const matches = buildPlayoffMatches(round, seeds, results);
    setPlayoffs({ ...playoffs, pendingMatches: matches, gameResults: [] });
  };

  // ── SIMULATE A SPECIFIC PLAYOFF GAME ───────────────────────────────────
  // Runs the sim, animates quarter-by-quarter, records the result.
  // gameIdx is the index in pendingMatches.
  const simulatePlayoffGame = async (gameIdx) => {
    if (!playoffs?.pendingMatches) return;
    const m = playoffs.pendingMatches[gameIdx];
    if (!m) return;
    // If this game was already simulated, refuse.
    if (playoffs.gameResults?.[gameIdx]) return;

    // Deep clone the league so we can apply stat lines and player updates.
    const newLeague = league.map(t => ({
      ...t,
      roster: {
        ...t.roster,
        qb:    t.roster.qb    ? { ...t.roster.qb,    currentSeason: { ...t.roster.qb.currentSeason } }    : null,
        coach: t.roster.coach ? { ...t.roster.coach, currentSeason: { ...t.roster.coach.currentSeason } } : null,
        stars: t.roster.stars.map(s => ({ ...s, currentSeason: { ...s.currentSeason } })),
      },
      teamSeasonStats: { ...t.teamSeasonStats },
    }));

    const tH = newLeague.find(t => t.id === m.home.id);
    const tA = newLeague.find(t => t.id === m.away.id);
    const r = simulateGame(tH, tA);
    if (r.homeScore === r.awayScore) {
      if (Math.random() > 0.5) r.homeScore += 3; else r.awayScore += 3;
    }

    const applyStatLines = (team, lines) => {
      lines.forEach(line => {
        const allP = [team.roster.qb, team.roster.coach, ...team.roster.stars].filter(Boolean);
        const p = allP.find(x => x.id === line.id);
        if (p) p.currentSeason = addStats(p.currentSeason, line.statDelta);
      });
    };
    applyStatLines(tH, r.playerStatsHome);
    applyStatLines(tA, r.playerStatsAway);

    // Generate random quarter-by-quarter scoring for drama.
    // Each team's final score is distributed unevenly across 4 quarters
    // so leads can swing — a team might be down 0-14 and storm back, or
    // start 21-0 and administer a lead.
    const distributeScore = (total) => {
      if (total === 0) return [0, 0, 0, 0];
      // Random weights for each quarter (0.4 to 1.6).
      const weights = [0.4 + Math.random() * 1.2, 0.4 + Math.random() * 1.2,
                       0.4 + Math.random() * 1.2, 0.4 + Math.random() * 1.2];
      const sum = weights.reduce((a, b) => a + b, 0);
      // Distribute the total proportionally, rounding to multiples of 3 or 7
      // when possible to look like real scoring (FGs and TDs).
      let raw = weights.map(w => (w / sum) * total);
      let q = raw.map(x => Math.round(x));
      let drift = q.reduce((a, b) => a + b, 0) - total;
      // Adjust to make sum match exactly.
      while (drift !== 0) {
        const idx = Math.floor(Math.random() * 4);
        if (drift > 0 && q[idx] > 0) { q[idx]--; drift--; }
        else if (drift < 0)          { q[idx]++; drift++; }
      }
      return q;
    };
    const hPerQ = distributeScore(r.homeScore);
    const aPerQ = distributeScore(r.awayScore);

    setPlayoffSimState({ gameIdx, quarter: 0, live: { h: 0, a: 0 } });
    let hRunning = 0, aRunning = 0;
    for (let q = 0; q < 4; q++) {
      await new Promise(res => setTimeout(res, 500));
      hRunning += hPerQ[q];
      aRunning += aPerQ[q];
      setPlayoffSimState({ gameIdx, quarter: q + 1, live: { h: hRunning, a: aRunning } });
    }

    const winner = r.homeScore > r.awayScore ? tH : tA;
    const loser  = r.homeScore > r.awayScore ? tA : tH;
    const gameResult = {
      conf: m.conf, winner, loser,
      result: { ...r, week: `P-${playoffs.round}`, home: tH.id, away: tA.id, gameIdx },
    };

    setLeague(newLeague);
    setPlayoffSimState(null);

    // Update per-game leaderboards
    let nextPlayerRecords = playerRecords;
    nextPlayerRecords = ingestGameRecords({
      playerRecords: nextPlayerRecords,
      game: gameResult.result, league: newLeague,
      season: seasonNum, week: gameResult.result.week,
    });
    setPlayerRecords(nextPlayerRecords);

    // Store the result by index.
    const newGameResults = [...(playoffs.gameResults || [])];
    newGameResults[gameIdx] = gameResult;
    setPlayoffs({ ...playoffs, gameResults: newGameResults });
  };

  // ── COMPLETE THE CURRENT ROUND AND ADVANCE ─────────────────────────────
  // Called when all pendingMatches have results. Stores the round results,
  // clears pendingMatches, advances to the next round.
  const advancePlayoffRound = () => {
    if (!playoffs?.pendingMatches) return;
    const total = playoffs.pendingMatches.length;
    const done = (playoffs.gameResults || []).filter(Boolean).length;
    if (done < total) return; // Not all games played.
    const round = playoffs.round;
    const nextRound = round === 'wildcard'   ? 'divisional'
                    : round === 'divisional' ? 'conference'
                    : round === 'conference' ? 'superbowl'
                    : 'done';
    const completedRoundResults = playoffs.gameResults.filter(Boolean);
    setPlayoffs({
      seeds: playoffs.seeds,
      round: nextRound,
      results: { ...playoffs.results, [round]: completedRoundResults },
      pendingMatches: null,
      gameResults: [],
    });
  };

  // ── START OFFSEASON ─────────────────────────────────────────────────────
  const startOffseason = () => {
    const allPlayers = league.flatMap(t => [t.roster.qb, ...t.roster.stars].filter(Boolean));
    const offScore = (p) => (p.currentSeason.passYds || 0) / 25
      + (p.currentSeason.rushYds || 0) / 10
      + (p.currentSeason.recYds  || 0) / 10
      + ((p.currentSeason.passTd || 0) + (p.currentSeason.rushTd || 0) + (p.currentSeason.recTd || 0)) * 6;
    const defScore = (p) => (p.currentSeason.sacks   || 0) * 5
      + (p.currentSeason.ints    || 0) * 6
      + (p.currentSeason.tackles || 0) / 5
      + (p.currentSeason.ff      || 0) * 4
      + (p.currentSeason.pd      || 0) * 2;
    const offMvp = [...allPlayers].filter(p => p.position === 'QB' || OFF_POSITIONS.includes(p.position))
      .sort((a, b) => offScore(b) - offScore(a))[0];
    const defMvp = [...allPlayers].filter(p => DEF_POSITIONS.includes(p.position))
      .sort((a, b) => defScore(b) - defScore(a))[0];
    const rookies = allPlayers.filter(p => p.yearsIn === 0);
    const offRookie = [...rookies].filter(p => p.position === 'QB' || OFF_POSITIONS.includes(p.position))
      .sort((a, b) => offScore(b) - offScore(a))[0];
    const defRookie = [...rookies].filter(p => DEF_POSITIONS.includes(p.position))
      .sort((a, b) => defScore(b) - defScore(a))[0];

    const sb = playoffs.results.superbowl?.[0];
    const historyEntry = {
      season: seasonNum,
      sbWinner: sb ? { id: sb.winner.id, name: sb.winner.name, city: sb.winner.city, color: sb.winner.color } : null,
      sbLoser:  sb ? { id: sb.loser.id,  name: sb.loser.name,  city: sb.loser.city,  color: sb.loser.color  } : null,
      afcChamp: null,
      nfcChamp: null,
      offMvp: offMvp ? { id: offMvp.id, name: offMvp.name, position: offMvp.position,
                          teamId: offMvp.teamId, stats: { ...offMvp.currentSeason } } : null,
      defMvp: defMvp ? { id: defMvp.id, name: defMvp.name, position: defMvp.position,
                          teamId: defMvp.teamId, stats: { ...defMvp.currentSeason } } : null,
      offRookie: offRookie ? { id: offRookie.id, name: offRookie.name, position: offRookie.position,
                                teamId: offRookie.teamId, stats: { ...offRookie.currentSeason } } : null,
      defRookie: defRookie ? { id: defRookie.id, name: defRookie.name, position: defRookie.position,
                                teamId: defRookie.teamId, stats: { ...defRookie.currentSeason } } : null,
      draftPick1: null,
    };
    if (sb) {
      const afc = sb.winner.conf === 'AFC' ? sb.winner : sb.loser;
      const nfc = sb.winner.conf === 'NFC' ? sb.winner : sb.loser;
      historyEntry.afcChamp = { id: afc.id, name: afc.name, city: afc.city, color: afc.color };
      historyEntry.nfcChamp = { id: nfc.id, name: nfc.name, city: nfc.city, color: nfc.color };
    }
    setHistory(prev => [...prev, historyEntry]);

    const annotated = league.map(t => ({ ...t }));
    if (playoffs && playoffs.results) {
      const sbInner = playoffs.results.superbowl?.[0];
      if (sbInner) {
        annotated.find(t => t.id === sbInner.winner.id).playoffResult = 'sb_winner';
        annotated.find(t => t.id === sbInner.loser.id).playoffResult  = 'sb_loser';
      }
      (playoffs.results.conference || []).forEach(r => {
        const t = annotated.find(x => x.id === r.loser.id);
        if (t && !t.playoffResult) t.playoffResult = 'conf_finalist';
      });
      (playoffs.results.divisional || []).forEach(r => {
        const t = annotated.find(x => x.id === r.loser.id);
        if (t && !t.playoffResult) t.playoffResult = 'div_round_out';
      });
      (playoffs.results.wildcard || []).forEach(r => {
        const t = annotated.find(x => x.id === r.loser.id);
        if (t && !t.playoffResult) t.playoffResult = 'wild_card_out';
      });
    }
    setLeague(annotated);

    // ── COMPUTE MOMENTUM CHANGES ────────────────────────────────────
    // Pre-compute new legacy/current tiers based on this season's results.
    // Show them on the momentum step; apply them at finalizeNextSeason.
    const scoreOf = (t) => {
      const res = t.playoffResult;
      const base = { sb_winner: 100, sb_loser: 90, conf_finalist: 80,
                     div_round_out: 70, wild_card_out: 60 }[res || ''] || 0;
      return base + t.record.w * 2 + (t.record.pf - t.record.pa) / 10;
    };
    const ranking      = [...annotated].sort((a, b) => scoreOf(b) - scoreOf(a)).map(t => t.id);
    const newLegacyMap = assignLegacy(ranking);
    const newCurrentMap = rotateCurrent(annotated);
    // Build a diff list for display: {teamId, fromLegacy, toLegacy, fromCurrent, toCurrent}
    const momentumChanges = annotated.map(t => ({
      teamId: t.id,
      fromLegacy:  t.legacy,
      toLegacy:    newLegacyMap[t.id],
      fromCurrent: t.current,
      toCurrent:   newCurrentMap[t.id],
    }));

    setOffseasonStep('momentum');

    const retirements = [];
    const lastYears   = [];
    annotated.forEach(t => {
      const allP = [t.roster.qb, t.roster.coach, ...t.roster.stars].filter(Boolean);
      allP.forEach(p => {
        if (p.yearsIn + 1 >= p.career)            retirements.push({ team: t.id, player: p });
        else if (p.yearsIn + 1 === p.career - 1)  lastYears.push({ team: t.id, player: p });
      });
    });
    setOffseasonData({
      retirements, lastYears, historyEntry,
      momentumChanges,
      precomputedLegacy: newLegacyMap,
      precomputedCurrent: newCurrentMap,
    });
  };

  // ── ARCHIVE SEASON & ROLL TO NEXT ───────────────────────────────────────
  const finalizeNextSeason = (newLeague, draftPick1) => {
    // Ingest end-of-season records BEFORE archive resets currentSeason.
    const updatedPlayerRecords = ingestSeasonRecords({
      playerRecords, league: newLeague, season: seasonNum,
    });
    setPlayerRecords(updatedPlayerRecords);
    // Team trophies/totals: division wins, conf wins, SB wins, playoff appearances.
    const updatedTeamRecords = ingestTeamRecords({
      teamRecords, league: newLeague, playoffs, season: seasonNum,
    });
    setTeamRecords(updatedTeamRecords);

    const archivePlayer = (p) => {
      if (!p) return p;
      const seasonRecord = { seasonNum, teamId: p.teamId, stats: { ...p.currentSeason } };
      return {
        ...p,
        bySeason:      [...(p.bySeason || []), seasonRecord],
        career_stats:  addStats(p.career_stats, p.currentSeason),
        currentSeason: emptyStatLine(p.position),
        yearsIn:       p.yearsIn + 1,
      };
    };
    const archiveTeam = (t) => {
      const seasonRecord = {
        seasonNum,
        stats:         { ...t.teamSeasonStats },
        record:        { ...t.record },
        playoffResult: t.playoffResult,
      };
      return {
        ...t,
        teamBySeason:    [...(t.teamBySeason || []), seasonRecord],
        teamCareerStats: addStats(t.teamCareerStats, t.teamSeasonStats),
        teamSeasonStats: emptyTeamSeasonStats(),
        record:          { w: 0, l: 0, t: 0, pf: 0, pa: 0 },
        playoffResult:   null,
        roster: {
          qb:    archivePlayer(t.roster.qb),
          coach: archivePlayer(t.roster.coach),
          stars: t.roster.stars.map(archivePlayer),
        },
      };
    };
    const archived = newLeague.map(archiveTeam);

    // Use the legacy/current we pre-computed and displayed on the momentum
    // step. If for some reason they weren't computed (older save format),
    // fall back to recomputing here.
    const newLegacy  = offseasonData?.precomputedLegacy
      || assignLegacy([...archived].sort((a, b) => {
        const score = t => {
          const past = t.teamBySeason[t.teamBySeason.length - 1];
          const res  = past?.playoffResult;
          const base = { sb_winner: 100, sb_loser: 90, conf_finalist: 80,
                         div_round_out: 70, wild_card_out: 60 }[res || ''] || 0;
          return base + past.record.w * 2 + (past.record.pf - past.record.pa) / 10;
        };
        return score(b) - score(a);
      }).map(t => t.id));
    const newCurrent = offseasonData?.precomputedCurrent || rotateCurrent(archived);

    let nl = archived.map(t => ({
      ...t,
      legacy: newLegacy[t.id],
      current: newCurrent[t.id],
      stats: {
        passAtk: rand(66, 74), runAtk: rand(66, 74),
        passDef: rand(66, 74), runDef: rand(66, 74),
        stAtk:   rand(66, 74), stDef:   rand(66, 74),
        physical: rand(66, 74), morale: 70,
      },
    }));
    nl = nl.map(applyMomentumBoost);

    if (draftPick1) {
      setHistory(prev => {
        const updated = [...prev];
        const last = updated[updated.length - 1];
        if (last) {
          last.draftPick1 = {
            name: draftPick1.player.name, position: draftPick1.player.position,
            rarity: draftPick1.player.rarity, teamId: draftPick1.team,
          };
        }
        return updated;
      });
    }

    setLeague(nl);
    setSeasonNum(seasonNum + 1);
    setCurrentWeek(1);
    setWeekResults({});
    setSchedule(generateSchedule(nl));
    setPlayoffs(null);
    setOffseasonStep(null);
    setOffseasonData(null);
    setSeasonRecords({});  // career records persist; season records reset
    setClinched([]);
    setWeekHighlights({});
    setWeekUiState('idle');
    setRevealCount(0);
    setTab('weekly');
  };

  // ── RENDER ──────────────────────────────────────────────────────────────
  return (
    <div style={styles.app}>
      <style>{globalCSS}</style>
      <Header
        seasonNum={seasonNum}
        saveName={saveName}
        tab={tab}
        setTab={setTab}
        hasPlayoffs={!!playoffs}
        inOffseason={offseasonStep !== null}
        onLeagueClick={() => {
          setSelectedTeamId(null);
          setSelectedPlayerId(null);
          setSelectedGame(null);
          setTab('weekly');
        }}
        onHomeClick={returnHome}
      />
      <div style={styles.main}>
        {selectedPlayerId ? (
          <PlayerDetail
            player={findPlayerById(league, freeAgents, selectedPlayerId)}
            league={league}
            onBack={() => setSelectedPlayerId(null)}
          />
        ) : selectedTeamId ? (
          <TeamDetail
            team={league.find(t => t.id === selectedTeamId)}
            onBack={() => setSelectedTeamId(null)}
            onPlayerClick={setSelectedPlayerId}
            weekResults={weekResults}
            onSelectGame={(g) => { setSelectedTeamId(null); setSelectedGame(g); }}
          />
        ) : offseasonStep ? (
          <OffseasonView
            step={offseasonStep} setStep={setOffseasonStep}
            data={offseasonData} setData={setOffseasonData}
            league={league} setLeague={setLeague}
            freeAgents={freeAgents} setFreeAgents={setFreeAgents}
            seasonNum={seasonNum}
            onComplete={finalizeNextSeason}
          />
        ) : selectedGame ? (
          <GameDetail
            game={
              weekResults[selectedGame.week]?.[selectedGame.gameIdx]
              || (playoffs?.results && Object.values(playoffs.results).flat()
                    .map(r => r.result)
                    .find(r => r.week === selectedGame.week && r.gameIdx === selectedGame.gameIdx))
            }
            week={selectedGame.week}
            league={league}
            onBack={() => setSelectedGame(null)}
            onPlayerClick={(id) => { setSelectedGame(null); setSelectedPlayerId(id); }}
            onTeamClick={(id)   => { setSelectedGame(null); setSelectedTeamId(id);   }}
          />
        ) : (
          <>
            {tab === 'weekly' && (
              <WeeklyTab
                currentWeek={currentWeek} weekResults={weekResults}
                weekHighlights={weekHighlights} schedule={schedule}
                league={league} simulateWeek={simulateWeek}
                hasPlayoffs={!!playoffs} playoffs={playoffs}
                prepareRound={prepareRound}
                simulatePlayoffGame={simulatePlayoffGame}
                advancePlayoffRound={advancePlayoffRound}
                simState={playoffSimState}
                onStartOffseason={startOffseason}
                weekUiState={weekUiState} revealCount={revealCount}
                goToNextWeek={goToNextWeek}
                onSelectGame={setSelectedGame}
              />
            )}
            {tab === 'standings' && <StandingsTab league={league} currentWeek={currentWeek} onSelectTeam={setSelectedTeamId} />}
            {tab === 'stars'     && <StarsTab     league={league} freeAgents={freeAgents}
                                                  onSelectPlayer={setSelectedPlayerId} />}
            {tab === 'teams'     && <TeamsTab     league={league} onSelectTeam={setSelectedTeamId} />}
            {tab === 'history'   && <HistoryTab history={history}
                                                  playerRecords={playerRecords}
                                                  teamRecords={teamRecords}
                                                  onSelectTeam={setSelectedTeamId} />}
          </>
        )}
      </div>
    </div>
  );
}
