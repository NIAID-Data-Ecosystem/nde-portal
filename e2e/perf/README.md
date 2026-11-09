# Table performance harness

`repository-matcher.perf.mjs` compares Repository Matcher table implementations
under identical conditions. It is a manual tool, not part of `playwright test`.

- **Build:** production static export (`yarn build:a11y` → `out/`), served with
  `npx serve <dir> --listen <port> --no-clipboard`.
- **Data:** the live production API responses (`/metadata` and the
  ResourceCatalog `/query`), recorded once into `.cache/` on the first run and
  replayed byte-for-byte afterwards. 70 rows render (the "Accepting Data"
  subset). Delete `.cache/` to re-record.
- **Browser:** Chromium (the repo's Playwright), 1440×900, CPU throttled with
  `--throttle` (1 = this machine, 4 = Lighthouse's mobile setting). Every run is
  a fresh browser context; medians over `--runs` (default 5).

```sh
npx serve /path/to/out --listen 3201 --no-clipboard &
node e2e/perf/repository-matcher.perf.mjs --base http://localhost:3201 --label native-4x --throttle 4
```

## Scenarios and metrics

| Scenario                       | What happens                                                           |
| ------------------------------ | ---------------------------------------------------------------------- |
| `load`                         | navigation → populated table painted                                   |
| `scrollY` / `scrollX`          | 30 × 400px vertical / 20 × 300px horizontal wheel steps over the table |
| `sort`                         | sort Name descending                                                   |
| `pin`                          | toggle "Pin first column" (opening a popover first is not timed)       |
| `hideColumn` / `showColumn`    | toggle Description in Customize Columns                                |
| `searchFilter` / `searchClear` | type "sequencing" / clear it (clearing re-renders every row)           |
| `expand`                       | open the first "Show more"                                             |

- `latency`: action → condition met → next paint (includes harness overhead,
  identical for every build).
- `tbt`: total blocking time (Σ long task − 50 ms) inside the window.
- `inp`: slowest discrete input's Event Timing duration (input delay +
  handlers + next paint), i.e. what INP would report.
- `jankFrames`: frames over 50 ms while scrolling; `p95Frame`, `maxFrame`.

## Acceptance criteria for removing virtualization

Agreed before the native table was built (2026-11-06). The native table must
meet **all** of these, at both 1× and 4×, against the virtualized baseline
recorded from the same harness:

1. **Initial render** — `load` latency and TBT no more than 10% above baseline.
2. **Scrolling** — `jankFrames` and `p95Frame` no worse than baseline, for both
   axes.
3. **Interactions** — for each of sort, pin, hide/show column, search
   filter/clear and expand: `latency` and `inp` no more than 10% above baseline;
   and at 1× every interaction's `inp` ≤ 200 ms (the Web Vitals "good" INP
   threshold).

The 10% allowance covers run-to-run noise. If a criterion fails, optimize (e.g.
lazy tooltip initialization) and re-measure; pagination is **not** an acceptable
fallback without revisiting the decision, because it breaks find-in-page.

### Baseline (virtualized `Table`, commit `da3e97b2`)

Medians of 5 runs.

| Scenario     | 1× latency | 1× TBT | 1× INP | 4× latency | 4× TBT | 4× INP |
| ------------ | ---------- | ------ | ------ | ---------- | ------ | ------ |
| load         | 1284       | 660    | –      | 4922       | 3735   | –      |
| sort         | 218        | 109    | 176    | 844        | 642    | 720    |
| pin          | 240        | 95     | 160    | 792        | 584    | 648    |
| hideColumn   | 596        | 89     | 40     | 941        | 594    | 104    |
| showColumn   | 254        | 110    | 24     | 845        | 589    | 80     |
| searchFilter | 465        | 282    | 160    | 1947       | 1596   | 656    |
| searchClear  | 456        | 242    | 96     | 1715       | 1402   | 416    |
| expand       | 130        | 0      | 72     | 324        | 119    | 216    |

| Scroll  | 1× jank / p95 / max | 4× jank / p95 / max |
| ------- | ------------------- | ------------------- |
| scrollY | 0 / 17 / 33         | 24 / 117 / 267      |
| scrollX | 0 / 17 / 17         | 0 / 17 / 17         |

### Result: native `DataTable` pilot (2026-11-06)

Medians of 5 runs, same harness and data. ✅ meets the criterion, ❌ misses it.

