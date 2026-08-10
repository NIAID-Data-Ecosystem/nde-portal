/**
 * Screen reader tests for the home page's DECORATIVE IMAGES, driving REAL
 * VoiceOver.
 *
 * Read `e2e/screen-reader/README.md` first — it covers the one-time macOS setup
 * and the "move with VoiceOver, wait with Playwright" rule these specs depend
 * on. Run with `yarn test:sr:nobuild e2e/screen-reader/decorative-images.spec.ts`.
 *
 * Surface: three ornamental images that carry paragraph-length alt text, plus
 * the unlabelled icons around the hero search. `src/views/home/components/
 * HeroBanner.tsx` and `src/pages/index.tsx`.
 *
 * Strategy: this is the finding where "axe can't see it" needs stating
 * precisely, because it is easy to assert loosely and be wrong.
 *
 *   - `image-alt` (critical, in scope) checks that `alt` is PRESENT and
 *     non-whitespace. It never inspects length, quality or decorative intent.
 *   - `image-redundant-alt` IS scanned (`best-practice` is one of the five tags
 *     in WCAG_AA_TAGS), but its only check fires when an image's name exactly
 *     equals the visible text of an ancestor button/link/p/li/td/th. None of
 *     these images has such an ancestor. It is also `minor`, and
 *     BLOCKING_IMPACTS is serious/critical — so it could not fail CI anyway.
 *   - No axe-core rule at any tag measures alt length or decorative intent.
 *     Decorative intent is not machine-derivable, so there is no rule to write.
 *
 * ## What the spike observed
 *
 * 66 words of stock-image prose before the page title (37 + 29, measured):
 *
 *     13. Staging API link
 *     14. A complex network of interconnected lines and nodes, resembling a
 *         molecular or neural network structure. … image
 *     15. An abstract graphic featuring three hexagons. The top-right hexagon
 *         shows a person typing on a keyboard with a microscope … image
 *     16. Discovery Portal heading level 1
 *
 * And 70 more immediately before "Getting Started":
 *
 *     21. The image shows a healthcare professional, likely a doctor, wearing a
 *         white coat and stethoscope, … image
 *     22. Getting Started heading level 2
 *
 * At a 375px viewport the hexagon image measures **0x0 and is still announced**
 * in full — see SR-024, the sharpest of these.
 *
 * The nav logo is the counter-example that makes that legible: three `<img>`
 * variants exist, and at any breakpoint exactly one is `display: block` while
 * the other two are genuinely `display: none`, so only one reaches the
 * accessibility tree. Same repo, same problem, solved correctly.
 *
 * ## Not verified
 *
 * Whether the alt text is *wrong* as opposed to unnecessary. These tests assert
 * that ornamental artwork should not be announced at all; they say nothing
 * about what the right alt would be if any of these images were later judged
 * informative. That is an editorial call, not a testable one.
 */
import { voiceOverTest as test } from '@guidepup/playwright';
import { expect, type Page } from '@playwright/test';
import { HERO_H1 } from './fixtures/home';
import { enterHomePageWebContent } from './utils/home-page';
import {
  attachFullSpokenLog,
  attachSpokenLog,
  spoken,
  walkUntil,
} from './utils/voiceover';

/**
 * Distinctive substrings of the three decorative alts. Substrings rather than
 * the full strings so a copy edit doesn't silently turn these into vacuous
 * passes — each is specific enough that nothing else on the page matches.
 */
const NODES_ALT = 'interconnected lines and nodes';
const HEXAGONS_ALT = 'three hexagons';
const DOCTOR_ALT = 'healthcare professional';

/** Measured word counts, quoted in failure messages so the cost is concrete. */
const NODES_WORDS = 37;
const HEXAGONS_WORDS = 29;
const DOCTOR_WORDS = 70;

/** The <h2> the doctor photo sits immediately before. */
const GETTING_STARTED = 'Getting Started';

/** What VoiceOver announces for an image with no accessible name. */
const NAMELESS_IMAGE = 'image';

/** Oracle only: every <img>'s alt and whether it is display:none. */
async function imageVisibility(page: Page) {
  return page.evaluate(() =>
    Array.from(document.querySelectorAll('img')).map(img => ({
      alt: img.getAttribute('alt') ?? '',
      display: getComputedStyle(img).display,
      width: Math.round(img.getBoundingClientRect().width),
      height: Math.round(img.getBoundingClientRect().height),
    })),
  );
}

