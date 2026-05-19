import { useState, useEffect } from 'react';
import { styles } from '../../theme/styles.js';
import { COLORS, RARITY_COLOR, rarityStyle, readableTextOn } from '../../theme/colors.js';
import { SectionTitle } from '../shared/SectionTitle.jsx';
import { DraftView } from './DraftView.jsx';
import { makePlayer } from '../../engine/factory.js';
import { rand, choice, generateRarity } from '../../engine/random.js';
import { RARITY_DEDUCT } from '../../engine/constants.js';
import { STAR_POSITIONS, TEAMS } from '../../data/teams.js';

// ─── AWARDS VIEW ─────────────────────────────────────────────────────────
// Reveals 6 awards 1 by 1, at 1-second cadence:
//   1. Super Bowl Champion (team)
//   2. Super Bowl MVP (player)
//   3. Regular Season Offensive MVP (player)
//   4. Regular Season Defensive MVP (player)
//   5. Offensive Rookie of the Year (player)
//   6. Defensive Rookie of the Year (player)
//
// Each card animates in. After all 6 are visible, "→ CONTINUE" appears.

const REVEAL_INTERVAL_MS = 1000;

// Format a player's headline stat line based on position.
const headlineStat = (player) => {
  const s = player.stats || {};
  if (player.position === 'QB')                          return `${s.passYds || 0} pass yds · ${s.passTd || 0} TD`;
  if (player.position === 'WR' || player.position === 'TE') return `${s.recYds || 0} rec yds · ${s.recTd || 0} TD`;
  if (player.position === 'RB')                          return `${s.rushYds || 0} rush yds · ${s.rushTd || 0} TD`;
  if (player.position === 'DE')                          return `${s.sacks || 0} sacks · ${s.tackles || 0} tkl`;
  if (player.position === 'CB')                          return `${s.ints || 0} INT · ${s.tackles || 0} tkl · ${s.pd || 0} PD`;
  if (player.position === 'K/P')                         return `${s.fgm || 0} FG`;
  return '';
};

// ── Team award card (Super Bowl Champion) ──
const TeamAwardCard = ({ label, team, snapshot }) => {
  if (!team) return null;
  const accent = team.color || COLORS.accent;
  const textOnAccent = readableTextOn(accent);
  return (
    <div style={{
      background: COLORS.panel,
      borderRadius: 12,
      overflow: 'hidden',
      boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
      border: `1px solid ${COLORS.border}`,
      animation: 'awardSlide 0.4s ease-out',
    }}>
      <div style={{
        padding: '14px 20px',
        background: accent,
        color: textOnAccent,
        fontSize: 11, letterSpacing: 3, fontWeight: 800,
      }}>{label}</div>
      <div style={{ padding: 20, display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{
          width: 64, height: 64, borderRadius: 10,
          background: accent, color: textOnAccent,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: "'Bebas Neue'", fontSize: 22, letterSpacing: 1,
          fontWeight: 800, flexShrink: 0,
        }}>{team.id}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 12, letterSpacing: 2, color: COLORS.textMute, fontWeight: 600 }}>
            {team.city?.toUpperCase()}
          </div>
          <div style={{
            fontFamily: "'Bebas Neue'", fontSize: 32, letterSpacing: 1.5, lineHeight: 1,
            marginTop: 2,
          }}>
            {team.name?.toUpperCase()}
          </div>
        </div>
        {snapshot && (
          <div style={{ display: 'flex', gap: 18, flexShrink: 0 }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 10, letterSpacing: 1.5, color: COLORS.textMute }}>RECORD</div>
              <div style={{ fontFamily: "'JetBrains Mono'", fontSize: 18, fontWeight: 800 }}>
                {snapshot.record.w}-{snapshot.record.l}{snapshot.record.t > 0 ? `-${snapshot.record.t}` : ''}
              </div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 10, letterSpacing: 1.5, color: COLORS.textMute }}>OVERALL</div>
              <div style={{ fontFamily: "'JetBrains Mono'", fontSize: 18, fontWeight: 800 }}>
                {snapshot.overall}
              </div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 10, letterSpacing: 1.5, color: COLORS.textMute }}>MOMENTUM</div>
              <div style={{ fontFamily: "'JetBrains Mono'", fontSize: 18, fontWeight: 800 }}>
                {snapshot.momentum}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ── Player award card ──
