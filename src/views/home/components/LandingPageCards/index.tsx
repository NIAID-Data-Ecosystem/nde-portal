import React from 'react';
import { Flex } from '@chakra-ui/react';
import { CARDS_DATA } from './data';

import { Card } from './Card';

export const LandingPageCards: React.FC = () => {
  return (
    <Flex
      direction={{ base: 'column', xl: 'row' }}
      gap={{ base: 6, xl: 4 }}
      flexWrap='wrap'
      width='100%'
      mt={4}
      justify='space-between'
    >
      {CARDS_DATA.map((card, i) => (
        <Card key={`landing-card-${i}`} card={card} index={i} />
      ))}
    </Flex>
  );
};
