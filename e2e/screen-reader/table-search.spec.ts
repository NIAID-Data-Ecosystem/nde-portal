/**
 * Screen reader tests for the resources table's SEARCH AND FILTER toolbar,
 * driving REAL VoiceOver.
 *
 * Read `e2e/screen-reader/README.md` first — it covers the one-time macOS setup
 * and the "move with VoiceOver, wait with Playwright" rule these specs depend
 * on. Run with `yarn test:sr:nobuild e2e/screen-reader/table-search.spec.ts`.
 *
 * Surface: `src/views/home/components/TableWithSearch/`, plus the two shared
 * components it composes — `src/components/search-input/` and
 * `src/components/checkbox-list/` (the latter also powers the hero search bar's
 * "Type" filter). Distinct from `table.spec.ts`, which covers the shared table
 * that renders BELOW this toolbar.
 *
 * Strategy: every control here has a correct accessible name, so the axe suite
 * passes — including its "filter popover is keyboard operable and restores
 * focus" test. What no static scan can see is that typing in the search box or
 * ticking a filter rewrites the row set and the "N results" counter while
 * saying NOTHING. There is no live region anywhere on this route: `grep -o
 * 'aria-live' out/index.html` returns zero matches. That is WCAG 4.1.3 (Status
 * Messages, Level AA), and it only exists as an experience.
 *
 * ## What the spike observed
 *
 * It took three rounds, and each round overturned something that reading the
 * markup had made look obvious. Worth recording, because this is the actual
 * cost of the method:
 *
 *   1. `walkToItem(…, 'Search table')` matches the visually-hidden `<label>`,
 *      not the input. The input is two steps further on, and ITS ITEM TEXT IS
 *      EMPTY — only the spoken phrase carries `Search table edit text`. So this
 *      spec keys the search-field predicate off the PHRASE, the reverse of the
 *      house rule, and the reason is exactly why the house rule exists: observe
 *      first.
 *   2. `voiceOver.interact()` + `voiceOver.type()` — the sequence that works on
 *      the hero `<Textarea>` in `home.spec.ts` — silently fails on this
 *      `<input type='text'>`. VoiceOver says "In edit text" but the value stays
 *      empty. `moveKeyboardFocusToCursor` first is what makes typing land.
 *   3. The VO cursor cannot enter an opened filter popover. `voiceOver.act()`
 *      DOES open it, but a linear walk from there goes straight past the dialog
 *      to the next toolbar button, and the popover closes behind the cursor.
 *      See "Not verified" below — that is a harness limit, and it is not
 *      reported as an app defect.
 *
 * The toolbar in walk order, from the section heading:
 *
 *      6. Search table                              (the hidden <label>)
 *      7. image                                     (magnifier icon)
 *      8. ""                        phrase: Search table edit text
 *      9. Type dialog pop up collapsed button
 *     10. Research Domain dialog pop up collapsed button
 *     11. Access dialog pop up collapsed button
 *     12. 2 results
 *
 * State coverage note: populated only, deliberately, as in the sibling specs.
 * The two data states that matter here are produced BY the tests themselves —
 * filtering down to one row, and filtering down to none.
 *
 * ## Not verified
 *
 * Whether a screen reader user can operate the filter popover at all. The VO
 * cursor will not enter it (see 3 above), so tests that need a checkbox ticked
 * use Playwright to do it and VoiceOver only to listen. That is sound for the
 * claims made here — a live region announces regardless of what triggered the
 * change — but it means this spec does NOT prove the popover's own contents are
 * reachable. Establishing that needs a different approach than a linear walk,
 * and is recorded as a coverage caveat in FINDINGS.md rather than a finding.
 */
import { voiceOverTest as test } from '@guidepup/playwright';
import { expect, type Page } from '@playwright/test';
import { SECOND_DOMAIN_GENRE } from './fixtures/home';
import { enterHomePageWebContent } from './utils/home-page';
import {
  attachFullSpokenLog,
  attachSpokenLog,
  expectAnnounces,
  spoken,
  walkUntil,
} from './utils/voiceover';

/** The <h2> introducing the table — the cheap jump target, 7 presses away. */
const TABLE_SECTION_HEADING = 'Explore All Included Resources';

/** The table search box's accessible name (SearchInput `ariaLabel` prop). */
const SEARCH_LABEL = 'Search table';

/**
 * The only filter trigger whose name is unique on this page. The hero search
 * bar renders the same CheckboxList with `label='Type'`, so there are THREE
 * buttons named "Type" in the DOM and only one named "Research Domain".
 */
const FILTER_TRIGGER = 'Research Domain';

/** The filter option the catalog row carries; the repo row gets Generalist. */
const FILTER_OPTION = 'IID';

