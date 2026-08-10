/**
 * Traversal and assertion helpers for real-VoiceOver specs.
 *
 * Why this exists: `e2e/utils/axe.ts` proves a control HAS an accessible name.
 * It cannot prove a screen reader user is actually TOLD anything useful when
 * they land on it — that the hero search announces its label and that it's a
 * text field, that a filter button announces collapsed/expanded, that arrowing
 * through a suggestion list announces the option. Those are WCAG 4.1.2
 * (Name, Role, Value) and 1.3.1 (Info and Relationships) as a user experiences
 * them, and they are exactly what a static scan is blind to.
 *
 * ## The one rule: move with VoiceOver, wait with Playwright
 *
 * The VoiceOver cursor and DOM focus are SEPARATE cursors. `locator.focus()`
 * moves DOM focus without moving the VO cursor, so a subsequent
 * `lastSpokenPhrase()` reports wherever VoiceOver happened to be — usually the
 * previous item, sometimes nothing. That desync is the single biggest source of
 * flake in screen reader tests, and it fails in the worst way: intermittently,
 * and with a plausible-looking wrong answer.
 *
 * So:
 *   - Playwright locators are for WAITING ON STATE — proving the mocked data
 *     rendered before the traversal starts.
 *   - VoiceOver commands are for MOVING — `navigateToWebContent()`, `next()`,
 *     `perform(voiceOver.keyboardCommands.findNextHeading)`.
 *
 * ## Bounded walks
 *
 * Guidepup's documented example walks with an unbounded `while` loop. If the
 * phrase it's looking for never arrives, that loop spins until the full test
 * timeout (5 minutes here) and reports a timeout rather than "I walked 200
 * items and never found X". Every walk in this module is bounded and
 * wrap-detecting, and reports what it DID see when it fails.
 */
import { expect, type TestInfo } from '@playwright/test';
import type { VoiceOverPlaywright } from '@guidepup/playwright';

/** How many VoiceOver moves a walk will make before giving up. */
export const DEFAULT_MAX_STEPS = 60;

/**
 * Collapse whitespace and trim. VoiceOver phrases arrive with newlines and
 * runs of spaces depending on the item, which makes raw string comparison
 * needlessly brittle.
 *
 * Deliberately does NOT strip role or state tokens ("heading level 1",
 * "text area", "collapsed") — those tokens ARE the thing under test.
 */
export function normalize(phrase: string): string {
  return phrase.replace(/\s+/g, ' ').trim();
}

/** True when `phrase` contains `needle`, case-insensitively. */
export function spoken(phrase: string, needle: string): boolean {
  return normalize(phrase).toLowerCase().includes(needle.toLowerCase());
}

export interface WalkOptions {
  /** Give up after this many moves. Default {@link DEFAULT_MAX_STEPS}. */
  maxSteps?: number;
  /**
   * Stop early when the walk has run out of road. Default true.
   *
   * A `findNext*` command with no further matches PARKS: it re-announces the
   * last match rather than erroring, so the same item text arrives twice in a
   * row and every remaining step is wasted at ~1.5s each. That is the observed
   * behaviour on this app — the heading walk ends on "Related Government
   * Websites" and stays there.
   *
   * Detection is deliberately limited to CONSECUTIVE repeats. An earlier
   * version also treated "we're back on item 1" as a wrap, which broke linear
   * walks: VoiceOver re-announces a container's item text when you EXIT it
   * (item "Main navigation navigation", spoken "end of Main navigation
   * navigation"), so a linear walk out of the nav landmark looked like a cycle
   * back to the top and stopped 7 items in. Don't reintroduce it.
   *
   * A detected repeat is also CONFIRMED with a second read before the walk
   * stops, because `itemText()` occasionally returns the previous item's text
   * when read too soon after a move. That is indistinguishable from a park at
   * the first read, and treating it as one truncated real walks twice — see the
   * comment at the check itself.
   */
  stopOnRepeat?: boolean;
}

export interface WalkResult {
  /** Item text at each step, in order. */
  items: string[];
  /** Spoken phrase at each step, in order. */
  phrases: string[];
  /** Index into `items` of the first match, or -1 if the predicate never hit. */
  matchIndex: number;
}

/**
 * Repeatedly perform a VoiceOver command, collecting what is announced, until
 * `predicate` matches an item or the walk runs out of road.
 *
 * `command` is a member of `voiceOver.keyboardCommands` (e.g.
 * `findNextHeading`), or omit it to use plain `voiceOver.next()`.
 *
 * Never throws on "not found" — it returns `matchIndex: -1` with the full
 * trace, so the caller can assert with a message that shows what WAS said.
 */
