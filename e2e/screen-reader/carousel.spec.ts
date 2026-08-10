/**
 * Screen reader tests for the news carousel, driving REAL VoiceOver.
 *
 * Read `e2e/screen-reader/README.md` first — it covers the one-time macOS setup
 * and the "move with VoiceOver, wait with Playwright" rule these specs depend
 * on. Run with `yarn test:sr:nobuild e2e/screen-reader/carousel.spec.ts`.
 *
 * Surface: `src/components/carousel/` (shared with the search route), rendered
 * through `src/views/home/components/NewsCarousel.tsx`. SR-006 already covers
 * the card headings' `h3` → `h2` outline break from `home.spec.ts`; this spec
 * covers the widget itself.
 *
 * Strategy: the carousel has NO widget semantics whatsoever — no
 * `role="region"`, no `aria-roledescription="carousel"`, no label, no
 * `aria-live`, no `aria-controls`. `aria-roledescription` appears zero times in
 * the built page. axe has no rule requiring a carousel to declare itself, so
 * every scan passes. What that costs a screen reader user only shows up when
 * you walk it.
 *
 * ## What the spike observed
 *
 * With six cards at a 1280px viewport, the carousel presents TWO and VoiceOver
 * reads all six, in full, including the four that are clipped out of view:
 *
 *      1. News Thumbnail Image image
 *      2. Update Card 001 heading level 2
 *      3. 2026-06-28 —Deterministic update card 001.
 *      4. ( view full release ) (view full release) link
 *      …
 *     21. News Thumbnail Image image
 *     22. Update Card 006 heading level 2
 *     23. 2026-06-23—Deterministic update card 006.
 *     24. ( view full release ) (view full release) link
 *     25. previous carousel item dimmed button, group
 *     26. carousel indicator 1 of 3 (current) button
 *
 * Three things that shaped these tests:
 *   - Card links announce as `( view full release ) (view full release) link` —
 *     the doubled form is the computed name plus the text, and the spaces come
 *     from the block `<p>` nested inside the anchor. All six are identical.
 *   - `next carousel item` sits AFTER the three dots, ~30 linear steps from the
 *     "Updates" heading. Hopping the six card links first and walking from
 *     there costs 12 moves instead of 30.
 *   - Moving the VoiceOver cursor SCROLLS clipped cards into view, desyncing
 *     the container's scroll position from the carousel's own transform — the
 *     dots still read `1 of 3` afterwards. So the visible-card count is only
 *     meaningful when measured at rest, before any traversal.
 *
 * ## A near-miss worth recording
 *
 * SR-015 asks whether entering the widget announces that it IS a carousel, and
 * it PASSED on its first confirmation run. It shouldn't have. The fixture cards
 * were named `Carousel Card 001`, so the assertion's search for the token
 * "carousel" matched the card's own heading — the test data was supplying the
 * very word the test was looking for. The cards are now `Update Card 00N` and
 * the fixture carries a comment forbidding widget vocabulary in that copy.
 *
 * Generalisable, and the same shape as the SR-002 near-miss: a screen reader
 * assertion is a substring search over a transcript, so **any fixture text that
 * contains the token under test can manufacture a pass.** Reading the attached
 * transcript is what catches it, which is why every test here attaches one.
 *
 * ## Runtime
 *
 * Six cards is deliberate: `constraint` is 2 at 1280px and 3 above it, and the
 * controls only render when `cards > constraint`. Three cards would work at
 * 1280 and silently vanish one pixel wider. Consequently the dot TOTAL differs
 * between viewports — never hard-code it; match `/carousel indicator \d+ of
 * \d+/` and key off ` (current)`.
 *
 * The flake this spec used to carry is now fixed at source. Twice, the
 * `findNextHeading` jump stopped short of "Updates" and failed with a trace that
 * made the heading look missing — `walkUntil`'s park detection treating a lagged
 * `itemText()` read as a genuine repeat. `walkUntil` now confirms a repeat with
 * a second read before stopping. See the note on `stopOnRepeat` in
 * `utils/voiceover.ts`.
 *
 * ## Not verified
 *
 * Whether the carousel is operable by a screen reader user at all, in the sense
 * of choosing which slide to view. The tests below prove what is announced, not
 * that a user could form and execute an intention. That needs a task-based
 * evaluation with a real user, which is not something this harness can do.
 */
