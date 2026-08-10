/**
 * Screen reader tests for the resources table's LOADING state, driving REAL
 * VoiceOver.
 *
 * Read `e2e/screen-reader/README.md` first — it covers the one-time macOS setup
 * and the "move with VoiceOver, wait with Playwright" rule these specs depend
 * on. Run with `yarn test:sr:nobuild e2e/screen-reader/table-loading.spec.ts`.
 *
 * Surface: the skeleton state of `src/views/home/components/TableWithSearch/`
 * while both NDE queries are in flight. Sibling of `table.spec.ts` (the shared
 * table) and `table-search.spec.ts` (the toolbar), which both cover the
 * populated state.
 *
 * Strategy — and this is the sharpest comparison in the whole exploration. The
 * axe suite scans **this exact state** and passes it: `a11y: Home — loading` →
 * _passes axe while the resources table is loading_. Same route, same mocks,
 * same DOM. Everything below is what that passing scan cannot see.
 *
 * ## What the spike observed
 *
 * The loading table announces itself as a table with ELEVEN ROWS and then reads
 * ten rows of placeholder:
 *
 *      9. 0 results
 *     10. List of repositories and resource catalogs table 5 columns, 11 rows
 *     …header row…
 *     22. row 2 of 11 NAME and sort table column ascending blank column 1 of 5
 *     23. DESCRIPTION blank column 2 of 5
 *     24. TYPE and sort table column ascending - column 3 of 5
 *     25. RESEARCH DOMAIN and sort table column ascending - column 4 of 5
 *     26. ACCESS and sort table column ascending - column 5 of 5
 *
 * Nothing anywhere says the table is loading.
 *
 * **The `-` corrects a prediction this suite had written down.** `home.spec.ts`
 * described this gap as "10 skeleton rows announced as empty cells". That is
 * right for columns 1-2, which announce `blank`, and WRONG for columns 3-5: the
 * ternaries at TableWithSearch/index.tsx:267,273,277 fall through to a literal
 * `'-'`, and Chakra's skeleton hides contents with `* { visibility: hidden }`,
 * which matches element descendants only — so a bare text node survives as
 * transparent-but-announced text. 30 cells (10 rows x 3 columns) tell the user
 * the value is a hyphen. Misinformation, not absence, and worse than predicted.
 *
 * Two more observations that shaped the tests:
 *   - The search input still announces correctly (`Search table edit text`), but
 *     its ITEM TEXT is empty — the name is only in the spoken phrase, the same
 *     quirk `table-search.spec.ts` documents. The three filter buttons do not
 *     render at all while loading, since their options derive from the data.
 *   - Reaching the table is fiddly in two ways, both found by getting it wrong.
 *     A predicate matching "table" lands on the visually-hidden `Search table`
 *     LABEL four items earlier. And `findNextTable` — the obvious fix — answers
 *     "Table not found" on this page and leaves the cursor where it was, which
 *     made two of these tests fail for a harness reason while looking like real
 *     findings. Both are now avoided by walking to `resource catalogs table`.
 *
 * ## Runtime
 *
 * There are no links in the loading table, so the `findNextLink` shortcut the
 * other table specs use is unavailable. Walks here are linear and bounded at 26
 * steps, which is what it takes to cross the toolbar, the table identity, the
 * header row and into the first data row.
 *
 * ## Not verified
 *
 * How long a real user would tolerate this. The loading state is normally brief;
 * these tests hold it open indefinitely to observe it, which is the only way to
 * traverse it but does exaggerate its duration. The defects are real either way
 * — a slow connection is exactly when a loading state matters — but this spec
 * says nothing about how often users hit it.
 */
import { voiceOverTest as test } from '@guidepup/playwright';
import { expect, type Page } from '@playwright/test';
import {
  enterHomePageGatedWebContent,
  enterHomePageLoadingWebContent,
} from './utils/home-page';
import {
  attachFullSpokenLog,
  attachSpokenLog,
  expectAnnounces,
  spoken,
  walkUntil,
} from './utils/voiceover';

/** The <h2> introducing the table — the cheap jump target, ~7 presses away. */
const TABLE_SECTION_HEADING = 'Explore All Included Resources';

/** The table search box's accessible name, present during loading. */
const SEARCH_LABEL = 'Search table';