/** A search term matching one of the two fixture rows. */
const MATCHING_TERM = 'Catalog';

/** A search term matching neither. */
const NO_MATCH_TERM = 'zzzz';

/** Empty-state copy, passed as `emptyState` from src/pages/index.tsx. */
const EMPTY_STATE_TEXT = 'No items match';

/**
 * The `N results` counter. Used ONLY as a Playwright oracle — it observes app
 * state and never moves the VoiceOver cursor.
 */
const resultCount = (page: Page) =>
  page.getByText(/^\d+ results$/).textContent();

/** Jump to the table's section heading (~7 presses vs ~60 walking). */
async function jumpToTableSection(
  voiceOver: Parameters<typeof enterHomePageWebContent>[1],
) {
  return walkUntil(
    voiceOver,
    voiceOver.keyboardCommands.findNextHeading,
    itemText => spoken(itemText, TABLE_SECTION_HEADING),
    { maxSteps: 20 },
  );
}

/**
 * Park the VO cursor on the table's search input, 8 steps past the heading.
 *
 * Matches on the SPOKEN PHRASE because this input's item text is empty — see
 * observation 1 in the docblock. Returns the phrase, since that is the only
 * place its name and role appear.
 */
async function walkToTableSearch(
  voiceOver: Parameters<typeof enterHomePageWebContent>[1],
) {
  const trace = await walkUntil(
    voiceOver,
    undefined,
    (_itemText, phrase) => spoken(phrase, 'edit text'),
    { maxSteps: 12 },
  );

  expect(
    trace.matchIndex,
    `VoiceOver never reached the table search field. Items announced:\n` +
      trace.phrases.map((p, i) => `  ${i + 1}. ${p}`).join('\n'),
  ).toBeGreaterThanOrEqual(0);

  return { phrase: trace.phrases[trace.matchIndex], trace };
}

/**
 * Type into the search field the VO cursor is parked on.
 *
 * `interact()` alone leaves DOM focus behind and the keystrokes go nowhere —
 * observation 2 in the docblock. `moveKeyboardFocusToCursor` puts DOM focus on
 * the same element the VO cursor is on, so this stays a VoiceOver-driven
 * interaction with no Playwright involvement.
 */
async function typeIntoSearch(
  voiceOver: Parameters<typeof enterHomePageWebContent>[1],
  text: string,
) {
  await voiceOver.perform(
    voiceOver.keyboardCommands.moveKeyboardFocusToCursor as never,
  );
  await voiceOver.clearSpokenPhraseLog();
  await voiceOver.type(text);
}

// --- Search field ------------------------------------------------------------

test.describe('screen reader: Table search — the field', () => {
  test("the table's search field announces its name and that it is a text field", async ({
    page,
    voiceOver,
  }, testInfo) => {
    await enterHomePageWebContent(page, voiceOver);
    await jumpToTableSection(voiceOver);

    // The control for this spec. `search-input/index.tsx` gives the input an
    // `id` of the literal string "Search table" — a space inside an id, which
    // is invalid — and no `aria-label`, leaving the visually-hidden <label> as
    // the only source of its name. That it survives into speech anyway is worth
    // guarding, because the obvious "tidy up the id" refactor could break it.
    const { phrase, trace } = await walkToTableSearch(voiceOver);
    await attachSpokenLog(testInfo, 'walk-to-table-search', trace.phrases);

    expectAnnounces(
      phrase,
      [SEARCH_LABEL, 'edit text'],
      'The table search field must announce its accessible name and its role.',
    );

    await attachFullSpokenLog(voiceOver, testInfo, 'table-search-name-role');
  });
});

// --- Searching ---------------------------------------------------------------