import { voiceOverTest as test } from '@guidepup/playwright';
import { expect, type Page } from '@playwright/test';
import { CAROUSEL_CARD_COUNT, carouselCardName } from './fixtures/home';
import { enterHomePageWebContent } from './utils/home-page';
import {
  attachFullSpokenLog,
  attachSpokenLog,
  expectAnnounces,
  spoken,
  walkUntil,
} from './utils/voiceover';

/** The <h3> introducing the carousel — the jump target, ~8 presses away. */
const UPDATES_HEADING = 'Updates';

/** The accessible name every card link shares. */
const CARD_LINK_NAME = 'view full release';

/** The two carousel controls, lowercase exactly as authored. */
const PREV_BUTTON = 'previous carousel item';
const NEXT_BUTTON = 'next carousel item';

/**
 * Names of the cards whose box actually falls inside the carousel's clipping
 * window.
 *
 * Playwright's `toBeVisible()` is no use here: clipping by an ancestor's
 * `overflow: hidden` does not make an element hidden by its definition, so all
 * six cards are "visible" to it. This compares bounding boxes instead.
 *
 * MEASURE AT REST. Moving the VoiceOver cursor scrolls clipped cards into view,
 * so calling this mid-traversal reports where the cursor has been, not what the
 * carousel is presenting.
 */
async function visibleCardNames(page: Page): Promise<string[]> {
  return page.evaluate(() => {
    const wrapper = document.querySelector('.padded-carousel');
    if (!wrapper) {
      return [];
    }
    const bounds = wrapper.getBoundingClientRect();

    return Array.from(document.querySelectorAll('.padded-carousel .item'))
      .map(item => {
        const box = item.getBoundingClientRect();
        const inside =
          box.left >= bounds.left - 2 && box.right <= bounds.right + 2;
        const heading = item.querySelector('h1,h2,h3,h4,h5,h6');
        return inside ? heading?.textContent ?? '' : null;
      })
      .filter((name): name is string => name !== null);
  });
}

/**
 * The dot label carrying ` (current)`, which is the only place the carousel
 * exposes which slide is showing. Used as a Playwright oracle only.
 */
async function currentDotLabel(page: Page): Promise<string | null> {
  return page.evaluate(() => {
    const dots = Array.from(
      document.querySelectorAll('[aria-label^="carousel indicator"]'),
    );
    const current = dots.find(dot =>
      (dot.getAttribute('aria-label') ?? '').includes('(current)'),
    );
    return current?.getAttribute('aria-label') ?? null;
  });
}

/** Jump to the carousel's section heading. */
async function jumpToUpdates(
  voiceOver: Parameters<typeof enterHomePageWebContent>[1],
) {
  const trace = await walkUntil(
    voiceOver,
    voiceOver.keyboardCommands.findNextHeading,
    itemText => spoken(itemText, UPDATES_HEADING),
    { maxSteps: 20 },
  );

  expect(
    trace.matchIndex,
    `VoiceOver never reached the "${UPDATES_HEADING}" heading. Items:\n` +
      trace.items.map((t, i) => `  ${i + 1}. ${t}`).join('\n'),
  ).toBeGreaterThanOrEqual(0);

  return trace;
}

/**
 * Hop the six card links, then walk forward to the controls.
 *
 * The controls sit between the last card and the "All updates" link, ~30 linear
 * steps from the heading. Link hops cover the cards at 1 press each instead of
 * 4, cutting the trip to about 12 moves.
 */
