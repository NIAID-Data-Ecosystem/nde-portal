/**
 * DEMO (not part of the suite)
 *
 * Two tests over ONE traversal, in the order they were originally written:
 *
 *   1. THE SPIKE. No assertions. Walks the home page and records everything
 *      VoiceOver says before the page title. You cannot write the test below
 *      until you have read this output.
 *
 *   2. THE TEST that spike produced. The same walk, now asserting the CORRECT
 *      behaviour — that a skip link is offered before the navigation. It FAILS,
 *      deliberately, and its failure message IS the transcript.
 *
 * Expect: 1 passed, 1 failed. Say that out loud before pressing Enter.
 *
 * Finding SR-009. No skip link exists anywhere in the app — only a dead
 * `SkipLink` key in src/theme/theme.types.ts:665, referenced by nothing. The
 * first link on every page is the logo. 31 files, all 21 routes. The existing
 * axe scanner HAS a rule for this criterion, rates it serious, and PASSES —
 * satisfied by a <main> landmark that on this site opens ABOVE the navigation.
 * It certifies a bypass mechanism that does not exist. See FINDINGS.md.
 *
 * The production version of test 2 lives at page-shell.spec.ts:263, deferred
 * with test.fixme so it starts passing the day someone fixes the app.
 *
 * Run:    yarn test:sr:nobuild e2e/screen-reader/demo.spec.ts
 * Output: e2e/screen-reader/demo-output/02-live-spike-transcript.txt
 *         e2e/screen-reader/demo-output/03-live-skip-link-evidence.txt
 * Delete after the talk:  rm -rf e2e/screen-reader/demo.spec.ts \
 *                                e2e/screen-reader/demo-output
 */
import { voiceOverTest as test } from '@guidepup/playwright';
import { expect } from '@playwright/test';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { HERO_H1 } from './fixtures/home';
import { enterHomePageWebContent } from './utils/home-page';
import {
  attachFullSpokenLog,
  attachSpokenLog,
  spoken,
  walkToItem,
  walkUntil,
} from './utils/voiceover';

/**
 * Separate output filenames from demo-spike.spec.ts on purpose: a live run must
 * never overwrite the slide asset prepared from the standalone spike.
 */
const OUT_DIR = join(process.cwd(), 'e2e/screen-reader/demo-output');

function writeTranscript(
  fileName: string,
  heading: string,
  items: string[],
): string {
  mkdirSync(OUT_DIR, { recursive: true });
  const filePath = join(OUT_DIR, fileName);
  writeFileSync(
    filePath,
    `${heading}\n${'='.repeat(heading.length)}\n\n` +
      items
        .map((t, i) => `${String(i + 1).padStart(2, ' ')}. ${t}`)
        .join('\n') +
      '\n',
    'utf8',
  );
  return filePath;
}

// --- 1. Observe -------------------------------------------------------------

test('SPIKE — what does a screen reader hear before the page title?', async ({
  page,
  voiceOver,
}, testInfo) => {
  await enterHomePageWebContent(page, voiceOver);

  const { items } = await walkUntil(
    voiceOver,
    undefined,
    itemText => spoken(itemText, 'heading level 1'),
    { maxSteps: 30 },
  );

  const filePath = writeTranscript(
    '02-live-spike-transcript.txt',
    `${items.length} announcements before the page title`,
    items,
  );

  console.log(
    `\n${items.length} announcements before the page title:\n` +
      items.map((t, i) => `  ${i + 1}. ${t}`).join('\n') +
      `\n\nWritten to: ${filePath}\n`,
  );

  await attachSpokenLog(testInfo, 'spike-before-h1', items);
});

// --- 2. Assert --------------------------------------------------------------

test('a skip link lets a screen reader user bypass the navigation', async ({
  page,
  voiceOver,
}, testInfo) => {
  await enterHomePageWebContent(page, voiceOver);

  const hero = await walkToItem(voiceOver, undefined, 'heading level 1', {
    maxSteps: 30,
  });
  await attachSpokenLog(testInfo, 'chrome-before-h1', hero.trace.items);

  // Written BEFORE the assertions, so the evidence file exists whatever the
  // outcome — a failing expect() would skip anything after it.
  const filePath = writeTranscript(
    '03-live-skip-link-evidence.txt',
    `${hero.trace.items.length} announcements before the page title, none a skip link`,
    hero.trace.items,
  );
  console.log(`\nEvidence written to: ${filePath}\n`);

  // ORACLE. If this fails the traversal broke, and "no skip link was found"
  // would be vacuously true. This is what separates a finding from a false
  // alarm, and it is why the suite writes oracles at all.
  expect(
    hero.itemText,
    'Sanity check on the walk: the level-1 heading reached should be the hero title.',
  ).toContain(HERO_H1);

  // THE FINDING. Asserts the CORRECT behaviour, so it fails until the app is
  // fixed. Never rewrite this to assert the current silence — that would lock
  // the bug in as expected.
  const skipLink = hero.trace.items.find(
    item => spoken(item, 'skip') && spoken(item, 'link'),
  );
  expect(
    skipLink,
    `A skip link must be offered before the navigation. VoiceOver announced ` +
      `${hero.trace.items.length} items before the page title, none of them a ` +
      `way past the header:\n` +
      hero.trace.items.map((t, i) => `  ${i + 1}. ${t}`).join('\n'),
  ).toBeDefined();

  await attachFullSpokenLog(voiceOver, testInfo, 'skip-link');
});
