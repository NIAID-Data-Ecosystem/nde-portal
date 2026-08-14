import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Accordion,
  AccordionButton,
  AccordionItem,
  AccordionPanel,
  Box,
  Button,
  Flex,
  Heading,
  Icon,
  Skeleton,
  Stack,
  Table,
  Text,
  Tr,
  VisuallyHidden,
  useDisclosure,
  Tooltip,
  VStack,
} from '@chakra-ui/react';
import { Link } from 'src/components/link';
import { IsBasedOn, IsBasisFor } from 'src/utils/api/types';
import { castArray, uniqueId } from 'lodash';
import { FaMinus, FaPlus } from 'react-icons/fa6';
import { Cell, EmptyCell, Th } from 'src/components/table/components/cell';
import { Row } from 'src/components/table/components/row';
import { TableContainer } from 'src/components/table/components/table-container';
import { getTruncatedText } from 'src/components/table/helpers';
import { useTableSort } from 'src/components/table/hooks/useTableSort';
import { TableWrapper } from 'src/components/table/components/wrapper';
import { TablePagination } from 'src/components/table/components/pagination';
import { TagWithUrl } from 'src/components/tag-with-url';

// TruncatedDescription: Component for displaying truncated text with 'read more/less' option
const TruncatedDescription = React.memo(
  ({ description }: { description: Item['description'] }) => {
    const { isOpen, onToggle } = useDisclosure();

    if (!description) return <></>;

    const { text, hasMore } = getTruncatedText(description, isOpen);
    return text ? (
      <Text fontSize='inherit' w='100%'>
        {text}
        {!isOpen && hasMore ? '...' : ''}
        {hasMore ? (
          <Button
            variant='link'
            textDecoration='underline'
            mx={1}
            onClick={onToggle}
          >
            {isOpen ? 'read less' : 'read more'}
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
  isLoading,
  caption,
  title,
  items,
  columns = COLUMNS,
}: {
  id: string;
  isLoading: boolean;
  caption: string;
  title?: string;
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

  if (!isLoading && items?.length === 0) return <></>;

  return (
    <Skeleton isLoaded={!isLoading} overflow='auto'>
      {title && (
        <Heading as='h4' fontSize='sm' mx={1} mb={4} fontWeight='semibold'>
          {title}
        </Heading>
      )}
      <TableWrapper colorScheme='primary'>
        <TableContainer>
          <Table
            role='table'
            aria-label={title}
            aria-describedby={caption}
            aria-rowcount={rows.length}
          >
            {/* Note: keep for accessibility */}
            <VisuallyHidden id={`table-caption-${id}`} as='caption'>
              {title}
            </VisuallyHidden>
            <thead>
              <Tr role='row' flex='1' display='flex' w='100%'>
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
              </Tr>
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
                      <Flex as='td' role='cell' alignItems='center'>
                        {columns.map(column => {
                          return (
                            <Cell
                              key={`table-td-${item.key}-${column.key}`}
                              sx={{ '>div': { my: 0 } }}
                              {...column.props}
                            >
                              {/* name */}
                              {column.key === 'name' && (
                                <Box>
                                  <Text fontSize='xs'>
                                    {item.name ? (
                                      item.url ? (
                                        <Link
                                          href={item.url}
                                          isExternal
                                          lineHeight={'shorter'}
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
                                    <Stack spacing={1} mt={1}>
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
                                          label={
                                            type?.url
                                              ? 'Show ontology information.'
                                              : ''
                                          }
                                          hasArrow
                                          bg='white'
                                          color='text.body'
                                          fontWeight='normal'
                                          fontSize='12px'
                                          boxShadow='base'
                                        >
                                          <span>
                                            <TagWithUrl
                                              href={type?.url || ''}
                                              colorScheme='primary'
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
                      </Flex>

                      {item.description && (
                        <Box
                          as='td'
                          role='cell'
                          px={3}
                          my={2}
                          fontSize='xs'
                          lineHeight='short'
                          whiteSpace='pre-wrap'
                          wordBreak='break-word'
                          fontWeight='normal'
                        >
                          <TruncatedDescription
                            description={item.description}
                          />
                        </Box>
                      )}
                    </Row>
                  </React.Fragment>
                );
              })}
            </tbody>
          </Table>
        </TableContainer>
        <TablePagination
          total={items.length}
          size={size}
          setSize={setSize}
          from={from}
          setFrom={setFrom}
          pageSizeOptions={ROW_SIZES}
          colorScheme='primary'
          __css={{
            '>div': { py: 1 },
          }}
        />
      </TableWrapper>
    </Skeleton>
  );
};

// ActionProcessDetail: labelled block of secondary details within an action process card.
const ActionProcessDetail = ({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) => (
  <Box>
    <Text fontWeight='semibold'>{label}</Text>
    {children}
  </Box>
);

// BasedOnActionProcess: describes how a DataCollection was generated.
// Detailed description and steps are nested under the action name,
// see https://github.com/NIAID-Data-Ecosystem/nde-portal/issues/444#issuecomment-5267360271
export const BasedOnActionProcess = ({
  name,
  description,
  disambiguatingDescription,
  actionProcess,
}: IsBasedOn) => {
  // step may come back from the API as a single string or a list.
  const steps = castArray(actionProcess?.step ?? []).filter(Boolean);

  if (!description && steps.length === 0) return <>No details provided.</>;

  return (
    <Stack
      gap={0.5}
      w='100%'
      bg='status.info_lt'
      borderRadius='sm'
      fontSize='sm'
      lineHeight='short'
      p={[2, 4]}
    >
      {/* Description and steps are collapsed by default to keep the card compact. */}
      <Accordion allowToggle>
        <AccordionItem border='none'>
          {({ isExpanded }) => (
            <>
              <Flex
                flexWrap='wrap'
                alignItems='flex-end'
                columnGap={3}
                rowGap={0.5}
                lineHeight='short'
              >
                {/* Name of action */}
                <Flex flexDirection='column' gap={0.5}>
                  <Text fontWeight='semibold'>
                    {name || 'Generation process'}
                  </Text>
                  {disambiguatingDescription && (
                    <Text fontWeight='medium'>{disambiguatingDescription}</Text>
                  )}
                </Flex>
                <AccordionButton
                  w='auto'
                  gap={2}
                  px={0}
                  py={0}
                  mb={0.5}
                  flexShrink={0}
                  fontSize='sm'
                  fontWeight='medium'
                  textDecoration='underline'
                  _hover={{ textDecoration: 'none' }}
                >
                  <Text as='span' fontSize='xs'>
                    {isExpanded ? 'Hide details' : 'Show details'}
                  </Text>
                  <Icon as={isExpanded ? FaMinus : FaPlus} fontSize='2xs' />
                </AccordionButton>
              </Flex>
              <AccordionPanel px={0} pt={1} pb={1}>
                <VStack alignItems='start' spacing={1} fontSize='xs'>
                  {description && (
                    <ActionProcessDetail label='Description'>
                      <Text>{description}</Text>
                    </ActionProcessDetail>
                  )}
                  {steps.length > 0 && (
                    <ActionProcessDetail label='Steps'>
                      <VStack alignItems='start' spacing={1}>
                        {steps.map((step, index) => (
                          <Text key={index}>{step}</Text>
                        ))}
                      </VStack>
                    </ActionProcessDetail>
                  )}
                </VStack>
              </AccordionPanel>
            </>
          )}
        </AccordionItem>
      </Accordion>
    </Stack>
  );
};
