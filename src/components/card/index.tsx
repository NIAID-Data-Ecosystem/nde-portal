import {
  Button,
  Card as ChakraCard,
  Flex,
  Image,
  Skeleton,
  SkeletonProps,
  StackProps,
  Text,
  VStack,
} from '@chakra-ui/react';
import NextLink from 'next/link';
import React from 'react';
import { Link } from 'src/components/link';

import { CardType } from './types';

export const CardWithImage: React.FC<CardType> = card => (
  <ChakraCard.Root
    variant='outline'
    flexDirection={{ base: 'column', md: 'row' }}
    flexWrap='wrap'
    overflow='hidden'
    flex={1}
    minW={{ base: '100%', md: '575px', lg: '500px' }}
  >
    <Image
      flex={1}
      src={card.image.src}
      alt={card.image.alt}
      objectFit='cover'
      maxWidth={{ base: '100%', md: '33.33%', xl: '40%' }}
      maxHeight={{ base: '250px', md: 'none', lg: '272px' }}
      aspectRatio={{ base: '5/3', xl: '4/3' }}
      {...card.image}
    />
    <Flex flexDirection='column' flex={1}>
      {/* ChakraCard Main Content */}
      <ChakraCard.Body gap='1'>
        <ChakraCard.Title>
          {card.headingHref ? (
            <Link href={card.headingHref}>{card.heading}</Link>
          ) : (
            card.heading
          )}
        </ChakraCard.Title>

        {card?.descriptions?.map(description => (
          <ChakraCard.Description key={description.id}>
            {description.content}
          </ChakraCard.Description>
        ))}
        {card.children}
      </ChakraCard.Body>

      {/* ChakraCard Footer */}
      {card.footer && (
        <ChakraCard.Footer justifyContent='flex-end' w='100%'>
          {/* Call to action buttons */}
          {card.footer.cta?.map((cta, index) => {
            return (
              <Button
                key={index}
                asChild={!!cta.href}
                maxWidth={{ base: '225px', sm: 'unset' }}
                {...cta}
              >
                {cta.href ? (
                  <NextLink href={cta.href}>
                    <Text truncate w='100%'>
                      {cta.children}
                    </Text>
                  </NextLink>
                ) : (
                  <Text truncate w='100%'>
                    {cta.children}
                  </Text>
                )}
              </Button>
            );
          })}
        </ChakraCard.Footer>
      )}
    </Flex>
  </ChakraCard.Root>
);

export const Card = {
  Stack: CardStack,
  Item: CardItem,
  Skeleton: CardSkeleton,
};
