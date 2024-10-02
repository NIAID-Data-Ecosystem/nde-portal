import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Box,
  Flex,
  FlexProps,
  Table,
  Tr,
  Text,
  VisuallyHidden,
  Heading,
  Skeleton,
  VStack,
} from '@chakra-ui/react';
import { Link } from 'src/components/link';
import { Funding as FundingType } from 'src/utils/api/types';
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
import { TableWrapper } from 'src/components/table/components/wrapper';
import { TablePagination } from 'src/components/table/components/pagination';
import { useTableSort } from 'src/components/table/hooks/useTableSort';
import { TagWithUrl } from 'src/components/tag-with-url';

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
  hasRowDrawer: boolean;
}
interface FundingProps {
  isLoading: boolean;
  data: FundingType[];
}

const SHOW_MAX_FUNDER_NAMES = 5;
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
          hasRowDrawer: funding.funder
            ? Array.isArray(funding.funder)
              ? funding.funder.some(funderItem =>
                  Object.keys(funderItem).some(
                    key =>
                      key !== '@type' && key !== 'name' && key !== 'identifier',
                  ),
                )
              : Object.keys(funding.funder).some(
                  key =>
                    key !== '@type' && key !== 'name' && key !== 'identifier',
                )
            : false,
        };
      }),
    [fundingData],
  );

  // sort data based on column sorting
  const accessor = useCallback((v: any) => {
    return v;
  }, []);

  const [{ data, orderBy, sortBy }, updateSort] = useTableSort({
    data: funding,
    accessor,
  });
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
                      isSortable={true}
                      tableSortToggleProps={{
                        isSelected: column.key === orderBy,
                        sortBy,
                        handleToggle: (sortByAsc: boolean) => {
                          updateSort(column.key, sortByAsc);
                        },
                      }}
                      {...column.props}
                    />
                  );
                })}
              </Tr>
            </thead>
            <Flex as='tbody' flexDirection='column'>
              {rows.map(funding => {
                const funders = Array.isArray(funding?.funder)
                  ? funding.funder
                  : [funding.funder];
                return (
                  <React.Fragment key={`table-tr-${funding.key}`}>
                    <Row
                      as='tr'
                      flexDirection='row'
                      borderTop='1px solid'
                      borderTopColor='gray.200'
                      borderBottom='none'
                    >
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
                                label='Funding ID |'
                                identifier={funding.identifier}
                                url={funding.url}
                                name={funding.name}
                              />
                            )}
                            {column.key === 'funderName' &&
                              funders
                                .slice(0, SHOW_MAX_FUNDER_NAMES)
                                .map((funder, idx) => {
                                  return (
                                    <React.Fragment
                                      key={`table-td-funder-${funding.key}-${funder?.identifier}-${funder?.name}-${idx}`}
                                    >
                                      <Box
                                        as='span'
                                        display='block'
                                        mb={
                                          Array.isArray(funding?.funder) ? 2 : 0
                                        }
                                      >
                                        <ContentWithTag
                                          label='Funder ID |'
                                          identifier={funder?.identifier}
                                          url={funder?.url}
                                          name={funder?.name}
                                        />
                                      </Box>
                                      {funders.length > SHOW_MAX_FUNDER_NAMES &&
                                      idx === SHOW_MAX_FUNDER_NAMES - 1 ? (
                                        <Text as='span' mt={8}>
                                          {`and ${
                                            funders.length -
                                            SHOW_MAX_FUNDER_NAMES
                                          } more... `}
                                        </Text>
                                      ) : (
                                        ''
                                      )}
                                    </React.Fragment>
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

                    {funding?.hasRowDrawer && (
                      <Row className='row-drawer' border='none'>
                        <RowWithDrawer as='td' role='cell'>
                          <FundingDrawerContent
                            id={funding.key}
                            funder={funding.funder}
                          />
                        </RowWithDrawer>
                      </Row>
                    )}
                  </React.Fragment>
                );
              })}
            </Flex>
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
    label,
    identifier,
    name,
  }: {
    identifier?: string | null;
    label?: string;
    name?: string | null;
    url?: string | null;
  }) => {
    if (!url && !identifier && !name) {
      return <EmptyCell />;
    }

    const href = url
      ? url
      : // check if it's a ror identifier
      identifier?.startsWith('https://ror.org/')
      ? identifier
      : '';

    return (
      <>
        {href && !identifier ? (
          <Link href={href} isExternal>
            <Text fontSize='inherit'>{name || 'Funding Information'}</Text>
          </Link>
        ) : (
          <Text fontWeight='medium' fontStyle={!name ? 'italic' : 'normal'}>
            {name || 'No name provided'}
          </Text>
        )}

        {identifier && (
          <TagWithUrl
            colorScheme='orange'
            href={href || ''}
            label={label}
            isExternal
            mt={0.5}
            whiteSpace='nowrap'
          >
            {identifier}
          </TagWithUrl>
        )}
      </>
    );
  },
);