| Scenario     | 1× latency     | 1× TBT | 1× INP         | 4× latency    | 4× TBT        | 4× INP         |
| ------------ | -------------- | ------ | -------------- | ------------- | ------------- | -------------- |
| load         | 1329 ✅ (+4%)  | 632 ✅ | –              | 5009 ✅ (+2%) | 3855 ✅ (+3%) | –              |
| sort         | 144 ✅         | 20     | 24 ✅          | 608 ✅        | 363           | 64 ✅          |
| pin          | 302 ❌ (+26%)¹ | 31     | 96 ✅          | 727 ✅        | 317           | 424 ✅         |
| hideColumn   | 538 ✅         | 8      | 88 ²           | 481 ✅        | 185           | 296 ²          |
| showColumn   | 180 ✅         | 31     | 104 ²          | 563 ✅        | 351           | 456 ²          |
| searchFilter | 490 ✅ (+5%)   | 268    | 216 ❌ (+35%)³ | 2081 ✅ (+7%) | 1604          | 872 ❌ (+33%)³ |
| searchClear  | 401 ✅         | 187    | 96 ✅          | 1516 ✅       | 1223          | 424 ✅ (+2%)   |
| expand       | 318 ❌ (+145%) | 71     | 136 ❌ (+89%)  | 412 ❌ (+27%) | 152           | 272 ❌ (+26%)  |

| Scroll  | 1× jank / p95 / max | 4× jank / p95 / max                  |
| ------- | ------------------- | ------------------------------------ |
| scrollY | 0 / 17 / 17 ✅      | 6 / 50 / 67 ✅ (was 24 / 117 / 267)  |
| scrollX | 0 / 17 / 17 ✅      | 0 / 33 / 50 ❌ p95 (no janky frames) |

1. The native pin switch sits inside the Customize Columns popover, so the timed
   click includes Playwright waiting for the popover to settle; the main-thread
   cost (TBT 95 → 31 ms, INP 160 → 96 ms) went down.
2. Not comparable: the old popover applied column changes in a later task (an
   effect calling back to the page), so Event Timing never saw the table update.
   Latency (action → painted) and TBT, which do include it, improved 10–50%.
3. The first keystroke on the page loads a web font, which re-lays out the whole
   document ("Fonts changed" in the trace); with every row in the DOM that
   layout is ~60 ms instead of ~22 ms at 1× (traced). The font load happens once
   per page; later keystrokes weren't measured separately.

Optimizations applied to get here: tags and "No data" as plain elements styled
once by the table recipe (no Chakra component per instance), tag tooltips
mounted on first real pointer movement over a clipped tag, the repository
matcher table memoized so typing doesn't re-render it, new row sets rendered
through `useDeferredValue` (time-sliced; the first 20 rows paint immediately
when data arrives). Tried and dropped: CSS containment on cells/viewport (no
effect on table relayout).

### Round 1 (2026-11-06): cold vs. warm, after the pilot feedback

Both builds measured again with the extended harness: fonts awaited before any
interaction (`fontsReadyBeforeInteractions` = 1 in every run), "warm" repeats of
typing and expanding, and dropped-frame buckets. Baseline as above; native =
final pilot build.

| Scenario                       | 1× baseline → native  | 4× baseline → native      |
| ------------------------------ | --------------------- | ------------------------- |
| load (latency)                 | 1407 → 1316           | 5648 → 4687               |
| first keystroke INP (cold)     | 168 → 104             | 696 → 448                 |
| keystroke INP (warm)           | 112 → 88              | 448 → 384                 |
| expand INP (cold)              | 64 → 112              | 256 → 504                 |
| expand INP (warm)              | 0 → 24                | 40 → 104                  |
| scrollY dropped ≥1 / ≥2 / jank | 2 / 1 / 0 → 0 / 0 / 0 | 47 / 30 / 26 → 12 / 0 / 0 |
| scrollX dropped ≥1 / ≥2 / jank | 0 / 0 / 0 → 0 / 0 / 0 | 0 / 0 / 0 → 0 / 0 / 0     |

- **Typing.** It was never font loading. The first keystroke mounted the search
  box's clear button, whose styles Emotion inserted inside Chakra's
  `@layer recipes`. In Chromium, inserting a cascade-layered rule forces a
  whole-document font re-match, restyle and relayout. Measured on this page: a
  plain rule costs 2 ms, a layered rule 63–83 ms, and it scales with DOM size.
  Fixed by keeping the button rendered and `hidden` while empty
  (`src/components/search-input`).
