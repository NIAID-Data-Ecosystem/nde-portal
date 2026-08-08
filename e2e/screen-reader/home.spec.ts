/**
 * Screen reader tests for the Home / index route (`/`), driving REAL VoiceOver.
 *
 * Read `e2e/screen-reader/README.md` first — it covers the one-time macOS setup
 * and the "move with VoiceOver, wait with Playwright" rule these specs depend
 * on. Run with `yarn test:sr:nobuild e2e/screen-reader/home.spec.ts`.
 *
 * Strategy: the axe suite (`e2e/accessibility/home.spec.ts`) already proves this
 * route's controls HAVE accessible names, in four data states. It cannot prove a
 * screen reader user is told anything useful when they reach them. So this spec
 * does not re-scan — it traverses the populated page with VoiceOver and asserts
 * on what is actually spoken.
 *
 * Every assertion here is written against OBSERVED output from a spike run on
 * this codebase, not inferred from the markup. Two things that would have been
 * guessed wrong:
 *   - the hero search bar is a `<Textarea>`, but VoiceOver announces it as
 *     "edit text", not "text area"
 *   - `lastSpokenPhrase()` can lag `itemText()` by a step (VoiceOver interleaves
 *     its own chrome, e.g. "VoiceOver Settings activity"), so assertions key off
 *     ITEM TEXT, with the spoken phrase attached as supporting evidence
 *
 * State coverage note — POPULATED ONLY, deliberately. Each traversal costs
 * minutes of wall clock and holds the machine's keyboard hostage, so the four
 * loading/empty/populated/error states the axe suite sweeps would be a poor
 * trade here: the announcements under test (heading structure, the hero search's
 * name and role) are identical in every state, because the hero renders from
 * static config and never depends on the two NDE queries.
 *
 * Scope. Two other specs cover surfaces reached through this same route, so
 * they are deliberately absent here:
 *   - `table.spec.ts` — the shared Explore Resources table
 *   - `page-shell.spec.ts` — the landmarks, skip link and nav state that
 *     `PageContainer` renders on every route, including the nav dropdowns and
 *     the footer
 *
 * Still uncovered anywhere: the table's filter popovers and result count, the
 * news carousel controls, and the hero's decorative images (~60 words of alt
 * text read before the `<h1>` — visible in the `chrome-before-h1` transcript
 * attached by `page-shell.spec.ts`, but not yet filed as a finding).
 *
 * Route mocks and fixtures come from `./fixtures/home`, which this suite OWNS —
 * `e2e/accessibility/home.spec.ts` keeps its own equivalent copy inline. That
 * duplication is deliberate: it keeps this exploratory suite deletable without
 * touching anything the CI merge gate reads. See the fixtures module's docblock
 * for the tradeoff.
 */
import { voiceOverTest as test } from '@guidepup/playwright';
import { expect } from '@playwright/test';
import { HERO_SEARCH_LABEL } from './fixtures/home';
import { enterHomePageWebContent } from './utils/home-page';
import {
  attachFullSpokenLog,
  attachSpokenLog,
  collectHeadings,
  expectAnnounces,
  spoken,
  walkToItem,
} from './utils/voiceover';

// --- Document structure ------------------------------------------------------

test.describe('screen reader: Home — document structure', () => {
  test('the heading outline is announced with correct levels', async ({
    page,
    voiceOver,
  }, testInfo) => {
    await enterHomePageWebContent(page, voiceOver);

    const headings = await collectHeadings(voiceOver);
    await attachSpokenLog(testInfo, 'heading-walk', headings);

    // Jumping heading-to-heading is how most screen reader users skim a page,
    // so the first heading they land on is the page's answer to "where am I?".
    expect(
      headings[0],
      `The first heading VoiceOver reaches should be the hero <h1>.\n` +
        `Full walk:\n${headings.map((h, i) => `  ${i + 1}. ${h}`).join('\n')}`,
    ).toBe('Discovery Portal heading level 1');

    // The three top-level sections a user navigates between. Asserted with
    // their announced level, because "Getting Started" being reachable is not
    // the same as it being announced as a section heading.
    for (const expected of [
      'Getting Started heading level 2',
      'Find Resources By Topic heading level 2',
      'Explore All Included Resources heading level 2',
    ]) {
      expect(
        headings,
        `VoiceOver should announce "${expected}".\n` +
          `Full walk:\n${headings
            .map((h, i) => `  ${i + 1}. ${h}`)
            .join('\n')}`,
      ).toContain(expected);
    }

    await attachFullSpokenLog(voiceOver, testInfo, 'structure');
  });

  // FIXME(a11y): the news carousel card title renders as <h2> immediately after
  // the <h3> "Updates" that introduces it, so the outline goes h3 -> h2 and the
  // cards read as siblings of "Explore All Included Resources" rather than as
  // children of "Updates". Confirmed by VoiceOver:
  //     8. Updates heading level 3
  //     9. Mock News Report heading level 2
  // Cause: `<Heading size='h5'>` in src/views/home/components/NewsCarousel.tsx
  // sets only the visual size; Chakra's Heading defaults `as='h2'`. Fix is to
  // pass `as='h4'`. axe classifies heading-order as moderate, so the axe suite
  // reports but does not fail on it — which is exactly why it's still here.
  // Un-fixme this once NewsCarousel.tsx sets the level explicitly.
  // See SR-006 in FINDINGS.md.
  test.fixme(
    'carousel card headings sit below the section heading that introduces them',
    async ({ page, voiceOver }, testInfo) => {
      await enterHomePageWebContent(page, voiceOver);

      const headings = await collectHeadings(voiceOver);
      await attachSpokenLog(testInfo, 'heading-walk-carousel', headings);

      const updatesIndex = headings.findIndex(h =>
        spoken(h, 'Updates heading'),
      );
      expect(
        updatesIndex,
        'the "Updates" heading should be reached',
      ).toBeGreaterThanOrEqual(0);

      const updatesLevel = Number(
        /heading level (\d+)/.exec(headings[updatesIndex])?.[1],
      );
      const cardHeading = headings[updatesIndex + 1];
      const cardLevel = Number(
        /heading level (\d+)/.exec(cardHeading ?? '')?.[1],
      );

      expect(
        cardLevel,
        `A carousel card heading must nest UNDER "Updates" (level ${updatesLevel}), ` +
          `but VoiceOver announced "${cardHeading}".`,
      ).toBeGreaterThan(updatesLevel);
    },
  );
});