/** The placeholder VoiceOver reads out of the three fall-through columns. */
const PLACEHOLDER = '-';

/**
 * Steps needed to get from the section heading into the first data row. Measured
 * from the spike: the first `-` cell lands on step 24.
 */
const STEPS_INTO_FIRST_ROW = 26;

/** Oracle only: how many rows the table body currently holds. */
const rowCount = (page: Page) => page.locator('tbody tr').count();

/** Jump to the table's section heading. */
async function jumpToTableSection(
  voiceOver: Parameters<typeof enterHomePageLoadingWebContent>[1],
) {
  const trace = await walkUntil(
    voiceOver,
    voiceOver.keyboardCommands.findNextHeading,
    itemText => spoken(itemText, TABLE_SECTION_HEADING),
    { maxSteps: 20 },
  );

  expect(
    trace.matchIndex,
    `VoiceOver never reached the "${TABLE_SECTION_HEADING}" heading. Items:\n` +
      trace.items.map((t, i) => `  ${i + 1}. ${t}`).join('\n'),
  ).toBeGreaterThanOrEqual(0);

  return trace;
}

/**
 * Distinctive tail of the table's announced identity. Matching on this rather
 * than on "table" matters: the visually-hidden `Search table` LABEL sits four
 * items earlier and any predicate containing the bare word "table" lands there
 * instead — which is exactly what the first version of this spec did.
 */
const TABLE_IDENTITY = 'resource catalogs table';

/**
 * Park the cursor on the table itself and report what it announced.
 *
 * A linear walk, NOT `findNextTable`: guidepup's table-find command answers
 * "Table not found" on this page even with the table a few items ahead, leaving
 * the cursor where it was. Discovered the hard way — it made two tests fail for
 * a harness reason while looking like real findings.
 */
async function jumpToTable(
  voiceOver: Parameters<typeof enterHomePageLoadingWebContent>[1],
) {
  const trace = await walkUntil(
    voiceOver,
    undefined,
    itemText => spoken(itemText, TABLE_IDENTITY),
    { maxSteps: 10 },
  );

  expect(
    trace.matchIndex,
    `VoiceOver never reached the table. Items:\n` +
      trace.items.map((t, i) => `  ${i + 1}. ${t}`).join('\n'),
  ).toBeGreaterThanOrEqual(0);

  return {
    itemText: trace.items[trace.matchIndex],
    phrase: trace.phrases[trace.matchIndex],
    trace,
  };
}

// --- The toolbar during loading ----------------------------------------------

test.describe('screen reader: Table loading — the toolbar', () => {
  test("the table's search field still announces its name and role while data loads", async ({
    page,
    voiceOver,
  }, testInfo) => {
    await enterHomePageLoadingWebContent(page, voiceOver);
    await jumpToTableSection(voiceOver);

    // The control for this spec. The toolbar stays usable while the table loads
    // — the search box keeps its name and role even though the three filter
    // buttons are gone (their options derive from data that hasn't arrived).
    // Worth guarding: a user can start typing before the rows land.
    const trace = await walkUntil(
      voiceOver,
      undefined,
      (_itemText, phrase) => spoken(phrase, 'edit text'),
      { maxSteps: 8 },
    );
    await attachSpokenLog(testInfo, 'walk-to-search', trace.phrases);

    expect(
      trace.matchIndex,
      `VoiceOver never reached the search field. Phrases:\n` +
        trace.phrases.map((p, i) => `  ${i + 1}. ${p}`).join('\n'),
    ).toBeGreaterThanOrEqual(0);

    // Asserted on the PHRASE, not the item text: this input's item text is
    // empty and only the phrase carries its name. Same quirk as
    // table-search.spec.ts, documented there.
    expectAnnounces(
      trace.phrases[trace.matchIndex],
      [SEARCH_LABEL, 'edit text'],
      'The table search field must announce its name and role during loading, ' +
        'not only once the data has arrived.',
    );

    await attachFullSpokenLog(voiceOver, testInfo, 'loading-search-field');
  });
});

// --- The loading table itself ------------------------------------------------

