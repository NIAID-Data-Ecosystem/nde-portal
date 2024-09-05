import React from 'react';
import {
  Box,
  Icon,
  forwardRef,
  Link as ChakraLink,
  LinkProps as ChakraLinkProps,
  useStyleConfig,
} from '@chakra-ui/react';
import { FaArrowUpRightFromSquare } from 'react-icons/fa6';

export interface LinkProps extends ChakraLinkProps {
  color?: string;
  variant?: 'base' | 'unstyled' | 'ghost';
}

export const Link = forwardRef<LinkProps, 'a'>((props, ref) => {
  const { variant, children, isExternal, ...rest } = props;

  // Get computed styles from theme.
  const styles = useStyleConfig('Link', { variant });

  // Pass the computed styles into the `__css` prop
  return (
    <ChakraLink
      isExternal={isExternal}
      __css={styles}
      variant={variant}
      ref={ref}
      {...rest}
    >
      {/* wrap children in div for border-bottom property */}
      <Box
        as='span'
        className={typeof children === 'string' ? 'child-string' : 'child-node'}
      >
        {children}
      </Box>
      {/* Show external icon when [isExternal] prop is true */}
      {isExternal && (
        <Icon as={FaArrowUpRightFromSquare} boxSize={3} ml={1} mr={0.5} />
      )}
    </ChakraLink>
  );
});