test.describe('screen reader: Table search — result feedback', () => {
  // FIXME(a11y): searching the table announces nothing about the outcome. The
  // count at src/views/home/components/TableWithSearch/index.tsx:124 is a plain
  // <p> — no role="status", no aria-live, and no association with the input or
  // the table. There is no live region ANYWHERE on this route.
  //
  // Observed: typing "Catalog" took the table from 2 rows to 1, and the ENTIRE
  // spoken log for the interaction was the character echo:
  //     C  a  t  a  l  o  g
  // A sighted user watches rows disappear and reads "1 results". A screen
  // reader user is told only what they typed, and would have to go hunting to
  // discover the table changed at all. WCAG 4.1.3 (Status Messages, AA).
  //
  // axe has no rule for this and cannot have one: it would need to know that a
  // number on the page was SUPPOSED to update in response to an action.
  //
  // Fix: role="status" (or aria-live="polite") on the results count. One
  // attribute, and it also fixes SR-012 and SR-013.
  // See SR-011 in FINDINGS.md.
  test.fixme(
    'typing in the table search announces how many results remain',
    async ({ page, voiceOver }, testInfo) => {
      await enterHomePageWebContent(page, voiceOver);
      await jumpToTableSection(voiceOver);
      await walkToTableSearch(voiceOver);

      const before = await resultCount(page);
      await typeIntoSearch(voiceOver, MATCHING_TERM);

      // ORACLE: the search must actually narrow the table, or the silence below
      // proves nothing — the lesson SR-002 was re-proven on. `searchTerm` is
      // debounced 250ms, so this polls rather than reads once. Playwright is
      // used here only to observe app state; it never moves the VO cursor.
      await expect
        .poll(() => resultCount(page), {
          message:
            'ORACLE: typing must change the row set before its silence can ' +
            'mean anything.',
        })
        .not.toBe(before);

      const log = await voiceOver.spokenPhraseLog();
      await attachSpokenLog(testInfo, 'after-typing', [
        `count: ${before} -> ${await resultCount(page)}`,
        '--- spoken ---',
        ...log,
      ]);

      expect(
        spoken(log.join(' '), 'result'),
        `Narrowing the table must be announced. The count went from ` +
          `"${before}" to "${await resultCount(page)}" and VoiceOver said:\n` +
          log.map((l, i) => `  ${i + 1}. ${l}`).join('\n'),
      ).toBe(true);

      await attachFullSpokenLog(voiceOver, testInfo, 'search-result-count');
    },
  );

  // FIXME(a11y): the worst case of SR-011 — a search that matches nothing.
  // Every row is replaced by the "No items match / Try clearing some filters or
  // broadening your search." message from src/pages/index.tsx:299, which the
  // Table renders INSIDE A TABLE CELL. Nothing is announced, focus stays in the
  // input, and the one piece of guidance the app offers sits somewhere the user
  // has no reason to navigate to. WCAG 4.1.3.
  //
  // Fix: the same role="status" as SR-011 makes the emptied state audible.
  // See SR-012 in FINDINGS.md.
  test.fixme(
    'a search that matches nothing announces the empty state',
    async ({ page, voiceOver }, testInfo) => {
      await enterHomePageWebContent(page, voiceOver);
      await jumpToTableSection(voiceOver);
      await walkToTableSearch(voiceOver);

      await typeIntoSearch(voiceOver, NO_MATCH_TERM);

      // ORACLE: the table must really have emptied.
      await expect(
        page.getByText(EMPTY_STATE_TEXT),
        'ORACLE: the search must empty the table before its silence can mean ' +
          'anything.',
      ).toBeVisible();

      const log = await voiceOver.spokenPhraseLog();
      await attachSpokenLog(testInfo, 'after-no-match', [
        `count: ${await resultCount(page)}`,
        '--- spoken ---',
        ...log,
      ]);

      expect(
        spoken(log.join(' '), EMPTY_STATE_TEXT) ||
          spoken(log.join(' '), '0 results'),
        `Emptying the table must be announced. Every row disappeared and ` +
          `VoiceOver said:\n` +
          log.map((l, i) => `  ${i + 1}. ${l}`).join('\n'),
      ).toBe(true);

      await attachFullSpokenLog(voiceOver, testInfo, 'search-empty-state');
    },
  );
});

// --- Filtering ---------------------------------------------------------------