const PlayerAwardCard = ({ label, player, accentColor }) => {
  if (!player) return null;
  const team = player.teamId ? TEAMS.find(t => t.id === player.teamId) : null;
  const accent = accentColor || team?.color || COLORS.accent;
  const textOnAccent = readableTextOn(accent);
  return (
    <div style={{
      background: COLORS.panel,
      borderRadius: 12,
      overflow: 'hidden',
      boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
      border: `1px solid ${COLORS.border}`,
      animation: 'awardSlide 0.4s ease-out',
    }}>
      <div style={{
        padding: '14px 20px',
        background: accent,
        color: textOnAccent,
        fontSize: 11, letterSpacing: 3, fontWeight: 800,
      }}>{label}</div>
      <div style={{ padding: 20, display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{
          width: 64, height: 64, borderRadius: 10,
          background: team?.color || COLORS.borderMute,
          color: team ? readableTextOn(team.color) : COLORS.textMute,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: "'Bebas Neue'", fontSize: 14, letterSpacing: 1,
          fontWeight: 800, flexShrink: 0,
        }}>{player.teamId || 'FA'}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
            <span style={{ ...styles.rarityBadge, ...rarityStyle(player.rarity), fontSize: 9 }}>
              {player.rarity}
            </span>
            <span style={{ fontSize: 10, letterSpacing: 1.5, color: COLORS.textMute, fontWeight: 600 }}>
              {player.position}
            </span>
          </div>
          <div style={{
            fontFamily: "'Bebas Neue'", fontSize: 28, letterSpacing: 1, lineHeight: 1.05,
          }}>
            {player.name}
          </div>
          <div style={{ fontSize: 11, color: COLORS.textMute, marginTop: 4, letterSpacing: 0.5 }}>
            {headlineStat(player)}
          </div>
        </div>
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <div style={{ fontSize: 10, letterSpacing: 1.5, color: COLORS.textMute }}>YEAR</div>
          <div style={{ fontFamily: "'JetBrains Mono'", fontSize: 18, fontWeight: 800 }}>
            {(player.yearsIn ?? 0) + 1}<span style={{ opacity: 0.4 }}>/{player.career ?? '?'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const AwardsView = ({ data, onContinue }) => {
  const historyEntry = data?.historyEntry || {};
  const sbMvp = data?.sbMvp;

  // Build the ordered list of awards. We skip any that have no data.
  const awards = [
    historyEntry.sbWinner && { kind: 'team', label: '🏆 SUPER BOWL CHAMPION',
      team: historyEntry.sbWinner, snapshot: historyEntry.sbWinnerSnapshot },
    sbMvp                  && { kind: 'player', label: '⭐ SUPER BOWL MVP', player: sbMvp,
      accent: '#FBBF24' },
    historyEntry.offMvp    && { kind: 'player', label: '🏈 OFFENSIVE MVP', player: historyEntry.offMvp },
    historyEntry.defMvp    && { kind: 'player', label: '🛡 DEFENSIVE MVP', player: historyEntry.defMvp },
    historyEntry.offRookie && { kind: 'player', label: '🌱 OFFENSIVE ROOKIE OF THE YEAR', player: historyEntry.offRookie },
    historyEntry.defRookie && { kind: 'player', label: '🌱 DEFENSIVE ROOKIE OF THE YEAR', player: historyEntry.defRookie },
  ].filter(Boolean);

  const [revealed, setRevealed] = useState(1);

  useEffect(() => {
    if (revealed >= awards.length) return;
    const timer = setTimeout(() => setRevealed(r => r + 1), REVEAL_INTERVAL_MS);
    return () => clearTimeout(timer);
  }, [revealed, awards.length]);

  const allRevealed = revealed >= awards.length;

  return (
    <div>
      <SectionTitle title="SEASON AWARDS" subtitle={allRevealed ? 'All awards announced' : `Announcing ${revealed} / ${awards.length}`} />
      <style>{`
        @keyframes awardSlide {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {awards.slice(0, revealed).map((a, i) => a.kind === 'team'
          ? <TeamAwardCard   key={i} label={a.label} team={a.team} snapshot={a.snapshot} />
          : <PlayerAwardCard key={i} label={a.label} player={a.player} accentColor={a.accent} />
        )}
      </div>
      <button
        onClick={onContinue}
        disabled={!allRevealed}
        style={{
          ...styles.bigBtn, marginTop: 20,
          opacity: allRevealed ? 1 : 0.4,
          cursor: allRevealed ? 'pointer' : 'not-allowed',
        }}
      >
        {allRevealed ? '→ CONTINUE TO OFFSEASON' : '◌ awards in progress...'}
      </button>
    </div>
  );
};

// ─── MOMENTUM CHANGE ROW ─────────────────────────────────────────────────
const TIER_RANK = { Bottom: 0, Low: 1, Mid: 2, Candidate: 3, Dynasty: 4 };
const LEGACY_RANK = { Normal: 0, Historical: 1, Classics: 2, 'Best Ever': 3 };

const ChangeArrow = ({ direction }) => (
  <span style={{
    display: 'inline-block', minWidth: 20, textAlign: 'center', fontWeight: 800,
    color: direction === 'up' ? COLORS.success
         : direction === 'down' ? COLORS.danger
         : COLORS.textMute,
  }}>
    {direction === 'up' ? '▲' : direction === 'down' ? '▼' : '—'}
  </span>
);

const MomentumChangeRow = ({ change }) => {
  const team = TEAMS.find(t => t.id === change.teamId);
  const legDir = LEGACY_RANK[change.toLegacy.tier] > LEGACY_RANK[change.fromLegacy.tier] ? 'up'
               : LEGACY_RANK[change.toLegacy.tier] < LEGACY_RANK[change.fromLegacy.tier] ? 'down'
               : 'same';
  const curDir = TIER_RANK[change.toCurrent.tier] > TIER_RANK[change.fromCurrent.tier] ? 'up'
               : TIER_RANK[change.toCurrent.tier] < TIER_RANK[change.fromCurrent.tier] ? 'down'
               : 'same';
  // Skip teams with no change at all.
  if (legDir === 'same' && curDir === 'same') return null;

  return (
    <div style={{
      display: 'grid', gridTemplateColumns: '120px 1fr 1fr', gap: 12,
      padding: '10px 12px',
      background: COLORS.panelDeep, borderRadius: 6,
      borderLeft: `4px solid ${team?.color || COLORS.borderMute}`,
      fontSize: 13, alignItems: 'center',
    }}>
      <div style={{ fontWeight: 700 }}>
        {team?.id} {team?.name}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
        <span style={{ color: COLORS.textMute, fontSize: 10, letterSpacing: 1 }}>LEGACY</span>
        <span>{change.fromLegacy.tier} +{change.fromLegacy.value}</span>
        <ChangeArrow direction={legDir} />
        <span style={{ fontWeight: legDir !== 'same' ? 800 : 400 }}>
          {change.toLegacy.tier} +{change.toLegacy.value}
        </span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
        <span style={{ color: COLORS.textMute, fontSize: 10, letterSpacing: 1 }}>CURRENT</span>
        <span>{change.fromCurrent.tier} +{change.fromCurrent.value}</span>
        <ChangeArrow direction={curDir} />
        <span style={{ fontWeight: curDir !== 'same' ? 800 : 400 }}>
          {change.toCurrent.tier} +{change.toCurrent.value}
        </span>
      </div>
    </div>
  );
};

const RetireRow = ({ item, league }) => {
  const t = league.find(x => x.id === item.team);
  return (
    <div style={styles.faRow}>
      <span style={{ ...styles.rarityBadge, ...rarityStyle(item.player.rarity), fontSize: 9 }}>
        {item.player.rarity}
      </span>
      <span style={{ flex: 1 }}>
        {item.player.name} <span style={{ opacity: 0.5 }}>({item.player.position})</span>
      </span>
      <span style={{ opacity: 0.6 }}>{t?.id}</span>
    </div>
  );
};

export const OffseasonView = ({
  step, setStep, data, setData, league, setLeague,
  freeAgents, setFreeAgents, seasonNum, onComplete,
}) => {
  // ── AWARDS STEP ─────────────────────────────────────────────────────
  if (step === 'awards') {
    return <AwardsView data={data} onContinue={() => setStep('momentum')} />;
  }

  // ── MOMENTUM STEP ───────────────────────────────────────────────────
  if (step === 'momentum') {
    const changes = (data?.momentumChanges || []);
    // Filter out unchanged teams; sort by biggest mover first.
    const changed = changes.filter(c => {
      const legDelta = LEGACY_RANK[c.toLegacy.tier]  - LEGACY_RANK[c.fromLegacy.tier];
      const curDelta = TIER_RANK[c.toCurrent.tier] - TIER_RANK[c.fromCurrent.tier];
      return legDelta !== 0 || curDelta !== 0;
    });
    return (
      <div>
        <SectionTitle title="OFFSEASON" subtitle="STEP 2 · MOMENTUM SHIFTS" />
        <div style={styles.detailCard}>
          <h4 style={styles.detailH4}>TEAM MOMENTUM CHANGES ({changed.length})</h4>
          {changed.length === 0 ? (
            <div style={{ opacity: 0.5, padding: 12 }}>No tier changes this offseason.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {changed.map(c => <MomentumChangeRow key={c.teamId} change={c} />)}
            </div>
          )}
          <div style={{
            marginTop: 12, padding: 10, background: COLORS.panelDeep, borderRadius: 6,
            fontSize: 11, color: COLORS.textMute, lineHeight: 1.5,
          }}>
            Legacy reflects long-term accomplishments and shifts based on this season's playoff performance.
            Current momentum reflects short-term form and can move up/down a tier as teams ascend or fade.
          </div>
        </div>
        <button onClick={() => setStep('retire')} style={{ ...styles.bigBtn, marginTop: 16 }}>
          → RETIREMENTS
        </button>
      </div>
    );
  }

  if (step === 'retire') {
    return (
      <div>
        <SectionTitle title="OFFSEASON" subtitle="STEP 3 · RETIREMENTS" />
        <div style={styles.offGrid}>
          <div style={styles.detailCard}>
            <h4 style={styles.detailH4}>🏁 RETIRING ({data.retirements.length})</h4>
            {data.retirements.map(r => <RetireRow key={r.player.id} item={r} league={league} />)}
            {data.retirements.length === 0 && (
              <div style={{ opacity: 0.5, padding: 12 }}>No retirements this year.</div>
            )}
          </div>
          <div style={styles.detailCard}>
            <h4 style={styles.detailH4}>⏳ LAST YEAR ({data.lastYears.length})</h4>
            {data.lastYears.map(r => <RetireRow key={r.player.id} item={r} league={league} />)}
            {data.lastYears.length === 0 && (
              <div style={{ opacity: 0.5, padding: 12 }}>No one entering their final year.</div>
            )}
          </div>
        </div>
        <button onClick={() => {
          // Remove retired players from rosters.
          const newLeague = league.map(t => {
            const retiredIds = data.retirements.filter(r => r.team === t.id).map(r => r.player.id);
            if (retiredIds.length === 0) return t;
            const nt = { ...t, roster: { ...t.roster, stars: [...t.roster.stars] } };
            if (retiredIds.includes(nt.roster.qb?.id))    nt.roster.qb = null;
            if (retiredIds.includes(nt.roster.coach?.id)) nt.roster.coach = null;
            nt.roster.stars = nt.roster.stars.filter(s => !retiredIds.includes(s.id));
            return nt;
          });
          setLeague(newLeague);
          // Each team releases its lowest-rarity star (more if over momentum budget).
          const releases = [];
          newLeague.forEach(t => {
            if (t.roster.stars.length === 0) return;
            const sorted = [...t.roster.stars].sort((a, b) => RARITY_DEDUCT[a.rarity] - RARITY_DEDUCT[b.rarity]);
            releases.push({ team: t.id, player: sorted[0] });
            const momTot = t.legacy.value * 2 + t.current.value;
            const used = (t.roster.qb    ? RARITY_DEDUCT[t.roster.qb.rarity]    : 0)
                       + (t.roster.coach ? RARITY_DEDUCT[t.roster.coach.rarity] : 0)
                       + t.roster.stars.reduce((s, p) => s + RARITY_DEDUCT[p.rarity], 0);
            if (used > momTot && sorted.length > 1) releases.push({ team: t.id, player: sorted[1] });
          });
          setData({ ...data, releases });
          setStep('fa');
        }} style={styles.bigBtn}>→ FREE AGENCY</button>
      </div>
    );
  }

  if (step === 'fa') {
    return (
      <div>
        <SectionTitle title="OFFSEASON" subtitle="STEP 4 · FREE AGENCY" />
        <div style={styles.detailCard}>
          <h4 style={styles.detailH4}>RELEASED ({data.releases.length})</h4>
          {data.releases.map((r, i) => {
            const t = league.find(x => x.id === r.team);
            return (
              <div key={i} style={styles.faRow}>
                <span style={{ ...styles.rarityBadge, ...rarityStyle(r.player.rarity), fontSize: 9 }}>
                  {r.player.rarity}
                </span>
                <span style={{ flex: 1 }}>
                  {r.player.name} <span style={{ opacity: 0.5 }}>({r.player.position})</span>
                </span>
                <span style={{ opacity: 0.6 }}>{t.id}</span>
              </div>
            );
          })}
        </div>
        <button onClick={() => {
          // Apply releases — push to FA pool, remove from rosters.
          const newFA = { stars: [...freeAgents.stars], coaches: [...freeAgents.coaches] };
          data.releases.forEach(r => newFA.stars.push({ ...r.player, teamId: null }));
          const newLeague = league.map(t => {
            const releasedIds = data.releases.filter(r => r.team === t.id).map(r => r.player.id);
            if (releasedIds.length === 0) return t;
            return { ...t, roster: { ...t.roster, stars: t.roster.stars.filter(s => !releasedIds.includes(s.id)) } };
          });
          setFreeAgents(newFA);
          setLeague(newLeague);

          // Generate trades (5-6 random same-type swaps).
          const trades = [];
          const tradesCount = rand(5, 6);
          for (let i = 0; i < tradesCount; i++) {
            const t1 = choice(newLeague);
            const t2 = choice(newLeague.filter(x => x.id !== t1.id));
            const allP1 = [t1.roster.qb, ...t1.roster.stars].filter(Boolean);
            const allP2 = [t2.roster.qb, ...t2.roster.stars].filter(Boolean);
            if (allP1.length === 0 || allP2.length === 0) continue;
            const p1 = choice(allP1);
            const p2 = choice(allP2);
            if (p1.kind !== p2.kind) continue;
            trades.push({ from: t1.id, to: t2.id, give: p1, receive: p2 });
          }
          setData({ ...data, trades });
          setStep('trades');
        }} style={styles.bigBtn}>→ TRADES</button>
      </div>
    );
  }

  if (step === 'trades') {
    return (
      <div>
        <SectionTitle title="OFFSEASON" subtitle="STEP 5 · TRADES" />
        <div style={styles.detailCard}>
          <h4 style={styles.detailH4}>BLOCKBUSTER TRADES ({data.trades.length})</h4>
          {data.trades.map((t, i) => (
            <div key={i} style={styles.tradeRow}>
              <div style={styles.tradeSide}>
                <div style={{ fontSize: 11, letterSpacing: 1, opacity: 0.5 }}>{t.from}</div>
                <div style={{ marginTop: 4 }}>
                  <span style={{ ...styles.rarityBadge, ...rarityStyle(t.give.rarity), fontSize: 9, marginRight: 6 }}>
                    {t.give.rarity}
                  </span>
                  {t.give.name} ({t.give.position})
                </div>
              </div>
              <div style={{ fontSize: 20, opacity: 0.4 }}>⇄</div>
              <div style={styles.tradeSide}>
                <div style={{ fontSize: 11, letterSpacing: 1, opacity: 0.5 }}>{t.to}</div>
                <div style={{ marginTop: 4 }}>
                  <span style={{ ...styles.rarityBadge, ...rarityStyle(t.receive.rarity), fontSize: 9, marginRight: 6 }}>
                    {t.receive.rarity}
                  </span>
                  {t.receive.name} ({t.receive.position})
                </div>
              </div>
            </div>
          ))}
        </div>
        <button onClick={() => {
          // Apply trades.
          let newLeague = league.map(t => ({ ...t, roster: { ...t.roster, stars: [...t.roster.stars] } }));
          data.trades.forEach(t => {
            const t1 = newLeague.find(x => x.id === t.from);
            const t2 = newLeague.find(x => x.id === t.to);
            if (t.give.kind === 'QB') {
              t1.roster.qb = { ...t.receive, teamId: t1.id };
              t2.roster.qb = { ...t.give,    teamId: t2.id };
            } else {
              t1.roster.stars = t1.roster.stars.map(s => s.id === t.give.id    ? { ...t.receive, teamId: t1.id } : s);
              t2.roster.stars = t2.roster.stars.map(s => s.id === t.receive.id ? { ...t.give,    teamId: t2.id } : s);
            }
          });
          setLeague(newLeague);

          // Generate the rookie draft class.
          const qbPool = [];
          for (let i = 0; i < 8; i++) {
            qbPool.push(makePlayer('QB', generateRarity('qb'), 'QB', { debutSeason: seasonNum + 1 }));
          }
          const starPool = [];
          for (let i = 0; i < 40; i++) {
            starPool.push(makePlayer('Star', generateRarity('star'), choice(STAR_POSITIONS), { debutSeason: seasonNum + 1 }));
          }
          const draftOrder = [...newLeague].sort((a, b) => a.record.w - b.record.w);
          setData({ ...data, draftOrder, qbPool, starPool, picks: [] });
          setStep('draft');
        }} style={styles.bigBtn}>→ DRAFT</button>
      </div>
    );
  }

  if (step === 'draft') {
    return (
      <DraftView data={data} setData={setData} league={league} setLeague={setLeague}
                 freeAgents={freeAgents} setFreeAgents={setFreeAgents}
                 onComplete={onComplete} />
    );
  }

  return null;
};