test.describe('screen reader: Table loading — the table', () => {
  // FIXME(a11y): nothing tells a screen reader user the table is loading. There
  // is no `aria-busy` ANYWHERE in this repo (`grep -rn "aria-busy" src/` → 0
  // hits) and no live region, and Chakra's Skeleton emits no ARIA of its own.
  // So the table announces itself as ordinary and complete:
  //     List of repositories and resource catalogs table 5 columns, 11 rows
  // Eleven rows, ten of which are fake — see SR-020 for what is in them. A user
  // who reaches the table mid-load has no way to know that data is on its way,
  // that what they are reading is placeholder, or that it is about to be
  // replaced. WCAG 4.1.3 (Status Messages, AA).
  //
  // Why axe missed it: the axe suite scans this exact state and passes it. A
  // skeleton row is valid markup; `aria-busy` is optional, so its absence is
  // never a violation; and no rule can know that ten rows of placeholder are
  // standing in for real content.
  //
  // Fix: `aria-busy="true"` on the table while loading, and/or a
  // `role="status"` "Loading results" message. There is already a precedent in
  // this codebase — src/views/diseases/disease/layouts/chart-wrapper.tsx:35 puts
  // role="status" on a loading skeleton. See SR-019 in FINDINGS.md.
  test.fixme(
    'the loading table announces that it is busy',
    async ({ page, voiceOver }, testInfo) => {
      await enterHomePageLoadingWebContent(page, voiceOver);

      // ORACLE: the table really is in its skeleton state.
      expect(
        await page.getByTestId('loading').count(),
        'ORACLE: the table must be showing skeleton cells, or this test is ' +
          'not looking at the loading state at all.',
      ).toBeGreaterThan(0);

      await jumpToTableSection(voiceOver);
      const { itemText, phrase } = await jumpToTable(voiceOver);
      await attachSpokenLog(testInfo, 'table-identity', [
        `item:   ${itemText}`,
        `phrase: ${phrase}`,
      ]);

      // Either fix is legitimate — `aria-busy` surfaces as a "busy" state, a
      // role="status" message as its text — so this accepts either token rather
      // than dictating the implementation.
      const announced = `${itemText} ${phrase}`;
      expect(
        spoken(announced, 'busy') || spoken(announced, 'loading'),
        `Reaching a table whose contents are still loading must say so. ` +
          `VoiceOver announced it as an ordinary, complete table:\n` +
          `  item:   ${itemText}\n  phrase: ${phrase}`,
      ).toBe(true);

      await attachFullSpokenLog(voiceOver, testInfo, 'loading-table-busy');
    },
  );

  // FIXME(a11y): three of the five columns announce a hyphen as the cell's
  // VALUE while loading. Observed on the first data row:
  //     row 2 of 11 NAME … blank column 1 of 5
  //     DESCRIPTION blank column 2 of 5
  //     TYPE … - column 3 of 5
  //     RESEARCH DOMAIN … - column 4 of 5
  //     ACCESS … - column 5 of 5
  // Cause: the ternaries at TableWithSearch/index.tsx:267, :273 and :277 fall
  // through to a literal '-' on an empty row object, and Chakra's skeleton hides
  // its contents with `* { visibility: hidden }` — which matches ELEMENT
  // descendants only. A bare text node is merely `color: transparent`, so it
  // stays in the accessibility tree and gets announced. 30 cells (10 rows x 3
  // columns) affected.
  //
  // This is worse than silence: the user is not told the data is missing, they
  // are told what it is, incorrectly. Columns 1-2 announce `blank`, which is
  // honest; these three assert a value. WCAG 1.3.1.
  //
  // Note this corrects the prediction in home.spec.ts, which described the
  // loading rows as "announced as empty cells" — true for 2 of 5 columns only.
  //
  // Why axe missed it: a `-` is valid text content. Nothing in the DOM marks it
  // as a placeholder, and axe cannot infer intent.
  //
  // Fix: render nothing (or the skeleton bar alone) while loading, instead of
  // falling through to '-'. See SR-020 in FINDINGS.md.
  test.fixme(
    'placeholder cells are not announced as content',
    async ({ page, voiceOver }, testInfo) => {
      await enterHomePageLoadingWebContent(page, voiceOver);
      await jumpToTableSection(voiceOver);

      const trace = await walkUntil(voiceOver, undefined, () => false, {
        maxSteps: STEPS_INTO_FIRST_ROW,
        stopOnRepeat: false,
      });
      await attachSpokenLog(testInfo, 'loading-row-walk', trace.items);
      await attachSpokenLog(testInfo, 'loading-row-phrases', trace.phrases);

      // ORACLE: the walk must actually have reached a data row, or "no cell
      // announced a hyphen" would be vacuously true.
      expect(
        trace.phrases.some(phrase => spoken(phrase, 'row 2 of')),
        'ORACLE: the walk must reach the first data row before its cell ' +
          'announcements can be judged. Phrases:\n' +
          trace.phrases.map((p, i) => `  ${i + 1}. ${p}`).join('\n'),
      ).toBe(true);

      // Assert on ITEM TEXT, which for these cells is exactly "-". Deliberately
      // an equality check, not a substring search: "-" appears inside dates and
      // hyphenated words elsewhere, and `spoken(item, '-')` would be a fake
      // assertion that passes or fails for unrelated reasons.
      const placeholders = trace.items.filter(
        item => item.trim() === PLACEHOLDER,
      );

      expect(
        placeholders,
        `No cell may announce "${PLACEHOLDER}" as its value while loading — ` +
          `that tells the user the data IS a hyphen rather than that it is ` +
          `still arriving. ${placeholders.length} of the ` +
          `${trace.items.length} items walked did:\n` +
          trace.items.map((t, i) => `  ${i + 1}. ${t}`).join('\n'),
      ).toEqual([]);

      await attachFullSpokenLog(voiceOver, testInfo, 'loading-placeholders');
    },
  );
});

