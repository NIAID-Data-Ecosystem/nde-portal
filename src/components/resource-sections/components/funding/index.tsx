import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Box,
  Button,
  Flex,
  FlexProps,
  Icon,
  Link,
  Table,
  TableContainer,
  TablePagination,
  TableSortToggle,
  TableWrapper,
  Tr,
  Tag,
  Text,
  useDisclosure,
  useTableSort,
  Tbody,
  Thead,
  VisuallyHidden,
  Heading,
  Skeleton,
} from 'nde-design-system';
import { Funding as FundingType } from 'src/utils/api/types';
import { FaExternalLinkSquareAlt } from 'react-icons/fa';
import { uniqueId } from 'lodash';
import { Cell, Label, Content, EmptyCell } from './components/cell';
import { Row, RowWithDrawer } from './components/row';
import { getMetadataTheme } from 'src/components/icon/helpers';

// Constants for table configuration.
// [ROW_SIZES]: num of rows per page
const ROW_SIZES = [5, 10, 50, 100];

// [COLUMNS]: table columns
const COLUMNS = [
  { key: 'name', title: 'Funding Name / Identifier' },
  { key: 'funderName', title: 'Funder' },
  {
    key: 'startDate',
    title: 'Start Date',
    props: { w: '200px', maxW: '200px', minW: 'unset' },
  },
  {
    key: 'endDate',
    title: 'End Date',
    props: { w: '200px', maxW: '200px', minW: 'unset' },
  },
];

interface Row extends FundingType {
  key: string;
}
interface FundingProps {
  isLoading: boolean;
  data: FundingType[];
}

