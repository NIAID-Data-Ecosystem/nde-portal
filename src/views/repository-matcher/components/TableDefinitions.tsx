import React from 'react';
import { Box, Heading, Text, VStack } from '@chakra-ui/react';
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
      spacing={2}
      my={6}
      fontSize='sm'
      bg='#fff'
      borderRadius='semi'
      border='1px solid'
      borderColor='gray.100'
      overflow='hidden'
    >
      <VStack p={4} alignItems='flex-start'>
        <Heading as='h2' fontSize='lg'>
          Data Dictionary
        </Heading>
        <Text lineHeight='short'>
          [Descriptive text about the data dictionary]
        </Text>
      </VStack>
      {columns
        .sort((a, b) => a.label.localeCompare(b.label))
        .map(({ label, info }) => {
          if (!info) return null;
          const { description, terms } = info;
          return (
            <VStack
              key={label}
              align='start'
              spacing={2}
              lineHeight='tall'
              width='100%'
              pb={4}
            >
              <Box bg='niaid.50' p={2} px={4} width='100%'>
                {label && (
                  <Text
                    fontWeight='semibold'
                    color='text.heading'
                    fontSize='md'
                  >
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
                <Text key={i} ml={6} fontWeight='semibold'>
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
