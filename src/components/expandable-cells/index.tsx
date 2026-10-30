import { Flex, FlexProps, Text, TextProps } from '@chakra-ui/react';
import React, {
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { CollapsibleTextTrigger } from 'src/components/collapsible-text';

/**
 * Per-cell "Show More / Show Less" expansion for table cells (search results,
 * repository matcher). The toggle is CollapsibleText's trigger, which carries
 * aria-expanded; each cell adds aria-controls for accessibility.
 */

/**
 * Long-text cell. Clamps to `noOfLines` and reveals the full
 * text with a toggle if the text overflows the clamp.
 * Returns null when there is no text.
 */
export const ExpandableText = ({
  text,
  noOfLines = 4,
  loading,
  ...props
}: TextProps & {
  text: string;
  noOfLines?: number;
  loading?: boolean;
}) => {
  const [expanded, setExpanded] = useState(false);
  const [isTruncated, setIsTruncated] = useState(false);
  const textRef = useRef<HTMLParagraphElement>(null);
  // Use React.useId instead (available in React 18+)
  const contentId = useId();

  // Detect whether the clamped text overflows so the toggle is only shown when
  // there is hidden content to reveal.
  useLayoutEffect(() => {
    if (loading) {
      return;
    }
    const el = textRef.current;
    if (el) {
      setIsTruncated(el.scrollHeight > el.clientHeight);
    }
  }, [loading, text, noOfLines]);

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
  ...props
}: Omit<FlexProps, 'children'> & {
  children: React.ReactNode;
  maxVisible?: number;
  gap?: FlexProps['gap'];
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
        </CollapsibleTextTrigger>
      )}
    </Flex>
  );
};