async function walkToControl(
  voiceOver: Parameters<typeof enterHomePageWebContent>[1],
  control: string,
) {
  await walkUntil(
    voiceOver,
    voiceOver.keyboardCommands.findNextLink,
    () => false,
    { maxSteps: CAROUSEL_CARD_COUNT, stopOnRepeat: false },
  );

  const trace = await walkUntil(
    voiceOver,
    undefined,
    itemText => spoken(itemText, control),
    { maxSteps: 10 },
  );

  expect(
    trace.matchIndex,
    `VoiceOver never reached the "${control}" control. Items:\n` +
      trace.items.map((t, i) => `  ${i + 1}. ${t}`).join('\n'),
  ).toBeGreaterThanOrEqual(0);

  return { itemText: trace.items[trace.matchIndex], trace };
}

// --- Controls ----------------------------------------------------------------

test.describe('screen reader: Carousel — controls', () => {
  test('the carousel controls announce their name, role and disabled state', async ({
    page,
    voiceOver,
  }, testInfo) => {
    await enterHomePageWebContent(page, voiceOver, {
      carouselCardCount: CAROUSEL_CARD_COUNT,
    });
    await jumpToUpdates(voiceOver);

    // The control for this spec. At rest the carousel is on the first slide, so
    // "previous" is disabled — Chakra emits a native `disabled` attribute
    // rather than `aria-disabled`, and VoiceOver renders that as "dimmed".
    // Worth guarding: switching to `aria-disabled` to keep the button
    // focusable, a common and otherwise reasonable refactor, changes what a
    // screen reader user is told.
    const { itemText, trace } = await walkToControl(voiceOver, PREV_BUTTON);
    await attachSpokenLog(testInfo, 'walk-to-controls', trace.items);

    expectAnnounces(
      itemText,
      [PREV_BUTTON, 'dimmed', 'button'],
      'The previous-slide control must announce its name, that it is a ' +
        'button, and that it is currently unavailable.',
    );

    await attachFullSpokenLog(voiceOver, testInfo, 'carousel-controls');
  });
});

// --- Widget semantics --------------------------------------------------------

