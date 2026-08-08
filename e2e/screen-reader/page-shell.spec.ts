/**
 * Screen reader tests for the PAGE SHELL — the landmarks, bypass mechanism and
 * navigation state that `PageContainer` renders on every route — driving REAL
 * VoiceOver.
 *
 * Read `e2e/screen-reader/README.md` first — it covers the one-time macOS setup
 * and the "move with VoiceOver, wait with Playwright" rule these specs depend
 * on. Run with `yarn test:sr:nobuild e2e/screen-reader/page-shell.spec.ts`.
 *
 * Exercised through the home page for the same reason `table.spec.ts` is: `/` is
 * the cheapest deterministic route this suite already has mocks and an entry
 * helper for. The surface under test is NOT home-page markup — it is
 * `src/components/page-container/`, `src/components/navigation-bar/` and
 * `src/components/footer/`, which render identically on all 21 routes.
 *
 * Strategy: the axe suite passes every landmark rule on this page —
 * `landmark-one-main` (there is exactly one `<main>`), `region` (all content is
 * inside it), and `bypass` (satisfied by the presence of `<main>`). What it
 * cannot see is that the single `<main>` STARTS ABOVE THE NAVIGATION and ENDS
 * BELOW THE FOOTER, so the landmarks a screen reader user actually navigates by
 * are missing entirely. Only walking the page settles that.
 *
 * ## What the spike observed
 *
 * Top of web content — the first landmark entered is the navigation itself.
 * There is no banner:
 *
 *     1. Main navigation navigation
 *     2. NDE Desktop Logo link
 *     3. Home link
 *     4. Search dialog pop up collapsed button
 *
 * Walking out of the footer — the last footer link is followed directly by the
 * end of `main`. No content information landmark is ever announced:
 *
 *    12. Data harvested: 00-00-0000 link
 *    13. main                              (spoken: "end of main")
 *
 * And the first link on the page is the logo, not a bypass link.
 *
 * Two things worth knowing before reading a transcript from this spec:
 *   - `out/` is built against the staging env, so `!isProd` is true and the
 *     "This is the alpha version…" environment banner IS part of the traversal
 *     between the nav and the hero. That is faithful to dev/staging, not to
 *     production, and it inflates the chrome-before-`<h1>` trace by ~4 items.
 *   - `navigateToWebContent()` parks the cursor already inside `<main>`, which
 *     is why no "main" boundary is announced at the START of a walk — only
 *     "end of main" at the finish.
 *
 * State coverage note — POPULATED ONLY, deliberately, as in `home.spec.ts`. The
 * shell renders from static config and the router; none of it depends on the two
 * NDE queries, so the four data states the axe suite sweeps would cost minutes
 * of wall clock to observe identical announcements.
 *
 * ## Not verified
 *
 * Whether a FIXED banner landmark would be announced at all from
 * `navigateToWebContent()`. The cursor parks inside `<main>` today; if the fix
 * puts a `<header>` above `<main>`, the entry point may land inside the banner
 * and skip its boundary announcement the same way. If SR-007 still fails after
 * the fix, check that before assuming the fix was wrong.
 *
 * Also not covered here: the nav's mobile menu toggle (no `aria-expanded`), the
 * environment banner's Read More disclosure (no `aria-expanded`, no live
 * region), and the duplicate `NDE Desktop Logo` link in the footer. Real, but
 * out of the agreed scope for this spec.
 */
import { voiceOverTest as test } from '@guidepup/playwright';
import { expect } from '@playwright/test';
import { HERO_H1 } from './fixtures/home';
import { enterHomePageWebContent } from './utils/home-page';
import {
  attachFullSpokenLog,
  attachSpokenLog,
  expectAnnounces,
  spoken,
  walkToItem,
  walkUntil,
} from './utils/voiceover';

/** The nav landmark's announced name (`nav-layout.tsx:28` aria-label). */
const NAV_LANDMARK_NAME = 'Main navigation';

