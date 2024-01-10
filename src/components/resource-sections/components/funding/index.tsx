import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Box,
  Button,
  Flex,
  FlexProps,
  Icon,
  Link,
  Table,
  TablePagination,
  TableSortToggle,
  TableWrapper,
  Tr,
  Tag,
  Text,
  useDisclosure,
  useTableSort,
  VisuallyHidden,
  Heading,
  Skeleton,
} from 'nde-design-system';
import { Funding as FundingType } from 'src/utils/api/types';
import { FaExternalLinkSquareAlt } from 'react-icons/fa';
import { uniqueId } from 'lodash';
import { getMetadataTheme } from 'src/components/icon/helpers';
import {
  Cell,
  Label,
  Content,
  EmptyCell,
  Th,
} from 'src/components/table/components/cell';
import { Row, RowWithDrawer } from 'src/components/table/components/row';
import { TableContainer } from 'src/components/table/components/table-container';
import { getTruncatedText } from 'src/components/table/helpers';

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
            aria-describedby='funding-table-caption'
            aria-rowcount={rows.length}
          >
            {/* Note: keep for accessibility */}
            <VisuallyHidden id='funding-table-caption' as='caption'>
              Grant and funding information
            </VisuallyHidden>
            <thead>
              <Tr role='row' flex='1' display='flex' w='100%'>
                {COLUMNS.map(column => {
                  return (
                    <Th
                      key={`table-col-th-${column.key}`}
                      label={column.title}
                      isSelected={column.key === orderBy}
                      borderBottomColor={`${getMetadataTheme('funding')}.200`}
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
                    </Th>
                  );
                })}
              </Tr>
            </thead>
            <tbody>
              {rows.map(funding => {
                return (
                  <Row
                    as='tr'
                    key={`table-tr-${funding.key}`}
                    flexDirection='column'
                    borderColor='gray.200'
                  >
                    <Flex as='td' role='cell'>
                      {COLUMNS.map(column => {
                        return (
                          <Cell
                            key={`table-td-${funding.key}-${column.key}`}
                            as='div'
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
                    </Flex>
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
                      <RowWithDrawer as='td' role='cell'>
                        <FundingDrawerContent
                          id={funding.key}
                          description={funding.description}
                          keywords={funding.keywords}
                          funder={funding.funder}
                        />
                      </RowWithDrawer>
                    )}
                  </Row>
                );
              })}
            </tbody>
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
            colorScheme='orange'
          >
            {url ? (
              <Link
                href={url}
                target='_blank'
                alignItems='center'
                fontWeight='semibold'
                color='inherit'
                _visited={{ color: 'inherit' }}
                _hover={{
                  color: 'inherit',
                  '#tag-value': { textDecoration: 'none' },
                }}
              >
                <span>ID</span> |{' '}
                <Text
                  id='tag-value'
                  as='span'
                  textDecoration='underline'
                  color='inherit'
                >
                  {identifier}
                </Text>
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
  ({ id, description, funder, keywords }: FundingDrawerContentProps) => {
    const { isOpen, onToggle } = useDisclosure();

    const { text, hasMore } = getTruncatedText(description, isOpen);

    const funders = Array.isArray(funder) ? funder : [funder];

    return (
      <Flex px={4} flexDirection='column'>
        <dl>
          <Label as='dt' mt={2}>
            Description
          </Label>
          <Content as='dd'>
            {text ? (
              <Text w='100%'>
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
              <Text fontStyle='italic'>None available</Text>
            )}
          </Content>
        </dl>
        <dl>
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
        </dl>
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
              <dd>
                {funders.map((funder, idx) => {
                  const alternateNames = funder?.alternateName
                    ? Array.isArray(funder.alternateName)
                      ? funder.alternateName
                      : [funder.alternateName]
                    : null;

                  return (
                    <Box
                      as='dl'
                      key={`table-drawer-content-funder-${funder?.identifier}-${funder?.name}-${idx}`}
                    >
                      <Label as='dt' textTransform='capitalize' px={2}>
                        Funder
                      </Label>
                      {funder?.name && (
                        <Box as='dd' px={4} py={1}>
                          <Content fontWeight='semibold' my={0}>
                            {funder.name}
                            {alternateNames && (
                              <Text color='gray.800' fontWeight='normal'>
                                Alternate Name:{' '}
                                {alternateNames.join(', ') || '-'}
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
                    </Box>
                  );
                })}
              </dd>
            </Box>
          )}
      </Flex>
    );
  },
);
