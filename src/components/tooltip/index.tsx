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
  /**
   * When true, renders children with no tooltip at all (with
   * `manualTriggers`: a tooltip that never opens).
   */
  disabled?: boolean;
  /**
   * Render `children` as given rather than as the trigger, and mark each
   * element that opens the tooltip with a `TooltipTrigger` (each with its own
   * `value`). For several elements sharing one tooltip; `positioning`'s
   * `getAnchorElement` can keep it in one place whichever is hovered.
   */
  manualTriggers?: boolean;
}

/** A trigger for a `Tooltip` with `manualTriggers`. Use with `asChild`. */
export const TooltipTrigger = ChakraTooltip.Trigger;

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
      manualTriggers,
      ...props
    },
    ref,
  ) => {
    if (disabled && !manualTriggers) return <>{children}</>;
    const borderColor = contentProps?.borderColor ?? 'gray.200';

    return (
      <ChakraTooltip.Root
        positioning={{ offset: { mainAxis: 2 } }}
        {...props}
        // Only ever true with `manualTriggers`, whose triggers can't be
        // unwrapped from it: they stay rendered, but open nothing.
        disabled={disabled}
      >
        {manualTriggers ? (
          children
        ) : (
          <ChakraTooltip.Trigger asChild>{children}</ChakraTooltip.Trigger>
        )}
        <Portal disabled={!portalled} container={portalRef}>
          <ChakraTooltip.Positioner>
            <ChakraTooltip.Content
              ref={ref}
              css={{ '--tooltip-bg': 'colors.white' }}
              color='text.body'
              fontSize='13px'
              fontWeight='normal'
              lineHeight='moderate'
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
