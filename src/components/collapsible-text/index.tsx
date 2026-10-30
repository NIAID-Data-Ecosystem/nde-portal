import {
  Box,
  BoxProps,
  chakra,
  Flex,
  HTMLChakraProps,
  Icon,
  SystemStyleObject,
} from '@chakra-ui/react';
import React, { useEffect, useId, useRef, useState } from 'react';
import { FaChevronDown } from 'react-icons/fa6';

export interface CollapsibleTextProps extends Omit<BoxProps, 'children'> {
  children?: React.ReactNode;
  /** Height of the peek shown while collapsed, in pixels. */
  collapsedHeight?: number;
  /** Maximum lines rendered once expanded. */
  lineClamp?: number;
  /** Trigger label while collapsed. */
  expandLabel?: string;
  /** Trigger label while expanded. */
  collapseLabel?: string;
  /**
   * Applied to the root only while the text is long enough to toggle, so a
   * block that is already fully visible does not look interactive.
   */
  _hover?: SystemStyleObject;
  /** Props for the Show More / Show Less button. */
  triggerProps?: HTMLChakraProps<'button'>;
}

/**
 * The Show More / Show Less button: a text button with a chevron that flips
 * while open. Exported so other expandable content shares the same trigger.
 */
export const CollapsibleTextTrigger = ({
  isOpen,
  children,
  ...props
}: HTMLChakraProps<'button'> & { isOpen: boolean }) => (
  <chakra.button
    type='button'
    aria-expanded={isOpen}
    display='inline-flex'
    alignItems='center'
    gap={2}
    py={1}
    fontSize='xs'
    cursor='pointer'
    focusVisibleRing='outside'
    _hover={{ textDecoration: 'underline' }}
    {...props}
  >
    {children}
    <Icon
      transform={isOpen ? 'rotate(180deg)' : undefined}
      boxSize='3'
      transition='transform 0.2s'
    >
      <FaChevronDown />
    </Icon>
  </chakra.button>
);

/**
 * Text that is clipped to a short peek and expands from a Show More button.
 *
 * Only the button toggles, so links in the text stay clickable. It is only
 * offered when the content is actually taller than the peek: shorter content
 * is already fully visible.
 *
 * Hand-rolled rather than built on Chakra's `Collapsible`: given a collapsed
 * size, zag marks every focusable element in the content `inert` while closed,
 * which leaves links in the visible peek, and in text too short to ever
 * expand, unclickable.
 */
export const CollapsibleText: React.FC<CollapsibleTextProps> = ({
  children,
  collapsedHeight = 100,
  lineClamp = 10,
  expandLabel = 'Show More',
  collapseLabel = 'Show Less',
  _hover,
  triggerProps,
  ...props
}) => {
  const contentId = useId();
  const [isOpen, setIsOpen] = useState(false);

  /*
   * Measured on the text itself rather than on the content box, whose height
   * is pinned to the peek while collapsed. `offsetHeight` rather than
   * `scrollHeight`, because the text is clipped with `overflow: clip` and so
   * has no scrolling box to report a larger `scrollHeight` from.
   */
  const textRef = useRef<HTMLDivElement>(null);
  const [textHeight, setTextHeight] = useState(0);
  const isClipped = textHeight > collapsedHeight;
  const isCollapsed = isClipped && !isOpen;

  useEffect(() => {
    const el = textRef.current;
    if (!el) {
      setTextHeight(0);
      return;
    }

    const measure = () => setTextHeight(el.offsetHeight);

    measure();

    // Catches both container resizes and content that renders late.
    if (typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [children]);

  // Tabbing onto a link clipped below the peek expands the text, so keyboard
  // focus never lands somewhere it cannot be seen.
  const handleFocus = (event: React.FocusEvent<HTMLDivElement>) => {
    if (!isCollapsed) return;
    const { bottom } = event.currentTarget.getBoundingClientRect();
    if (event.target.getBoundingClientRect().bottom > bottom) setIsOpen(true);
  };

  return (
    <Box py={1} _hover={isClipped ? _hover : undefined} {...props}>
      <Box
        id={contentId}
        position='relative'
        overflow='clip'
        minHeight={`${collapsedHeight}px`}
        maxHeight={`${isOpen ? textHeight : collapsedHeight}px`}
        transitionProperty='max-height'
        transitionDuration='moderate'
        onFocus={handleFocus}
        // Fade hinting at the clipped text below.
        _after={
          isCollapsed
            ? {
                content: '""',
                position: 'absolute',
                inset: 0,
                zIndex: 1,
                pointerEvents: 'none',
                shadow: 'inset 0 -12px 12px -9px var(--shadow-color)',
                shadowColor: 'whiteAlpha.800',
              }
            : undefined
        }
      >
        {children && (
          <Flex
            ref={textRef}
            minWidth='200px'
            lineClamp={lineClamp}
            overflow='clip'
            css={{
              '& > :first-of-type': {
                overflow: 'clip',
              },
            }}
          >
            {children}
          </Flex>
        )}
      </Box>
      {isClipped && (
        <CollapsibleTextTrigger
          isOpen={isOpen}
          aria-controls={contentId}
          onClick={() => setIsOpen(open => !open)}
          {...triggerProps}
        >
          {isOpen ? collapseLabel : expandLabel}
        </CollapsibleTextTrigger>
      )}
    </Box>
  );
};
