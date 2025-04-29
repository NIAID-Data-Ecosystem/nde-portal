import React from 'react';
import { Box, Heading, HStack, ListItem, Text } from '@chakra-ui/react';
import { BadgeWithTooltip } from 'src/components/badges';
import type { SourceResponse } from 'src/pages/sources';
import { formatDate } from 'src/utils/api/helpers';

interface Sidebar {
  data: SourceResponse[];
}

const Sidebar: React.FC<Sidebar> = ({ data }) => {
  const sourceNames = [];
  for (const source in data) {
    if (data[source]) {
      sourceNames.push([data[source]?.name || source, source]);
    }
  }

  sourceNames.sort((a, b) => a[0].localeCompare(b[0]));
  return (
    <>
      {sourceNames.map(([name, id], index) => {
        return (
          <ListItem key={index} _hover={{ bg: 'gray.50' }} cursor='pointer'>
            <Box
              as='a'
              display='block'
              href={`#${name.replace(/\s+/g, '-')}`}
              px={[2, 4, 6]}
              py={4}
            >
              <HStack alignItems='center'>
                <Heading size='h6' alignItems='center'>
                  {name}{' '}
                </Heading>
                {data[+id].isNiaidFunded && (
                  <BadgeWithTooltip colorScheme='blue' variant='subtle'>
                    NIAID
                  </BadgeWithTooltip>
                )}
              </HStack>
              {data[+id].dateModified ? (
                <Text fontWeight='medium' fontSize='sm'>
                  Latest Release {formatDate(data[+id].dateModified)}
                </Text>
              ) : (
                <Text fontWeight='medium' fontSize='sm'>
                  Latest Release N/A
                </Text>
              )}
            </Box>
          </ListItem>
        );
      })}
    </>
  );
};

export default Sidebar;
