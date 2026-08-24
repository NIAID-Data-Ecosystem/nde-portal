/**
 * DEMO SPIKE
 *
 * This is step one of writing any spec in this suite. You cannot predict what a
 * screen reader will say by reading the markup, so before asserting anything you
 * walk the surface and record what is actually spoken. Real spikes are deleted
 * once their output has been read — see the README, "Observe before asserting".
 *
 * There is NOT ONE ASSERTION in this file. It cannot pass or fail on what it
 * hears. It only listens, and writes down what it heard.
 *
 * Run:    yarn test:sr:nobuild e2e/screen-reader/demo-spike.spec.ts
 * Output: e2e/screen-reader/demo-output/01-spike-transcript.txt
 * Delete after the talk:  rm -rf e2e/screen-reader/demo-spike.spec.ts \
 *                                e2e/screen-reader/demo-output
 */
import { voiceOverTest as test } from '@guidepup/playwright';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { enterHomePageWebContent } from './utils/home-page';
import { attachSpokenLog, spoken, walkUntil } from './utils/voiceover';

/**
 * Where transcripts land. Playwright runs from the directory holding its config
 * — the repo root — so a cwd-relative path is stable, and a plain .txt file is
 * far easier to show in VS Code than the HTML report's embedded attachments.
 */
const OUT_DIR = join(process.cwd(), 'e2e/screen-reader/demo-output');

/** Write a numbered transcript to a plain text file; return the path. */
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

test('SPIKE — what does a screen reader hear before the page title?', async ({
  page,
  voiceOver,
}, testInfo) => {
  // Playwright waits on state; VoiceOver moves the cursor. Never mix them —
  // see the README's one rule.
  await enterHomePageWebContent(page, voiceOver);

  // Linear walk from the top of web content to the <h1>. No assertion about
  // what is announced: that is the whole point of a spike.
  const { items } = await walkUntil(
    voiceOver,
    undefined, // plain voiceOver.next()
    itemText => spoken(itemText, 'heading level 1'),
    { maxSteps: 30 },
  );

  const filePath = writeTranscript(
    '01-spike-transcript.txt',
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
