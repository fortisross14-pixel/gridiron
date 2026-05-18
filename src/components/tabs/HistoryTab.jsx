import { useState } from 'react';
import { styles } from '../../theme/styles.js';
import { COLORS, RARITY_COLOR, rarityStyle } from '../../theme/colors.js';
import { SectionTitle } from '../shared/SectionTitle.jsx';
import { PLAYER_STAT_DEFS } from '../../engine/leaderboards.js';
import { TEAMS } from '../../data/teams.js';

// ─── SEASONS VIEW (existing per-season recap) ────────────────────────────
const labelStyle = { fontSize: 10, letterSpacing: 2, opacity: 0.5 };
const HistoryAward = ({ label, children }) => (
  <div>
    <div style={labelStyle}>{label}</div>
    <div style={{ fontSize: 14, marginTop: 4 }}>{children}</div>
  </div>
);

const SeasonsView = ({ history }) => (
  <>
    {history.length === 0 && (
      <div style={{ ...styles.detailCard, textAlign: 'center', padding: 40, opacity: 0.5 }}>
        Complete a full season to start building history.
      </div>
    )}
    {[...history].reverse().map(entry => (
      <div key={entry.season} style={{ ...styles.detailCard, marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 16 }}>
          <span style={{ fontFamily: "'Bebas Neue'", fontSize: 36, letterSpacing: 2, color: COLORS.accent }}>
            S{entry.season}
          </span>
          {entry.sbWinner && (
            <span style={{ fontSize: 14, letterSpacing: 1, opacity: 0.7 }}>
              SUPER BOWL {entry.season}
            </span>
          )}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
          {entry.sbWinner && (
            <div>
              <div style={labelStyle}>🏆 CHAMPION</div>
              <div style={{
                fontFamily: "'Bebas Neue'", fontSize: 24, letterSpacing: 1,
                color: entry.sbWinner.color, marginTop: 4,
              }}>
                {entry.sbWinner.city} {entry.sbWinner.name}
              </div>
            </div>
          )}
          {entry.sbLoser && (
            <div>
              <div style={labelStyle}>RUNNER-UP</div>
              <div style={{
                fontFamily: "'Bebas Neue'", fontSize: 20, letterSpacing: 1,
                marginTop: 4, opacity: 0.85,
              }}>
                {entry.sbLoser.city} {entry.sbLoser.name}
              </div>
            </div>
          )}
          {entry.afcChamp && (
            <HistoryAward label="AFC CHAMP">{entry.afcChamp.city} {entry.afcChamp.name}</HistoryAward>
          )}
          {entry.nfcChamp && (
            <HistoryAward label="NFC CHAMP">{entry.nfcChamp.city} {entry.nfcChamp.name}</HistoryAward>
          )}
          {entry.offMvp && (
            <HistoryAward label="OFFENSIVE MVP">
              {entry.offMvp.name} <span style={{ opacity: 0.6, fontSize: 11 }}>{entry.offMvp.position} · {entry.offMvp.teamId}</span>
            </HistoryAward>
          )}
          {entry.defMvp && (
            <HistoryAward label="DEFENSIVE MVP">
              {entry.defMvp.name} <span style={{ opacity: 0.6, fontSize: 11 }}>{entry.defMvp.position} · {entry.defMvp.teamId}</span>
            </HistoryAward>
          )}
          {entry.offRookie && (
            <HistoryAward label="OFF. ROOKIE OF THE YEAR">
              {entry.offRookie.name} <span style={{ opacity: 0.6, fontSize: 11 }}>{entry.offRookie.position} · {entry.offRookie.teamId}</span>
            </HistoryAward>
          )}
          {entry.defRookie && (
            <HistoryAward label="DEF. ROOKIE OF THE YEAR">
              {entry.defRookie.name} <span style={{ opacity: 0.6, fontSize: 11 }}>{entry.defRookie.position} · {entry.defRookie.teamId}</span>
            </HistoryAward>
          )}
          {entry.draftPick1 && (
            <HistoryAward label="#1 DRAFT PICK">
              {entry.draftPick1.name}{' '}
              <span style={{ ...styles.rarityBadge, ...rarityStyle(entry.draftPick1.rarity), fontSize: 9 }}>
                {entry.draftPick1.rarity}
              </span>
              <span style={{ opacity: 0.6, fontSize: 11 }}> · {entry.draftPick1.position} · {entry.draftPick1.teamId}</span>
            </HistoryAward>
          )}
        </div>
      </div>
    ))}
  </>
);