export async function walkUntil(
  voiceOver: VoiceOverPlaywright,
  command: unknown | undefined,
  predicate: (itemText: string, spokenPhrase: string) => boolean,
  { maxSteps = DEFAULT_MAX_STEPS, stopOnRepeat = true }: WalkOptions = {},
): Promise<WalkResult> {
  const items: string[] = [];
  const phrases: string[] = [];

  for (let step = 0; step < maxSteps; step++) {
    if (command === undefined) {
      await voiceOver.next();
    } else {
      // `perform` is typed against guidepup's own command union; the
      // keyboardCommands getter hands back exactly those values.
      await voiceOver.perform(command as never);
    }

    let itemText = normalize(await voiceOver.itemText());
    let phrase = normalize(await voiceOver.lastSpokenPhrase());

    // Out of road: parked on the last match. Consecutive repeats only — see
    // the note on `stopOnRepeat` for why "back on item 1" must NOT count.
    if (
      stopOnRepeat &&
      items.length > 0 &&
      items[items.length - 1] === itemText
    ) {
      // A repeat is ambiguous: either the cursor really has parked, or this
      // read landed before VoiceOver finished updating and returned the
      // PREVIOUS item's text. Both look identical here, and treating a lagged
      // read as a park truncated the walk twice in real runs — a heading jump
      // stopped one heading short of its target and failed with a trace that
      // looked like the heading was missing.
      //
      // So confirm before concluding: read again. A genuinely parked cursor
      // reports the same text twice; a lagged read has caught up by now. Costs
      // one extra read, and only on the repeat path.
      itemText = normalize(await voiceOver.itemText());
      phrase = normalize(await voiceOver.lastSpokenPhrase());

      if (items[items.length - 1] === itemText) {
        break;
      }
    }

    items.push(itemText);
    phrases.push(phrase);

    if (predicate(itemText, phrase)) {
      return { items, phrases, matchIndex: items.length - 1 };
    }
  }

  return { items, phrases, matchIndex: -1 };
}

/**
 * Walk every heading on the page via `findNextHeading`, returning the announced
 * item text for each ("Discovery Portal heading level 1", ...).
 *
 * Call after `voiceOver.navigateToWebContent()`.
 */
export async function collectHeadings(
  voiceOver: VoiceOverPlaywright,
  options: WalkOptions = {},
): Promise<string[]> {
  const { items } = await walkUntil(
    voiceOver,
    voiceOver.keyboardCommands.findNextHeading,
    () => false, // never match — walk until wrap or maxSteps
    options,
  );
  return items;
}

/**
 * Walk forward until an item's announced text contains `needle`, then return
 * the phrase VoiceOver spoke for it.
 *
 * Fails with the full trace of what was announced instead of a bare timeout,
 * because "VoiceOver never reached the search box" and "VoiceOver reached it
 * but said the wrong thing" need very different fixes.
 */
export async function walkToItem(
  voiceOver: VoiceOverPlaywright,
  command: unknown | undefined,
  needle: string,
  options: WalkOptions = {},
): Promise<{ itemText: string; phrase: string; trace: WalkResult }> {
  const result = await walkUntil(
    voiceOver,
    command,
    itemText => spoken(itemText, needle),
    options,
  );

  expect(
    result.matchIndex,
    `VoiceOver never announced an item containing "${needle}" in ` +
      `${result.items.length} steps. Items announced:\n` +
      result.items.map((t, i) => `  ${i + 1}. ${t}`).join('\n'),
  ).toBeGreaterThanOrEqual(0);

  return {
    itemText: result.items[result.matchIndex],
    phrase: result.phrases[result.matchIndex],
    trace: result,
  };
}

/**
 * Assert an announcement carries every one of `expectedTokens`.
 *
 * Token-wise rather than whole-string equality on purpose: VoiceOver appends
 * verbosity hints that vary by macOS version and user settings, so pinning the
 * exact full phrase would make these specs fail on someone else's machine for
 * no accessibility reason. The tokens are the load-bearing part — the
 * accessible name, the role, the state.
 */
export function expectAnnounces(
  phrase: string,
  expectedTokens: string[],
  description: string,
): void {
  const missing = expectedTokens.filter(token => !spoken(phrase, token));
  expect(
    missing,
    `${description}\n` +
      `  VoiceOver said: "${normalize(phrase)}"\n` +
      `  Missing token(s): ${missing.map(t => `"${t}"`).join(', ')}`,
  ).toEqual([]);
}

/**
 * Attach a spoken-phrase / item-text trace to the HTML report, on PASS as well
 * as fail.
 *
 * The counterpart to `attachA11yReport` in `e2e/utils/axe.ts`. A screen reader
 * result is close to unreviewable without the transcript: it's the only way to
 * tell "this passed for the right reason" from "this passed because the
 * predicate matched something incidental", and the only way to see the
 * announcements a test does not assert on but a human would notice.
 */
export async function attachSpokenLog(
  testInfo: TestInfo,
  name: string,
  lines: string[],
): Promise<void> {
  await testInfo.attach(`voiceover-${name}`, {
    body: lines.map((line, i) => `${i + 1}. ${normalize(line)}`).join('\n'),
    contentType: 'text/plain',
  });
}

/**
 * Attach the full spoken-phrase log VoiceOver has accumulated so far.
 * Use at the end of a test so the report holds everything that was said.
 */
export async function attachFullSpokenLog(
  voiceOver: VoiceOverPlaywright,
  testInfo: TestInfo,
  name: string,
): Promise<void> {
  await attachSpokenLog(testInfo, name, await voiceOver.spokenPhraseLog());
}
