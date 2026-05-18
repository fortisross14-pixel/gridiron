// Stat-line scaffolding. Each position tracks a different schema.

export const emptyStatLine = (position) => {
  const base = { gp: 0, w: 0, l: 0 };
  if (position === 'QB')                            return { ...base, passYds: 0, passTd: 0, passInt: 0, rushYds: 0, rushTd: 0 };
  if (position === 'WR' || position === 'TE')       return { ...base, recYds: 0, recTd: 0, rec: 0 };
  if (position === 'RB')                            return { ...base, rushYds: 0, rushTd: 0, recYds: 0, recTd: 0, rec: 0 };
  if (position === 'DE')                            return { ...base, sacks: 0, tackles: 0, ff: 0 };
  if (position === 'CB')                            return { ...base, tackles: 0, ints: 0, pd: 0 };
  if (position === 'K/P')                           return { ...base, fga: 0, fgm: 0, xpm: 0, punts: 0 };
  if (position === 'HC')                            return { ...base }; // coaches: W/L only
  return base;
};

export const emptyTeamSeasonStats = () => ({
  gp: 0, w: 0, l: 0, t: 0,
  pf: 0, pa: 0,
  passYdsFor: 0, runYdsFor: 0, stYdsFor: 0,
  passYdsAgainst: 0, runYdsAgainst: 0, stYdsAgainst: 0,
  tdFor: 0, fgFor: 0,
  sacks: 0, ints: 0,
});

export const addStats = (a, b) => {
  const out = { ...a };
  Object.keys(b).forEach(k => { out[k] = (out[k] || 0) + b[k]; });
  return out;
};