test.describe('screen reader: Carousel — widget semantics', () => {
  // FIXME(a11y): the carousel never identifies itself. src/components/carousel/
  // index.tsx renders plain <div>s — no role="region", no
  // aria-roledescription="carousel", no accessible name, no aria-live. Walking
  // in from the "Updates" heading, the first thing announced is a card image:
  //     1. News Thumbnail Image image
  //     2. Carousel Card 001 heading level 2
  // So a screen reader user walks into a rotating widget with no signal that
  // one exists, no name for it, and no indication that most of its content is
  // off screen (see SR-016). They cannot know there is anything to operate.
  //
  // Why axe missed it: there is no rule requiring a composite widget to declare
  // itself, and no way for a scanner to infer that a div containing a
  // horizontal track IS a carousel. WCAG 1.3.1.
  //
  // Fix: role="region" (or role="group") + aria-roledescription="carousel" +
  // an accessible name, per the APG carousel pattern.
  // See SR-015 in FINDINGS.md.
  test.fixme(
    'the carousel identifies itself as a carousel',
    async ({ page, voiceOver }, testInfo) => {
      await enterHomePageWebContent(page, voiceOver, {
        carouselCardCount: CAROUSEL_CARD_COUNT,
      });
      await jumpToUpdates(voiceOver);

      // Deliberately short. The dots are named "carousel indicator N of M", so
      // a longer walk would find the word "carousel" and pass for the wrong
      // reason — this must only cover the boundary into the track.
      const trace = await walkUntil(voiceOver, undefined, () => false, {
        maxSteps: 4,
        stopOnRepeat: false,
      });
      await attachSpokenLog(testInfo, 'entering-carousel', trace.items);

      const announced = trace.items.find(item => spoken(item, 'carousel'));
      expect(
        announced,
        'Crossing into the carousel must announce that it IS a carousel, so ' +
          'the user knows there is a widget here holding content they cannot ' +
          'currently see. VoiceOver announced:\n' +
          trace.items.map((t, i) => `  ${i + 1}. ${t}`).join('\n'),
      ).toBeDefined();

      await attachFullSpokenLog(voiceOver, testInfo, 'carousel-semantics');
    },
  );

  // FIXME(a11y): every slide is announced, including the ones clipped out of
  // view. Off-screen cards are moved with a framer-motion translateX under
  // `overflow: hidden` (carousel/index.tsx:84, Track.tsx:176) and are NOT
  // aria-hidden, inert, or tabIndex=-1, so all of them stay in the
  // accessibility tree. Observed with six cards at 1280px, where the carousel
  // presents two: VoiceOver read all six in full — image, heading, date,
  // description and link, 24 announcements for content the user was shown a
  // third of.
  //
  // This one is specifically a SCREEN READER defect rather than a keyboard one.
  // Item.tsx:24-31 scrolls a card into view on Tab keyup, so a keyboard user is
  // partly protected. The VoiceOver cursor fires no focus event, so it gets no
  // such help — and worse, the browser scrolls the clipped card into view
  // behind the widget's back, leaving the container's scroll position desynced
  // from the carousel's own transform while the dots still report slide 1.
  //
  // Why axe missed it: every card is valid, named, and in the DOM. Whether an
  // element is VISUALLY clipped by an ancestor is not something axe evaluates,
  // and "should this be hidden from assistive tech?" is a question about intent.
  // WCAG 1.3.2 (Meaningful Sequence) and 2.4.3 (Focus Order).
  //
  // Fix: aria-hidden (or inert) on slides outside the current window, per the
  // APG carousel pattern. See SR-016 in FINDINGS.md.
  test.fixme(
    'only the cards on screen are announced',
    async ({ page, voiceOver }, testInfo) => {
      await enterHomePageWebContent(page, voiceOver, {
        carouselCardCount: CAROUSEL_CARD_COUNT,
      });

      // ORACLE, measured AT REST before the cursor moves: how many cards is the
      // carousel actually presenting? Playwright observes state only here.
      const visible = await visibleCardNames(page);
      expect(
        visible.length,
        'ORACLE: the carousel must be presenting fewer cards than it holds, ' +
          'or there is nothing hidden for this test to be about.',
      ).toBeLessThan(CAROUSEL_CARD_COUNT);

      await jumpToUpdates(voiceOver);

      // Each card contributes exactly one link, so link hops count cards.
      const trace = await walkUntil(
        voiceOver,
        voiceOver.keyboardCommands.findNextLink,
        () => false,
        { maxSteps: CAROUSEL_CARD_COUNT + 2, stopOnRepeat: false },
      );
      await attachSpokenLog(testInfo, 'card-link-hops', trace.items);

      const reachable = trace.items.filter(item =>
        spoken(item, CARD_LINK_NAME),
      ).length;

      expect(
        reachable,
        `A screen reader user should reach the ${visible.length} card(s) the ` +
          `carousel is presenting (${visible.join(', ')}), not all ` +
          `${CAROUSEL_CARD_COUNT} it holds. Slides outside the current window ` +
          `need aria-hidden or inert. VoiceOver reached ${reachable} card ` +
          `links:\n` +
          trace.items.map((t, i) => `  ${i + 1}. ${t}`).join('\n'),
      ).toBe(visible.length);

      await attachFullSpokenLog(voiceOver, testInfo, 'offscreen-slides');
    },
  );
});

// --- Slide changes -----------------------------------------------------------

