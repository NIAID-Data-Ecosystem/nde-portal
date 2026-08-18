import React from 'react';
import {
  Box,
  Icon,
  Link as ChakraLink,
  LinkProps as ChakraLinkProps,
} from '@chakra-ui/react';
import { FaArrowUpRightFromSquare } from 'react-icons/fa6';

export interface LinkProps extends ChakraLinkProps {
  color?: string;
  variant?: 'base' | 'unstyled' | 'ghost';
  /**
   * Opens the link in a new tab and appends an external-link icon.
   *
   * Chakra dropped its own `isExternal` in v3; this keeps the prop as part of
   * this component's API, since the icon is ours either way.
   */
  isExternal?: boolean;
}

export const Link = React.forwardRef<HTMLAnchorElement, LinkProps>(
  (props, ref) => {
    const { variant, children, isExternal, ...rest } = props;

    /*
     * The v2 version resolved the Link style config by hand and injected it as
     * `__css`. That was a workaround for the descendant selectors below, and it
     * never actually took effect — ChakraLink resolved the config itself and
     * wrote its own `__css` last. With a real v3 recipe, passing `variant` is
     * enough.
     */
    return (
      <ChakraLink
        variant={variant}
        ref={ref}
        {...(isExternal && { target: '_blank', rel: 'noopener noreferrer' })}
        {...rest}
      >
        {/* Wrapped so the NIAID border-bottom underline applies to the text
            only, not to the external-link icon beside it. The class names are
            a contract with the `link` recipe in src/theme/recipes. */}
        <Box
          as='span'
          className={
            typeof children === 'string' ? 'child-string' : 'child-node'
          }
        >
          {children}
        </Box>
        {isExternal && (
          <Icon boxSize={3} ml={1} mr={0.5} asChild>
            <FaArrowUpRightFromSquare />
          </Icon>
        )}
      </ChakraLink>
    );
  },
);

Link.displayName = 'Link';
