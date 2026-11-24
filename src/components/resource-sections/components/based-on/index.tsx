import {
  Accordion,
  Box,
  Flex,
  HStack,
  Icon,
  Stack,
  Text,
  VStack,
} from '@chakra-ui/react';
import { castArray } from 'lodash';
import React, { useMemo } from 'react';
import { FaMinus, FaPlus } from 'react-icons/fa6';
import { ColumnDef, DataTable, LinkCell } from 'src/components/table';
import { TagWithUrl } from 'src/components/tag-with-url';
import Tooltip from 'src/components/tooltip';
import { formatDate } from 'src/utils/api/helpers';
import { IsBasedOn, IsBasisFor } from 'src/utils/api/types';

import { ContentHeader, ContentHeaderProps } from '../section';

/*
The resource page's "Based On" table (the shared DataTable; see
src/components/table/README.md).

Sizes are content widths: the cells' 2 × 16px padding comes on top. Name keeps
the legacy table's 280px border-box minimum (248px of content). Description,
once a full-width line under each row, is now a column, so Type and Date
Published are narrower than the legacy 200px to make room: the four columns
fit the resource page's content (816px at a 1440px window) without scrolling
sideways, as the legacy three did.
*/

interface Item extends IsBasedOn, IsBasisFor {}

interface BasedOnRow extends Item {
  name: string;
  url: string;
  /** The item's `@type` and its `additionalType`s. */
  type: { name?: string; url?: string }[];
}

/** Fills in a name and url where the item lacks them, and lists its types. */
const toRow = (item: Item): BasedOnRow => {
  let url = item?.url || '';
  let name = item?.name || '';

  if (!name && item?.codeRepository) {
    name = item?.codeRepository;
  }
  if (name?.includes('http') && !url) {
    url = name;
  }
  const additionalType = Array.isArray(item.additionalType)
    ? item.additionalType
    : [item.additionalType];
  return {
    ...item,
    name,
    url,
    type: [{ name: item['@type'] }, ...additionalType].filter(
      (type): type is { name?: string; url?: string } => Boolean(type),
    ),
  };
};

/** The name (linked when it has a url) and the item's ID, PMID and DOI. */
const NameCell = ({ item }: { item: BasedOnRow }) => (
  <>
    <Box>
      {item.name ? (
        item.url ? (
          <LinkCell href={item.url} label={item.name} external />
        ) : (
          item.name
        )
      ) : (
        <Text as='span' fontStyle='italic' color='gray.600'>
          No name provided
        </Text>
      )}
    </Box>
    {(item.identifier || item.pmid || item.doi) && (
      <Stack gap={1} mt={1} alignItems='flex-start'>
        {item.identifier && (
          <TagWithUrl
            // only add url here if there is no name (name field is default used for the link)
            href={!item.name && item.url ? item.url : ''}
            label='ID |'
            isExternal
          >
            {item.identifier}
          </TagWithUrl>
        )}
        {item.pmid && (
          <TagWithUrl label='PMID |' isExternal>
            {item.pmid}
          </TagWithUrl>
        )}
        {item.doi && (
          <TagWithUrl label='DOI |' isExternal>
            {item.doi}
          </TagWithUrl>
        )}
      </Stack>
    )}
  </>
);

/** Each type as a tag, linking to its ontology entry when it has one. */
const TypeCell = ({ types }: { types: BasedOnRow['type'] }) => (
  <>
    {types.map((type, idx) => {
      if (!type?.name && !type?.url) return null;
      return (
        <Tooltip
          key={idx}
          content='Show ontology information.'
          disabled={!type?.url}
        >
          <span>
            <TagWithUrl
              href={type?.url || ''}
              colorPalette='primary'
              isExternal
            >
              {type?.name || type?.url || 'No type provided'}
            </TagWithUrl>
          </span>
        </Tooltip>
      );
    })}
  </>
);