test.describe('screen reader: Table search — filters', () => {
  // FIXME(a11y): ticking a filter checkbox re-filters the table instantly
  // (there is no Apply button — handleFilterChange calls setFilters on every
  // change) and announces nothing, for the same reason as SR-011: no live
  // region. Observed with the Research Domain filter, 2 rows down to 1, in
  // total silence. WCAG 4.1.3.
  //
  // Note on method: the checkbox is ticked with Playwright rather than
  // VoiceOver because the VO cursor will not enter the popover at all (see the
  // docblock). That does not weaken the claim — a live region announces
  // whatever triggered the change — but the popover's own reachability is NOT
  // tested here. See SR-013 in FINDINGS.md.
  test.fixme(
    'applying a filter announces how many results remain',
    async ({ page, voiceOver }, testInfo) => {
      // Give the repository row a different domain to the catalog row, so the
      // Research Domain filter has two options and ticking one is not a no-op.
      // With the default fixtures every filter is a no-op and this test could
      // pass off an inert click as a finding.
      await enterHomePageWebContent(page, voiceOver, {
        repoGenre: SECOND_DOMAIN_GENRE,
      });
      await jumpToTableSection(voiceOver);

      const trigger = await walkUntil(
        voiceOver,
        undefined,
        itemText => spoken(itemText, FILTER_TRIGGER),
        { maxSteps: 12 },
      );
      await attachSpokenLog(testInfo, 'walk-to-filter', trigger.items);
      expect(
        trigger.matchIndex,
        `VoiceOver never reached the ${FILTER_TRIGGER} filter. Items:\n` +
          trigger.items.map((t, i) => `  ${i + 1}. ${t}`).join('\n'),
      ).toBeGreaterThanOrEqual(0);

      const before = await resultCount(page);

      // Open with VoiceOver's own default action, then tick with Playwright.
      await voiceOver.act();
      const option = page
        .getByRole('checkbox', { name: FILTER_OPTION, exact: true })
        .first();
      await expect(
        option,
        'ORACLE: the popover must open before anything can be ticked.',
      ).toBeVisible();

      await option.focus();
      await voiceOver.clearSpokenPhraseLog();
      await page.keyboard.press('Space');

      // ORACLE: the filter must actually change the row set.
      await expect
        .poll(() => resultCount(page), {
          message:
            'ORACLE: the filter must change the row set before its silence ' +
            'can mean anything.',
        })
        .not.toBe(before);

      const log = await voiceOver.spokenPhraseLog();
      await attachSpokenLog(testInfo, 'after-filter', [
        `count: ${before} -> ${await resultCount(page)}`,
        '--- spoken ---',
        ...log,
      ]);

      expect(
        spoken(log.join(' '), 'result'),
        `Applying a filter must be announced. The count went from ` +
          `"${before}" to "${await resultCount(page)}" and VoiceOver said:\n` +
          log.map((l, i) => `  ${i + 1}. ${l}`).join('\n'),
      ).toBe(true);

      await attachFullSpokenLog(voiceOver, testInfo, 'filter-result-count');
    },
  );

  // FIXME(a11y): each applied filter renders a chip whose remove button is a
  // Chakra <TagCloseButton>, and Chakra's default accessible name for it is the
  // bare word "close". Observed walking the toolbar with one filter applied:
  //     13. Showing results filtered by:
  //     14. Clear all
  //     15. close button, group
  //     16. IID
  //     17. close button, group
  // Two buttons, one name, neither saying what it removes — and with N filters
  // it is N+1. Navigating by control, a normal way to use a screen reader, they
  // are indistinguishable from each other and from the "Clear all" chip, which
  // destroys every filter rather than one. WCAG 2.4.6 and 4.1.2.
  //
  // Why axe missed it: the `button-name` rule is satisfied — every button HAS a
  // name. Duplicate and uninformative names are not violations. Same shape as
  // SR-003.
  //
  // Fix: pass an explicit label, e.g. aria-label={`Remove ${name} filter`}.
  // See SR-014 in FINDINGS.md.
  test.fixme(
    'filter chips name the filter they remove',
    async ({ page, voiceOver }, testInfo) => {
      await enterHomePageWebContent(page, voiceOver, {
        repoGenre: SECOND_DOMAIN_GENRE,
      });

      // Reaching the applied-filter state is setup, not the thing under test,
      // so it is driven with Playwright.
      const before = await resultCount(page);
      await page
        .getByRole('button', { name: FILTER_TRIGGER, exact: true })
        .click();
      const option = page
        .getByRole('checkbox', { name: FILTER_OPTION, exact: true })
        .first();
      await expect(option).toBeVisible();
      await option.focus();
      await page.keyboard.press('Space');
      await expect.poll(() => resultCount(page)).not.toBe(before);
      await page.keyboard.press('Escape');
      await expect(page.getByText('Clear all')).toBeVisible();

      // Re-park the cursor WITHOUT reloading, or the filter state is lost.
      await voiceOver.navigateToWebContent();
      await jumpToTableSection(voiceOver);

      const trace = await walkUntil(voiceOver, undefined, () => false, {
        maxSteps: 20,
        stopOnRepeat: false,
      });
      await attachSpokenLog(testInfo, 'toolbar-with-chip', trace.items);

      const labelIndex = trace.items.findIndex(
        item => item.trim() === FILTER_OPTION,
      );
      expect(
        labelIndex,
        `The applied "${FILTER_OPTION}" filter chip should be reachable. ` +
          `Items announced:\n` +
          trace.items.map((t, i) => `  ${i + 1}. ${t}`).join('\n'),
      ).toBeGreaterThanOrEqual(0);

      const removeButton = trace.items[labelIndex + 1] ?? '';
      expectAnnounces(
        removeButton,
        [FILTER_OPTION, 'button'],
        `The button that removes the "${FILTER_OPTION}" filter must name that ` +
          `filter. Every chip's remove button is called just "close", so with ` +
          `several filters applied they cannot be told apart — nor from ` +
          `"Clear all", which removes all of them.`,
      );

      await attachFullSpokenLog(voiceOver, testInfo, 'filter-chip-names');
    },
  );
});
