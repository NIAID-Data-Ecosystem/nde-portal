import React from 'react';
import { Flex, Link } from '@chakra-ui/react';
import { NIAIDLogo } from './niaid-logo';
import { NDELogo } from './nde-logo';

export interface LogoProps {
  href?: string;
}

export const Logo = ({ href }: LogoProps) => {
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
    >
      <Link
        display='flex'
        alignItems='center'
        href='https://www.niaid.nih.gov/'
        variant='unstyled'
        target='_blank'
        rel='preload'
      >
        <NIAIDLogo />
      </Link>

      <Link
        display='flex'
        alignItems='center'
        href={href?.endsWith('/') ? href : `${href}/`}
        variant='unstyled'
        rel='preload'
      >
        <NDELogo />
      </Link>
    </Flex>
  );
};
