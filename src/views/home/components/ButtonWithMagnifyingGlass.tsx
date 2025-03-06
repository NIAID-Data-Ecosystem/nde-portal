import { Button, ButtonProps } from '@chakra-ui/react';
import NextLink from 'next/link';
import { FaMagnifyingGlass } from 'react-icons/fa6';

interface ButtonWithMagnifyingGlassProps extends ButtonProps {
  href: string | { pathname: string; query?: Record<string, any> };
  mt?: number;
  colorScheme?: string;
  children: React.ReactNode;
}

export const ButtonWithMagnifyingGlass: React.FC<
  ButtonWithMagnifyingGlassProps
> = ({ href, mt, colorScheme, children, ...props }) => {
  return (
    <Button
      as={NextLink}
      href={href}
      size={{ base: 'sm', sm: 'xs' }}
      height={{ base: 'unset', sm: '25.5px' }}
      leftIcon={<FaMagnifyingGlass />}
      mt={mt}
      fontWeight='medium'
      lineHeight='shorter'
      {...(colorScheme ? { colorScheme } : {})}
      {...props}
    >
      {children}
    </Button>
  );
};
