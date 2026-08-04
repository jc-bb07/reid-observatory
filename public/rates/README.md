# Where the rates go — Braddan, Marown and Santon

Static site. No build step, no server-side code, no external dependencies at runtime
(d3 is vendored in `lib/`). Copy the whole folder to the web server and it works.

## Deploy

Copy the contents of this folder to the target directory, e.g.

    rsync -av --delete ./ user@host:/var/www/observatory/rates/

Then browse to `index.html`. Everything is relative-path, so it works from any
sub-directory (e.g. `observatory.coalfinch.com/rates/`).

## Contents

    index.html                      landing page: the three authorities, scale comparison, method
    braddan-budget-sankey.html      Braddan, 2022-23 to 2026-27, budget estimates
    marown-budget-sankey.html       Marown, 2021-22 to 2023-24, audited outturn
    santon-budget-sankey.html       Santon, 2021-22 to 2023-24, audited outturn
    lib/observatory.css             shared stylesheet (dark/light)
    lib/d3.min.js                   d3 v7
    lib/d3-sankey.min.js            d3-sankey v0.12
    data/*.csv                      every figure in the diagrams, as CSV

## Notes

- The three pages accept the Observatory shell's theme messages (`observatory-theme`,
  `setTheme`) via postMessage, so they can be iframed into the main site and will
  follow its light/dark state. Standalone, they use a local toggle and remember the
  choice in `localStorage`.
- Each page verifies its own arithmetic on load and logs the result to the browser
  console. If a figure is ever edited incorrectly, the console will say so.
- Google Fonts is the only external request. Remove the `<link>` in each file if the
  server must be fully self-contained; the pages fall back to system sans-serif.

## Caveat carried on the site itself

Braddan is budget estimates; Marown and Santon are audited outturn. They are not
directly comparable and the site says so. Marown and Santon are comparable with
each other.
