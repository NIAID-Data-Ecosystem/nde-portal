import React from 'react';
import {
  Box,
  Flex,
  Image,
  VStack,
  Heading,
  Text,
  Link as ChakraLink,
} from '@chakra-ui/react';
import NextLink from 'next/link';

const cards = [
  {
    image: '/assets/homepage/influenza-a-virus-h1n1.png',
    imageAlt:
      'Microscopic view of the influenza A virus, a key focus in infectious disease research and vaccine development.',
    heading: 'Explore Infectious and Immune-mediated Disease Data',
    body: (
      <>
        <Text
          fontWeight='400'
          lineHeight={{ base: 'short', xl: 'shorter' }}
          fontSize='sm'
        >
          NIAID funds cutting-edge research to understand, diagnose, and treat
          infectious and immune-mediated diseases.
        </Text>
        <Text
          fontWeight='400'
          lineHeight={{ base: 'short', xl: 'shorter' }}
          fontSize='sm'
        >
          Explore curated datasets and results from clinical studies for
          priority diseases such as{' '}
          <ChakraLink as={NextLink} href='/' textDecoration='underline'>
            asthma
          </ChakraLink>
          ,{' '}
          <ChakraLink as={NextLink} href='/' textDecoration='underline'>
            HIV/AIDS
          </ChakraLink>
          ,{' '}
          <ChakraLink as={NextLink} href='/' textDecoration='underline'>
            influenza
          </ChakraLink>
          ,{' '}
          <ChakraLink as={NextLink} href='/' textDecoration='underline'>
            tuberculosis
          </ChakraLink>
          ,{' '}
          <ChakraLink as={NextLink} href='/' textDecoration='underline'>
            malaria,
          </ChakraLink>{' '}
          and emerging viruses. Access the latest findings on disease
          mechanisms, biomarkers, therapeutic strategies, and more in the{' '}
          <ChakraLink as={NextLink} href='/' textDecoration='underline'>
            Diseases Page
          </ChakraLink>
          .
        </Text>
      </>
    ),
  },
  {
    image: '/assets/homepage/student-scrubs-green.png',
    imageAlt:
      'Group of four biomedical researchers collaborating in a laboratory setting.',
    heading: 'Curated Datasets from NIAID Research Programs',
    body: (
      <>
        <Text
          fontWeight='400'
          lineHeight={{ base: 'short', xl: 'shorter' }}
          fontSize='sm'
        >
          The Discovery Portal connects researchers with high-impact datasets
          from NIAID-funded programs that drive innovation in infectious and
          immune-mediated disease research.
        </Text>
        <Text
          fontWeight='400'
          lineHeight={{ base: 'short', xl: 'shorter' }}
          fontSize='sm'
        >
          Discover resources from programs like{' '}
          <ChakraLink as={NextLink} href='/' textDecoration='underline'>
            CFAR
          </ChakraLink>
          ,{' '}
          <ChakraLink as={NextLink} href='/' textDecoration='underline'>
            IMPAACT
          </ChakraLink>
          ,{' '}
          <ChakraLink as={NextLink} href='/' textDecoration='underline'>
            HIPC
          </ChakraLink>
          , and others. Explore how these collaborative networks accelerate
          biomedical discoveries in the{' '}
          <ChakraLink as={NextLink} href='/' textDecoration='underline'>
            Programs Page
          </ChakraLink>
          .
        </Text>
      </>
    ),
  },
];

export const ExplorationCards = () => {
  return (
    <Flex
      direction={{ base: 'column', xl: 'row' }}
      gap={{ base: 6, xl: 1 }}
      flexWrap='wrap'
      width='100%'
      mt={4}
    >
      {cards.map((card, i) => (
        <Flex
          key={i}
          direction={{ base: 'column', md: 'row' }}
          flex={{ base: '1 1 100%', lg: '1 1 48%' }}
          boxShadow='sm'
          borderRadius='semi'
          overflow='hidden'
          border='1px solid'
          borderColor='gray.100'
        >
          <Box
            width={{ base: '100%', md: '33.33%' }}
            flexShrink={0}
            position='relative'
            aspectRatio={{ base: '5 / 3', md: '4 / 3' }}
            maxHeight={{ base: '250px', md: 'none' }}
          >
            <Image
              src={card.image}
              alt={card.imageAlt}
              objectFit='cover'
              objectPosition={
                i === 1 ? { base: 'center', xl: '15% center' } : 'center'
              }
              width='100%'
              height='100%'
            />
          </Box>
          <Box
            width={{ base: '100%', md: '66.66%' }}
            px={{ base: 4, sm: 5 }}
            py={{ base: 4, xl: 1 }}
            display='flex'
            alignItems='flex-start'
            justifyContent='flex-start'
          >
            <VStack align='flex-start' spacing={2} w='100%'>
              <Heading as='h3' fontSize='lg' fontWeight='semibold'>
                {card.heading}
              </Heading>
              {card.body}
            </VStack>
          </Box>
        </Flex>
      ))}
    </Flex>
  );
};
