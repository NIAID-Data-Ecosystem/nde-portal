import { Box, Highlight, Icon, List, Text } from '@chakra-ui/react';
import React from 'react';
import { FaMagnifyingGlass } from 'react-icons/fa6';
import { useDropdownContext } from 'src/components/input-with-dropdown';

export const DropdownListItem = React.memo(
  ({
    children,
    colorPalette = 'primary',
    handleSubmit,
    id,
    index,
    ontology,
    highlight,
  }: {
    children: string;
    colorPalette?: string;
    handleSubmit: () => void;
    id: string;
    index: number;
    ontology?: string;
    highlight: string | string[];
  }) => {
    const { cursor, getListItemProps } = useDropdownContext();
    return (
      <List.Item
        display='flex'
        cursor='pointer'
        px={2}
        mx={2}
        {...getListItemProps({
          index,
          id: `ontology-browser-search-${id}`,
          value: `/ontology-browser/${id}`,
          isSelected: cursor === index,
          onClick: () => handleSubmit(),
        })}
      >
        <Icon mr={2} mt={1.5} color='primary.400' boxSize={3}>
          <FaMagnifyingGlass />
        </Icon>
        <Box>
          {/* Ontology label */}
          {ontology && (
            <Text
              fontSize='12px'
              color={`${colorPalette}.800`}
              wordBreak='break-word'
              fontWeight='light'
              textAlign='left'
            >
              {ontology} | {id}
            </Text>
          )}

          {/* No fontSize: v2 passed `size='sm'`, which the Text theme had no
              sizes for, so the label rendered at the inherited 16px. */}
          <Text
            color='text.body'
            fontWeight='normal'
            lineHeight='moderate'
            textAlign='left'
            wordBreak='break-word'
          >
            {/* v2 matched case-insensitively; v3 needs `ignoreCase`. */}
            <Highlight
              query={highlight}
              ignoreCase
              styles={{
                fontWeight: 'bold',
                textDecoration: 'underline',
                color: `${colorPalette}.600`,
                bg: 'transparent',
              }}
            >
              {children}
            </Highlight>
          </Text>
        </Box>
      </List.Item>
    );
  },
);
