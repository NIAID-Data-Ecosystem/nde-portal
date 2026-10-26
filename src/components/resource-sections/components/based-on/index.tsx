import {
  Accordion,
  Box,
  Button,
  Flex,
  Heading,
  HStack,
  Icon,
  Skeleton,
  Stack,
  Table,
  Text,
  useDisclosure,
  VisuallyHidden,
  VStack,
} from '@chakra-ui/react';
import { castArray, uniqueId } from 'lodash';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { FaMinus, FaPlus } from 'react-icons/fa6';
import { Link } from 'src/components/link';
import { Cell, EmptyCell, Th } from 'src/components/table/components/cell';
import { TablePagination } from 'src/components/table/components/pagination';
import { Row } from 'src/components/table/components/row';
import { TableContainer } from 'src/components/table/components/table-container';
import { TableWrapper } from 'src/components/table/components/wrapper';
import { getTruncatedText } from 'src/components/table/helpers';
import { useTableSort } from 'src/components/table/hooks/useTableSort';
import { TagWithUrl } from 'src/components/tag-with-url';
import Tooltip from 'src/components/tooltip';
import { IsBasedOn, IsBasisFor } from 'src/utils/api/types';

import { SectionHeader, SectionHeaderProps } from '../section';

// TruncatedDescription: Component for displaying truncated text with 'read more/less' option
const TruncatedDescription = React.memo(
  ({ description }: { description: Item['description'] }) => {
    const { open, onToggle } = useDisclosure();

    if (!description) return <></>;

    const { text, hasMore } = getTruncatedText(description, open);
    return text ? (
      <Text fontSize='inherit' w='100%'>
        {text}
        {!open && hasMore ? '...' : ''}
        {hasMore ? (
          <Button
            variant='plain'
            textDecoration='underline'
            mx={1}
            onClick={onToggle}
          >
            {open ? 'read less' : 'read more'}
          </Button>
        ) : (
          <></>
        )}
      </Text>
    ) : (
      <></>
    );
  },
);

// [ROW_SIZES]: num of rows per page
const ROW_SIZES = [5, 10, 50, 100];

// Define columns for the table with their respective properties
const COLUMNS = [
  { key: 'name', title: 'Name' },
  {
    key: '@type',
    title: 'Type',
    props: { w: '200px', maxW: '200px', minW: 'unset' },
  },
  {
    key: 'datePublished',
    title: 'Date Published',
    props: { w: '200px', maxW: '200px', minW: 'unset' },
  },
];

interface Item extends IsBasedOn, IsBasisFor {}
type Items = Item[];

interface Row extends Item {
  key: string;
  type: { name?: string; url?: string }[];
}

