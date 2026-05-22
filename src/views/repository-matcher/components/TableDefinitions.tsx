import React from 'react';
import { Box, Text, VStack } from '@chakra-ui/react';
import { RepositoryMatcherColumn } from '../types';

interface TableDefinitionsProps {
  columns: RepositoryMatcherColumn[];
}

export const TableDefinitions: React.FC<TableDefinitionsProps> = ({
  columns,
}) => {
  return (
    <VStack
      align='start'
      spacing={4}
      my={6}
      fontSize='sm'
      bg='#fff'
      borderRadius='semi'
      border='1px solid'
      borderColor='gray.100'
      p={4}
    >
      {columns.map(({ label, info }) => {
        if (!info) return null;
        const { description, terms } = info;
        return (
          <VStack key={label} align='start' spacing={2} lineHeight='short'>
            <Box>
              {label && (
                <Text fontWeight='semibold' color='text.heading' fontSize='md'>
                  {label}
                </Text>
              )}
              {description && (
                <Text color='gray.800' mb={2}>
                  {description}
                </Text>
              )}
            </Box>
            {terms?.map((term, i) => (
              <Text key={i} ml={2} fontWeight='semibold'>
                {term.label}:{' '}
                <Text as='span' fontWeight='normal'>
                  {term.description}
                </Text>
              </Text>
            ))}
          </VStack>
        );
      })}
    </VStack>
  );
};
