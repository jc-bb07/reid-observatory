# Where the rates go — Isle of Man local authorities

Static site. No build step, no server-side code, no external dependencies at runtime
(d3 is vendored in `lib/`). Copy the whole folder to the web server and it works.

## Deploy

Copy the contents of this folder to the target directory, e.g.

    rsync -av --delete ./ user@host:/var/www/observatory/rates/

Then browse to `index.html`. Everything is relative-path, so it works from any
sub-directory (e.g. `observatory.coalfinch.com/rates/`).

## Contents

    index.html                          landing page: Middle / South / North, East & West / Douglas tabs, scale comparisons, method
    benchmarking.html                   all 17 built authorities side by side, full 21-authority roster, pick-any-4 tool

    braddan-budget-sankey.html          Braddan, 2022-23 to 2026-27, budget estimates
    marown-budget-sankey.html           Marown, 2021-22 to 2023-24, audited outturn
    santon-budget-sankey.html           Santon, 2021-22 to 2023-24, audited outturn

    arbory-rushen-budget-sankey.html    Arbory & Rushen, 2022-23 to 2023-24, audited outturn
    malew-budget-sankey.html            Malew, 2021-22 to 2023-24, audited outturn
    port-erin-budget-sankey.html        Port Erin, 2021-22 to 2024-25, audited outturn
    port-st-mary-budget-sankey.html     Port St Mary, 2021-22 to 2023-24, audited outturn
    castletown-budget-sankey.html       Castletown, 2021-22 to 2023-24 (draft), audited outturn

    andreas-budget-sankey.html          Andreas, 2021-22 to 2023-24, audited outturn
    ballaugh-budget-sankey.html         Ballaugh, 2021-22 to 2023-24, audited outturn
    bride-budget-sankey.html            Bride, 2021-22 to 2024-25, audited outturn
    german-budget-sankey.html           German, 2021-22 to 2023-24, audited outturn
    jurby-budget-sankey.html            Jurby, 2021-22 to 2023-24, audited outturn
    lezayre-budget-sankey.html          Lezayre, 2021-22 to 2022-23 (2023-24 not in archive), audited outturn
    patrick-budget-sankey.html          Patrick, 2021-22 to 2023-24, audited outturn
    garff-budget-sankey.html            Garff, 2022-23 to 2024-25, audited outturn (2016 merger of Laxey/Lonan/Maughold)
    douglas-budget-sankey.html          Douglas, 2022-23 to 2024-25, audited outturn — General Fund only, HRA shown separately

    lib/observatory.css                 shared stylesheet (dark/light)
    lib/d3.min.js                       d3 v7
    lib/d3-sankey.min.js                d3-sankey v0.12
    data/*.csv                          every figure in the diagrams, as CSV

## Notes

- All pages accept the Observatory shell's theme messages (`observatory-theme`,
  `setTheme`) via postMessage, so they can be iframed into the main site and will
  follow its light/dark state. Standalone, they use a local toggle and remember the
  choice in `localStorage`.
- Each authority page verifies its own arithmetic on load and logs the result to the
  browser console. If a figure is ever edited incorrectly, the console will say so.
- Google Fonts is the only external request. Remove the `<link>` in each file if the
  server must be fully self-contained; the pages fall back to system sans-serif.

## Coverage

17 of the Isle of Man's 21 current local authorities are built. Not yet covered:
Ramsey, Peel (Town); Onchan, Michael (District). See `benchmarking.html` for the
full roster.

## Caveat carried on the site itself

Braddan is budget estimates; every other authority is audited outturn — not
directly comparable to Braddan, and the site says so throughout. Authorities on
the same basis and years (see each page's own header) are directly comparable
with each other.
