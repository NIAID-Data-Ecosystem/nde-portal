import React from 'react';
import { Box, Heading, Text, VStack } from '@chakra-ui/react';
import { RepositoryMatcherColumn } from '../types';

interface DataDictionaryProps {
  columns: RepositoryMatcherColumn[];
  presentTermsByColumnId?: Record<string, Set<string>>;
}

export const DataDictionary: React.FC<DataDictionaryProps> = ({
  columns,
  presentTermsByColumnId,
}) => {
  return (
    <Box
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
          Table Dictionary
        </Heading>
        <Text lineHeight='short'>
          Definitions of fields and values used in the Repository Matcher
        </Text>
      </VStack>
      {columns
        .sort((a, b) => a.label.localeCompare(b.label))
        .map(({ id, label, info }) => {
          if (!info) return null;
          const { description, terms } = info;
          // Restrict the listed terms to those present in the data when we
          // have a value set for this column; otherwise list all terms.
          const presentTerms = presentTermsByColumnId?.[id];
          const visibleTerms = presentTerms
            ? terms?.filter(term => presentTerms.has(term.label || ''))
            : terms;
          return (
            <Box key={label} lineHeight='tall' width='100%'>
              <Box
                bg='niaid.50'
                borderTop='1px solid'
                borderBottom='1px solid'
                borderColor='niaid.100'
                p={2}
                px={4}
                width='100%'
              >
                {label && (
                  <Text
                    fontWeight='semibold'
                    color='text.heading'
                    fontSize='md'
                  >
                    {label}
                  </Text>
                )}
                {description && <Text color='gray.800'>{description}</Text>}
              </Box>
              {visibleTerms && visibleTerms.length > 0 && (
                <VStack mx={6} my={4} alignItems='flex-start'>
                  {visibleTerms.map(term => (
                    <Box key={term.label}>
                      <Text fontWeight='semibold'>{term.label}</Text>
                      <Text as='span' fontWeight='normal'>
                        {term.description}
                      </Text>
                    </Box>
                  ))}
                </VStack>
              )}
            </Box>
          );
        })}
    </Box>
  );
};
