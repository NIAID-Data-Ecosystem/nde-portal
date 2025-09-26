import { Card, Flex, Image } from '@chakra-ui/react';
import React from 'react';
import { ArrowButton } from 'src/components/button.tsx/arrow-button';
import { Link } from 'src/components/link';

import { LandingPageCardType } from './types';

export const LandingPageCard: React.FC<LandingPageCardType> = card => (
  <Card.Root
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
      {/* Card Main Content */}
      <Card.Body gap='1'>
        <Card.Title>
          {card.headingHref ? (
            <Link href={card.headingHref}>{card.heading}</Link>
          ) : (
            card.heading
          )}
        </Card.Title>

        {card?.descriptions?.map(description => (
          <Card.Description key={description.id} fontSize='md'>
            {description.content}
          </Card.Description>
        ))}
      </Card.Body>

      {/* Card Footer */}
      {card.footer && (
        <Card.Footer justifyContent='flex-end' w='100%'>
          {/* Call to action buttons */}
          {card.footer.cta?.map((cta, index) => {
            return (
              <ArrowButton
                key={index}
                maxWidth={{ base: '225px', sm: 'unset' }}
                {...cta}
              >
                {cta.children}
              </ArrowButton>
            );
          })}
        </Card.Footer>
      )}
    </Flex>
  </Card.Root>
);