// Main Funding component - renders a table with funding data.
export const Funding: React.FC<FundingProps> = ({
  data: fundingData,
  isLoading,
}) => {
  // create custom [properties] for sorting. This is needed because the data is nested.
  const funding = useMemo(
    () =>
      fundingData.map((funding, idx) => {
        const funderName = Array.isArray(funding?.funder)
          ? funding?.funder?.map(f => f.name).join(', ')
          : funding?.funder?.name;
        return {
          ...funding,
          key: uniqueId(`funding-${funding.identifier || idx}`),
          name: funding.name || '',
          funderName,
        };
      }),
    [fundingData],
  );

  // sort data based on column sorting
  const accessor = useCallback((v: any) => {
    return v;
  }, []);

  const [{ data, orderBy, sortBy }, updateSort] = useTableSort(
    funding,
    accessor,
  );
  // [size]: num of rows per page
  const [size, setSize] = useState(ROW_SIZES[0]);

  // [from]: current page number
  const [from, setFrom] = useState(0);

  // [rows]: all rows to display

  const [rows, setRows] = useState<Row[]>(data);

  useEffect(() => {
    // update rows to display based on current page number and num of rows per page
    setRows(data.slice(from * size, from * size + size));
  }, [data, size, from]);

  if (!isLoading && funding?.length === 0) {
    return <Text>No funding data available.</Text>;
  }

  return (
    <Skeleton isLoaded={!isLoading} overflow='auto'>
      <Heading as='h4' fontSize='sm' mx={1} mb={4} fontWeight='semibold'>
        Grant and Funding Information
      </Heading>
      <TableWrapper colorScheme='gray'>
        <TableContainer>
          <Table
            role='table'
            aria-label='Grant and funding information'
            aria-describedby='table-caption'
            aria-rowcount={rows.length}
            sx={{
              tr: {
                th: {
                  borderBottom: '1px solid',
                  borderBottomColor: `${getMetadataTheme('funding')}.200`,
                  borderColor: `${getMetadataTheme('funding')}.200`,
                },
                td: {
                  py: undefined,
                },
              },
            }}
          >
            {/* Note: keep for accessibility */}
            <VisuallyHidden as='caption'>
              Grant and funding information
            </VisuallyHidden>
            <Thead>
              <Tr role='row' flex='1' display='flex' w='100%'>
                {COLUMNS.map(column => {
                  return (
                    <React.Fragment key={`table-col-th-${column.key}`}>
                      <Cell
                        as='th'
                        role='columnheader'
                        scope='col'
                        label={column.title}
                        alignItems='center'
                        fontWeight='bold'
                        bg={column.key === orderBy ? 'page.alt' : 'transparent'}
                        {...column.props}
                      >
                        {column.key && (
                          <TableSortToggle
                            isSelected={column.key === orderBy}
                            sortBy={sortBy}
                            handleToggle={(sortByAsc: boolean) => {
                              updateSort(column.key, sortByAsc);
                            }}
                          />
                        )}
                      </Cell>
                    </React.Fragment>
                  );
                })}
              </Tr>
            </Thead>
            <Tbody
              sx={{
                tr: {
                  td: {
                    py: undefined,
                  },
                },
              }}
            >
              {rows.map(funding => {
                return (
                  <React.Fragment key={`table-tr-${funding.key}`}>
                    <Row>
                      {COLUMNS.map(column => {
                        return (
                          <Cell
                            key={`table-td-${funding.key}-${column.key}`}
                            as='td'
                            role='cell'
                            {...column.props}
                          >
                            {column.key === 'name' && (
                              <ContentWithTag
                                identifier={funding.identifier}
                                url={funding.url}
                                name={funding.name}
                              />
                            )}
                            {column.key === 'funderName' &&
                              (Array.isArray(funding?.funder)
                                ? funding.funder
                                : [funding.funder]
                              ).map(funder => {
                                return (
                                  <Box
                                    key={`table-td-funder-${funding.key}-${funder?.identifier}-${funder?.name}`}
                                    as='span'
                                    display='block'
                                    mb={Array.isArray(funding?.funder) ? 4 : 0}
                                  >
                                    <ContentWithTag
                                      identifier={funder?.identifier}
                                      url={funder?.url}
                                      name={funder?.name}
                                    />
                                  </Box>
                                );
                              })}

                            {column.key.toLowerCase().includes('date') &&
                              (funding[column.key as keyof FundingType] ? (
                                <>
                                  {new Date(
                                    funding[
                                      column.key as keyof FundingType
                                    ] as string,
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
                    </Row>
                    {(funding.description ||
                      funding.keywords ||
                      (funding?.funder &&
                        // check that funder has additional fields than @type, name, and identifier
                        (Array.isArray(funding.funder)
                          ? funding.funder.some(funderItem =>
                              Object.keys(funderItem).some(
                                key =>
                                  key !== '@type' &&
                                  key !== 'name' &&
                                  key !== 'identifier',
                              ),
                            )
                          : Object.keys(funding.funder).some(
                              key =>
                                key !== '@type' &&
                                key !== 'name' &&
                                key !== 'identifier',
                            )))) && (
                      <RowWithDrawer>
                        <FundingDrawerContent
                          id={funding.key}
                          description={funding.description}
                          keywords={funding.keywords}
                          funder={funding.funder}
                        />
                      </RowWithDrawer>
                    )}
                  </React.Fragment>
                );
              })}
            </Tbody>
          </Table>
        </TableContainer>
        <TablePagination
          total={funding.length}
          size={size}
          setSize={setSize}
          from={from}
          setFrom={setFrom}
          pageSizeOptions={ROW_SIZES}
          colorScheme='gray'
          __css={{ '>div': { py: 1 } }}
        />
      </TableWrapper>
    </Skeleton>
  );
};

const ContentWithTag = React.memo(
  ({
    url,
    identifier,
    name,
  }: {
    url?: string | null;
    identifier?: string | null;
    name?: string | null;
  }) => {
    if (!url && !identifier && !name) {
      return <EmptyCell />;
    }
    return (
      <>
        {url && !identifier ? (
          <Link href={url} isExternal>
            <Text fontSize='inherit'>{name || 'Funding Information'}</Text>
          </Link>
        ) : (
          <Text fontWeight='medium'>{name}</Text>
        )}

        {identifier && (
          <Tag
            size='sm'
            variant='subtle'
            alignItems='center'
            px={1.5}
            mt={0.5}
            fontSize='12px'
          >
            {url ? (
              <Link href={url} target='_blank' alignItems='center'>
                <b>ID</b> | {identifier}
                <Icon
                  as={FaExternalLinkSquareAlt}
                  boxSize={3}
                  ml={1}
                  color='gray.800'
                />
              </Link>
            ) : (
              <>
                <b>ID</b> | {identifier}
              </>
            )}
          </Tag>
        )}
      </>
    );
  },
);

interface FundingDrawerContentProps extends FlexProps {
  id: string;
  description: FundingType['description'];
  funder: FundingType['funder'];
  keywords: FundingType['keywords'];
}
// FundingDrawerContent component - displays detailed information for a funding item.
const FundingDrawerContent = React.memo(
  ({
    id,
    description: fullDescription,
    funder,
    keywords,
  }: FundingDrawerContentProps) => {
    const { isOpen, onToggle } = useDisclosure();

    const getTruncatedDescription = (
      description?: FundingType['description'],
      MAX_CHARS = 144,
    ) => {
      if (!description) {
        return { text: '', hasMore: false };
      }

      // truncate description if it's longer than 144 chars
      const text =
        description.length < MAX_CHARS
          ? description
          : description.substring(0, isOpen ? description.length : 144);

      return { text, hasMore: description.length > MAX_CHARS };
    };

    const description = getTruncatedDescription(fullDescription);

    const funders = Array.isArray(funder) ? funder : [funder];

    return (
      <Flex as='dl' px={4} flexDirection='column'>
        <Label as='dt' mt={2}>
          Description
        </Label>
        <Content as='dd'>
          {description.text ? (
            <Text w='100%'>
              {description.text}
              {!isOpen && description.hasMore ? '...' : ''}
              {description.hasMore ? (
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
            <Text fontStyle='italic'>None available</Text>
          )}
        </Content>

        <Label as='dt' mt={4}>
          Project Terms
        </Label>
        <Content as='dd'>
          {keywords && keywords?.length > 0 ? (
            keywords.map((keyword, idx) => (
              <Tag
                key={`table-drawer-content-keyword-${id}-${keyword}-${idx}`}
                size='sm'
                m={1}
                colorScheme='primary'
              >
                {keyword}
              </Tag>
            ))
          ) : (
            <Text
              key={`table-drawer-content-keyword-${id}-none`}
              fontStyle='italic'
            >
              None available
            </Text>
          )}
        </Content>

        {funders.length &&
          funders.some(
            funderItem =>
              funderItem &&
              Object.keys(funderItem).some(
                key =>
                  key !== '@type' && key !== 'name' && key !== 'identifier',
              ),
          ) && (
            <Box as='dl' mt={4}>
              <Label as='dt' mb={2}>
                About the Funder{funders.length > 1 ? 's' : ''}
              </Label>
              {funders.map((funder, idx) => {
                const alternateNames = funder?.alternateName
                  ? Array.isArray(funder.alternateName)
                    ? funder.alternateName
                    : [funder.alternateName]
                  : null;

                return (
                  <React.Fragment
                    key={`table-drawer-content-funder-${funder?.identifier}-${funder?.name}-${idx}`}
                  >
                    <Label as='dt' textTransform='capitalize' px={2}>
                      Funder
                    </Label>
                    {funder?.name && (
                      <Box px={4} py={1}>
                        <Content as='dd' fontWeight='semibold'>
                          {funder.name}
                          {alternateNames && (
                            <Text color='gray.800' fontWeight='normal'>
                              Alternate Name: {alternateNames.join(', ') || '-'}
                            </Text>
                          )}
                        </Content>
                      </Box>
                    )}

                    {(funder?.class ||
                      funder?.role ||
                      funder?.parentOrganization ||
                      funder?.employee) && (
                      <>
                        {funder?.class && (
                          <Box px={4} py={1}>
                            <Label as='dt' textTransform='capitalize'>
                              Class
                            </Label>
                            <Content as='dd' my={1}>
                              {Array.isArray(funder.class)
                                ? funder.class.join(', ')
                                : funder.class}
                            </Content>
                          </Box>
                        )}
                        {funder?.role && (
                          <Box px={4} py={1}>
                            <Label as='dt' textTransform='capitalize'>
                              Role
                            </Label>
                            <Content as='dd' my={1}>
                              {Array.isArray(funder.role)
                                ? funder.role.join(', ')
                                : funder.role}
                            </Content>
                          </Box>
                        )}

                        {funder?.parentOrganization && (
                          <Box px={4} py={1}>
                            <Label as='dt' textTransform='capitalize'>
                              Parent Organization
                            </Label>
                            <Content as='dd' my={1}>
                              {Array.isArray(funder.parentOrganization)
                                ? funder.parentOrganization.join(', ')
                                : funder.parentOrganization}
                            </Content>
                          </Box>
                        )}

                        {funder?.employee && (
                          <Box px={4} py={1}>
                            <Label as='dt' textTransform='capitalize'>
                              Employee
                            </Label>
                            <Content as='dd' my={1}>
                              {funder.employee.map(employee => {
                                return Array.isArray(employee.name)
                                  ? employee.name.join(', ')
                                  : employee.name;
                              })}
                            </Content>
                          </Box>
                        )}
                      </>
                    )}
                  </React.Fragment>
                );
              })}
            </Box>
          )}
      </Flex>
    );
  },
);
