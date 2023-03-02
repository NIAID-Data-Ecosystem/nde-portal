import React from 'react';
import { Box, Heading, ListItem, Text } from 'nde-design-system';
import { formatDate } from 'src/utils/api/helpers';
import { SourceResponse } from 'src/pages/sources';

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
              href={`#${name}`}
              aria-label={`Go to ${name} section`}
              px={[2, 4, 6]}
              py={4}
            >
              <Heading size='h6'>
                {name} <br />
              </Heading>
              <Text fontWeight='medium' fontSize='sm'>
                Latest Release {formatDate(data[+id].dateModified)}
              </Text>
            </Box>
          </ListItem>
        );
      })}
    </>
  );
};

export default Sidebar;
