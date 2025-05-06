import React from 'react';
import { Box, Highlight, Icon, ListItem, Text } from '@chakra-ui/react';
import { useDropdownContext } from 'src/components/input-with-dropdown';
import { FaMagnifyingGlass } from 'react-icons/fa6';

export const DropdownListItem = React.memo(
  ({
    children,
    colorScheme = 'primary',
    handleSubmit,
    id,
    index,
    ontology,
    highlight,
  }: {
    children: string;
    colorScheme?: string;
    handleSubmit: () => void;
    id: string;
    index: number;
    ontology?: string;
    highlight: string | string[];
  }) => {
    const { cursor, getListItemProps } = useDropdownContext();
    return (
      <ListItem
        display='flex'
        cursor='pointer'
        px={2}
        mx={2}
        my={1}
        {...getListItemProps({
          index,
          id: `ontology-browser-search-${id}`,
          value: `/ontology-browser/${id}`,
          isSelected: cursor === index,
          onClick: () => handleSubmit(),
        })}
      >
        <Icon
          as={FaMagnifyingGlass}
          mr={2}
          mt={1.5}
          color='primary.400'
          boxSize={3}
        />
        <Box>
          {/* Ontology label */}
          {ontology && (
            <Text
              fontSize='12px'
              color={`${colorScheme}.800`}
              wordBreak='break-word'
              fontWeight='light'
              textAlign='left'
            >
              {ontology} | {id}
            </Text>
          )}

          <Text
            size='sm'
            lineHeight='short'
            color='text.body'
            wordBreak='break-word'
            fontWeight='normal'
            textAlign='left'
          >
            <Highlight
              query={highlight}
              styles={{
                fontWeight: 'bold',
                textDecoration: 'underline',
                color: `${colorScheme}.400`,
                bg: 'transparent',
              }}
            >
              {children}
            </Highlight>
          </Text>
        </Box>
      </ListItem>
    );
  },
);
