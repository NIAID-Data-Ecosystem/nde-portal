import React from 'react';
import { Box, Flex, Image, VStack, Heading } from '@chakra-ui/react';
import { CardData } from './types';
import { CardText } from './CardText';
import { Link } from 'src/components/link';

interface CardProps {
  card: CardData;
  index: number;
}

export const Card: React.FC<CardProps> = React.memo(({ card, index }) => (
  <Flex
    direction={{ base: 'column', md: 'row' }}
    flex={{ base: '1 1 100%', lg: '1 1 48%' }}
    boxShadow='sm'
    borderRadius='semi'
    overflow='hidden'
    border='1px solid'
    borderColor='gray.100'
    role='article'
    aria-labelledby={`card-heading-${index}`}
  >
    <Box
      width={{ base: '100%', md: '33.33%', lg: '40%' }}
      flexShrink={0}
      position='relative'
      aspectRatio={{ base: '5/3', lg: '4/3' }}
      maxHeight={{ base: '250px', md: 'none' }}
    >
      <Image
        src={card.image}
        alt={card.imageAlt}
        objectFit='cover'
        objectPosition={card.objectPosition}
        width='100%'
        height='100%'
      />
    </Box>
    <Box
      width={{ base: '100%', md: '66.66%', lg: '60%' }}
      px={5}
      py={5}
      display='flex'
      alignItems='flex-start'
      justifyContent='flex-start'
    >
      <VStack align='flex-start' spacing={2} w='100%'>
        <Heading
          as='h3'
          fontSize='xl'
          fontWeight='semibold'
          id={`card-heading-${index}`}
        >
          <Link href={card.headingHref}>{card.heading}</Link>
        </Heading>
        {card.paragraphs.map(paragraph => (
          <CardText key={paragraph.id}>{paragraph.content}</CardText>
        ))}
      </VStack>
    </Box>
  </Flex>
));

Card.displayName = 'Card';
