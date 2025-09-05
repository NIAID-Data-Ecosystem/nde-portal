import React from 'react';
import { Flex, Link } from '@chakra-ui/react';
import { NDELogo } from './nde-logo';

export interface LogoProps {
  href?: string;
  isLazy?: boolean;
}

export const Logo = ({ href, isLazy }: LogoProps) => {
  /*
    There are two logos in our nav bar with two separate links.
    1. Link to the NIAID homepage
    2. Link to the Discovery Portal homepage
  */
  return (
    <Flex
      className='logo'
      flexDirection={{ base: 'column', sm: 'row' }}
      height={{ base: '55px', sm: '28px', lg: '40px' }}
      flex={1}
    >
      <Link
        display='flex'
        alignItems='center'
        href={href?.endsWith('/') ? href : `${href}/`}
        variant='no-line'
        rel='preload'
        outlineColor='whiteAlpha.300'
      >
        <NDELogo loading={isLazy ? 'lazy' : 'eager'} />
      </Link>
    </Flex>
  );
};
