import React, { useState } from 'react';
import {
  Badge,
  Box,
  Flex,
  IconButton,
  ListItem,
  Tag,
  TagLabel,
  TagRightIcon,
  Text,
  UnorderedList,
} from 'nde-design-system';
import MetadataFieldsConfig from 'configs/resource-fields.json';
import { getTypeLabel } from './helpers';
import { FlattenedItem } from '../../types';
import { transformFieldName } from '../../../Search/components/FieldSelect/helpers';
import { getUnionTheme } from 'src/components/advanced-search/utils/query-helpers';
import { FaCaretDown } from 'react-icons/fa';
import { FieldSelect } from '../../../Search';

interface ItemContentProps {
  childCount?: number;
  value: FlattenedItem['value'];
  id: FlattenedItem['id'];
  index: FlattenedItem['index'];
}
type MetadataField = (typeof MetadataFieldsConfig)[number];

const FieldComponent = ({
  field,
  colorScheme,
}: {
  field: MetadataField;
  colorScheme: string;
}) => {
  const [toggleFieldMenu, setToggleFieldMenu] = useState(false);

  return (
    <>
      <Tag colorScheme={colorScheme} variant='subtle' size='sm'>
        <TagLabel>{field.name}</TagLabel>
        <IconButton
          as={FaCaretDown}
          colorScheme={colorScheme}
          aria-label='Change field for term'
          variant='ghost'
          p={1}
          ml={1}
          onClick={() => {
            setToggleFieldMenu(!toggleFieldMenu);
          }}
          cursor='pointer'
          transition='transform 250ms ease'
          transform={!toggleFieldMenu ? `rotate(-90deg)` : `rotate(0deg)`}
        />
      </Tag>
      {/* <FieldSelect /> */}
    </>
  );
};

export const ItemContent = ({ childCount, value }: ItemContentProps) => {
  const { field, term, union } = value;

  const fieldDetails = MetadataFieldsConfig.find(field => {
    if (value.field === '_exists_' || value.field === '-_exists_') {
      return field.property === value.term;
    }

    return field.property === value.field;
  }) as MetadataField;

  const getDisplayTerm = (value: FlattenedItem['value']) => {
    if (value.field === '_exists_' || value.field === '-_exists_') {
      return (
        <span>
          Must{' '}
          <Text as='span' textDecoration='underline'>
            {value.field === '-_exists_' ? 'not' : ''}
          </Text>{' '}
          contain{' '}
          <Text as='span' fontWeight='bold'>
            {term ? transformFieldName(fieldDetails) : ''}
          </Text>{' '}
          field.
        </span>
      );
    }
    return <span>{value.term}</span>;
  };

  return (
    <Flex flex={1} alignItems='center'>
      <Box flex={1}>
        {!childCount && field?.format !== 'enum' && field?.type !== 'date' && (
          // Type of search such as contains, exact, etc.
          <Text
            fontWeight='semibold'
            fontFamily='heading'
            fontSize='10px'
            textTransform='uppercase'
          >
            {getTypeLabel(value)}
          </Text>
        )}

        {/* Formatted query string */}
        <Text fontWeight={childCount ? 'semibold' : 'normal'}>
          {childCount ? term : getDisplayTerm(value)}
        </Text>
      </Box>

      {/* Don't show field if it's an exists type or parent container*/}
      {!childCount && value.field && (
        <FieldComponent
          field={fieldDetails}
          colorScheme={union ? getUnionTheme(union).colorScheme : 'gray'}
        />
      )}
    </Flex>
  );
};
