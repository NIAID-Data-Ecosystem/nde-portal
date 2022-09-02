import React, { useCallback, useState } from 'react';
import { useRouter } from 'next/router';
import {
  Flex,
  Button,
  Heading,
  Text,
  Box,
  Select,
  Divider,
  List,
  ListItem,
  ListIcon,
} from 'nde-design-system';
import { useQuery } from 'react-query';
import { fetchSearchResults } from 'src/utils/api';
import { FetchSearchResultsResponse } from 'src/utils/api/types';
import { Error } from 'src/components/error';
import LoadingSpinner from 'src/components/loading';
import { SelectedFilterType } from '../../../hooks';
import { Chart as NetworkNodes, Datum, parameters } from './components/chart';
import * as d3 from 'd3';
import MeasurementPathogenViz from '../measurement-pathogen-viz/index';
import { queryFilterObject2String } from 'src/components/filter';
import { FaCheckCircle, FaRegCircle } from 'react-icons/fa';
import { formatNumber } from 'src/utils/helpers';
import { encodeString } from 'src/utils/querystring-helpers';

interface NetworkProps {
  // Stringified query.
  queryString: string;
  // Filters object
  filters: SelectedFilterType;
  // fn for updating filter selection
  updateFilters: (updatedFilters: SelectedFilterType) => void;
  removeAllFilters: () => void;
}

// Options for what paremeters to view the data with.
export const options: { [key: string]: { value: string; name: string } } = {
  'infectiousAgent.name': {
    value: 'infectiousAgent.name',
    name: 'Pathogen',
  },
  'measurementTechnique.name': {
    value: 'measurementTechnique.name',
    name: 'Measurement Technique',
  },
};

