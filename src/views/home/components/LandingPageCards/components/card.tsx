import { Card, Image } from '@chakra-ui/react';
import React from 'react';
import { Link } from 'src/components/link';

import { CardData } from '../types';

interface CardProps {
  card: CardData;
}

export const LandingPageCard: React.FC<CardProps> = React.memo(({ card }) => (
  <Card.Root
    variant='outline'
    flexDirection={{ base: 'column', md: 'row' }}
    flexWrap='wrap'
    overflow='hidden'
    flex={1}
    minW={{ base: '100%', md: '575px', lg: '500px' }}
  >
    <Image
      src={card.image}
      alt={card.imageAlt}
      objectFit='cover'
      objectPosition={card.objectPosition}
      maxW={{ base: '100%', md: '33.33%', xl: '40%' }}
      maxHeight={{ base: '250px', md: 'none', lg: '272px' }}
      aspectRatio={{ base: '5/3', xl: '4/3' }}
    />
    <Card.Body gap='1'>
      <Card.Title>
        <Link href={card.headingHref}>{card.heading}</Link>
      </Card.Title>

      {card.paragraphs.map(paragraph => (
        <Card.Description key={paragraph.id} fontSize='md'>
          {paragraph.content}
        </Card.Description>
      ))}
    </Card.Body>
  </Card.Root>
));