// --- The transition out of loading -------------------------------------------

test.describe('screen reader: Table loading — data arriving', () => {
  // FIXME(a11y): when the data lands, the content under the user's cursor is
  // replaced wholesale and nothing is announced. Observed with the cursor parked
  // on the table: the row set went from 10 placeholder rows to 2 real ones and
  // the counter from "0 results" to "2 results", and the spoken log was EMPTY.
  //
  // Same root cause as SR-011 to SR-013 and SR-017 — no live region anywhere in
  // the app — but filed separately because the trigger is a data load rather
  // than something the user did. That makes it the worst of the family: the user
  // has no reason to expect a change and no action to associate it with.
  //
  // Why axe missed it: axe scans one DOM snapshot. A transition between two
  // states, each individually valid, is not a thing it can evaluate.
  //
  // Fix: the same role="status" as SR-011, which would announce the new result
  // count as it changes. See SR-021 in FINDINGS.md.
  test.fixme(
    'data arriving is announced',
    async ({ page, voiceOver }, testInfo) => {
      // The gate lets this test decide exactly when the data lands, so the
      // cursor is provably on the table first. A delayed fulfil would race the
      // traversal, whose duration depends on how fast VoiceOver is speaking.
      const release = await enterHomePageGatedWebContent(page, voiceOver);
      await jumpToTableSection(voiceOver);
      const { itemText } = await jumpToTable(voiceOver);
      await attachSpokenLog(testInfo, 'cursor-parked-on', [itemText]);

      const rowsBefore = await rowCount(page);
      await voiceOver.clearSpokenPhraseLog();
      release();

      // ORACLE: the data must actually land, or the silence proves nothing.
      await expect
        .poll(() => rowCount(page), {
          message:
            'ORACLE: releasing the gate must replace the skeleton rows before ' +
            'their silent replacement can mean anything.',
        })
        .not.toBe(rowsBefore);

      const log = await voiceOver.spokenPhraseLog();
      await attachSpokenLog(testInfo, 'after-data-landed', [
        `rows: ${rowsBefore} -> ${await rowCount(page)}`,
        '--- spoken ---',
        ...log,
      ]);

      // Either phrasing is a legitimate fix: the new count, or a plain
      // "results loaded". Not asserting merely "something was said", because
      // VoiceOver interleaves its own chrome into the log and that would pass
      // for the wrong reason.
      const everything = log.join(' ');
      expect(
        spoken(everything, 'result') || spoken(everything, 'load'),
        `The table's contents being replaced must be announced. ${rowsBefore} ` +
          `placeholder rows became ${await rowCount(
            page,
          )} real ones under the ` +
          `user's cursor and VoiceOver said:\n` +
          log.map((l, i) => `  ${i + 1}. ${l}`).join('\n'),
      ).toBe(true);

      await attachFullSpokenLog(voiceOver, testInfo, 'loading-to-loaded');
    },
  );
});