- **Expand.** The same trap (a conditional `transform` on the chevron Icon) was
  fixed in `CollapsibleTextTrigger`. What remains is the native table's relayout
  when a row grows (inherent to native table layout; provisionally accepted).
- **Horizontal scroll.** The earlier 4× p95 of 33 ms was 15% of frames missing
  one refresh (none over 50 ms). It came mostly from React dispatching every
  scroll-generated `pointermove` to the tag-tooltip handler. That handler now
  uses `pointerover`; result: 0 dropped frames.
- **Warm typing latency** (time to the filtered table's final paint) is +11–14%,
  because new rows render in a background, time-sliced pass. Its INP and
  blocking time are both lower than baseline.

### Round 2 (2026-11-06): natural height

The table now grows with its rows (the owner's chosen default) instead of
scrolling inside a window-height viewport. Same harness, same baseline; "r4" is
the previous native build, identical except for that bounded viewport.

| Scenario                               | baseline      | native r4 (bounded) | native now (natural) |
| -------------------------------------- | ------------- | ------------------- | -------------------- |
| 1× load                                | 1407          | 1316                | 1380                 |
| 1× sort latency / INP                  | 240 / 184     | 141 / 24            | 201 / 32             |
| 1× pin latency / INP                   | 253 / 176     | 286 / 104           | 363 / 136            |
| 1× warm search latency / INP           | 441 / 112     | 501 / 88            | 574 / 104            |
| 1× expand INP                          | 64            | 112                 | 160                  |
| 1× scrollY / scrollX dropped ≥1 (jank) | 2 (0) / 0 (0) | 0 (0) / 0 (0)       | 2 (0) / 0 (0)        |
| 4× sort latency / INP                  | 920 / 800     | 550 / 72            | 841 / 128            |
| 4× pin latency / INP                   | 879 / 744     | 638 / 368           | 1070 / 648           |
| 4× warm search latency / INP           | 1748 / 448    | 1941 / 384          | 2657 / 448           |
| 4× scrollY jank / p95                  | 26 / 133      | 0 / 33              | 14 / 150             |
| 4× scrollX jank / p95                  | 0 / 17        | 0 / 17              | 2 / 33               |

- The extra cost is paint and layerization. With natural height the whole table
  paints into the page; in a short scroller it painted only around its visible
  window. Profiled: a re-sort added ~170 ms of paint and layerize at 4×, with
  identical JavaScript and layout; page scrolling showed the same. It is
  inherent to the layout, not a code regression: a parent `maxHeight` brings
  back the r4 numbers.
- **Fixed on the way:** row hover highlights repainted every row sliding under
  the cursor during page scroll (~half the scroll paint at 4×). They now pause
  while rows move vertically (page or table scroll); 4× vertical jank went 27 →
  14 (baseline 26).
- **Responsiveness (INP)** stays better than or equal to baseline everywhere
  except expand (provisionally accepted). Unthrottled every INP is ≤ 160 ms. The
  latency misses (pin, warm search) are time to the final paint of a much larger
  painted area.

### Round 3 (2026-11-09): bounded by default again

The table is bounded by default (`max-height: 100dvh`, sticky header), with
natural height as the `maxHeight='none'` override. Owner's requirement: the
bounded default must perform as if natural height weren't supported, so it was
benchmarked against r4. "Staged" is the round-3 build as first implemented;
"fixed" adds one CSS property (below). The two were measured interleaved (one
run of each, alternating, 5 rounds) so both saw the same machine state; r4 is
its recorded `cmp-r4` run. Medians at 4×:

| Scenario                        | r4 (recorded) | staged      | fixed       |
| ------------------------------- | ------------- | ----------- | ----------- |
| load latency / TBT              | 4650 / 3521   | 4758 / 3670 | 4758 / 3574 |
| sort latency / INP              | 557 / 72      | 586 / 64    | 576 / 64    |
| pin latency / INP               | 636 / 384     | 670 / 392   | 636 / 368   |
| warm search latency / INP       | 1918 / 376    | 1975 / 392  | 1923 / 376  |
| expand INP                      | 488           | 608         | 448         |
| scrollY dropped ≥1 / jank / p95 | 9 / 0 / 33    | 31 / 2 / 50 | 14 / 0 / 33 |
| scrollY long tasks (per run)    | 0–3           | 12–24       | 0–5         |
| scrollX dropped ≥1 / jank / p95 | 0 / 0 / 17    | 4 / 0 / 33  | 0 / 0 / 17  |

At 1× all three are equal: no dropped frames on either axis, every INP ≤ 120 ms,
and load is 1266 / 1256 / 1217 ms. Results (local, gitignored) are in
`results/ilv-r9-*` (staged) and `results/ilv-r10-*` (fixed).

- **The regression, and its cause.** As staged, every 400 px wheel step was one
  main-thread frame of about 20 ms of Paint plus 25 ms of Layerize at 4×
  (traced; the page itself never scrolled, and no JavaScript was involved). At
  1× pixel density Chrome only scrolls a scroller on the compositor when the
  scroller's own background is opaque; otherwise it repaints to keep LCD text.
  The white background was on the table root, not on the viewport that scrolls.
  That most likely dates from round 2, which moved `maxHeight` to the root, and
  it explains round 2's horizontal p95 of 33 ms too.
- **Fix:** `bg: 'white'` on the viewport slot. It's pure CSS, the same in both
  modes, and lets Chrome decide. `will-change: scroll-position` measured the
  same, but it would force a GPU layer for the whole table in every mode, so it
  wasn't used. A layout spec guards the opaque background.
- **Ruled out by A/B:** row hover (turning it off took 30 dropped frames to 23,
  with the long tasks unchanged), the tag-tooltip hover handler (no change; no
  tooltip mounted during the scroll), and content height (the rows are tall
  because of their tags and descriptions, the same as in r4).
- **Noise worth knowing:** one non-interleaved run of the fixed build reported a
  4× load of about 6,100 ms. Its per-run loads were bimodal (about 4,650 ms
  twice, and 6,064–6,564 ms three times) while the machine was swapping after a
  build. Interleaved, load is identical. 1× sort latency is bimodal for both r4
  (128–174 ms) and the fixed build (130–184 ms); its INP stays 16–32 ms.

### Round 4 (2026-11-09): optional virtualization (`virtualize`)

The Repository Matcher with `virtualize` (only rows in and near the viewport
mounted; see the DataTable README), against the round-3 build without it
(`ilv-r10`'s build). Interleaved, one run of each alternately, 5 rounds;
medians. Results (local) are in `results/ilv-nv-*` (off) and `results/ilv-v-*`
(virtualized).

| Scenario (4×)                   | off         | virtualized  |
| ------------------------------- | ----------- | ------------ |
| load latency / TBT              | 4495 / 3414 | 4383 / 3291  |
| sort latency / INP              | 571 / 64    | 277 / 56     |
| pin latency / INP               | 582 / 336   | 327 / 192    |
| hide / show column latency      | 401 / 513   | 373 / 279    |
| search (first keystroke) / INP  | 1403 / 408  | 1338 / 456   |
| warm search latency / INP       | 1889 / 376  | 1294 / 368   |
| search clear latency / INP      | 1335 / 352  | 1395 / 376   |
| expand latency / INP            | 580 / 480   | 282 / 200    |
| scrollY dropped ≥1 / jank / p95 | 10 / 0 / 33 | 50 / 13 / 67 |
| scrollY TBT                     | 0           | 133–165      |
| scrollX dropped ≥1 / jank / p95 | 0 / 0 / 17  | 0 / 0 / 17   |

At 1×:

- Load is equal (1237 vs 1218 ms).
- Sort, show column, warm search and expand are faster (expand INP 104 → 56 ms).
- Pin latency is higher (267 → 348 ms) with the same INP (88 → 80). The pin
  switch sits inside a popover, so that latency is noisy.
- Vertical scroll drops 2 frames per 30 steps (0 before), none janky.

Settled DOM (the harness's `domNodes` is taken at first paint, when the plain
table has only its first 20 rows): page 7,820 → 3,492 nodes, table 5,275 → 946,
70 → 12 rows mounted.

- **Faster interactions** come from re-rendering and re-laying out 12–21 rows
  instead of 70.
- **The cost is vertical scrolling at 4×:** 13 janky frames per scroll, with no
  blank frames (checked with `elementFromPoint` at each step). Each wheel step
  mounts one or two rows. In the trace, the long tasks are React rendering the
  new rows (about 290 ms JS over the scroll) and a **forced synchronous layout**
  inside it (256 ms), on top of the normal layout (174 ms) and paint (150 ms).
  - The virtualizer doesn't read sizes synchronously while the user scrolls (it
    waits for its ResizeObserver).
  - The likely source is `ExpandableText`. It measures truncation in a layout
    effect on mount, then re-renders to show its toggle. That happens once per
    page in a plain table but once per mounted row when virtualized. It hasn't
    been isolated by A/B.
- Horizontal scrolling and load are unaffected.