test.describe('screen reader: Carousel — slide changes', () => {
  // FIXME(a11y): moving to the next slide announces nothing. Same root cause as
  // SR-011 to SR-013 — there is no live region anywhere in the app — but in a
  // different component and with a different fix, so it is filed separately.
  //
  // The dots make this worse rather than better. They are <div role="button">
  // with the state baked into the NAME (`carousel indicator 1 of 3 (current)`)
  // rather than exposed as state: no aria-current, no aria-selected, no
  // aria-pressed, and no tablist/tab relationship to the slides. So the one
  // place the position is published is a string a user only encounters if they
  // happen to navigate onto that particular 12x12px div — it is never
  // announced when it changes, which is the moment it matters. WCAG 4.1.3.
  //
  // Fix: announce the new position in a live region on change, and expose the
  // active dot with aria-current in addition to the "(current)" text.
  // See SR-017 in FINDINGS.md.
  test.fixme(
    'changing slide announces the new position',
    async ({ page, voiceOver }, testInfo) => {
      await enterHomePageWebContent(page, voiceOver, {
        carouselCardCount: CAROUSEL_CARD_COUNT,
      });
      await jumpToUpdates(voiceOver);

      const { trace } = await walkToControl(voiceOver, NEXT_BUTTON);
      await attachSpokenLog(testInfo, 'walk-to-next-control', trace.items);

      const before = await currentDotLabel(page);
      await voiceOver.clearSpokenPhraseLog();
      await voiceOver.act();

      // ORACLE: the slide must actually change. The spike's first attempt at
      // this test never reached the next button and activated a dot instead,
      // producing a silence that meant nothing — the SR-002 lesson, again.
      await expect
        .poll(() => currentDotLabel(page), {
          message:
            'ORACLE: activating "next" must move the carousel before its ' +
            'silence can mean anything.',
        })
        .not.toBe(before);

      const log = await voiceOver.spokenPhraseLog();
      await attachSpokenLog(testInfo, 'after-next-slide', [
        `dot: ${before} -> ${await currentDotLabel(page)}`,
        '--- spoken ---',
        ...log,
      ]);

      expect(
        spoken(log.join(' '), 'carousel') || spoken(log.join(' '), 'of'),
        `Moving to the next slide must announce the new position. The ` +
          `carousel went from "${before}" to ` +
          `"${await currentDotLabel(page)}" and VoiceOver said:\n` +
          log.map((l, i) => `  ${i + 1}. ${l}`).join('\n'),
      ).toBe(true);

      await attachFullSpokenLog(voiceOver, testInfo, 'slide-change');
    },
  );

  /**
   * A PASSING test that guards a disproved prediction — see the "disproved"
   * section of FINDINGS.md.
   *
   * Track.tsx:79-100 registers a keydown handler on `document` that
   * preventDefault()s ArrowLeft/Right/Up/Down whenever `trackIsActive`, with no
   * modifier check at all. VoiceOver navigates with Ctrl+Option+Arrow, which
   * reaches the DOM as `key === 'ArrowRight'`. Reading that code, VO navigation
   * anywhere on the page should scroll the carousel — `trackIsActive` is set by
   * focusing any card and is almost never cleared.
   *
   * It does not. Phase 1 below proves the handler is live and modifier-blind (a
   * plain ArrowRight while a card link has focus moves the slide); phase 2
   * shows VoiceOver's own navigation leaves the carousel alone.
   */
  test('moving the VoiceOver cursor does not scroll the carousel', async ({
    page,
    voiceOver,
  }, testInfo) => {
    await enterHomePageWebContent(page, voiceOver, {
      carouselCardCount: CAROUSEL_CARD_COUNT,
    });

    // PHASE 1 — arming oracle. Focusing a card link sets `trackIsActive`; a
    // plain ArrowRight must then move the slide. Without this, phase 2 would
    // pass simply because the hijack was never switched on.
    await page
      .getByRole('link', { name: new RegExp(CARD_LINK_NAME) })
      .first()
      .focus();
    const armedBefore = await currentDotLabel(page);
    await page.keyboard.press('ArrowRight');

    await expect
      .poll(() => currentDotLabel(page), {
        message:
          'ORACLE: a plain ArrowRight with a card focused must move the ' +
          'carousel, proving the document-level keydown handler is armed. ' +
          'If this fails the handler changed, and phase 2 proves nothing.',
      })
      .not.toBe(armedBefore);
    await attachSpokenLog(testInfo, 'phase1-handler-armed', [
      `plain ArrowRight: ${armedBefore} -> ${await currentDotLabel(page)}`,
    ]);

    // PHASE 2 — the claim. Reload to reset the slide, arm the handler again,
    // and park the VoiceOver cursor in the carousel before navigating with it.
    await enterHomePageWebContent(page, voiceOver, {
      carouselCardCount: CAROUSEL_CARD_COUNT,
    });
    await page
      .getByRole('link', { name: new RegExp(CARD_LINK_NAME) })
      .first()
      .focus();
    await jumpToUpdates(voiceOver);

    const before = await currentDotLabel(page);
    const trace = await walkUntil(voiceOver, undefined, () => false, {
      maxSteps: 4,
      stopOnRepeat: false,
    });
    await attachSpokenLog(testInfo, 'phase2-vo-navigation', [
      `dot before: ${before}`,
      `dot after:  ${await currentDotLabel(page)}`,
      '--- items walked ---',
      ...trace.items,
    ]);

    expect(
      await currentDotLabel(page),
      'Reading the page with VoiceOver must not operate the carousel. The ' +
        'document-level handler is armed (phase 1) and does not check ' +
        'modifiers, so VO+Arrow could plausibly be caught by it — but ' +
        'VoiceOver consumes the keystroke first. If this ever fails, the ' +
        'carousel is scrolling under users who are only trying to read.',
    ).toBe(before);

    await attachFullSpokenLog(voiceOver, testInfo, 'vo-nav-vs-carousel');
  });
});