type Rows = Row[];
// BasedOnTable: Main component for rendering a paginated and sortable table
export const BasedOnTable = ({
  id,
  loading,
  caption,
  title,
  subtitle,
  items,
  columns = COLUMNS,
}: {
  id: string;
  loading: boolean;
  caption: string;
  title?: SectionHeaderProps['title'];
  subtitle?: SectionHeaderProps['subtitle'];
  items: Items;
  columns?: { key: string; title: string; props?: any }[];
}) => {
  // State and memoization hooks for handling unique IDs, sorting, and pagination
  const itemsWithUniqueId = useMemo(
    () =>
      items.map((item, idx) => {
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
        const type = item['@type'];
        return {
          ...item,
          key: uniqueId(`list-item-${item.identifier || idx}`),
          name,
          url,
          type: [{ name: type }, ...additionalType].filter(Boolean),
        };
      }),
    [items],
  );
  // sort data based on column sorting
  const accessor = useCallback((v: any) => {
    return v;
  }, []);

  // Hook for sorting table data
  const [{ data, orderBy, sortBy }, updateSort] = useTableSort({
    data: itemsWithUniqueId,
    accessor,
  });
  // [size]: num of rows per page
  const [size, setSize] = useState(ROW_SIZES[0]);

  // [from]: current page number
  const [from, setFrom] = useState(0);

  // [rows]: all rows to display
  const [rows, setRows] = useState<Rows>(data);

  useEffect(() => {
    // update rows to display based on current page number and num of rows per page
    setRows(data.slice(from * size, from * size + size));
  }, [data, size, from]);

  if (!loading && items?.length === 0) return <></>;

  return (
    <Skeleton loading={!!loading} overflow='auto'>
      <Stack gap={4}>
        {title && (
          <SectionHeader
            title={title}
            subtitle={subtitle}
            titleProps={{ as: 'h4' }}
          />
        )}

        <TableWrapper colorPalette='primary' size='sm'>
          <TableContainer>
            <Table.Root
              role='table'
              size='sm'
              aria-label={title}
              aria-describedby={caption}
              aria-rowcount={rows.length}
            >
              {/* Note: keep for accessibility */}
              <VisuallyHidden id={`table-caption-${id}`} asChild>
                <caption>{title}</caption>
              </VisuallyHidden>
              <thead>
                <Table.Row role='row' flex='1' display='flex' w='100%'>
                  {columns.map(column => {
                    return (
                      <Th
                        key={`table-col-th-${column.key}`}
                        label={column.title}
                        isSelected={column.key === orderBy}
                        borderBottomColor='primary.200'
                        isSortable={true}
                        tableSortToggleProps={{
                          isSelected: column.key === orderBy,
                          sortBy,
                          handleToggle: (sortByAsc: boolean) => {
                            updateSort(column.key, sortByAsc);
                          },
                        }}
                        {...column.props}
                      ></Th>
                    );
                  })}
                </Table.Row>
              </thead>
              <tbody>
                {rows.map(item => {
                  return (
                    <React.Fragment key={`table-tr-${item.key}`}>
                      <Row
                        borderColor='primary.100'
                        flexDirection='column'
                        py={1}
                      >
                        <Flex role='cell' alignItems='center' asChild>
                          <td>
                            {columns.map(column => {
                              return (
                                <Cell
                                  key={`table-td-${item.key}-${column.key}`}
                                  css={{ '& > div': { my: 0 } }}
                                  {...column.props}
                                >
                                  {/* name */}
                                  {column.key === 'name' && (
                                    <Box>
                                      <Text>
                                        {item.name ? (
                                          item.url ? (
                                            <Link
                                              href={item.url}
                                              isExternal
                                              lineHeight='shorter'
                                            >
                                              {item.name}
                                            </Link>
                                          ) : (
                                            item.name
                                          )
                                        ) : (
                                          <EmptyCell label='No name provided' />
                                        )}
                                      </Text>
                                      {(item.identifier ||
                                        item.pmid ||
                                        item.doi) && (
                                        <Stack gap={1} mt={1}>
                                          {item.identifier && (
                                            <TagWithUrl
                                              // only add url here if there is no name (name field is default used for the link)
                                              href={
                                                !item.name && item.url
                                                  ? item.url
                                                  : ''
                                              }
                                              label='ID |'
                                              isExternal
                                            >
                                              {item.identifier}
                                            </TagWithUrl>
                                          )}
                                          {item.pmid && (
                                            <TagWithUrl
                                              label='PMID |'
                                              isExternal
                                            >
                                              {item.pmid}
                                            </TagWithUrl>
                                          )}
                                          {item.doi && (
                                            <TagWithUrl
                                              label='DOI |'
                                              isExternal
                                            >
                                              {item.doi}
                                            </TagWithUrl>
                                          )}
                                        </Stack>
                                      )}
                                    </Box>
                                  )}
                                  {/* type */}
                                  {column.key === '@type' &&
                                    (item.type.length > 0 &&
                                    item.type.some(type => {
                                      return type.name || type.url;
                                    }) ? (
                                      <>
                                        {item.type.map((type, idx) => {
                                          if (!type?.name && !type?.url)
                                            return <React.Fragment key={idx} />;
                                          return (
                                            <Tooltip
                                              key={idx}
                                              content={
                                                type?.url
                                                  ? 'Show ontology information.'
                                                  : ''
                                              }
                                            >
                                              <span>
                                                <TagWithUrl
                                                  href={type?.url || ''}
                                                  colorPalette='primary'
                                                  isExternal
                                                >
                                                  {type?.name ||
                                                    type?.url ||
                                                    'No type provided'}
                                                </TagWithUrl>
                                              </span>
                                            </Tooltip>
                                          );
                                        })}
                                      </>
                                    ) : (
                                      <EmptyCell />
                                    ))}
                                  {/* datePublished */}
                                  {column.key === 'datePublished' &&
                                    (item.datePublished ? (
                                      <>
                                        {new Date(
                                          item['datePublished'] as string,
                                        ).toLocaleDateString('en-US', {
                                          year: 'numeric',
                                          month: 'short',
                                          day: 'numeric',
                                        })}
                                      </>
                                    ) : (
                                      <EmptyCell />
                                    ))}
                                </Cell>
                              );
                            })}
                          </td>
                        </Flex>

                        {item.description && (
                          <Box
                            role='cell'
                            px={3}
                            my={2}
                            lineHeight='moderate'
                            whiteSpace='pre-wrap'
                            wordBreak='break-word'
                            fontWeight='normal'
                            asChild
                          >
                            <td>
                              <TruncatedDescription
                                description={item.description}
                              />
                            </td>
                          </Box>
                        )}
                      </Row>
                    </React.Fragment>
                  );
                })}
              </tbody>
            </Table.Root>
          </TableContainer>
          <TablePagination
            total={items.length}
            size={size}
            setSize={setSize}
            from={from}
            setFrom={setFrom}
            pageSizeOptions={ROW_SIZES}
            colorPalette='primary'
            css={{
              '>div': { py: 1 },
            }}
          />
        </TableWrapper>
      </Stack>
    </Skeleton>
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

                        <Icon>{expanded ? <FaMinus /> : <FaPlus />}</Icon>
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
