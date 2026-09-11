import {
  Collapsible,
  Flex,
  HStack,
  Icon,
  SystemStyleObject,
  Text,
} from '@chakra-ui/react';
import React, { useEffect, useRef, useState } from 'react';
import { FaChevronDown } from 'react-icons/fa6';

export interface CollapsibleTextProps
  extends Omit<Collapsible.RootProps, 'collapsedHeight' | 'children'> {
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
  /** Styles for the clickable region wrapping the text and its label. */
  triggerProps?: Collapsible.TriggerProps;
}

/**
 * Text that is clipped to a short peek and expands on click.
 *
 * The trigger is only offered when the content is actually taller than the
 * peek: shorter content is already fully visible, so the toggle is disabled,
 * unlabelled, and left out of the tab order.
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
  /*
   * Measured on the text itself rather than on the Collapsible content, whose
   * height is pinned to the peek while closed. `offsetHeight` rather than
   * `scrollHeight`, because the text is clipped with `overflow: clip` and so
   * has no scrolling box to report a larger `scrollHeight` from.
   */
  const textRef = useRef<HTMLDivElement>(null);
  const [isClipped, setIsClipped] = useState(false);

  useEffect(() => {
    const el = textRef.current;
    if (!el) {
      setIsClipped(false);
      return;
    }

    const checkClipped = () => setIsClipped(el.offsetHeight > collapsedHeight);

    checkClipped();

    // Catches both container resizes and content that renders late.
    if (typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(checkClipped);
    observer.observe(el);
    return () => observer.disconnect();
  }, [children, collapsedHeight]);

  return (
    <Collapsible.Root
      collapsedHeight={`${collapsedHeight}px`}
      collapsedWidth='100%'
      disabled={!isClipped}
      _hover={isClipped ? _hover : undefined}
      {...props}
    >
      <Collapsible.Trigger
        // Nothing to toggle, so keep it out of the tab order too.
        disabled={!isClipped}
        cursor={isClipped ? 'pointer' : 'default'}
        py={1}
        {...triggerProps}
      >
        <Collapsible.Content
          position='relative'
          // Fade hinting at the clipped text below.
          _closed={
            isClipped
              ? {
                  _after: {
                    content: '""',
                    position: 'absolute',
                    inset: 0,
                    zIndex: 1,
                    pointerEvents: 'none',
                    shadow: 'inset 0 -12px 12px -9px var(--shadow-color)',
                    shadowColor: 'whiteAlpha.800',
                  },
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
              textAlign='left'
              css={{
                '& > :first-of-type': {
                  overflow: 'clip',
                },
              }}
            >
              {children}
            </Flex>
          )}
        </Collapsible.Content>
        {isClipped && (
          <Collapsible.Context>
            {api => (
              <HStack py={1}>
                <Text as='span' fontSize='xs' gap={1}>
                  {api.open ? collapseLabel : expandLabel}
                </Text>
                <Icon
                  transform={api.open ? 'rotate(180deg)' : undefined}
                  boxSize='3'
                  transition='transform 0.2s'
                >
                  <FaChevronDown />
                </Icon>
              </HStack>
            )}
          </Collapsible.Context>
        )}
      </Collapsible.Trigger>
    </Collapsible.Root>
  );
};
