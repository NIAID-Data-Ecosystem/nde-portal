import NextLink, { LinkProps } from 'next/link';
import React, { useId, useRef, useState } from 'react';
import { FaMagnifyingGlass } from 'react-icons/fa6';
import { CollapsibleTextTrigger } from 'src/components/collapsible-text';
import Tooltip from 'src/components/tooltip';
import { useIsomorphicLayoutEffect } from 'usehooks-ts';

import { EmptyValue } from './EmptyValue';
import { visuallyHidden } from './styles';

/*
Scrolling slides tags under a stationary cursor, which fires `pointerover` on
each one; tooltips shouldn't mount or pop open mid-scroll. (Pointer movement
can't tell them apart: `movementX/Y` are always 0 on `pointerover`.) So a hover
only counts once scrolling has settled. One passive listener for the page,
added on first use.
*/
let lastScrollAt = -Infinity;
let watchingScroll = false;
const scrolledRecently = () => {
  if (!watchingScroll && typeof window !== 'undefined') {
    watchingScroll = true;
    window.addEventListener(
      'scroll',
      () => {
        lastScrollAt = performance.now();
      },
      { capture: true, passive: true },
    );
  }
  return performance.now() - lastScrollAt < 150;
};

const isClipped = (el: Element) =>
  el.scrollHeight > el.clientHeight || el.scrollWidth > el.clientWidth;

// The element that clamps a tag's text: its label.
const clampedText = (tag: Element) =>
  tag.querySelector('.nde-tag-label, .nde-tag-link-label') ?? tag;

/**
 * Short terms as tags, with "Show N More" past `maxVisible`, each clamped to one
 * line. When a tag is actually clipped, hovering it shows the full text in a
 * tooltip. The tooltip is mounted for that one tag on first hover, from a
 * single handler on the list, instead of a tooltip machine (and a layout read
 * to decide whether it's needed) per tag up front.
 *
 * Tags are plain elements styled by the table (the dataTable recipe), not
 * Chakra `Tag`s: a table can hold thousands, and a component per tag costs
 * more than the rest of the cell. A plain tag (`.nde-tag` around a
 * `.nde-tag-label`, as `Tag.Root` and `Tag.Label`) takes its styles from the
 * tag recipe: a subtle, small, full-radius `Tag`. With `getSearchHref`, each is a
 * search link (`.nde-tag-link`) with the look of the result cards' searchable
 * `TagWithUrl`: a magnifying glass, the text underlined until hovered, the
 * same corners. Being focusable, a clipped one shows its tooltip on keyboard
 * focus too. A tap or click just follows the link.
 */
export const TagsCell = ({
  values,
  maxVisible = 12,
  toggleContext,
  getSearchHref,
}: {
  values: string[];
  maxVisible?: number;
  toggleContext?: string;
  /** Makes each tag a link to the search this returns for its value. */
  getSearchHref?: (value: string) => LinkProps['href'];
}) => {
  const [expanded, setExpanded] = useState(false);
  const [tooltipIndex, setTooltipIndex] = useState<number | null>(null);
  // Mounting a tooltip replaces its tag's element. When keyboard focus mounted
  // it, focus moves onto the new element.
  const refocusIndex = useRef<number | null>(null);
  const listRef = useRef<HTMLSpanElement>(null);
  const listId = useId();

  useIsomorphicLayoutEffect(() => {
    if (tooltipIndex === null || refocusIndex.current !== tooltipIndex) return;
    refocusIndex.current = null;
    listRef.current
      ?.querySelector<HTMLElement>(`[data-tag-index="${tooltipIndex}"]`)
      ?.focus({ preventScroll: true });
  }, [tooltipIndex]);

  const labels = values.filter(Boolean);
  if (labels.length === 0) return <EmptyValue />;

  /** The index of the tag `target` is in, if it's clipped and has no tooltip yet. */
  const clippedTagIndex = (target: EventTarget) => {
    const tag = (target as Element).closest?.('[data-tag-index]');
    if (!tag || !listRef.current?.contains(tag)) return null;
    const index = Number(tag.getAttribute('data-tag-index'));
    return index !== tooltipIndex && isClipped(clampedText(tag)) ? index : null;
  };

  const hiddenCount = Math.max(0, labels.length - maxVisible);
  const visible = expanded ? labels : labels.slice(0, maxVisible);

  return (
    <span
      ref={listRef}
      id={listId}
      className='nde-tags'
      // `over` rather than `move`: once per tag entered, not per pixel, so
      // scrolling doesn't send a stream of events through React.
      onPointerOver={event => {
        // A tap on a link navigates; a tooltip would only replace the
        // element mid-tap.
        if (getSearchHref && event.pointerType === 'touch') return;
        if (scrolledRecently()) return;
        const index = clippedTagIndex(event.target);
        if (index !== null) setTooltipIndex(index);
      }}
      // Keyboard focus only: a click focuses a link too, and replacing it
      // then could lose the click.
      onFocus={event => {
        if (!(event.target as Element).matches(':focus-visible')) return;
        const index = clippedTagIndex(event.target);
        if (index === null) return;
        refocusIndex.current = index;
        setTooltipIndex(index);
      }}
    >
      {visible.map((label, index) => {
        const tag = getSearchHref ? (
          <NextLink
            key={index}
            className='nde-tag-link'
            data-tag-index={index}
            href={getSearchHref(label)}
            prefetch={false}
            // The tooltip only repeats the link's own name, so it isn't
            // announced again as its description.
            aria-describedby={index === tooltipIndex ? '' : undefined}
          >
            <FaMagnifyingGlass aria-hidden className='nde-tag-link-icon' />
            {/* The underline is on the text, not the label, as in
            TagWithUrl: the ellipsis isn't underlined. */}
            <span className='nde-tag-link-label'>
              <span>{label}</span>
            </span>
          </NextLink>
        ) : (
          <span key={index} className='nde-tag' data-tag-index={index}>
            <span className='nde-tag-label'>{label}</span>
          </span>
        );
        return index === tooltipIndex ? (
          <Tooltip key={index} content={label} defaultOpen>
            {tag}
          </Tooltip>
        ) : (
          tag
        );
      })}
      {hiddenCount > 0 && (
        <CollapsibleTextTrigger
          isOpen={expanded}
          aria-controls={listId}
          onClick={() => setExpanded(prev => !prev)}
        >
          {expanded ? 'Show Less' : `Show ${hiddenCount} More`}
          {toggleContext && (
            <span style={visuallyHidden}> {toggleContext}</span>
          )}
        </CollapsibleTextTrigger>
      )}
    </span>
  );
};
