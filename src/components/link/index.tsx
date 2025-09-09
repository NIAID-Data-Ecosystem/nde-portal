import React from 'react';
import { Icon, IconProps, Link, LinkProps } from '@chakra-ui/react';
import { FaArrowUpRightFromSquare } from 'react-icons/fa6';

// Styles based on: https://designsystem.niaid.nih.gov/components/atoms)

interface CustomLinkProps extends LinkProps {
  isExternal?: boolean;
  iconProps?: IconProps;
}
const CustomLink = ({
  isExternal,
  children,
  iconProps,
  ...props
}: CustomLinkProps) => {
  return (
    <Link
      target={isExternal ? '_blank' : undefined}
      rel={isExternal ? 'noopener noreferrer' : undefined}
      {...props}
    >
      {children}
      {/* Add an external link icon when [isExternal] prop is true */}
      {isExternal && (
        <Icon
          as={FaArrowUpRightFromSquare}
          boxSize={3}
          ml={0.5}
          {...iconProps}
        />
      )}
    </Link>
  );
};

export { CustomLink as Link };
export type { CustomLinkProps as LinkProps };
