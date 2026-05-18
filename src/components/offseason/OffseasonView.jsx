import { styles } from '../../theme/styles.js';
import { COLORS, RARITY_COLOR, rarityStyle } from '../../theme/colors.js';
import { SectionTitle } from '../shared/SectionTitle.jsx';
import { DraftView } from './DraftView.jsx';
import { makePlayer } from '../../engine/factory.js';
import { rand, choice, generateRarity } from '../../engine/random.js';
import { RARITY_DEDUCT } from '../../engine/constants.js';
import { STAR_POSITIONS, TEAMS } from '../../data/teams.js';

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
        <SectionTitle title="OFFSEASON" subtitle="STEP 1 · MOMENTUM SHIFTS" />
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
        <SectionTitle title="OFFSEASON" subtitle="STEP 2 · RETIREMENTS" />
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
        <SectionTitle title="OFFSEASON" subtitle="STEP 3 · FREE AGENCY" />
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
        <SectionTitle title="OFFSEASON" subtitle="STEP 4 · TRADES" />
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
