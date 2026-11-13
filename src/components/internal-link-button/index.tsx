import { Button, ButtonProps, Icon } from '@chakra-ui/react';
import NextLink, { LinkProps as NextLinkProps } from 'next/link';
import React from 'react';
import { FaChevronRight } from 'react-icons/fa6';

export interface InternalLinkButtonProps extends ButtonProps {
  /** Route within the portal. Rendered through `next/link`. */
  href: NextLinkProps['href'];
}

/**
 * A button that navigates to a page within the portal, with a chevron that
 * slides right on hover.
 *
 * Use it for in-app navigation calls to action (e.g. "Read more", "All
 * updates"). For links that leave the portal, use `Link` with `isExternal`.
 */
export const InternalLinkButton = React.forwardRef<
  HTMLAnchorElement,
  InternalLinkButtonProps
>(function InternalLinkButton({ children, href, size = 'sm', ...props }, ref) {
  return (
    <Button
      size={size}
      width={{ base: '100%', sm: 'unset' }}
      maxW='min(100%, 500px)'
      whiteSpace='normal'
      textAlign='center'
      h='auto'
      py={1.5}
      _hover={{ '& svg': { transform: 'translateX(0)' } }}
      asChild
      {...props}
    >
      <NextLink ref={ref} href={href}>
        {children}
        <Icon
          as={FaChevronRight}
          boxSize={3}
          ml={1}
          transform='translateX(-5px)'
          transition='transform .3s ease'
        />
      </NextLink>
    </Button>
  );
});
