# NFL Season Simulator

Live URL: https://fortisross14-pixel.github.io/gridiron/

## Run locally

```
npm install
npm run dev
```

## Deploy

`git push` to `main` triggers GitHub Pages deploy via the workflow in `.github/workflows/deploy.yml`. The live URL serves the contents of `dist/` after build.

## Structure

```
src/
├── App.jsx                  Top-level composition, state hooks, routing between views
├── main.jsx                 React entry
├── data/                    Static lookups (teams, names, history scores, coach specialties)
├── engine/                  Pure simulation — no React
│   ├── constants.js         Rarity tables, bonus magnitudes, scoring thresholds
│   ├── factory.js           makePlayer, createInitialTeam, initialFreeAgents
│   ├── bonuses.js           coachBonuses, aggregateBonuses, describePlayerEffects
│   ├── simulate.js          simulateGame (5-stage pipeline)
│   ├── season.js            schedule generation, playoff seeding
│   └── offseason.js         retirements, FA, trades, draft, legacy re-rank
├── state/                   State helpers (stat lines, morale updates)
├── theme/                   styles object, color tokens, rarity colors
└── components/
    ├── shared/              Small reusable bits (PlayerCard, SectionTitle, etc.)
    ├── tabs/                The 5 main tabs (Weekly, Standings, Stars, Teams, History)
    ├── details/             GameDetail, TeamDetail, PlayerDetail
    └── offseason/           PlayoffsView, OffseasonView, DraftView
```

### When you want to change something

| Change | File |
|---|---|
| Adjust scoring thresholds, win-% balance, star yards | `engine/constants.js` + `engine/simulate.js` |
| Tweak coach specialty effects | `engine/bonuses.js` + `data/specialties.js` |
| Update team colors, names, history achievement | `data/teams.js` + `data/history.js` |
| Change visual style — colors, fonts, spacing | `theme/styles.js` + `theme/colors.js` |
| Restructure a tab's layout | `components/tabs/{name}.jsx` |
| Add a stat to player detail | `components/details/PlayerDetail.jsx` |