/** One of the three nav dropdown triggers, used in the control assertion. */
const NAV_DROPDOWN_NAME = 'Search';

/**
 * The last footer `<h2>`. Used as a jump target: `findNextHeading` reaches it in
 * 13 presses, where a linear walk to the footer costs well over 100.
 */
const FOOTER_HEADING = 'Related Government Websites';

/** The nav item for the route under test — `/` makes "Home" the current page. */
const ACTIVE_NAV_LINK = 'Home';

// --- Landmarks ---------------------------------------------------------------

test.describe('screen reader: Page shell — landmarks', () => {
  test('the navigation landmark and its dropdown triggers announce name, role and state', async ({
    page,
    voiceOver,
  }, testInfo) => {
    await enterHomePageWebContent(page, voiceOver);

    // The control for this spec. A suite whose every test is a defect report
    // can't be distinguished from one that manufactures them, and this is the
    // one part of the shell that is built correctly — so it gets a passing test
    // that will notice if it regresses.
    const nav = await walkToItem(voiceOver, undefined, NAV_LANDMARK_NAME, {
      maxSteps: 4,
    });
    await attachSpokenLog(testInfo, 'walk-to-nav', nav.trace.items);

    expectAnnounces(
      nav.itemText,
      [NAV_LANDMARK_NAME, 'navigation'],
      'The navigation must announce its accessible name and that it is a ' +
        'navigation landmark, so it can be found and skipped by landmark.',
    );

    // Continue forward from the landmark to its first dropdown trigger, 3 more
    // moves along. Chakra's PopoverTrigger supplies the popup type and expanded
    // state; this pins that they survive into speech.
    const trigger = await walkToItem(voiceOver, undefined, 'dialog pop up', {
      maxSteps: 6,
    });
    await attachSpokenLog(testInfo, 'walk-to-dropdown', trigger.trace.items);

    expectAnnounces(
      trigger.itemText,
      [NAV_DROPDOWN_NAME, 'pop up', 'collapsed', 'button'],
      'A nav dropdown trigger must announce its name, that it opens a popup, ' +
        'whether it is currently expanded, and that it is a button.',
    );

    await attachFullSpokenLog(voiceOver, testInfo, 'nav-landmark');
  });

  // FIXME(a11y): there is no banner landmark on any route. The whole page is
  // one <main>: src/components/page-container/components/container.tsx:76 opens
  // `<Flex as='main'>` and renders <Navigation /> inside it at line 82, so the
  // first landmark a screen reader user enters is the navigation itself, with
  // no header region around it. `grep` for `<header` or `role='banner'` across
  // src/ returns nothing. Observed at the top of web content:
  //     1. Main navigation navigation
  //     2. NDE Desktop Logo link
  // axe cannot see this: `landmark-banner-is-top-level` only inspects banners
  // that EXIST, so a page with no banner at all is inapplicable rather than
  // failing, and `region` passes because every element is inside <main>.
  // WCAG 1.3.1 — the header's role is conveyed visually and not programmatically.
  //
  // Fix is one element in container.tsx: move <Navigation /> out of <main> and
  // wrap it in a <header>. Same fix resolves SR-008. Un-fixme after that lands.
  // See SR-007 in FINDINGS.md.
  test.fixme(
    'the navigation sits in a banner landmark, outside the main content',
    async ({ page, voiceOver }, testInfo) => {
      await enterHomePageWebContent(page, voiceOver);

      // Linear, not a heading jump: landmark boundaries are announced as items
      // in a linear walk and are invisible to every findNext* command guidepup
      // exposes — there is no findNextLandmark.
      const trace = await walkUntil(voiceOver, undefined, () => false, {
        maxSteps: 8,
        stopOnRepeat: false,
      });
      await attachSpokenLog(testInfo, 'top-of-page-landmarks', trace.items);

      const banner = trace.items.find(item => spoken(item, 'banner'));
      expect(
        banner,
        'The site header must be a banner landmark, so a screen reader user ' +
          'can jump past it — or straight to it — by landmark. VoiceOver ' +
          'announced no banner in the first 8 items of the page:\n' +
          trace.items.map((t, i) => `  ${i + 1}. ${t}`).join('\n'),
      ).toBeDefined();

      await attachFullSpokenLog(voiceOver, testInfo, 'banner-landmark');
    },
  );

  // FIXME(a11y): the footer is not a content information landmark. <footer>
  // only maps to `contentinfo` when it is NOT a descendant of <main>, and
  // src/components/page-container/components/container.tsx:133 renders <Footer />
  // inside the <main> opened at line 76 — so it maps to a plain generic
  // container and never appears in VoiceOver's landmark rotor. Observed walking
  // out of the footer:
  //     12. Data harvested: 00-00-0000 link
  //     13. main                          (spoken: "end of main")
  // The last footer link is followed directly by the end of <main>. There is no
  // contentinfo boundary anywhere on the page.
  //
  // axe cannot see this either: `landmark-contentinfo-is-top-level` inspects
  // contentinfo landmarks that exist, and there isn't one, so the rule is
  // inapplicable rather than failing. No axe rule requires a page to HAVE a
  // contentinfo. WCAG 1.3.1.
  //
  // Fix: close <main> before <Footer /> in container.tsx — the same one-element
  // change as SR-007. Un-fixme after that lands. See SR-008 in FINDINGS.md.
  test.fixme(
    'the footer is announced as a content information landmark',
    async ({ page, voiceOver }, testInfo) => {
      await enterHomePageWebContent(page, voiceOver);

      // Jump to the last footer heading (13 presses), then walk linearly out of
      // the document so the landmark boundary is crossed and announced.
      const footer = await walkToItem(
        voiceOver,
        voiceOver.keyboardCommands.findNextHeading,
        FOOTER_HEADING,
        { maxSteps: 20 },
      );
      await attachSpokenLog(testInfo, 'heading-walk', footer.trace.items);

      const trace = await walkUntil(voiceOver, undefined, () => false, {
        maxSteps: 15,
        stopOnRepeat: false,
      });
      await attachSpokenLog(testInfo, 'footer-exit', trace.items);

      const contentinfo = trace.items.find(item =>
        spoken(item, 'content information'),
      );
      expect(
        contentinfo,
        'The footer must be a content information landmark, so a screen ' +
          'reader user can reach policies, contact and government links by ' +
          'landmark instead of walking the whole page. VoiceOver announced no ' +
          'content information on the way out of the footer — it announced the ' +
          'end of `main` instead, because the footer is inside it:\n' +
          trace.items.map((t, i) => `  ${i + 1}. ${t}`).join('\n'),
      ).toBeDefined();

      await attachFullSpokenLog(voiceOver, testInfo, 'contentinfo-landmark');
    },
  );
});

