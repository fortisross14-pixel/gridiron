import { styles } from '../../theme/styles.js';
import { RARITY_COLOR } from '../../theme/colors.js';
import { SectionTitle } from '../shared/SectionTitle.jsx';
import { DraftView } from './DraftView.jsx';
import { makePlayer } from '../../engine/factory.js';
import { rand, choice, generateRarity } from '../../engine/random.js';
import { RARITY_DEDUCT } from '../../engine/constants.js';
import { STAR_POSITIONS } from '../../data/teams.js';

const RetireRow = ({ item, league }) => {
  const t = league.find(x => x.id === item.team);
  return (
    <div style={styles.faRow}>
      <span style={{ ...styles.rarityBadge, background: RARITY_COLOR[item.player.rarity], fontSize: 9 }}>
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
  if (step === 'retire') {
    return (
      <div>
        <SectionTitle title="OFFSEASON" subtitle="STEP 1 · RETIREMENTS" />
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
        <SectionTitle title="OFFSEASON" subtitle="STEP 2 · FREE AGENCY" />
        <div style={styles.detailCard}>
          <h4 style={styles.detailH4}>RELEASED ({data.releases.length})</h4>
          {data.releases.map((r, i) => {
            const t = league.find(x => x.id === r.team);
            return (
              <div key={i} style={styles.faRow}>
                <span style={{ ...styles.rarityBadge, background: RARITY_COLOR[r.player.rarity], fontSize: 9 }}>
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
        <SectionTitle title="OFFSEASON" subtitle="STEP 3 · TRADES" />
        <div style={styles.detailCard}>
          <h4 style={styles.detailH4}>BLOCKBUSTER TRADES ({data.trades.length})</h4>
          {data.trades.map((t, i) => (
            <div key={i} style={styles.tradeRow}>
              <div style={styles.tradeSide}>
                <div style={{ fontSize: 11, letterSpacing: 1, opacity: 0.5 }}>{t.from}</div>
                <div style={{ marginTop: 4 }}>
                  <span style={{ ...styles.rarityBadge, background: RARITY_COLOR[t.give.rarity], fontSize: 9, marginRight: 6 }}>
                    {t.give.rarity}
                  </span>
                  {t.give.name} ({t.give.position})
                </div>
              </div>
              <div style={{ fontSize: 20, opacity: 0.4 }}>⇄</div>
              <div style={styles.tradeSide}>
                <div style={{ fontSize: 11, letterSpacing: 1, opacity: 0.5 }}>{t.to}</div>
                <div style={{ marginTop: 4 }}>
                  <span style={{ ...styles.rarityBadge, background: RARITY_COLOR[t.receive.rarity], fontSize: 9, marginRight: 6 }}>
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
