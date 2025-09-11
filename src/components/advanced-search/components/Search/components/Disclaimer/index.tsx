import React, { useEffect, useState } from 'react';
import { Button, Flex, Icon, SlideFade, Text } from '@chakra-ui/react';
import { useAdvancedSearchContext } from '../AdvancedSearchFormContext';
import { useLocalStorage } from 'usehooks-ts';
import { FaTriangleExclamation } from 'react-icons/fa6';

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
      {isMounted ? (
        <Flex bg='waning.light' alignItems='center'>
          <Button
            size='sm'
            variant='ghost'
            onClick={() => setIsMinimized(!isMinimized)}
            px={2}
            position='unset'
            bg={isMinimized ? 'waning.default' : 'waning.light'}
            borderColor='waning.default'
            color='text.heading'
            _hover={{ bg: 'waning.light' }}
            _active={{ boxShadow: 'none' }}
            _focus={{ boxShadow: 'none' }}
          >
            <Flex mx={1}>
              <Icon as={FaTriangleExclamation} color='inherit' />
            </Flex>
            {isMinimized && (
              <Text fontSize='sm' color='inherit'>
                About this query
              </Text>
            )}
          </Button>
          <SlideFade
            in={!isMinimized && !!selectedSearchType?.additionalInfo}
            offsetX={20}
            offsetY={0}
          >
            <Flex
              display={isMinimized ? 'none' : 'flex'}
              alignItems='center'
              justifyContent='flex-end'
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
                _hover={{ bg: 'waning.default' }}
                _active={{ bg: 'waning.default', boxShadow: 'none' }}
              >
                Got it
              </Button>
            </Flex>
          </SlideFade>
        </Flex>
      ) : (
        <></>
      )}
    </Flex>
  );
};