/**
 * Jump to the hero `<h1>` in one press.
 *
 * `findNextHeading` lands directly on it from the top of web content, which
 * saves the ~15 linear steps the nav and environment banner would otherwise
 * cost. Only safe as a STARTING point — the images under test are announced in
 * a linear walk and would be skipped by further heading jumps.
 */
async function jumpToHeroHeading(
  voiceOver: Parameters<typeof enterHomePageWebContent>[1],
) {
  const trace = await walkUntil(
    voiceOver,
    voiceOver.keyboardCommands.findNextHeading,
    itemText => spoken(itemText, HERO_H1),
    { maxSteps: 6 },
  );

  expect(
    trace.matchIndex,
    `VoiceOver never reached the "${HERO_H1}" heading. Items:\n` +
      trace.items.map((t, i) => `  ${i + 1}. ${t}`).join('\n'),
  ).toBeGreaterThanOrEqual(0);

  return trace;
}

/**
 * Walk linearly from the top of web content to the hero `<h1>`, returning
 * everything announced on the way — which is where the two hero images live.
 */
async function walkToHeroHeading(
  voiceOver: Parameters<typeof enterHomePageWebContent>[1],
) {
  const trace = await walkUntil(
    voiceOver,
    undefined,
    (_itemText, phrase) => spoken(phrase, 'heading level 1'),
    { maxSteps: 30 },
  );

  expect(
    trace.matchIndex,
    `ORACLE: the walk must reach the page title, or "the artwork was not ` +
      `announced" is vacuously true. Items:\n` +
      trace.items.map((t, i) => `  ${i + 1}. ${t}`).join('\n'),
  ).toBeGreaterThanOrEqual(0);

  return trace;
}

// --- Breakpoint hiding, done right -------------------------------------------

test.describe('screen reader: Decorative images — breakpoint hiding', () => {
  test('only one logo variant is announced per breakpoint', async ({
    page,
    voiceOver,
  }, testInfo) => {
    await enterHomePageWebContent(page, voiceOver);

    // ORACLE: three logo <img>s exist and two are display:none. Without this
    // the assertion below would also pass on a page with only one logo, which
    // is not what is being guarded.
    const logos = (await imageVisibility(page)).filter(img =>
      img.alt.includes('Logo'),
    );
    const hidden = logos.filter(img => img.display === 'none');
    await attachSpokenLog(
      testInfo,
      'logo-variants',
      logos.map(l => `${l.display.padEnd(6)} ${l.width}x${l.height} ${l.alt}`),
    );
    expect(
      hidden.length,
      'ORACLE: the nav/footer render several logo variants and hide all but ' +
        'one per breakpoint. If none are hidden this test is not exercising ' +
        'the behaviour it claims to.',
    ).toBeGreaterThan(0);

    // The control for this spec, and the counter-example that makes SR-024
    // legible: `display: none` genuinely removes an element from the
    // accessibility tree, so only the visible variant is ever announced. The
    // hexagon artwork uses height:0 instead, and is not removed.
    const trace = await walkUntil(voiceOver, undefined, () => false, {
      maxSteps: 3,
      stopOnRepeat: false,
    });
    await attachSpokenLog(testInfo, 'top-of-page', trace.items);

    const announcedLogos = trace.items.filter(item => spoken(item, 'Logo'));
    expect(
      announcedLogos.length,
      `Exactly one logo variant should be announced. VoiceOver announced ` +
        `${announcedLogos.length}:\n` +
        trace.items.map((t, i) => `  ${i + 1}. ${t}`).join('\n'),
    ).toBe(1);

    await attachFullSpokenLog(voiceOver, testInfo, 'logo-variants');
  });
});

// --- Ornamental artwork ------------------------------------------------------

