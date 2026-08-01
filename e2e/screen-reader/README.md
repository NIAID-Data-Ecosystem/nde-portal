# Screen reader tests (real VoiceOver)

Playwright specs that drive **actual VoiceOver** via
[guidepup](https://www.guidepup.dev/), to assert on what a screen reader user
really hears. Separate suite from the axe scans in
[`../accessibility/`](../accessibility/), with its own config
([`playwright.screen-reader.config.ts`](../../playwright.screen-reader.config.ts)).

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
import { mockHomePopulated, ROUTE, CATALOG_ROW_NAME } from '../fixtures/home';
import {
  walkToItem,
  expectAnnounces,
  attachFullSpokenLog,
} from './utils/voiceover';

test('the hero search announces its label and role', async ({
  page,
  voiceOver,
}, testInfo) => {
  await mockHomePopulated(page);
  await page.goto(ROUTE, { waitUntil: 'domcontentloaded' });
  await expect(
    page.getByRole('link', { name: CATALOG_ROW_NAME }),
  ).toBeVisible();

  await voiceOver.navigateToWebContent();
  // Linear walk (`undefined` command = voiceOver.next()). `findNextControl`
  // proved less reliable on this page — it skips the field and strands the
  // cursor. Assert on itemText; the spoken phrase can lag by a step.
  const { itemText } = await walkToItem(voiceOver, undefined, 'edit text', {
    maxSteps: 45,
  });
  expectAnnounces(
    itemText,
    ['Search for resources', 'edit text'],
    'The hero search field must announce its accessible name and its role.',
  );

  await attachFullSpokenLog(voiceOver, testInfo, 'hero-search');
});
```

Route mocks and fixtures are **shared with the axe suite** via
[`../fixtures/home.ts`](../fixtures/home.ts), so the two suites can't drift onto
different DOMs. Add new route fixtures there, not inline in a spec.

> **Those fixtures gate CI.** The axe suite imports the same module and runs on
> every PR, so editing a fixture for a screen reader test can break the merge
> gate. Two rules:
>
> 1. **Add a variant, don't mutate the base.** If a spec needs different data —
>    e.g. the carousel only renders its prev/next controls when
>    `childrenLength > constraint`, so exercising them needs more cards than the
>    base fixture provides — export a factory alongside the base rather than
>    changing it.
> 2. **Re-run the route's axe spec before pushing**, and get the ~20s answer
>    instead of the CI one:
>    ```sh
>    yarn test:a11y:nobuild e2e/accessibility/home.spec.ts
>    ```
>
> The coupling is deliberate. Duplicating the fixtures would remove this risk
> and replace it with a worse one: the two suites silently drifting onto
> different DOMs, with the rarely-run screen reader suite rotting unnoticed.

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
// FIXME(a11y): the hero suggestion dropdown has no combobox ARIA — see NDE-XXXX
test.fixme('arrowing through suggestions announces each option', ...);
```

Write the test asserting the **correct** behaviour and defer it. Never rewrite
it to assert the broken behaviour — that locks the bug in as expected.