// --- Bypassing the chrome ----------------------------------------------------

test.describe('screen reader: Page shell — bypass', () => {
  // FIXME(a11y): there is no skip link anywhere in the app — only a dead
  // `SkipLink` key in src/theme/theme.types.ts:665, referenced by nothing. The
  // first link on every page is the logo:
  //     1. NDE Desktop Logo link
  //     2. Home link
  // So a screen reader or keyboard user has no way past the header, and must
  // walk the logo, four nav items, the login button, the environment banner and
  // both hero images before reaching the page title — on every route, every
  // time. WCAG 2.4.1 (Bypass Blocks), a Level A criterion.
  //
  // Why axe misses it is worth stating precisely, because axe DOES have a rule
  // for 2.4.1: `bypass` passes when the page has a skip link OR a heading OR a
  // main landmark. This page has a <main> — one that starts above the navigation
  // (SR-007) — so the rule certifies a bypass mechanism that does not exist.
  // That is the sharpest example in this suite of a static check being
  // satisfied by the letter of a criterion while the user experience fails it.
  //
  // Fix: a visually-hidden-until-focused "Skip to main content" link as the
  // first focusable element, targeting a content container BELOW the nav —
  // which requires SR-007's fix to have somewhere meaningful to point.
  // See SR-009 in FINDINGS.md.
  test.fixme(
    'a skip link lets a screen reader user bypass the navigation',
    async ({ page, voiceOver }, testInfo) => {
      await enterHomePageWebContent(page, voiceOver);

      // One linear walk serving two purposes: it reaches the <h1>, and the
      // trace it returns IS the evidence — everything a screen reader user
      // hears before the page tells them what page they are on. A correct skip
      // link would be the first item in it.
      const hero = await walkToItem(voiceOver, undefined, 'heading level 1', {
        maxSteps: 30,
      });
      await attachSpokenLog(testInfo, 'chrome-before-h1', hero.trace.items);

      expect(
        hero.itemText,
        `Sanity check on the walk: the level-1 heading reached should be the ` +
          `hero title.`,
      ).toContain(HERO_H1);

      const skipLink = hero.trace.items.find(
        item => spoken(item, 'skip') && spoken(item, 'link'),
      );
      expect(
        skipLink,
        `A skip link must be offered before the navigation. VoiceOver ` +
          `announced ${hero.trace.items.length} items before the page title, ` +
          `none of them a way past the header:\n` +
          hero.trace.items.map((t, i) => `  ${i + 1}. ${t}`).join('\n'),
      ).toBeDefined();

      await attachFullSpokenLog(voiceOver, testInfo, 'skip-link');
    },
  );
});

