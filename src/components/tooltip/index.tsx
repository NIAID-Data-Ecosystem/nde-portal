import { Portal, Tooltip as ChakraTooltip } from '@chakra-ui/react';
import * as React from 'react';
import { system } from 'src/theme';

export interface TooltipProps extends ChakraTooltip.RootProps {
  showArrow?: boolean;
  portalled?: boolean;
  portalRef?: React.RefObject<HTMLElement>;
  content: React.ReactNode;
  contentProps?: ChakraTooltip.ContentProps;
  disabled?: boolean;
  variant?: 'light' | 'dark';
}

const theme = {
  dark: {
    '--tooltip-bg':
      system.tokens.getByName('colors.text.heading')?.value || '#2f2f2f',
    color: 'white',
    border: 'none',
    borderColor: 'transparent',
  },
  light: {
    '--tooltip-bg': 'white',
    color: system.tokens.getByName('colors.text.body')?.value || '#404B56',
    border: '1px solid',
    borderColor: system.tokens.getByName('colors.gray.200')?.value || '#E2E8F0',
    '& > [data-part="arrow"] > [data-part="arrow-tip"]': {
      borderColor:
        system.tokens.getByName('colors.gray.200')?.value || '#E2E8F0',
    },
  },
};

export const Tooltip = React.forwardRef<HTMLDivElement, TooltipProps>(
  function Tooltip(props, ref) {
    const {
      showArrow,
      children,
      disabled,
      portalled = true,
      content,
      contentProps,
      portalRef,
      variant = 'light',
      ...rest
    } = props;

    if (disabled || !content) return children;

    return (
      <ChakraTooltip.Root {...rest}>
        <ChakraTooltip.Trigger asChild>{children}</ChakraTooltip.Trigger>
        <Portal disabled={!portalled} container={portalRef}>
          <ChakraTooltip.Positioner>
            <ChakraTooltip.Content
              ref={ref}
              css={{
                lineHeight: 'short',
                fontWeight: 'normal',
                ...theme[variant],
              }}
              {...contentProps}
            >
              {showArrow && (
                <ChakraTooltip.Arrow>
                  <ChakraTooltip.ArrowTip />
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
