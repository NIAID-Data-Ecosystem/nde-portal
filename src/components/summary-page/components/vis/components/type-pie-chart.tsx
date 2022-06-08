// @ts-nocheck
// [TO DO]: type d3 to get it to work with typescript

import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { Box, Button, Flex, Heading, Text, theme } from 'nde-design-system';
import { SelectedFilterType } from 'src/components/summary-page';
import { FetchSearchResultsResponse } from 'src/utils/api/types';
import { useQuery } from 'react-query';
import { queryFilterObject2String } from 'src/components/filter';
import { fetchSearchResults } from 'src/utils/api';
import LoadingSpinner from 'src/components/loading';
import Empty from 'src/components/empty';
import { Error } from 'src/components/error';
import { formatNumber } from 'src/utils/helpers';
import { useRouter } from 'next/router';

/*
 [TO DO]:
 [] Add tooltips with number of resources in each type
 [] Add animation
*/

const names = {
  ComputationalTool: 'Computational Tool',
  Dataset: 'Dataset',
};

const PARAMETERS = {
  width: 400,
  height: 400,
  colors: [
    theme.colors.primary['500'],
    theme.colors.accent.bg,
    theme.colors.secondary['500'],
  ],
  stroke: 'white',
  strokeWidth: 1,
  strokeLinejoin: 'round',
  fontColor: 'white',
};

interface PieChartProps {
  // Stringified query.
  queryString: string;
  // Filters object
  filters: SelectedFilterType;
}

export const PieChart: React.FC<PieChartProps> = ({ queryString, filters }) => {
  const facets = ['@type'];
  const router = useRouter();

  const { data, isLoading, error } = useQuery<
    FetchSearchResultsResponse | undefined,
    Error
  >(
    [
      'search-results',
      {
        q: queryString,
        filters,
        facets,
      },
    ],
    () => {
      if (typeof queryString !== 'string' && !queryString) {
        return;
      }
      const filter_string = queryFilterObject2String(filters);
      return fetchSearchResults({
        q: filter_string
          ? `${
              queryString === '__all__' ? '' : `${queryString} AND `
            }${filter_string}`
          : `${queryString}`,
        size: 0,
        from: '0',
        facet_size: 50,
        facets: facets.join(','),
      });
    },
    { refetchOnWindowFocus: false },
  );

  const svgRef = useRef(null);
  const { width, height, colors, fontColor, strokeLinejoin } = PARAMETERS;
  /****
   * Process Data
   */
  const pie_data = data?.facets['@type'].terms || [];
  const types = pie_data?.map(d => d.term);

  /****
   * Pie
   */
  const innerRadius = Math.min(width, height) / 3; // inner radius of pie, in pixels (non-zero for donut)
  const outerRadius = Math.min(width, height) / 2.5; // outer radius of pie, in pixels
  const padAngle = 1 / outerRadius;
  const arcs = d3
    .pie()
    .padAngle(padAngle)
    .value(d => {
      return d.count;
    })(pie_data);

  const arc = d3
    .arc()
    .innerRadius(innerRadius)
    .outerRadius(outerRadius)
    .cornerRadius(4);

  const colorScale = d3.scaleOrdinal().domain(types).range(colors);

  useEffect(() => {
    const svg = d3.select(svgRef.current);
    svg
      .append('g')
      .attr('stroke-linejoin', strokeLinejoin)
      .attr('class', 'pie-chart')
      .selectAll('path')
      .data(arcs)
      .join('path')
      .attr('fill', ({ data }) => colorScale(data.term))
      .attr('d', arc);

    return () => {
      svg.selectAll('.pie-chart').remove();
    };
  }, [arc, arcs, colorScale, strokeLinejoin]);

  if (isLoading) {
    return (
      <Flex
        position='relative'
        width={width}
        height={height}
        justifyContent='center'
        alignItems='center'
      >
        {isLoading && <LoadingSpinner isLoading={isLoading}></LoadingSpinner>}
      </Flex>
    );
  }

  if (error) {
    return (
      <Error
        message="It's possible that the server is experiencing some issues."
        bg='transparent'
        color='white'
        minH='unset'
        width={width}
        height={height}
      >
        <Button flex={1} onClick={() => router.reload()} variant='solid'>
          Retry
        </Button>
      </Error>
    );
  }

  if (!pie_data || pie_data.length === 0) {
    return (
      <Empty
        message='No results found.'
        imageAlt='Missing information icon.'
        alignSelf='center'
        color='white'
        width={width}
        height={height}
      >
        <Text color='whiteAlpha.800'>
          Search yielded no results, please try again.
        </Text>
      </Empty>
    );
  }

  return (
    <Box position='relative' width={width}>
      <Box position='absolute' top={height / 2} left={width / 2} maxW='250px'>
        <Heading
          as='h2'
          size='h6'
          transform='translate(-50%,-50%)'
          textAlign='center'
          color={fontColor}
          fontWeight='semibold'
        >
          {formatNumber(data?.facets['@type'].total)} resources
        </Heading>
      </Box>
      <svg
        ref={svgRef}
        width={width}
        height={height}
        viewBox={`${-width / 2} ${-height / 2} ${width} ${height}`}
      ></svg>
      <Flex w={'100%'} justifyContent='center'>
        {pie_data.map(({ term, count }) => {
          const bg = colorScale(term);
          return (
            <Flex
              key={term}
              mx={2}
              minW='120px'
              // onClick={() => filterByType(term)}
            >
              <Box bg={bg} w='15px' h='15px' m={4}></Box>
              <Text color={fontColor} fontSize='xs'>
                {formatNumber(count)}
                <br />
                {`${names[term]}${count > 1 ? 's' : ''}`}
              </Text>
            </Flex>
          );
        })}
      </Flex>
    </Box>
  );
};