// ─── PLAYER RECORDS VIEW ─────────────────────────────────────────────────
//
// One card per tracked stat, showing 3 columns of top-5: PER GAME / PER
// SEASON / CAREER. Each entry: rank · player + position + team · value.
const RecordList = ({ scope, board }) => {
  if (!board || board.length === 0) {
    return <div style={{ padding: 12, fontSize: 12, color: COLORS.textMute, fontStyle: 'italic' }}>—</div>;
  }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {board.map((e, i) => {
        const rankColor = i === 0 ? '#FBBF24' : i === 1 ? '#A5ACAF' : i === 2 ? '#B87333' : COLORS.textMute;
        const team = TEAMS.find(t => t.id === e.teamId);
        const teamColor = team?.color || COLORS.borderMute;
        return (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '8px 10px',
            background: COLORS.panelDeep,
            borderRadius: 6,
            borderLeft: `3px solid ${teamColor}`,
          }}>
            <div style={{
              fontFamily: "'JetBrains Mono'", fontSize: 14, fontWeight: 900,
              color: rankColor, minWidth: 18, textAlign: 'center',
            }}>{i + 1}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 700, lineHeight: 1.2 }}>
                {e.playerName}
              </div>
              <div style={{ fontSize: 10, color: COLORS.textMute, marginTop: 1, letterSpacing: 0.5 }}>
                {e.position} · {e.teamId}
                {scope === 'perGame' && e.season != null && (
                  <> · S{e.season} W{e.week} vs {e.opponent}</>
                )}
                {scope === 'perSeason' && e.season != null && <> · S{e.season}</>}
                {scope === 'perCareer' && e.throughSeason != null && <> · thru S{e.throughSeason}</>}
              </div>
            </div>
            <div style={{
              fontFamily: "'JetBrains Mono'", fontSize: 18, fontWeight: 800,
            }}>{e.value}</div>
          </div>
        );
      })}
    </div>
  );
};

const StatRecordCard = ({ def, board }) => (
  <div style={styles.detailCard}>
    <h4 style={styles.detailH4}>{def.label.toUpperCase()}</h4>
    <div style={{
      display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12,
    }}>
      <div>
        <div style={{
          fontSize: 10, letterSpacing: 2, color: COLORS.textMute, fontWeight: 700,
          marginBottom: 8,
        }}>PER GAME</div>
        <RecordList scope="perGame" board={board?.perGame} />
      </div>
      <div>
        <div style={{
          fontSize: 10, letterSpacing: 2, color: COLORS.textMute, fontWeight: 700,
          marginBottom: 8,
        }}>PER SEASON</div>
        <RecordList scope="perSeason" board={board?.perSeason} />
      </div>
      <div>
        <div style={{
          fontSize: 10, letterSpacing: 2, color: COLORS.textMute, fontWeight: 700,
          marginBottom: 8,
        }}>CAREER</div>
        <RecordList scope="perCareer" board={board?.perCareer} />
      </div>
    </div>
  </div>
);

