import {
  Portal,
  Tooltip as ChakraTooltip,
  TooltipRootProps,
} from '@chakra-ui/react';
import React from 'react';

export interface TooltipProps extends TooltipRootProps {
  /** Tooltip content displayed in the overlay. */
  content: React.ReactNode;
  /** Renders the arrow. Replaces v2's `hasArrow`. */
  showArrow?: boolean;
  /** Render the content inline rather than in a portal. */
  portalled?: boolean;
  portalRef?: React.RefObject<HTMLElement | null>;
  /** Forwarded to `Tooltip.Content` — use for sizing/overrides. */
  contentProps?: ChakraTooltip.ContentProps;
  /** When true, renders children with no tooltip at all. */
  disabled?: boolean;
}

/**
 * Chakra v3 exposes Tooltip as a compound component. This flattens it back to a
 * single element so the ~20 call sites stay readable, and keeps the NIAID
 * styling (white background, hairline grey border) in one place.
 */
const Tooltip = React.forwardRef<HTMLDivElement, TooltipProps>(
  (
    {
      content,
      children,
      showArrow = true,
      disabled,
      portalled = true,
      portalRef,
      contentProps,
      ...props
    },
    ref,
  ) => {
    if (disabled) return <>{children}</>;
    const borderColor = contentProps?.borderColor ?? 'gray.200';

    return (
      <ChakraTooltip.Root positioning={{ offset: { mainAxis: 2 } }} {...props}>
        <ChakraTooltip.Trigger asChild>{children}</ChakraTooltip.Trigger>
        <Portal disabled={!portalled} container={portalRef}>
          <ChakraTooltip.Positioner>
            <ChakraTooltip.Content
              ref={ref}
              css={{ '--tooltip-bg': 'colors.white' }}
              color='text.body'
              fontSize='13px'
              fontWeight='normal'
              lineHeight='short'
              border='1px solid'
              borderColor={borderColor}
              {...contentProps}
            >
              {showArrow && (
                <ChakraTooltip.Arrow>
                  <ChakraTooltip.ArrowTip borderColor={borderColor} />
                </ChakraTooltip.Arrow>
              )}
              {content}
            </ChakraTooltip.Content>
          </ChakraTooltip.Positioner>
        </Portal>
      </ChakraTooltip.Root>
    );
  },
);

Tooltip.displayName = 'Tooltip';

export default Tooltip;
