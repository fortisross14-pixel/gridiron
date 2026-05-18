// Historical achievement: Super Bowls won, SB appearances, conf championships,
// division titles, winning seasons. Used to seed legacy at league start.
export const HISTORY_SCORE_DATA = {
  PIT: { sb: 6, sbApp: 8, conf: 8, div: 24, win: 35 },
  NE:  { sb: 6, sbApp: 11, conf: 11, div: 22, win: 28 },
  DAL: { sb: 5, sbApp: 8, conf: 10, div: 25, win: 33 },
  SF:  { sb: 5, sbApp: 7, conf: 7, div: 22, win: 30 },
  GB:  { sb: 4, sbApp: 5, conf: 9, div: 22, win: 32 },
  NYG: { sb: 4, sbApp: 5, conf: 11, div: 17, win: 28 },
  DEN: { sb: 3, sbApp: 8, conf: 8, div: 16, win: 27 },
  LAR: { sb: 2, sbApp: 5, conf: 8, div: 19, win: 30 },
  WAS: { sb: 3, sbApp: 5, conf: 5, div: 15, win: 25 },
  KC:  { sb: 4, sbApp: 6, conf: 6, div: 14, win: 26 },
  LV:  { sb: 3, sbApp: 5, conf: 5, div: 16, win: 25 },
  BAL: { sb: 2, sbApp: 2, conf: 2, div: 8, win: 18 },
  MIA: { sb: 2, sbApp: 5, conf: 5, div: 14, win: 30 },
  IND: { sb: 2, sbApp: 4, conf: 4, div: 17, win: 26 },
  TB:  { sb: 2, sbApp: 2, conf: 2, div: 8, win: 14 },
  PHI: { sb: 1, sbApp: 4, conf: 4, div: 14, win: 24 },
  CHI: { sb: 1, sbApp: 2, conf: 4, div: 19, win: 28 },
  NYJ: { sb: 1, sbApp: 1, conf: 1, div: 4, win: 18 },
  NO:  { sb: 1, sbApp: 1, conf: 1, div: 7, win: 15 },
  SEA: { sb: 1, sbApp: 3, conf: 3, div: 11, win: 21 },
  CIN: { sb: 0, sbApp: 3, conf: 3, div: 10, win: 17 },
  BUF: { sb: 0, sbApp: 4, conf: 6, div: 13, win: 24 },
  ATL: { sb: 0, sbApp: 2, conf: 2, div: 7, win: 14 },
  CAR: { sb: 0, sbApp: 2, conf: 2, div: 6, win: 9 },
  TEN: { sb: 0, sbApp: 1, conf: 1, div: 9, win: 21 },
  ARI: { sb: 0, sbApp: 1, conf: 1, div: 6, win: 10 },
  MIN: { sb: 0, sbApp: 4, conf: 4, div: 21, win: 30 },
  CLE: { sb: 0, sbApp: 0, conf: 4, div: 11, win: 24 },
  DET: { sb: 0, sbApp: 0, conf: 4, div: 4, win: 17 },
  HOU: { sb: 0, sbApp: 0, conf: 0, div: 7, win: 8 },
  LAC: { sb: 0, sbApp: 1, conf: 1, div: 10, win: 22 },
  JAX: { sb: 0, sbApp: 0, conf: 0, div: 4, win: 9 },
};

export const historyScore = (id) => {
  const h = HISTORY_SCORE_DATA[id] || { sb: 0, sbApp: 0, conf: 0, div: 0, win: 0 };
  return h.sb * 10 + (h.sbApp - h.sb) * 5 + (h.conf - h.sbApp) * 3 + h.div * 2 + h.win;
};
