import React from 'react';
import { Box, Button, Icon, Text } from '@chakra-ui/react';
import { FaAnglesLeft, FaMagnifyingGlass } from 'react-icons/fa6';
import Tooltip from 'src/components/tooltip';

// ListToggle component for toggling the visibility of the search list
// It provides a button that, when clicked, expands or collapses the search list sidebar.
export const ListToggle = ({
  label = 'Expand list of selected search terms',
  isOpen,
  toggleOpen,
}: {
  label?: string;
  isOpen: boolean;
  toggleOpen: () => void;
}) => {
  return (
    <>
      {!isOpen && (
        <Tooltip label={label}>
          <Button
            aria-label={label}
            onClick={toggleOpen}
            size='sm'
            colorScheme='gray'
            bg='white'
            variant='ghost'
            height={{ base: 'auto', lg: '100%' }}
          >
            <Text display={{ base: 'block', lg: 'none' }} mr={2}>
              Toggle Search List
            </Text>
            <Box>
              <Icon as={FaMagnifyingGlass} />
              <Icon
                display={{ base: 'none', lg: 'block' }}
                as={FaAnglesLeft}
                fill='gray.600'
                mt={4}
              />
            </Box>
          </Button>
        </Tooltip>
      )}
    </>
  );
};