interface FundingDrawerContentProps extends FlexProps {
  id: string;
  funder: FundingType['funder'];
}
// FundingDrawerContent component - displays detailed information for a funding item.
const FundingDrawerContent = React.memo(
  ({ funder }: FundingDrawerContentProps) => {
    const funders = Array.isArray(funder) ? funder : [funder];

    return (
      <Flex px={4} flexDirection='column'>
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
                      <VStack px={4} py={1} spacing={1} alignItems='flex-start'>
                        {funder?.name && (
                          <dd>
                            <Content fontWeight='semibold' my={0}>
                              {funder.name}
                              {alternateNames && (
                                <Text color='gray.800' fontWeight='normal'>
                                  Alternate Name:{' '}
                                  {alternateNames.join(', ') || '-'}
                                </Text>
                              )}
                            </Content>
                          </dd>
                        )}

                        {(funder?.class ||
                          funder?.role ||
                          funder?.parentOrganization ||
                          funder?.employee) && (
                          <>
                            {funder?.class && (
                              <Flex alignItems='baseline'>
                                <Label
                                  as='dt'
                                  textTransform='capitalize'
                                  fontWeight='medium'
                                >
                                  Class:
                                </Label>
                                <Content as='dd' my={0} ml={1}>
                                  {Array.isArray(funder.class)
                                    ? funder.class.join(', ')
                                    : funder.class}
                                </Content>
                              </Flex>
                            )}
                            {funder?.role && (
                              <Flex alignItems='baseline'>
                                <Label
                                  as='dt'
                                  textTransform='capitalize'
                                  fontWeight='medium'
                                >
                                  Role:
                                </Label>
                                <Content as='dd' my={0} ml={1}>
                                  {Array.isArray(funder.role)
                                    ? funder.role.join(', ')
                                    : funder.role}
                                </Content>
                              </Flex>
                            )}

                            {funder?.parentOrganization && (
                              <Flex alignItems='baseline'>
                                <Label
                                  as='dt'
                                  textTransform='capitalize'
                                  fontWeight='medium'
                                >
                                  Parent Organization:
                                </Label>
                                <Content as='dd' my={0} ml={1}>
                                  {Array.isArray(funder.parentOrganization)
                                    ? funder.parentOrganization.join(', ')
                                    : funder.parentOrganization}
                                </Content>
                              </Flex>
                            )}

                            {funder?.employee && (
                              <Flex alignItems='baseline'>
                                <Label
                                  as='dt'
                                  textTransform='capitalize'
                                  fontWeight='medium'
                                >
                                  Employee:
                                </Label>
                                <Content as='dd' my={0} ml={1}>
                                  {funder.employee.map(employee => {
                                    return Array.isArray(employee.name)
                                      ? employee.name.join(', ')
                                      : employee.name;
                                  })}
                                </Content>
                              </Flex>
                            )}
                          </>
                        )}
                      </VStack>
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