// --- Hero search bar ---------------------------------------------------------

test.describe('screen reader: Home — hero search', () => {
  test('the search field announces its name and that it is a text field', async ({
    page,
    voiceOver,
  }, testInfo) => {
    await enterHomePageWebContent(page, voiceOver);

    // Walk linearly rather than with `findNextControl`. The spike showed the
    // control-only walk is the less reliable of the two here: it skips past the
    // field and strands the cursor. A linear walk reaches it in ~26 steps.
    const { itemText, phrase, trace } = await walkToItem(
      voiceOver,
      undefined, // plain voiceOver.next()
      'edit text',
      { maxSteps: 45 },
    );
    await attachSpokenLog(testInfo, 'walk-to-search', trace.items);

    // WCAG 4.1.2 (Name, Role, Value) as a user hears it: reaching the field
    // must tell them WHAT it is and WHAT it's for.
    expectAnnounces(
      itemText,
      [HERO_SEARCH_LABEL, 'edit text'],
      'The hero search field must announce its accessible name and its role.',
    );

    // Sanity: the spoken phrase should carry the name too. Kept separate from
    // the item-text assertion above because the spoken log can lag by a step.
    expect(
      spoken(phrase, HERO_SEARCH_LABEL) || spoken(itemText, HERO_SEARCH_LABEL),
      `Neither the item text ("${itemText}") nor the spoken phrase ("${phrase}") ` +
        `named the search field.`,
    ).toBe(true);

    await attachFullSpokenLog(voiceOver, testInfo, 'hero-search-name-role');
  });

  test('typing into the search field echoes the entered text', async ({
    page,
    voiceOver,
  }, testInfo) => {
    await enterHomePageWebContent(page, voiceOver);

    const { trace } = await walkToItem(voiceOver, undefined, 'edit text', {
      maxSteps: 45,
    });
    await attachSpokenLog(testInfo, 'walk-to-search', trace.items);

    // Enter the text field, then type through VoiceOver so the echo is captured
    // in its spoken log — `page.keyboard.type` would bypass it entirely.
    await voiceOver.interact();
    await voiceOver.clearSpokenPhraseLog();
    await voiceOver.type('asthma');

    const log = await voiceOver.spokenPhraseLog();
    await attachSpokenLog(testInfo, 'typing-echo', log);

    // Character echo is what tells a screen reader user their keystrokes are
    // landing in the field at all. Assert the characters were spoken, not the
    // exact per-character phrasing, which varies with VoiceOver verbosity.
    const everythingSpoken = log.join(' ');
    expect(
      spoken(everythingSpoken, 'a') && spoken(everythingSpoken, 's'),
      `Typing into the search field should be echoed. VoiceOver said:\n` +
        log.map((l, i) => `  ${i + 1}. ${l}`).join('\n'),
    ).toBe(true);

    await attachFullSpokenLog(voiceOver, testInfo, 'hero-search-typing');
  });

  // FIXME(a11y): the hero search suggestion dropdown is invisible to screen
  // readers. src/components/input-with-dropdown/components/DropdownInput.tsx
  // renders a <Textarea> with NO combobox semantics — no role="combobox",
  // aria-expanded, aria-autocomplete, aria-controls or aria-activedescendant —
  // and the suggestions are bare <li id="li-N"> with no role="option". There is
  // no live region anywhere on the route either. So a sighted user sees a list
  // appear and arrow through highlighted options, while a screen reader user is
  // told nothing: not that a list opened, not how many results, not which one
  // is current. WCAG 4.1.2 (Name, Role, Value) and 1.3.1.
  //
  // This test asserts the CORRECT behaviour and is expected to fail until the
  // component gains combobox semantics. Do not rewrite it to assert the current
  // silence — that would lock the bug in as expected. Un-fixme after the fix.
  // See SR-001 in FINDINGS.md.
  test.fixme(
    'arrowing through search suggestions announces each option',
    async ({ page, voiceOver }, testInfo) => {
      await enterHomePageWebContent(page, voiceOver);

      const { trace } = await walkToItem(voiceOver, undefined, 'edit text', {
        maxSteps: 45,
      });
      await attachSpokenLog(testInfo, 'walk-to-search', trace.items);

      await voiceOver.interact();
      await voiceOver.type('asthma');

      // Opening the suggestion list is a significant change of context and
      // should be announced (a live region, or combobox expanded state).
      await voiceOver.clearSpokenPhraseLog();
      await voiceOver.press('Down');

      const log = await voiceOver.spokenPhraseLog();
      await attachSpokenLog(testInfo, 'suggestion-arrow', log);

      const everythingSpoken = log.join(' ');
      expect(
        spoken(everythingSpoken, 'asthma'),
        `Arrowing onto a suggestion must announce it. VoiceOver said:\n` +
          log.map((l, i) => `  ${i + 1}. ${l}`).join('\n'),
      ).toBe(true);

      await attachFullSpokenLog(voiceOver, testInfo, 'hero-search-suggestions');
    },
  );
});
