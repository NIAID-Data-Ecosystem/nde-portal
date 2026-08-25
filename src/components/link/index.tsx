import {
  Icon,
  Link as ChakraLink,
  LinkProps as ChakraLinkProps,
} from '@chakra-ui/react';
import React from 'react';
import { FaArrowUpRightFromSquare } from 'react-icons/fa6';

export interface LinkProps extends ChakraLinkProps {
  color?: string;
  /**
   * Opens the link in a new tab and appends an external-link icon.
   *
   * Chakra dropped its own `isExternal` in v3; this keeps the prop as part of
   * this component's API.
   */
  isExternal?: boolean;
}

export const Link = React.forwardRef<HTMLAnchorElement, LinkProps>(
  (props, ref) => {
    const { variant, children, isExternal, ...rest } = props;
    return (
      <ChakraLink
        variant={variant}
        ref={ref}
        {...(isExternal && { target: '_blank', rel: 'noopener noreferrer' })}
        {...rest}
      >
        {children}

        {isExternal && (
          <Icon boxSize={3} ml={1} mr={0.5} color='inherit'>
            <FaArrowUpRightFromSquare />
          </Icon>
        )}
      </ChakraLink>
    );
  },
);

Link.displayName = 'Link';