test.describe('screen reader: Decorative images — ornamental artwork', () => {
  // FIXME(a11y): the two hero images are pure decoration — background art at
  // opacity 0.2 and a hero illustration — and both carry paragraph-length alt
  // text that VoiceOver reads in full BEFORE the page title:
  //     14. A complex network of interconnected lines and nodes, … image
  //     15. An abstract graphic featuring three hexagons. … image
  //     16. Discovery Portal heading level 1
  // 66 words (37 + 29, measured) of stock-image description before a screen
  // reader user learns what page they are on. Both should be alt=''.
  //
  // Why axe missed it: `image-alt` checks that alt is PRESENT, never that it is
  // appropriate or that the image is decorative. `image-redundant-alt` is
  // scanned but only fires on an exact duplicate of an ancestor's visible text,
  // and is `minor` so it could not fail CI regardless. No axe rule at any tag
  // measures alt length or decorative intent — that is not machine-derivable.
  // WCAG 1.1.1, technique H67 (decorative images must be ignorable by AT).
  //
  // Fix: alt='' on both. See SR-022 in FINDINGS.md.
  test.fixme(
    'decorative hero artwork is not announced',
    async ({ page, voiceOver }, testInfo) => {
      await enterHomePageWebContent(page, voiceOver);

      const trace = await walkToHeroHeading(voiceOver);
      await attachSpokenLog(testInfo, 'chrome-before-h1', trace.items);

      const announced = trace.items.filter(
        item => spoken(item, NODES_ALT) || spoken(item, HEXAGONS_ALT),
      );

      expect(
        announced,
        `Ornamental hero artwork must not be announced. VoiceOver read ` +
          `${NODES_WORDS + HEXAGONS_WORDS} words of image description before ` +
          `the page title, in ${trace.items.length} items:\n` +
          trace.items.map((t, i) => `  ${i + 1}. ${t}`).join('\n'),
      ).toEqual([]);

      await attachFullSpokenLog(voiceOver, testInfo, 'hero-artwork');
    },
  );

  // FIXME(a11y): the same defect beside "Getting Started" — a stock photo of a
  // doctor with a 70-word alt, announced immediately before the heading that
  // introduces the section:
  //     21. The image shows a healthcare professional, likely a doctor, … image
  //     22. Getting Started heading level 2
  // Filed separately from SR-022 because it is a different file and a different
  // one-line fix. WCAG 1.1.1.
  //
  // Fix: alt='' at src/pages/index.tsx:200. See SR-023 in FINDINGS.md.
  test.fixme(
    'the Getting Started photo is not announced',
    async ({ page, voiceOver }, testInfo) => {
      await enterHomePageWebContent(page, voiceOver);

      // Heading-jump to the <h1> first — it is one press and skips the nav and
      // banner. From there the walk must be linear, because a heading jump
      // would step straight over the image under test.
      await jumpToHeroHeading(voiceOver);

      const trace = await walkUntil(
        voiceOver,
        undefined,
        itemText => spoken(itemText, GETTING_STARTED),
        { maxSteps: 26 },
      );
      await attachSpokenLog(testInfo, 'walk-to-getting-started', trace.items);

      // ORACLE: the walk must actually reach the heading the image precedes.
      expect(
        trace.matchIndex,
        `ORACLE: the walk must reach "${GETTING_STARTED}", or "the photo was ` +
          `not announced" is vacuously true. Items:\n` +
          trace.items.map((t, i) => `  ${i + 1}. ${t}`).join('\n'),
      ).toBeGreaterThanOrEqual(0);

      const announced = trace.items.filter(item => spoken(item, DOCTOR_ALT));
      expect(
        announced,
        `The Getting Started stock photo is decoration and must not be ` +
          `announced. VoiceOver read ${DOCTOR_WORDS} words of it immediately ` +
          `before the heading:\n` +
          trace.items.map((t, i) => `  ${i + 1}. ${t}`).join('\n'),
      ).toEqual([]);

      await attachFullSpokenLog(voiceOver, testInfo, 'getting-started-photo');
    },
  );

  // FIXME(a11y): decorative icons reach the accessibility tree as nameless
  // images. The built page has 56 <svg> elements, 28 of them with neither
  // `aria-hidden` nor a role, and the hero search input's magnifier
  // (src/components/search-input/index.tsx:102) is announced as a bare:
  //     9. image
  // — an item with a role and no name, which tells the user something is there
  // and nothing about what. Every one of these is ornamental; they should be
  // aria-hidden.
  //
  // Why axe missed it: `svg-img-alt` only examines <svg> with
  // role="img"/"graphics-*", and this page has ZERO of those, so the rule is
  // INAPPLICABLE rather than passing. An unlabelled svg with no role is outside
  // every alt-related rule in axe-core. WCAG 1.1.1.
  //
  // Fix: aria-hidden='true' on presentational Icon instances.
  // See SR-025 in FINDINGS.md.
  test.fixme(
    'decorative icons are not announced as nameless images',
    async ({ page, voiceOver }, testInfo) => {
      await enterHomePageWebContent(page, voiceOver);

      // Start at the <h1>, deliberately: the environment banner ALSO renders a
      // nameless icon, but only in non-production builds. Starting below it
      // keeps this test about the hero search magnifier, which ships in every
      // environment.
      await jumpToHeroHeading(voiceOver);

      const trace = await walkUntil(voiceOver, undefined, () => false, {
        maxSteps: 12,
        stopOnRepeat: false,
      });
      await attachSpokenLog(testInfo, 'hero-search-area', trace.items);

      // ORACLE: the walk must have reached the search area, where the icon is.
      expect(
        trace.items.some(item => spoken(item, 'edit text')),
        `ORACLE: the walk must reach the hero search field, or a nameless ` +
          `icon simply may not have been passed yet. Items:\n` +
          trace.items.map((t, i) => `  ${i + 1}. ${t}`).join('\n'),
      ).toBe(true);

      // Exact match, not a substring: every image announcement ends in "image",
      // so `spoken(item, 'image')` would match the alt-bearing ones too and
      // make this test about the wrong defect.
      const nameless = trace.items.filter(
        item => item.trim().toLowerCase() === NAMELESS_IMAGE,
      );
      expect(
        nameless,
        `Decorative icons must be hidden from assistive tech, not announced ` +
          `as unnamed images. ${nameless.length} of the ${trace.items.length} ` +
          `items walked announced only "image":\n` +
          trace.items.map((t, i) => `  ${i + 1}. ${t}`).join('\n'),
      ).toEqual([]);

      await attachFullSpokenLog(voiceOver, testInfo, 'nameless-icons');
    },
  );
});

