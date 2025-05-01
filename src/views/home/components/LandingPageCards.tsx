import React from 'react';
import {
  Box,
  Flex,
  Image,
  VStack,
  Heading,
  Text,
  Link as ChakraLink,
  TextProps,
} from '@chakra-ui/react';
import NextLink from 'next/link';

type CardData = {
  image: string;
  imageAlt: string;
  heading: string;
  headingHref: string;
  paragraphs: React.ReactNode[];
  objectPosition: string;
};

const CARDS_DATA: CardData[] = [
  {
    image: '/assets/homepage/influenza-a-virus-h1n1.png',
    imageAlt:
      'Microscopic view of the influenza A virus, a key focus in infectious disease research and vaccine development.',
    heading: 'Select Diseases and Conditions',
    headingHref: '/topics#diseases',
    paragraphs: [
      <>
        Explore datasets and computational tools for diseases such as{' '}
        <ChakraLink
          as={NextLink}
          href='/topics/asthma'
          textDecoration='underline'
        >
          asthma
        </ChakraLink>
        ,{' '}
        <ChakraLink
          as={NextLink}
          href='/topics/HIV-AIDS'
          textDecoration='underline'
        >
          HIV/AIDS
        </ChakraLink>
        ,{' '}
        <ChakraLink
          as={NextLink}
          href='/topics/influenza'
          textDecoration='underline'
        >
          influenza
        </ChakraLink>
        ,{' '}
        <ChakraLink
          as={NextLink}
          href='/topics/malaria'
          textDecoration='underline'
        >
          malaria
        </ChakraLink>
        ,{' '}
        <ChakraLink
          as={NextLink}
          href='/topics/tuberculosis'
          textDecoration='underline'
        >
          tuberculosis
        </ChakraLink>
        , and{' '}
        <ChakraLink
          as={NextLink}
          href='/topics#diseases'
          textDecoration='underline'
        >
          more
        </ChakraLink>
        .
      </>,
    ],
    objectPosition: 'center',
  },
  {
    image: '/assets/homepage/student-scrubs-green.png',
    imageAlt:
      'Group of biomedical researchers collaborating in a laboratory setting.',
    heading: 'NIAID-Funded Programs',
    headingHref: '/topics#programs',
    paragraphs: [
      <>
        Find high-impact datasets and other resources from{' '}
        <ChakraLink
          as={NextLink}
          href='/topics#programs'
          textDecoration='underline'
        >
          NIAID-funded programs
        </ChakraLink>{' '}
        that are driving innovation.
      </>,
    ],
    objectPosition: 'center',
  },
];

const CardText: React.FC<TextProps> = props => (
  <Text fontWeight='400' lineHeight={'short'} fontSize='md' {...props} />
);

const LandingPageCard = ({
  card,
  index,
}: {
  card: CardData;
  index: number;
}) => (
  <Flex
    direction={{ base: 'column', md: 'row' }}
    flex={{ base: '1 1 100%', lg: '1 1 48%' }}
    boxShadow='sm'
    borderRadius='semi'
    overflow='hidden'
    border='1px solid'
    borderColor='gray.100'
  >
    <Box
      width={{ base: '100%', md: '33.33%', lg: '40%' }}
      flexShrink={0}
      position='relative'
      aspectRatio={{ base: '5 / 3', lg: '4 / 3' }}
      maxHeight={{ base: '250px', md: 'none' }}
    >
      <Image
        src={card.image}
        alt={card.imageAlt}
        objectFit='cover'
        objectPosition={card.objectPosition}
        width='100%'
        height='100%'
        loading={index === 0 ? 'eager' : 'lazy'}
      />
    </Box>
    <Box
      width={{ base: '100%', md: '66.66%', lg: '60%' }}
      px={'5'}
      py={'5'}
      display='flex'
      alignItems='flex-start'
      justifyContent='flex-start'
    >
      <VStack align='flex-start' spacing={2} w='100%'>
        <Heading as='h3' fontSize='xl' fontWeight='semibold'>
          <ChakraLink
            as={NextLink}
            href={card.headingHref}
            textDecoration='underline'
          >
            {card.heading}
          </ChakraLink>
        </Heading>
        {card.paragraphs.map((paragraph, i) => (
          <CardText key={i}>{paragraph}</CardText>
        ))}
      </VStack>
    </Box>
  </Flex>
);

export const LandingPageCards = () => {
  return (
    <Flex
      direction={{ base: 'column', xl: 'row' }}
      gap={{ base: 6, xl: 1 }}
      flexWrap='wrap'
      width='100%'
      mt={4}
    >
      {CARDS_DATA.map((card, i) => (
        <LandingPageCard key={i} card={card} index={i} />
      ))}
    </Flex>
  );
};
