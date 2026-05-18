// ─── RECORD TRACKING ─────────────────────────────────────────────────────
// Tracks single-game highs across positions and stats.
// Two scopes:
//   - seasonRecords: best in current season (resets at season rollover)
//   - careerRecords: all-time across all seasons (persistent)
//
// Each record is { value, holder, season, week, opponent }.
// Holder is { id, name, position, teamId }.

// Stat keys tracked per position. The label is what appears in highlights.
// `min` = minimum value to even consider as a record (suppresses noise).
export const TRACKED_STATS = {
  QB:   [{ key: 'passYds', label: 'passing yards', min: 250 },
         { key: 'passTd',  label: 'passing TDs',   min: 3 }],
  WR:   [{ key: 'recYds',  label: 'receiving yards', min: 100 },
         { key: 'recTd',   label: 'receiving TDs',   min: 2 }],
  TE:   [{ key: 'recYds',  label: 'receiving yards', min: 80 },
         { key: 'recTd',   label: 'receiving TDs',   min: 2 }],
  RB:   [{ key: 'rushYds', label: 'rushing yards', min: 110 },
         { key: 'rushTd',  label: 'rushing TDs',   min: 2 }],
  DE:   [{ key: 'sacks',   label: 'sacks',   min: 2 },
         { key: 'tackles', label: 'tackles', min: 8 }],
  CB:   [{ key: 'ints',    label: 'interceptions',  min: 2 },
         { key: 'tackles', label: 'tackles',        min: 6 },
         { key: 'pd',      label: 'passes defended', min: 3 }],
  'K/P':[{ key: 'fgm',     label: 'field goals', min: 3 }],
};

// Build an empty record bag.
export const emptyRecords = () => ({});

// Make a stable string key for a record.
export const recordKey = (position, statKey) => `${position}::${statKey}`;

// Check a player's per-game stat line against existing records.
// Returns an array of { scope: 'season'|'career', key, label, value, prev, tied }.
// Does NOT mutate; the caller decides whether to commit via updateRecords().
export const checkRecords = ({
  player, position, statLine, season, week, opponent,
  seasonRecords, careerRecords,
}) => {
  const tracked = TRACKED_STATS[position];
  if (!tracked) return [];
  const out = [];
  tracked.forEach(({ key, label, min }) => {
    const value = statLine?.[key] || 0;
    if (value <= 0) return;
    // Skip values that fall below the min threshold — too noisy as "records".
    if (min && value < min) return;
    const seasonRec = seasonRecords[recordKey(position, key)];
    const careerRec = careerRecords[recordKey(position, key)];

    // Season record: strictly greater than previous (or no previous).
    if (!seasonRec || value > seasonRec.value) {
      out.push({
        scope: 'season',
        position, key, label, value,
        prev: seasonRec?.value || 0,
        holder: { id: player.id, name: player.name, position, teamId: player.teamId },
        season, week, opponent,
      });
    }

    // Career record: fires when player exceeds prior best, OR when a
    // different player ties the prior best. First-ever records are tracked
    // silently — we don't have prior history to compare against.
    if (!careerRec) {
      // Track silently as a "ghost" entry. No highlight emitted.
      out.push({
        scope: 'career',
        position, key, label, value,
        prev: 0,
        tied: false,
        silent: true, // marker — caller will skip the highlight but still commit
        holder: { id: player.id, name: player.name, position, teamId: player.teamId },
        season, week, opponent,
      });
    } else if (value > careerRec.value) {
      out.push({
        scope: 'career',
        position, key, label, value,
        prev: careerRec.value,
        tied: false,
        holder: { id: player.id, name: player.name, position, teamId: player.teamId },
        season, week, opponent,
      });
    } else if (value === careerRec.value && careerRec.holder?.id !== player.id) {
      out.push({
        scope: 'career',
        position, key, label, value,
        prev: careerRec.value,
        tied: true,
        holder: { id: player.id, name: player.name, position, teamId: player.teamId },
        season, week, opponent,
      });
    }
  });
  return out;
};

// Apply the new-records list to the record bags. Pure function; returns
// new {seasonRecords, careerRecords} objects.
export const updateRecords = (records, seasonRecords, careerRecords) => {
  const nextSeason = { ...seasonRecords };
  const nextCareer = { ...careerRecords };
  records.forEach(rec => {
    const k = recordKey(rec.position, rec.key);
    const entry = {
      value: rec.value,
      holder: rec.holder,
      season: rec.season,
      week: rec.week,
      opponent: rec.opponent,
    };
    if (rec.scope === 'season') nextSeason[k] = entry;
    if (rec.scope === 'career' && !rec.tied) nextCareer[k] = entry;
    // For ties: don't overwrite, but it's still a noteworthy highlight.
  });
  return { seasonRecords: nextSeason, careerRecords: nextCareer };
};
