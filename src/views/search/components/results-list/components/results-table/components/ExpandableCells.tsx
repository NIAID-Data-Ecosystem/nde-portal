import React, {
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Button, Flex, FlexProps, Text, TextProps } from '@chakra-ui/react';

/**
 * Per-cell "Show more / Show less" expansion for the search results tables
 * with aria-expanded / aria-controls for accessibility.
 */
const toggleButtonProps = {
  variant: 'link' as const,
  size: 'xs' as const,
  fontSize: 'sm' as const,
  colorScheme: 'primary' as const,
  fontWeight: 'medium' as const,
};

/**
 * Long-text cell. Clamps to `noOfLines` and reveals the full
 * text with a toggle if the text overflows the clamp.
 * Returns null when there is no text.
 */
export const ExpandableText = ({
  text,
  noOfLines = 4,
  isLoading,
  ...props
}: TextProps & {
  text: string;
  noOfLines?: number;
  isLoading?: boolean;
}) => {
  const [expanded, setExpanded] = useState(false);
  const [isTruncated, setIsTruncated] = useState(false);
  const textRef = useRef<HTMLParagraphElement>(null);
  const contentId = useId();

  // Detect whether the clamped text overflows so the toggle is only shown when
  // there is hidden content to reveal.
  useLayoutEffect(() => {
    if (isLoading) {
      return;
    }
    const el = textRef.current;
    if (el) {
      setIsTruncated(el.scrollHeight > el.clientHeight);
    }
  }, [isLoading, text, noOfLines]);

  if (!text) {
    return null;
  }

  return (
    <Flex flexDirection='column' alignItems='flex-start'>
      <Text
        id={contentId}
        ref={textRef}
        noOfLines={expanded ? undefined : noOfLines}
        fontSize='sm'
        {...props}
      >
        {text}
      </Text>
      {(isTruncated || expanded) && (
        <Button
          {...toggleButtonProps}
          mt={1}
          aria-expanded={expanded}
          aria-controls={contentId}
          onClick={() => setExpanded(prev => !prev)}
        >
          {expanded ? 'Show less' : 'Show more'}
        </Button>
      )}
    </Flex>
  );
};

/**
 * Multi-value stacked cell. Renders the first `maxVisible` already-built item
 * nodes and reveals the rest with a "Show N more" / "Show less" toggle. Passing
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
        <Button
          {...toggleButtonProps}
          my={2}
          aria-expanded={expanded}
          aria-controls={contentId}
          onClick={() => setExpanded(prev => !prev)}
        >
          {expanded ? 'Show less' : `Show ${hiddenCount} more`}
        </Button>
      )}
    </Flex>
  );
};
