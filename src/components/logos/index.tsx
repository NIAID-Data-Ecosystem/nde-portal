import { Flex, Link } from '@chakra-ui/react';
import React from 'react';

import { NDELogo } from './nde-logo';

export interface LogoProps {
  href?: string;
  isLazy?: boolean;
}

const LOGO_HEIGHTS = { base: '55px', sm: '28px', md: '40px' };
export const Logo = ({ href, isLazy }: LogoProps) => {
  /*
    There are two logos in our nav bar with two separate links.
    1. Link to the NIAID homepage
    2. Link to the Discovery Portal homepage
  */
  return (
    <Flex
      className='logo'
      alignItems='center'
      py={4}
      flex={{ base: 1, md: 'auto' }}
    >
      <Flex
        flexDirection={{ base: 'column', sm: 'row' }}
        height={LOGO_HEIGHTS}
        flex={1}
      >
        <Link
          display='flex'
          alignItems='center'
          href={href?.endsWith('/') ? href : `${href}/`}
          variant='unstyled'
          rel='preload'
          height='100%'
        >
          <NDELogo loading={isLazy ? 'lazy' : 'eager'} />
        </Link>
      </Flex>
    </Flex>
  );
};