export const BASED_ON_COLUMNS: ColumnDef<BasedOnRow>[] = [
  {
    id: 'name',
    header: 'Name',
    sort: true,
    size: { min: 248 },
    // "No data" only when there's nothing at all to show.
    cell: ({ row }) =>
      row.name || row.identifier || row.pmid || row.doi ? (
        <NameCell item={row} />
      ) : null,
  },
  {
    id: '@type',
    header: 'Type',
    sort: true,
    size: { min: 140, max: 140 },
    cell: ({ row }) =>
      row.type.some(type => type.name || type.url) ? (
        <TypeCell types={row.type} />
      ) : null,
  },
  {
    id: 'datePublished',
    header: 'Date Published',
    type: 'date',
    sort: true,
    accessor: row => formatDate(row.datePublished),
  },
  {
    id: 'description',
    header: 'Description',
    type: 'longText',
    size: { min: 200 },
  },
];

// Their order in the record is stable, and nothing in them is unique.
const getBasedOnRowId = (_: BasedOnRow, index: number) => String(index);

// BasedOnTable: a paginated, sortable table of the works this one is based on.
export const BasedOnTable = ({
  loading,
  title,
  subtitle,
  items,
}: {
  loading: boolean;
  /** The section's title, shown above the table and naming it. */
  title?: ContentHeaderProps['title'];
  subtitle?: ContentHeaderProps['subtitle'];
  items: Item[];
}) => {
  const rows = useMemo(() => items.map(toRow), [items]);

  if (!loading && items?.length === 0) return null;

  return (
    <Stack gap={4}>
      {title && (
        <ContentHeader
          title={title}
          subtitle={subtitle}
          titleProps={{ as: 'h4' }}
        />
      )}
      <DataTable
        label={title || 'Based on'}
        data={rows}
        columns={BASED_ON_COLUMNS}
        getRowId={getBasedOnRowId}
        pagination
        status={{ loading }}
      />
    </Stack>
  );
};

// BasedOnActionProcess: describes how a DataCollection was generated.
// Detailed description and steps are nested under the action name,
// see https://github.com/NIAID-Data-Ecosystem/nde-portal/issues/444#issuecomment-5267360271
export const BasedOnActionProcess = ({
  name,
  description,
  actionProcess,
}: IsBasedOn) => {
  // step may come back from the API as a single string or a list.
  const steps = castArray(actionProcess?.step ?? []).filter(Boolean);
  const showAccordion = description || steps.length > 0;
  if (!showAccordion) return <>No details provided.</>;

  return (
    <Stack
      w='100%'
      bg='info.subtle'
      borderRadius='semi'
      fontSize='sm'
      // lineHeight='moderate'
      px={4}
      py={2}
    >
      {/* "How to" steps are collapsed by default to keep the card compact. */}
      <Accordion.Root collapsible>
        <Accordion.Item border='none' value='action-process'>
          <Accordion.ItemContext>
            {({ expanded }) => (
              <>
                <Flex
                  flexDirection='row'
                  justifyContent='space-between'
                  lineHeight='short'
                  flexWrap='wrap'
                >
                  {showAccordion && (
                    <Accordion.ItemTrigger px={0} py={0}>
                      {/* Name of action */}
                      <Text fontWeight='semibold' flex={1} fontSize='sm'>
                        {name || 'Generation process'}
                      </Text>
                      <HStack gap={1} fontSize='xs' fontWeight='light'>
                        <Text data-accordion-control>
                          {expanded ? 'hide' : 'show details'}
                        </Text>

                        <Icon as={expanded ? FaMinus : FaPlus} />
                      </HStack>
                    </Accordion.ItemTrigger>
                  )}
                </Flex>
                {showAccordion && (
                  <Accordion.ItemContent px={0} pt={1} pb={1}>
                    <Accordion.ItemBody>
                      <VStack alignItems='start' gap={1.5} fontSize='sm'>
                        {description && (
                          <Text fontSize='inherit'>{description}</Text>
                        )}

                        {steps.map((step, index) => (
                          <Text key={index} fontSize='inherit'>
                            {step}
                          </Text>
                        ))}
                      </VStack>
                    </Accordion.ItemBody>
                  </Accordion.ItemContent>
                )}
              </>
            )}
          </Accordion.ItemContext>
        </Accordion.Item>
      </Accordion.Root>
    </Stack>
  );
};
