import React, { useEffect, useState } from 'react';
import { MetadataIcon } from 'src/components/icon';
import { Box, Button, Flex, SlideFade, Text } from 'nde-design-system';
import { useAdvancedSearchContext } from '../AdvancedSearchFormContext';
import { useLocalStorage } from 'usehooks-ts';

export const Disclaimer = () => {
  const { selectedSearchType } = useAdvancedSearchContext();
  const [isMinimized, setIsMinimized] = useLocalStorage(
    'query-disclaimer-minimize',
    false,
  );

  const [isMounted, setIsMounted] = useState(false); // local storage for SSR.

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <Flex
      visibility={selectedSearchType?.additionalInfo ? 'visible' : 'hidden'}
      w='100%'
      justifyContent='flex-end'
      alignItems='center'
      px={2}
      mt={1}
    >
      <Button
        size='sm'
        variant='ghost'
        onClick={() => setIsMinimized(!isMinimized)}
        _active={{ boxShadow: 'none' }}
        _focus={{ boxShadow: 'none' }}
        px={2}
        position='unset'
      >
        <Box mx={1}>
          <MetadataIcon id='info' glyph='info' fill='primary.700' />
        </Box>
        <Text fontSize='sm'>About this query</Text>
      </Button>
      {isMounted && (
        <SlideFade
          in={!isMinimized && !!selectedSearchType?.additionalInfo}
          offsetX={20}
          offsetY={0}
        >
          <Flex
            display={isMinimized ? 'none' : 'flex'}
            alignItems='center'
            justifyContent='flex-end'
            py={1}
          >
            <Text fontStyle='italic' fontWeight='light' fontSize='sm'>
              {selectedSearchType.additionalInfo}
            </Text>
            <Button
              variant='ghost'
              onClick={() => setIsMinimized(true)}
              size='sm'
              textDecoration='underline'
              px={2}
              mx={1}
              position='unset'
            >
              Got it
            </Button>
          </Flex>
        </SlideFade>
      )}
    </Flex>
  );
};
