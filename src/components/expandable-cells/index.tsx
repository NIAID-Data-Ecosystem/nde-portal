import {
  Flex,
  FlexProps,
  Text,
  TextProps,
  VisuallyHidden,
} from '@chakra-ui/react';
import React, { useEffect, useId, useMemo, useRef, useState } from 'react';
import { CollapsibleTextTrigger } from 'src/components/collapsible-text';
import { useIsomorphicLayoutEffect } from 'usehooks-ts';

/**
 * Per-cell "Show More / Show Less" expansion for table cells (search results,
 * repository matcher). The toggle is CollapsibleText's trigger, which carries
 * aria-expanded; each cell adds aria-controls for accessibility.
 */

/*
One ResizeObserver for every observed element on the page, rather than one per
cell: a table can hold hundreds of clamped cells.
*/
const resizeCallbacks = new WeakMap<Element, () => void>();
let sharedObserver: ResizeObserver | null = null;

const observeResize = (element: Element, callback: () => void) => {
  if (typeof ResizeObserver === 'undefined') return () => {};
  sharedObserver ??= new ResizeObserver(entries => {
    for (const entry of entries) resizeCallbacks.get(entry.target)?.();
  });
  resizeCallbacks.set(element, callback);
  sharedObserver.observe(element);
  return () => {
    resizeCallbacks.delete(element);
    sharedObserver?.unobserve(element);
  };
};

/**
 * Visually hidden text appended to the toggle so a screen reader hears which
 * content it expands ("Show More Description", "Show 3 More Species") rather
 * than a column of identical "Show More" buttons.
 */
const ToggleContext = ({ children }: { children?: string }) =>
  children ? <VisuallyHidden> {children}</VisuallyHidden> : null;

/**
 * Long-text cell. Clamps to `noOfLines` and reveals the full
 * text with a toggle if the text overflows the clamp.
 * Returns null when there is no text.
 */
export const ExpandableText = ({
  text,
  noOfLines = 4,
  loading,
  toggleContext,
  ...props
}: TextProps & {
  text: string;
  noOfLines?: number;
  loading?: boolean;
  /** What the text is (e.g. the column header), read after "Show More". */
  toggleContext?: string;
}) => {
  const [expanded, setExpanded] = useState(false);
  const [isTruncated, setIsTruncated] = useState(false);
  const textRef = useRef<HTMLParagraphElement>(null);
  const contentId = useId();

  // Detect whether the clamped text overflows so the toggle is only shown when
  // there is hidden content to reveal. Measured before paint on mount, then
  // again whenever the text box resizes (a fluid column narrows or widens);
  // not while expanded, when there is no clamp to overflow.
  useIsomorphicLayoutEffect(() => {
    if (loading || expanded) return;
    const el = textRef.current;
    if (el) setIsTruncated(el.scrollHeight > el.clientHeight);
  }, [loading, text, noOfLines, expanded]);

  useEffect(() => {
    const el = textRef.current;
    if (loading || expanded || !el) return;
    return observeResize(el, () =>
      setIsTruncated(el.scrollHeight > el.clientHeight),
    );
  }, [loading, expanded]);

  if (!text) {
    return null;
  }

  return (
    <Flex flexDirection='column' alignItems='flex-start'>
      <Text
        id={contentId}
        ref={textRef}
        lineClamp={expanded ? undefined : noOfLines}
        fontSize='sm'
        {...props}
      >
        {text}
      </Text>
      {(isTruncated || expanded) && (
        <CollapsibleTextTrigger
          isOpen={expanded}
          mt={1}
          aria-controls={contentId}
          onClick={() => setExpanded(prev => !prev)}
        >
          {expanded ? 'Show Less' : 'Show More'}
          <ToggleContext>{toggleContext}</ToggleContext>
        </CollapsibleTextTrigger>
      )}
    </Flex>
  );
};

/**
 * Multi-value stacked cell. Renders the first `maxVisible` already-built item
 * nodes and reveals the rest with a "Show N More" / "Show Less" toggle. Passing
 * pre-rendered children keeps each field's existing rendering (links vs text).
 */
export const ExpandableList = ({
  children,
  maxVisible = 5,
  gap = 2,
  toggleContext,
  ...props
}: Omit<FlexProps, 'children'> & {
  children: React.ReactNode;
  maxVisible?: number;
  gap?: FlexProps['gap'];
  /** What the items are (e.g. the column header), read after "Show N More". */
  toggleContext?: string;
}) => {
  const [expanded, setExpanded] = useState(false);
  // Use React.useId instead (available in React 18+)
  const contentId = useId();

  const items = useMemo(() => React.Children.toArray(children), [children]);

  const hiddenCount = Math.max(0, items.length - maxVisible);
  const shouldTruncate = hiddenCount > 0;
  const visibleItems =
    shouldTruncate && !expanded ? items.slice(0, maxVisible) : items;

  return (
    <Flex flexDirection='column' alignItems='flex-start' {...props}>
      <Flex id={contentId} flexDirection='column' gap={gap} width='100%'>
        {visibleItems}
      </Flex>
      {shouldTruncate && (
        <CollapsibleTextTrigger
          isOpen={expanded}
          my={2}
          aria-controls={contentId}
          onClick={() => setExpanded(prev => !prev)}
        >
          {expanded ? 'Show Less' : `Show ${hiddenCount} More`}
          <ToggleContext>{toggleContext}</ToggleContext>
        </CollapsibleTextTrigger>
      )}
    </Flex>
  );
};