// --- Artwork that isn't even rendered ----------------------------------------

test.describe('screen reader: Decorative images — hidden at mobile width', () => {
  // A phone-sized viewport. Confirmed to compose with guidepup's voiceOverTest.
  test.use({ viewport: { width: 375, height: 812 } });

  // FIXME(a11y): at mobile width the hexagon artwork is NOT RENDERED — and is
  // still read out in full. src/views/home/components/HeroBanner.tsx:65 sets
  //     height={{ base: 0, sm: '200px', md: '70%', lg: '85%', xl: '100%' }}
  // so at 375px the element measures 0x0. But `height: 0` is not `display:
  // none`: the element keeps a box, stays in the accessibility tree, and its 29
  // words are announced before the page title. Observed at 375x812:
  //     hexagon box: 0x0 display=block
  //     11. An abstract graphic featuring three hexagons. … image
  //     12. Discovery Portal heading level 1
  //
  // A sighted phone user sees nothing there. A screen reader user hears a
  // paragraph describing artwork that does not exist on their screen. That is
  // the clearest form of this defect, and it is invisible to any DOM scan
  // because the markup is identical at every breakpoint — only CSS differs.
  //
  // The same codebase does this correctly a few elements away:
  // src/components/logos/nde-logo.tsx uses `display: none` for its off-
  // breakpoint variants, and they are correctly silent. Guarded by the passing
  // control test in this spec.
  //
  // Fix: `display={{ base: 'none', sm: 'block' }}` instead of `height: 0`.
  // See SR-024 in FINDINGS.md.
  test.fixme(
    'the hexagon artwork is not announced where it is not rendered',
    async ({ page, voiceOver }, testInfo) => {
      await enterHomePageWebContent(page, voiceOver);

      // ORACLE: the image really is unrendered at this width. Without it, this
      // would just be SR-022 again at a different viewport.
      const hexagon = (await imageVisibility(page)).find(img =>
        img.alt.includes(HEXAGONS_ALT),
      );
      await attachSpokenLog(testInfo, 'hexagon-box', [
        `viewport: ${JSON.stringify(page.viewportSize())}`,
        `box: ${hexagon?.width}x${hexagon?.height} display=${hexagon?.display}`,
      ]);
      expect(
        hexagon?.height,
        'ORACLE: at mobile width the hexagon must be collapsed to zero ' +
          'height, or this test is not about unrendered content.',
      ).toBe(0);

      const trace = await walkToHeroHeading(voiceOver);
      await attachSpokenLog(testInfo, 'mobile-chrome-before-h1', trace.items);

      const announced = trace.items.filter(item => spoken(item, HEXAGONS_ALT));
      expect(
        announced,
        `Artwork that is not rendered must not be announced. The hexagon ` +
          `image measures 0x0 at this viewport and VoiceOver still read all ` +
          `${HEXAGONS_WORDS} words of its description:\n` +
          trace.items.map((t, i) => `  ${i + 1}. ${t}`).join('\n'),
      ).toEqual([]);

      await attachFullSpokenLog(voiceOver, testInfo, 'hexagon-mobile');
    },
  );
});
