import React from 'react';
import { Icon, Link, LinkProps, Text } from '@chakra-ui/react';
import { FaArrowUpRightFromSquare } from 'react-icons/fa6';

// Styles based on: https://designsystem.niaid.nih.gov/components/atoms)

interface CustomLinkProps extends LinkProps {
  isExternal?: boolean;
}
const CustomLink = ({ isExternal, children, ...props }: CustomLinkProps) => {
  return (
    <Link
      target={isExternal ? '_blank' : undefined}
      rel={isExternal ? 'noopener noreferrer' : undefined}
      {...props}
    >
      {children}
      {/* Add an external link icon when [isExternal] prop is true */}
      {isExternal && (
        <Icon as={FaArrowUpRightFromSquare} boxSize={3} ml={0.5} />
      )}
    </Link>
  );
};

export default CustomLink;