const PlayerRecordsView = ({ playerRecords }) => {
  // Show only stats that have at least one record somewhere.
  const meaningful = PLAYER_STAT_DEFS.filter(def => {
    const b = playerRecords?.[def.key];
    if (!b) return false;
    return (b.perGame?.length || 0) + (b.perSeason?.length || 0) + (b.perCareer?.length || 0) > 0;
  });

  if (meaningful.length === 0) {
    return (
      <div style={{ ...styles.detailCard, textAlign: 'center', padding: 40, opacity: 0.5 }}>
        Play games and complete seasons to populate the record book.
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {meaningful.map(def => (
        <StatRecordCard key={def.key} def={def} board={playerRecords[def.key]} />
      ))}
    </div>
  );
};

// ─── TEAM RECORDS VIEW ───────────────────────────────────────────────────
const TEAM_RECORD_COLUMNS = [
  { key: 'superBowls',           label: 'SB Wins',          width: 70 },
  { key: 'superBowlAppearances', label: 'SB Apps',          width: 70 },
  { key: 'conferenceTitles',     label: 'Conf Titles',      width: 80 },
  { key: 'divisionTitles',       label: 'Div Titles',       width: 80 },
  { key: 'playoffAppearances',   label: 'Playoff Apps',     width: 90 },
  { key: 'playoffWins',          label: 'Playoff Wins',     width: 90 },
  { key: 'totalRegularWins',     label: 'Reg Wins',         width: 80 },
  { key: 'totalRegularLosses',   label: 'Reg Losses',       width: 80 },
  { key: 'seasonsPlayed',        label: 'Seasons',          width: 70 },
];

const TeamRecordsView = ({ teamRecords, onSelectTeam }) => {
  const [sortKey, setSortKey] = useState('superBowls');
  const teamIds = Object.keys(teamRecords);
  if (teamIds.length === 0) {
    return (
      <div style={{ ...styles.detailCard, textAlign: 'center', padding: 40, opacity: 0.5 }}>
        Complete at least one season to start tracking team records.
      </div>
    );
  }

  const rows = teamIds.map(id => {
    const t = TEAMS.find(x => x.id === id);
    return { ...t, ...teamRecords[id] };
  }).sort((a, b) => (b[sortKey] || 0) - (a[sortKey] || 0));

  return (
    <div>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
        <span style={{
          fontSize: 11, letterSpacing: 1.5, color: COLORS.textMute,
          alignSelf: 'center', fontWeight: 700,
        }}>SORT BY</span>
        {TEAM_RECORD_COLUMNS.map(c => (
          <button key={c.key} onClick={() => setSortKey(c.key)} style={{
            ...styles.chip,
            background: sortKey === c.key ? COLORS.accent : 'transparent',
            color:      sortKey === c.key ? COLORS.accentText : COLORS.textMute,
          }}>{c.label.toUpperCase()}</button>
        ))}
      </div>

      <div style={styles.detailCard}>
        <table style={{ ...styles.standingsTable, width: '100%' }}>
          <thead>
            <tr>
              <th style={styles.thNum}>#</th>
              <th style={styles.th}>Team</th>
              {TEAM_RECORD_COLUMNS.map(c => (
                <th key={c.key} style={{
                  ...styles.thNum,
                  color: sortKey === c.key ? COLORS.accent : undefined,
                  opacity: sortKey === c.key ? 1 : 0.5,
                }}>{c.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((t, i) => (
              <tr key={t.id} onClick={() => onSelectTeam(t.id)} style={styles.standingRow}>
                <td style={{ ...styles.tdNum,
                  color: i === 0 ? '#FBBF24' : i === 1 ? '#A5ACAF' : i === 2 ? '#B87333' : undefined,
                  fontWeight: 800,
                }}>{i + 1}</td>
                <td style={styles.td}>
                  <span style={{ ...styles.teamDot, background: t.color }} />
                  {t.city} {t.name}
                </td>
                {TEAM_RECORD_COLUMNS.map(c => (
                  <td key={c.key} style={{
                    ...styles.tdNum,
                    fontWeight: sortKey === c.key ? 800 : 400,
                    color: sortKey === c.key ? COLORS.accent : undefined,
                  }}>{t[c.key] ?? 0}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ─── MAIN HISTORY TAB ────────────────────────────────────────────────────
export const HistoryTab = ({ history, playerRecords, teamRecords, onSelectTeam }) => {
  const [view, setView] = useState('seasons');
  const viewBtn = (key, label) => (
    <button onClick={() => setView(key)} style={{
      ...styles.chip, padding: '8px 16px', fontSize: 12,
      background: view === key ? COLORS.accent : 'transparent',
      color:      view === key ? COLORS.accentText : COLORS.textMute,
    }}>{label}</button>
  );

  const subtitle =
    view === 'seasons'        ? `${history.length} seasons completed`
    : view === 'playerRecords' ? 'Top 5 by stat — game / season / career'
    : 'Trophy counts & lifetime totals';

  return (
    <div>
      <SectionTitle title="LEAGUE HISTORY" subtitle={subtitle} />
      <div style={{ display: 'flex', gap: 8, marginBottom: 18, flexWrap: 'wrap' }}>
        {viewBtn('seasons', 'SEASONS')}
        {viewBtn('playerRecords', 'PLAYER RECORDS')}
        {viewBtn('teamRecords', 'TEAM RECORDS')}
      </div>

      {view === 'seasons'       && <SeasonsView history={history} />}
      {view === 'playerRecords' && <PlayerRecordsView playerRecords={playerRecords || {}} />}
      {view === 'teamRecords'   && <TeamRecordsView teamRecords={teamRecords || {}} onSelectTeam={onSelectTeam} />}
    </div>
  );
};
