import React, { useEffect, useState } from 'react';
import { Button, Flex, Icon, Text, Presence } from '@chakra-ui/react';
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
        <Flex bg='warning.subtle' alignItems='center'>
          <Button
            size='sm'
            variant='ghost'
            onClick={() => setIsMinimized(!isMinimized)}
            px={2}
            position='unset'
            bg={isMinimized ? 'warning' : 'warning.subtle'}
            borderColor='warning'
            color='text.heading'
            _hover={{ bg: 'warning.subtle' }}
            _active={{ boxShadow: 'none' }}
            _focus={{ boxShadow: 'none' }}
          >
            <Flex mx={1}>
              <Icon color='inherit'>
                <FaTriangleExclamation />
              </Icon>
            </Flex>
            {isMinimized && (
              <Text fontSize='sm' color='inherit'>
                About this query
              </Text>
            )}
          </Button>
          <Presence
            present={!isMinimized && !!selectedSearchType?.additionalInfo}
            animationName={{
              _open: 'slide-from-bottom, fade-in',
              _closed: 'slide-to-bottom, fade-out',
            }}
            animationDuration='moderate'
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
                _hover={{ bg: 'warning' }}
                _active={{ bg: 'warning', boxShadow: 'none' }}
              >
                Got it
              </Button>
            </Flex>
          </Presence>
        </Flex>
      ) : (
        <></>
      )}
    </Flex>
  );
};
