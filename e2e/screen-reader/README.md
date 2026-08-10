# Screen reader tests (real VoiceOver)

Playwright specs that drive **actual VoiceOver** via
[guidepup](https://www.guidepup.dev/), to assert on what a screen reader user
really hears. A **self-contained** suite, independent of the axe scans in
[`../accessibility/`](../accessibility/): its own config
([`playwright.screen-reader.config.ts`](../../playwright.screen-reader.config.ts)),
its own fixtures, its own helpers, and no imports crossing into the axe suite in
either direction. This is an exploration — see
[Why this suite duplicates the axe suite's fixtures](#why-this-suite-duplicates-the-axe-suites-fixtures)
for why it's built to be deletable.

## Why this exists

The axe suite is a **static** analyzer. It proves a control has an accessible
name; it cannot prove the user is told anything useful when they reach it. The
landing page passes every axe scan while, for example, its hero search bar is a
`<Textarea>` with a suggestion dropdown carrying no combobox ARIA at all — no
`role="combobox"`, no `aria-expanded`, no `aria-activedescendant`, no
`role="option"` on the suggestions, and no live region anywhere on the route.
Nothing announces that a suggestion list opened or which suggestion you're on.
That is WCAG 4.1.2 as a user experiences it, and only a real screen reader
catches it.

## What it has found so far

Twenty-five defects, **all of which pass every axe scan today**. Each is written
as a test asserting the correct behaviour and deferred with `test.fixme` + a
`FIXME(a11y)` note, so it starts passing the day someone fixes it. Every one was
confirmed by temporarily un-`fixme`-ing it and watching it fail.

**[FINDINGS.md](./FINDINGS.md) is the full record** — per finding: what a
sighted user sees vs what VoiceOver says, why axe missed it, the WCAG criterion,
the fix, and how many files the shared component reaches. The `FIXME(a11y)`
comments reference these IDs rather than repeating the detail.

| ID     | Surface         | Defect                                                                       |
| ------ | --------------- | ---------------------------------------------------------------------------- |
| SR-001 | Hero search     | Suggestion dropdown announces **nothing** — no combobox ARIA, no live region |
| SR-002 | Table sorting   | Activating a sort control announces **nothing**; state is colour-only        |
| SR-003 | Table sorting   | All 8 sort controls share 2 generic labels — none names its column           |
| SR-004 | Table cells     | Every cell announcement is padded with a sort-control label                  |
| SR-005 | Table headers   | The first column header announces as **empty**                               |
| SR-006 | News carousel   | Card headings jump `h3` → `h2`, so cards don't nest under "Updates"          |
| SR-007 | Page shell      | No banner landmark — the nav is inside the one `<main>`                      |
| SR-008 | Page shell      | No contentinfo landmark — the footer is inside the same `<main>`             |
| SR-009 | Page shell      | No skip link. **16 announcements** before the page title, on every route     |
| SR-010 | Navigation      | The active nav item announces `Home link` — no "current page"                |
| SR-011 | Table search    | Searching narrows the table and announces **nothing** but the typed keys     |
| SR-012 | Table search    | A search matching nothing empties the table in silence                       |
| SR-013 | Table filters   | Ticking a filter halves the table with a **completely empty** spoken log     |
| SR-014 | Table filters   | Every filter chip's remove button is named just `close`                      |
| SR-015 | News carousel   | The carousel never identifies itself as a carousel                           |
| SR-016 | News carousel   | All 6 slides are announced when only 2 are on screen                         |
| SR-017 | News carousel   | Changing slide announces nothing                                             |
| SR-018 | News carousel   | Six card links share the name `(view full release)`                          |
| SR-019 | Table loading   | Nothing says the table is loading — no `aria-busy` in the repo at all        |
| SR-020 | Table loading   | 30 skeleton cells announce `-` as the cell's **value**                       |
| SR-021 | Table loading   | Skeleton rows being replaced by real data announces nothing                  |
| SR-022 | Hero artwork    | **66 words** of decorative alt text read before the page title               |
| SR-023 | Getting Started | 70 more words of stock-photo alt before the heading                          |
| SR-024 | Hero artwork    | Artwork collapsed to **0x0** at mobile width is still announced in full      |
| SR-025 | Icons           | 28 unlabelled `<svg>`s; at least one announced as a nameless `image`         |

Four of these are worth singling out for what they say about static analysis:

**SR-009** — axe **has** a rule for WCAG 2.4.1 (`bypass`, impact _serious_), and
it passes here because the page has a `<main>` landmark, one that starts above
the navigation. The rule certifies a bypass mechanism that does not exist.

**SR-011/012/013** — all three are WCAG 4.1.3 (Status Messages, AA), and axe has
no rule for that criterion and cannot have one. Detecting a _missing_ status
message means knowing a number was supposed to update in response to an action —
a claim about intent that no DOM snapshot contains. One fix (`role="status"` on
the results count) closes all three.

**SR-019** — the axe suite scans the table's loading state in a test of its own
and **passes it**. Same route, same mocks, same DOM as `table-loading.spec.ts`.
That is the cleanest comparison in the project: not two methods looking at
different things, but two methods looking at one identical page state and
disagreeing about whether it is accessible.

**SR-024** — the hero's hexagon artwork is collapsed to `0x0` at phone width and
VoiceOver still reads all 29 words of its description. No DOM scan can catch
this: the markup is byte-identical at every breakpoint, and only the CSS
differs. It also has a built-in control — the nav logo, a few elements away,
hides its off-breakpoint variants with real `display: none` and is correctly
silent.

Equally useful, the suite has **disproved two** defects that looked certain from
the markup:

- The table is virtualised (`react-window`) and declares
  `aria-rowcount={rows.length}` with no `aria-rowindex` anywhere, which should
  break row position — and doesn't. VoiceOver reports "row 2 of 42" correctly,
  and all 40 rows stay reachable and ordered across recycling.
- The carousel registers a `keydown` handler on `document` that
  `preventDefault()`s arrow keys with **no modifier check**, which should mean
  VoiceOver's Ctrl+Option+Arrow navigation scrolls the carousel from anywhere on
  the page. It doesn't — VoiceOver consumes the keystroke first. The handler is
  still wrong for unmodified arrow keys (proven by the test's own oracle), but
  it is not the screen-reader catastrophe the code implies.

Both are now guarded by passing tests. This is the case for observing before
asserting — and the second is the clearest example in the project of code
review, human or AI, producing a confident and specific wrong answer.

A third correction landed on **this suite's own documentation**. `home.spec.ts`
described the table's loading state as "10 skeleton rows announced as empty
cells". Two of the five columns do announce `blank`; the other three announce a
literal `-` as the cell's value, because Chakra's skeleton hides contents with
`* { visibility: hidden }` and `*` matches element descendants only, leaving a
bare text node transparent but fully announced. Worse than predicted, and the
prediction was written from the markup — see SR-020.

## Not in CI — on purpose

These tests are slow (minutes each), headed, single-worker, macOS-only, and they
take over the machine's keyboard and audio while running. They are run on demand
by a human.

CI isolation is enforced from both sides:

- this suite's `testDir` is `./e2e/screen-reader`
- [`playwright.config.ts`](../../playwright.config.ts) sets
  `testIgnore: '**/screen-reader/**'`, so the CI command
  (`yarn test:a11y:nobuild`) can never collect them

Verify with `npx playwright test --list | grep -c screen-reader` → `0`.

## One-time machine setup

**Do not run `npx @guidepup/setup setup`.** On macOS it writes to the TCC
database and requires disabling System Integrity Protection. The
[manual setup](https://www.guidepup.dev/docs/guides/manual-voiceover-setup)
below is the documented path for a local machine.

1. **Allow VoiceOver to be controlled with AppleScript.** VoiceOver Utility →
   **General** → tick the checkbox. Equivalently, with VoiceOver **not
   running**:

   ```sh
   defaults write com.apple.VoiceOver4/default SCREnableAppleScript -bool true
   defaults read  com.apple.VoiceOver4/default SCREnableAppleScript   # → 1
   ```

   Set it back to `false` to undo. Write it only while VoiceOver is stopped — a
   running VoiceOver rewrites this plist when it quits.

2. **Accessibility permission** for whatever app runs the tests (Terminal /
   iTerm / VS Code): System Preferences → Security & Privacy → Privacy →
   **Accessibility** → unlock, add the app, tick it. On Ventura and newer this
   moved to System Settings → Privacy & Security → Accessibility.

   Check it's already granted:

   ```sh
   osascript -e 'tell application "System Events" to return name of first application process whose frontmost is true'
   ```

   A process name means yes; a permission error means no.

3. **Install guidepup's VoiceOver preference assets** — required, and separate
   from the npm install:

   ```sh
   npx @guidepup/setup install
   ```

   guidepup mounts a prebuilt preferences disk image so VoiceOver starts in a
   known configuration. Without it, `voiceOver.start()` fails with _"Failed to
   mount Guidepup preferences"_ before any test runs. This is the `install`
   command only — **not** `setup`, which is the SIP-requiring one. The manifest
   ships a Darwin 21 (Monterey) asset.

4. **Disable the Dictation prompt.** macOS's "Do you want to enable Dictation?"
   dialog steals focus mid-traversal and derails the walk:

   ```sh
   defaults write com.apple.HIToolbox AppleDictationAutoEnable -int 0
   ```

5. **Dismiss the VoiceOver welcome dialog once.** Start VoiceOver by hand (⌘F5),
   dismiss the dialog, quit. It can otherwise block the first automated start.

6. **Install the browser**: `npx playwright install chromium`.

7. **Accept the Automation prompts** macOS raises on the first run.

## Running

```sh
yarn build:a11y                                     # build out/ (once, after app changes)
yarn test:sr:nobuild                                # run the suite against existing out/
yarn test:sr:nobuild e2e/screen-reader/home.spec.ts # run one spec
yarn test:sr                                        # build + run
yarn test:sr:report                                 # open the HTML report
```

**Do not touch the machine while these run.** VoiceOver owns the keyboard;
typing or clicking will corrupt the traversal and fail the test for reasons that
have nothing to do with the app. Expect audible speech.

To kill a run mid-flight: `Ctrl-C`, then ⌘F5 if VoiceOver is left running.

## Browser: Chromium, not WebKit

WebKit/Safari is the realistic VoiceOver pairing and is what guidepup's examples
use, but Playwright builds WebKit per macOS version and no longer ships one for
macOS 12 — `npx playwright install webkit` fails with _"Playwright does not
support webkit on mac12"_. On Ventura or newer, switch the project in
`playwright.screen-reader.config.ts` to:

```ts
{ name: 'webkit', use: { ...devices['Desktop Safari'], headless: false } }
```

guidepup already maps both browsers to their macOS application names, so nothing
else changes.

## Writing a spec

### The one rule: move with VoiceOver, wait with Playwright

The VoiceOver cursor and DOM focus are **separate cursors**. `locator.focus()`
moves DOM focus without moving the VO cursor, so a following
`lastSpokenPhrase()` reports wherever VoiceOver happened to be. This desync is
the biggest source of flake in screen reader tests, and it fails in the worst
way — intermittently, with a plausible-looking wrong answer.

- **Playwright locators wait on state.** Use them to prove the mocked data
  rendered before the traversal starts.
- **VoiceOver commands move.** `navigateToWebContent()`, `next()`,
  `perform(voiceOver.keyboardCommands.findNextHeading)`.

### Shape

```ts
import { voiceOverTest as test } from '@guidepup/playwright';
import { expect } from '@playwright/test';
import { HERO_SEARCH_LABEL } from './fixtures/home';
import { enterHomePageWebContent } from './utils/home-page';
import {
  walkToItem,
  expectAnnounces,
  attachFullSpokenLog,
} from './utils/voiceover';

test('the hero search announces its label and role', async ({
  page,
  voiceOver,
}, testInfo) => {
  // Mocks the route, navigates, waits for the data to render, and parks the
  // VoiceOver cursor at the top of web content.
  await enterHomePageWebContent(page, voiceOver);

  // Linear walk (`undefined` command = voiceOver.next()). `findNextControl`
  // proved less reliable on this page — it skips the field and strands the
  // cursor. Assert on itemText; the spoken phrase can lag by a step.
  const { itemText } = await walkToItem(voiceOver, undefined, 'edit text', {
    maxSteps: 45,
  });
  expectAnnounces(
    itemText,
    [HERO_SEARCH_LABEL, 'edit text'],
    'The hero search field must announce its accessible name and its role.',
  );

  await attachFullSpokenLog(voiceOver, testInfo, 'hero-search');
});
```

Route mocks and fixtures live in [`./fixtures/`](./fixtures/) and belong to
**this suite alone**. Per-route entry helpers live in
[`./utils/home-page.ts`](./utils/home-page.ts) and friends. Add new fixtures and
entry helpers there — never inline in a spec, and never by importing from
`e2e/accessibility/` or `e2e/utils/`.

## Why this suite duplicates the axe suite's fixtures

`e2e/accessibility/home.spec.ts` defines equivalent fixtures inline, and this
suite keeps its own copy. That's deliberate, and it's the opposite of what you'd
normally do.

Screen reader automation here is an **exploration that may not be kept**. The
axe suite gates merges to `main`. If the two shared a fixture module, every edit
made while developing a screen reader test would carry merge-gate risk on behalf
of an experiment — and abandoning the experiment would mean unpicking a refactor
out of a spec CI depends on. As it stands, dropping this work is:

```sh
rm -rf e2e/screen-reader playwright.screen-reader.config.ts
```

plus reverting the `testIgnore` line in `playwright.config.ts`, three `test:sr`
scripts, and two `.gitignore` lines. Nothing the axe suite reads is touched.

**The cost:** the two copies can drift. If the NDE API's response shape changes,
both need updating and nothing will tell you. If this suite is ever made
permanent, revisit the decision and extract a shared module then.

One upside while it lasts: because nothing in CI reads these fixtures, you can
change them freely — including adding variants a spec needs, such as extra
carousel cards (the Carousel only renders its prev/next controls when
`childrenLength > constraint`).

## What this suite still shares

The isolation isn't absolute, and shouldn't be overstated. This suite consumes
two pieces of the axe suite's infrastructure **read-only**:

- `yarn build:a11y` (`scripts/build-a11y.mjs`) to produce `out/`
- `e2e/mock-strapi-server.js`, which `playwright.screen-reader.config.ts` spawns

Neither is modified, so neither is a CI risk, and both would remain if this
exploration were dropped — the axe suite needs them regardless.

### Helpers

From [`./utils/voiceover.ts`](./utils/voiceover.ts) — don't hand-roll
alternatives:

| Helper                                    | Use                                                                        |
| ----------------------------------------- | -------------------------------------------------------------------------- |
| `walkUntil`                               | Bounded traversal that stops when VoiceOver parks. Returns the full trace. |
| `walkToItem`                              | Walk until an item matches; fails with everything that _was_ announced.    |
| `collectHeadings`                         | Walk every heading via `findNextHeading`.                                  |
| `expectAnnounces`                         | Assert a phrase carries the expected name/role/state tokens.               |
| `attachSpokenLog` / `attachFullSpokenLog` | Attach the transcript to the report.                                       |
| `normalize` / `spoken`                    | Whitespace-collapse; case-insensitive contains.                            |

Plus one per-route entry helper, from
[`./utils/home-page.ts`](./utils/home-page.ts):

| Helper                    | Use                                                                                              |
| ------------------------- | ------------------------------------------------------------------------------------------------ |
| `enterHomePageWebContent` | Mock `/`, navigate, wait for the data to render, park the VoiceOver cursor at the top of content |

Pass `{ repoCount }` to render a many-row table instead of the 1-repo baseline
(see `metadataFixtureWithCount` in [`./fixtures/home.ts`](./fixtures/home.ts)).
`table.spec.ts` needs it: with only two rows react-window never windows, so
nothing about row recycling is observable.

Pass `{ repoGenre }` to give the repository row a different Research Domain from
the catalog row. `table-search.spec.ts` needs it: with both rows on `IID` the
filter has one option, so ticking it filters 2 rows down to 2 — and "nothing was
announced" after a no-op proves nothing. Same trap as SR-002.

Pass `{ carouselCardCount }` for a multi-card news carousel. `carousel.spec.ts`
needs it: the prev/next controls only render when there are more cards than fit,
and nothing about off-screen slides is observable until some are off screen.
Note the card copy deliberately avoids the word "carousel" — see the next
section.

For the table's loading state there are two more entry helpers rather than
options, because their proof-of-render waits are the opposite of the populated
one's — the rows never arrive:

| Helper                           | Use                                                                     |
| -------------------------------- | ----------------------------------------------------------------------- |
| `enterHomePageLoadingWebContent` | Both NDE requests hang forever; the table stays in skeleton state       |
| `enterHomePageGatedWebContent`   | Same, but returns a `release()` so the test chooses when the data lands |

Both wait on `getByTestId('loading').first()` — a skeleton has no accessible
surface to wait on, which is itself the point of SR-019.

### Fixture text can manufacture a pass

A screen reader assertion is ultimately a substring search over a transcript, so
**any fixture text containing the token under test can make a test pass for the
wrong reason.** SR-015 asks whether entering the carousel announces that it is
one; it passed on its first run because the fixture cards were named
`Carousel Card 001`. Renaming them to `Update Card 00N` made it fail correctly.

This is the same shape as the SR-002 near-miss, and the reason every test here
attaches its transcript: the only way to tell "passed" from "passed for the
right reason" is to read what was actually said.

When another route gets coverage, add a sibling (`search-page.ts`) rather than
generalising this into a registry — the per-route "proof the data rendered"
waits are the point, and they differ per route.

### Two tricks worth reusing

Every VoiceOver move costs ~1.5s, so traversal strategy is the difference
between a 1-minute test and a 5-minute timeout:

- **Jump, don't walk, to a distant surface.** The table sits ~60 items from the
  top of web content. `findNextHeading` reaches its section heading in 7
  presses.
- **Pick the command that matches your stride.** Each table row's name cell is a
  link, so `findNextLink` hops row-to-row at 1 press instead of the 5 a linear
  walk costs. The tradeoff: `findNextLink` omits the "row N of M" context a
  linear walk announces, so choose per assertion.

Two conventions those encode, worth keeping:

- **Bound every walk.** Guidepup's documented example uses an unbounded `while`
  loop; when the phrase never arrives it spins to the 5-minute test timeout and
  tells you nothing. `walkUntil` stops and reports what it saw.
- **Assert on tokens, not whole phrases.** VoiceOver appends verbosity hints
  that vary by macOS version and user settings. Pin the accessible name, the
  role and the state — not the exact sentence — or the spec fails on someone
  else's machine for no accessibility reason.

### Always attach the transcript

Call `attachFullSpokenLog` at the end of every test, passing or failing. It is
the only way to tell "passed for the right reason" from "passed because the
predicate matched something incidental", and it surfaces announcements the test
doesn't assert on but a human reviewer would notice. This is the counterpart to
`attachA11yReport` in the axe suite.

### Observe before asserting

Don't guess what VoiceOver says. Write a throwaway spec that walks the surface
and dumps `itemText()` / `lastSpokenPhrase()` to attachments, run it, read the
report, then write assertions against the real strings — then delete it.

Three things the first spike found that reading the markup would have gotten
wrong:

- The hero search bar is a `<Textarea>`, but VoiceOver announces the item as
  **`edit text`**, not "text area".
- Its accessible name is announced **twice**
  (`Search for resources Search for resources edit text`) — the visually-hidden
  `<label>` and the placeholder both supply it. The submit button shares that
  same name, so "Search for resources" identifies three different things on the
  page.
- `lastSpokenPhrase()` can **lag `itemText()` by a step**. VoiceOver interleaves
  its own chrome ("VoiceOver Settings activity"), so the phrase you get back may
  belong to the previous item. Key assertions off `itemText()` and treat the
  spoken phrase as supporting evidence.

### Known flakes, and when to fix them

Both of these are the same underlying thing — a read landing before VoiceOver
has finished updating — and the rule of thumb here has been: **record it the
first time, fix it in the helper the second.**

| Flake                                                                                                                     | Status                                                                                                                                                                                                                                                                                                           |
| ------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `walkUntil` treating a lagged `itemText()` as a park, truncating a walk                                                   | **Fixed.** Happened twice (a heading jump stopped one heading short), so `walkUntil` now confirms a repeat with a second read before stopping.                                                                                                                                                                   |
| `table.spec.ts` → _announces its name, dimensions…_ getting `"VoiceOver Settings activity"` instead of the table's phrase | **Recorded, not fixed.** Seen once, passes on re-run. That test must assert on the phrase because the dimensions (`5 columns, 42 rows`) appear nowhere else. If it recurs, the fix is to re-read `lastSpokenPhrase()` once when it comes back as VoiceOver chrome — the phrase-side twin of the `walkUntil` fix. |

A test failing this way is recognisable: the "VoiceOver said" line in the
failure quotes VoiceOver's own UI rather than anything on the page.

### Reading the transcripts

The HTML report embeds attachments rather than writing loose files. To read them
from the terminal:

```sh
node -e "
const fs=require('fs');const h=fs.readFileSync('playwright-report-sr/index.html','utf8');
const k='playwrightReportBase64\">data:application/zip;base64,';const s=h.indexOf(k)+k.length;
fs.writeFileSync('/tmp/r.zip',Buffer.from(h.slice(s,h.indexOf('<',s)).trim(),'base64'));"
mkdir -p /tmp/r && unzip -oq /tmp/r.zip -d /tmp/r
node -e "
const fs=require('fs');const f=fs.readdirSync('/tmp/r').find(n=>n!=='report.json');
const w=(o,cb)=>Array.isArray(o)?o.forEach(x=>w(x,cb)):o&&typeof o==='object'&&(o.attachments&&cb(o),Object.values(o).forEach(x=>w(x,cb)));
w(JSON.parse(fs.readFileSync('/tmp/r/'+f,'utf8')),t=>(t.attachments||[]).forEach(a=>a.body&&console.log('\n=== '+a.name+' ===\n'+a.body)));"
```

Or just `yarn test:sr:report` and click through in the browser.

## When a test fails

Same principle as the axe suite: **the default is to fix the app, not the
test.** A missing or wrong announcement is a real defect.

If it's a real issue that's out of scope right now, defer it the way the axe
suite does — mark that one test `test.fixme` with a `FIXME(a11y)` comment naming
the gap and linking a follow-up issue, so it stays visible as tracked debt:

```ts
// FIXME(a11y): the hero suggestion dropdown has no combobox ARIA — see SR-001 in FINDINGS.md
test.fixme('arrowing through suggestions announces each option', ...);
```

Write the test asserting the **correct** behaviour and defer it. Never rewrite
it to assert the broken behaviour — that locks the bug in as expected.