export const Network: React.FC<NetworkProps> = ({
  queryString,
  filters,
  updateFilters,
  removeAllFilters,
}) => {
  const router = useRouter();

  const [hovered, setHovered] = useState<Datum | null>(null);
  const [primaryGroup, setPrimaryGroup] = useState('infectiousAgent.name');
  const [secondaryGroup, setSecondaryGroup] = useState(
    'measurementTechnique.name',
  );

  /****
   * Fetch Data
   */
  const queryFn = (queryString: string, facets: string) => {
    if (typeof queryString !== 'string' && !queryString) {
      return;
    }
    if (!primaryGroup || !secondaryGroup) {
      return;
    }

    const filter_string = filters ? queryFilterObject2String(filters) : null;

    return fetchSearchResults({
      q: encodeString(queryString),
      extra_filter: filter_string || '', // extra filter updates aggregate fields
      facet_size: 1000,
      /*
       Aggregate the data using the second group grouped by the first (ex: measurementTechnique(secondary selection) grouped by pathogen(primary selection)).
      */
      facets,
      size: 0,
    });
  };

  // Get data. Possible to extract out in the future.
  const {
    data: APIdata,
    isLoading,
    error,
  } = useQuery<FetchSearchResultsResponse | undefined, Error>(
    [
      'search-results-aggregate',
      {
        q: queryString,
        filters,
        facets: `${primaryGroup}(${secondaryGroup}), ${secondaryGroup}`,
      },
    ],
    () =>
      queryFn(
        queryString,
        `${primaryGroup}(${secondaryGroup}), ${secondaryGroup}`,
      ),
    {
      refetchOnWindowFocus: false,
    },
  );

  const data = React.useMemo(
    () => APIdata?.facets[primaryGroup].terms || [],
    [APIdata?.facets, primaryGroup],
  );

  const formatted_data = React.useMemo(
    () =>
      data.map((facet, i) => {
        const group_one_data: Datum = {
          id: facet.term,
          name: facet.term,
          count: facet.count, //number of datasets for group term.
          type: primaryGroup,
          fill: parameters.primary.getColor(i) || parameters.primary.fill,
          stroke: parameters.primary.getColor(i) || parameters.primary.stroke,
          [secondaryGroup]: [],
        };

        let group_two_data: Datum[] = [];

        const secondaryTerms = facet[secondaryGroup];

        if (
          typeof secondaryTerms !== 'string' &&
          typeof secondaryTerms !== 'number'
        ) {
          group_one_data[secondaryGroup] = secondaryTerms.terms;
          group_two_data = secondaryTerms.terms.map(d => {
            return {
              id: `${facet.term}-${d.term}`,
              name: d.term,
              count: d.count,
              type: secondaryGroup,
              fill: i < 10 ? d3.schemeTableau10[i] : parameters.secondary.fill,
              stroke:
                i < 10 ? d3.schemeTableau10[i] : parameters.secondary.stroke,
              primary: group_one_data,
            };
          });
        }

        return {
          name: facet.term,
          children: [group_one_data, ...group_two_data],
        };
      }),
    [data, primaryGroup, secondaryGroup],
  );

  const handleFilterUpdate = useCallback(
    update => {
      updateFilters(update);
    },
    [updateFilters],
  );

  if (error) {
    return (
      <Error
        message="It's possible that the server is experiencing some issues."
        bg='whiteAlpha.100'
        color='status.error'
        minH='unset'
      >
        {/* reload page */}
        <Button
          flex={1}
          onClick={() => router.reload()}
          variant='solid'
          colorScheme='negative'
        >
          Retry
        </Button>
      </Error>
    );
  }
  const appliedFilters = Object.values(filters).flat();

  const Info = ({ node }: { node: any }) => {
    return (
      <Box borderLeft='4px' px={2} minWidth={200}>
        {/* Type */}
        <Heading color='whiteAlpha.800' size='sm' as='h2'>
          {node.type ? options[node.type].name : ''}
        </Heading>

        {/* Name */}
        <Heading color='white' size='sm' as='h3'>
          {node.name ? node.name : ''}
        </Heading>
      </Box>
    );
  };

  if (isLoading) {
    return <LoadingSpinner isLoading={isLoading} />;
  }
  return (
    <Flex justifyContent='start' flexDirection={['column', 'column', 'row']}>
      <Flex bg='whiteAlpha.200' p={4}>
        {/* Select how to group the datasets */}
        <Box maxW={['unset', 'unset', '300px']} color='whiteAlpha.800'>
          <Text color='inherit'>Select values to compare.</Text>
          <Box color='text.body' py={4}>
            <Select
              id='secondary-selection'
              placeholder='Select property'
              bg='whiteAlpha.900'
              value={secondaryGroup}
              onChange={e => {
                const { value } = e.currentTarget;
                setSecondaryGroup(value);
              }}
            >
              {Object.values(options).map((option, i) => {
                if (option.value === primaryGroup) {
                  return;
                }
                return (
                  <option key={option.value} value={option.value}>
                    {option.name}
                  </option>
                );
              })}
            </Select>

            <Heading
              size='xs'
              m={2}
              color='white'
              whiteSpace='nowrap'
              textTransform='uppercase'
            >
              Grouped By:
            </Heading>
            <Select
              id='primary-selection'
              placeholder='Select property'
              bg='whiteAlpha.900'
              onChange={e => {
                const { value } = e.currentTarget;
                setPrimaryGroup(value);
              }}
              value={primaryGroup}
            >
              {Object.values(options).map((option, i) => {
                if (option.value === secondaryGroup) {
                  return;
                }
                return (
                  <option key={option.value} value={option.value}>
                    {option.name}
                  </option>
                );
              })}
            </Select>
            <Divider borderColor='whiteAlpha.500' my={4}></Divider>
          </Box>

          {/* Legend */}
          {primaryGroup && secondaryGroup && (
            <Flex flexDirection='column' alignItems='center'>
              <svg viewBox='-25 -25 50 50' width='50px' height='50px'>
                <circle
                  r={20}
                  fill={parameters.primary.fill}
                  fillOpacity={parameters.primary.fillOpacity}
                  stroke={parameters.primary.stroke}
                  strokeWidth={parameters.primary.strokeWidth}
                ></circle>
              </svg>
              <Text color='inherit' textAlign='center'>
                Outlined circles represent{' '}
                <Text
                  as='span'
                  color='inherit'
                  textDecoration='underline'
                  fontWeight='semibold'
                >
                  {primaryGroup
                    ? `${options[primaryGroup]?.name.toLocaleLowerCase() + 's'}`
                    : 'property selected 1'}
                </Text>{' '}
                sized by their respective number of datasets.
              </Text>
              <Box my={2}></Box>
              <svg viewBox='-25 -25 50 50' width='50px' height='50px'>
                <circle
                  r={20}
                  fill={parameters.secondary.fill}
                  stroke={parameters.secondary.stroke}
                ></circle>
              </svg>
              <Text color='inherit' textAlign='center'>
                Solid circles represent{' '}
                <Text
                  as='span'
                  color='inherit'
                  textDecoration='underline'
                  fontWeight='semibold'
                >
                  {secondaryGroup
                    ? `${
                        options[secondaryGroup].name.toLocaleLowerCase() + 's'
                      }`
                    : 'property selected 2'}
                </Text>{' '}
                sized by their respective number of datasets.
              </Text>
              <Divider borderColor='whiteAlpha.500' my={4}></Divider>
            </Flex>
          )}

          <Text color='inherit'>
            Click on nodes in the network chart or the bars in the bar chart to
            update your selection. Hover over them to discover more detailed
            information.
          </Text>
        </Box>
      </Flex>

      {/* Network Chart */}
      <Box w='100%'>
        {(!primaryGroup || !secondaryGroup) && (
          <Flex
            justifyContent='center'
            alignItems='center'
            flexDirection='column'
            flex={1}
            h='100%'
            color='whiteAlpha.800'
          >
            <Text
              color='inherit'
              fontWeight='semibold'
              textDecoration='underline'
            >
              Instructions
            </Text>
            <List>
              <ListItem>
                <ListIcon
                  as={secondaryGroup ? FaCheckCircle : FaRegCircle}
                  color={secondaryGroup ? 'green.500' : 'white'}
                />
                Select a property to view.
              </ListItem>
              <ListItem>
                <ListIcon
                  as={primaryGroup ? FaCheckCircle : FaRegCircle}
                  color={primaryGroup ? 'green.500' : 'white'}
                />
                Select a second property with which to group the first property.
              </ListItem>
            </List>
          </Flex>
        )}

        {
          <Box className='b' w='100%'>
            <Flex bg='whiteAlpha.200' alignItems='center' p={4}>
              {appliedFilters.length > 0 ? (
                <>
                  <Heading size='h6' as='h2' color='white'>
                    You&apos;ve selected &quot;
                    {appliedFilters.join('" and "')}
                    &quot;
                  </Heading>
                  <Button
                    colorScheme='primary'
                    variant='solid'
                    size='sm'
                    mx={4}
                    onClick={removeAllFilters}
                  >
                    Clear Filters
                  </Button>
                </>
              ) : (
                <></>
              )}
            </Flex>
            <Flex w='100%' h='100%'>
              {data && data.length > 0 ? (
                <NetworkNodes
                  keys={[primaryGroup, secondaryGroup]}
                  data={formatted_data}
                  filters={filters}
                  updateFilters={handleFilterUpdate}
                  setHovered={setHovered}
                />
              ) : (
                <></>
              )}

              {/* Bar charts */}
              <Box borderLeft='2px solid' flex={1} p={4}>
                <MeasurementPathogenViz
                  keys={[primaryGroup, secondaryGroup]}
                  data={APIdata}
                  filters={filters}
                  updateFilters={handleFilterUpdate}
                  setHovered={setHovered}
                />
              </Box>
            </Flex>

            <Box minH={100}>
              <Flex>
                {/* Primary Group information */}

                {hovered?.primary && <Info node={hovered.primary} />}
                {hovered && <Info node={hovered} />}
              </Flex>
              {/* Additional info about hovered node. */}
              <Text color='white' fontStyle='italic' mt={2} pl={2}>
                {/* Num datasets */}
                {hovered?.count
                  ? `Contains ${formatNumber(hovered.count)} dataset${
                      hovered.count === 1 ? '' : 's'
                    }`
                  : ''}{' '}
                {/* number of nested secondary groups */}
                {hovered?.[secondaryGroup]
                  ? `and ${hovered[secondaryGroup].length} ${options[
                      secondaryGroup
                    ].name.toLocaleLowerCase()}${
                      hovered[secondaryGroup].length === 1 ? '' : 's'
                    }`
                  : ''}
                {hovered && appliedFilters.length > 0
                  ? ` associated with ${appliedFilters.join(' and ')}`
                  : ''}
              </Text>
            </Box>
          </Box>
        }
      </Box>
    </Flex>
  );
};