// --- Link text ---------------------------------------------------------------

test.describe('screen reader: Carousel — link text', () => {
  // FIXME(a11y): every card link is called "(view full release)". With six
  // cards that is six links sharing one name (NewsCarousel.tsx:228), announced
  // as `( view full release ) (view full release) link`. Navigating by link — a
  // normal way to use a screen reader, and the fastest way through a list of
  // cards — they are completely indistinguishable, and none of them says what
  // it leads to. The card title sits in a separate heading node, so it is not
  // part of the link's accessible name.
  //
  // Why axe missed it: `link-name` is satisfied — every link HAS a name.
  // Duplicate, non-descriptive names are not violations. Third instance of this
  // same blind spot, after SR-003 and SR-014. WCAG 2.4.4 (Link Purpose).
  //
  // Fix: include the card title, e.g. aria-label={`View full release: ${name}`}.
  // See SR-018 in FINDINGS.md.
  test.fixme(
    'card links describe where they lead',
    async ({ page, voiceOver }, testInfo) => {
      await enterHomePageWebContent(page, voiceOver, {
        carouselCardCount: CAROUSEL_CARD_COUNT,
      });
      await jumpToUpdates(voiceOver);

      const trace = await walkUntil(
        voiceOver,
        voiceOver.keyboardCommands.findNextLink,
        () => false,
        { maxSteps: CAROUSEL_CARD_COUNT, stopOnRepeat: false },
      );
      await attachSpokenLog(testInfo, 'card-links', trace.items);

      // Each link must name its own card. Checking the FIRST is enough to fail
      // the current behaviour, but assert across all of them so the report
      // shows the full extent rather than one example.
      const undescriptive = trace.items.filter(
        (item, i) => !spoken(item, carouselCardName(i + 1)),
      );

      expect(
        undescriptive,
        `Every card link must identify the card it opens. ${trace.items.length} ` +
          `links share the name "(${CARD_LINK_NAME})", so navigating by link ` +
          `gives no way to tell them apart or to know where any of them go:\n` +
          trace.items.map((t, i) => `  ${i + 1}. ${t}`).join('\n'),
      ).toEqual([]);

      await attachFullSpokenLog(voiceOver, testInfo, 'card-link-names');
    },
  );
});
