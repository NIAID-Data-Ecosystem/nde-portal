import React, { useId, useState } from 'react';
import { CollapsibleTextTrigger } from 'src/components/collapsible-text';
import Tooltip from 'src/components/tooltip';

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

/**
 * Short terms as tags, with "Show N More" past `maxVisible`.
 *
 * Each tag is a single plain span styled by the table (`.nde-tag` in the
 * dataTable recipe), with the look of the repo's subtle, small, full-radius
 * `Tag`, clamped to one line. When one is actually clipped, hovering it shows
 * the full text in a tooltip. The tooltip is mounted for that one tag on first
 * hover, from a single handler on the list, instead of a tooltip machine (and
 * a layout read to decide whether it's needed) per tag up front.
 */
export const TagsCell = ({
  values,
  maxVisible = 12,
  toggleContext,
}: {
  values: string[];
  maxVisible?: number;
  toggleContext?: string;
}) => {
  const [expanded, setExpanded] = useState(false);
  const [tooltipIndex, setTooltipIndex] = useState<number | null>(null);
  const listId = useId();

  const labels = values.filter(Boolean);
  if (labels.length === 0) return <EmptyValue />;

  const hiddenCount = Math.max(0, labels.length - maxVisible);
  const visible = expanded ? labels : labels.slice(0, maxVisible);

  return (
    <span
      id={listId}
      className='nde-tags'
      // `over` rather than `move`: once per tag entered, not per pixel, so
      // scrolling doesn't send a stream of events through React.
      onPointerOver={event => {
        if (scrolledRecently()) return;
        const tag = (event.target as Element).closest?.('.nde-tag');
        const index = Number(tag?.getAttribute('data-index'));
        if (!tag || index === tooltipIndex || !isClipped(tag)) {
          return;
        }
        setTooltipIndex(index);
      }}
    >
      {visible.map((label, index) => {
        const tag = (
          <span key={index} className='nde-tag' data-index={index}>
            {label}
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
