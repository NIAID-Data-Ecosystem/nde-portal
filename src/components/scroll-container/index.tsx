import { ScrollArea } from '@chakra-ui/react';

export interface ScrollContainerProps
  extends React.ComponentProps<typeof ScrollArea.Root> {
  showScrollShadow?: boolean;
}

export const ScrollContainer = ({
  children,
  showScrollShadow,
  variant = 'always',
  ...props
}: ScrollContainerProps) => {
  return (
    <ScrollArea.Root variant={variant} {...props}>
      <ScrollArea.Viewport
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
      </ScrollArea.Viewport>
      <ScrollArea.Scrollbar>
        <ScrollArea.Thumb />
      </ScrollArea.Scrollbar>
      <ScrollArea.Corner />
    </ScrollArea.Root>
  );
};
