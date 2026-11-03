import { ScrollArea, useScrollAreaContext } from '@chakra-ui/react';

export interface ScrollContainerProps
  extends React.ComponentProps<typeof ScrollArea.Root> {
  showScrollShadow?: boolean;
}

// zag only puts the viewport in the tab order when it overflows on *both* axes, so a region that scrolls one way can't be reached by keyboard. Focusable whenever it scrolls at all. The ring is inset because the root's `overflow: hidden` clips an outside one.
const Viewport = (props: ScrollArea.ViewportProps) => {
  const { hasOverflowX, hasOverflowY } = useScrollAreaContext();
  return (
    <ScrollArea.Viewport
      tabIndex={hasOverflowX || hasOverflowY ? 0 : undefined}
      focusVisibleRing='inside'
      {...props}
    />
  );
};

export const ScrollContainer = ({
  children,
  showScrollShadow,
  variant = 'always',
  ...props
}: ScrollContainerProps) => {
  return (
    <ScrollArea.Root variant={variant} {...props}>
      <Viewport
        css={
          showScrollShadow && {
            '--scroll-shadow-size': '4rem',
            maskImage: 'linear-gradient(#000, #000)',
            '&[data-overflow-y]': {
              maskImage:
                'linear-gradient(#000,#000,transparent 0,#000 var(--scroll-shadow-size),#000 calc(100% - var(--scroll-shadow-size)),transparent)',
              '&[data-at-top]': {
                maskImage:
                  'linear-gradient(180deg,#000 calc(100% - var(--scroll-shadow-size)),transparent)',
              },
              '&[data-at-bottom]': {
                maskImage:
                  'linear-gradient(0deg,#000 calc(100% - var(--scroll-shadow-size)),transparent)',
              },
            },
          }
        }
      >
        <ScrollArea.Content>{children}</ScrollArea.Content>
      </Viewport>
      <ScrollArea.Scrollbar>
        <ScrollArea.Thumb />
      </ScrollArea.Scrollbar>
      <ScrollArea.Corner />
    </ScrollArea.Root>
  );
};