// --- Current page ------------------------------------------------------------

test.describe('screen reader: Page shell — current page', () => {
  // FIXME(a11y): `aria-current` appears nowhere in src/. The active top-level
  // nav item is marked with a white underline <Box> only —
  // src/components/navigation-bar/components/nav-desktop-top-level-link.tsx:28
  // — so on `/` the "Home" link announces exactly like every other link:
  //     2. Home link
  // A screen reader user is never told which of the nav items is the page they
  // are already on. Colour and shape are the only channel, which also makes
  // this WCAG 1.4.1 (Use of Color) for low-vision users, not only 4.1.2.
  //
  // Why axe misses it: `aria-current` is optional in ARIA, so its absence is
  // never a violation, and axe has no way to know which nav item corresponds to
  // the current URL.
  //
  // Fix: set `aria-current='page'` on the active link alongside the existing
  // underline. The component already computes the active state to render it.
  // The same gap exists on the breadcrumb trail (breadcrumbs.tsx:89), which is
  // not on this route. See SR-010 in FINDINGS.md.
  test.fixme(
    'the active navigation link announces that it is the current page',
    async ({ page, voiceOver }, testInfo) => {
      // The route IS the state under test here, and `enterHomePageWebContent`
      // guarantees it — so unlike SR-002 this needs no oracle proving a click
      // fired before the silence can mean anything.
      await enterHomePageWebContent(page, voiceOver);

      // Hop link-to-link: "Home" is the second link, so this costs 2 moves
      // against the 3 a linear walk would.
      const home = await walkToItem(
        voiceOver,
        voiceOver.keyboardCommands.findNextLink,
        ACTIVE_NAV_LINK,
        { maxSteps: 4 },
      );
      await attachSpokenLog(testInfo, 'walk-to-home-link', home.trace.items);

      expectAnnounces(
        home.itemText,
        [ACTIVE_NAV_LINK, 'current page'],
        'The nav item for the route being viewed must announce that it is the ' +
          'current page, so a screen reader user knows where they are in the ' +
          'site without relying on the underline.',
      );

      await attachFullSpokenLog(voiceOver, testInfo, 'current-page');
    },
  );
});
