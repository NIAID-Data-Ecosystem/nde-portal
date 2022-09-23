import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import * as d3 from 'd3';
import { Box, Flex, Text } from 'nde-design-system';
import { Datum } from '../../../network/components/chart';
import { SelectedFilterType } from 'src/components/filters/types';
import { FacetTerm } from 'src/utils/api/types';

interface BarChartProps {
  // Bar chart data
  data?: FacetTerm[];
  updateFilters: (updatedFilters: SelectedFilterType) => void;
  setHovered: (node: Datum | null) => void;
}

export const parameters = {
  bars: {
    padding: 60,
    height: 40,
  },
  margin: {
    top: 40,
    right: 10,
    bottom: 20,
    left: 10,
  },
  text: { fontSize: 10, color: 'white', lineHeight: '1' },
  width: 300,
};

export const BarChart: React.FC<BarChartProps> = ({
  data = [],
  updateFilters,
  setHovered,
}) => {
  const svgRef = useRef(null);

  const HEIGHT =
    parameters.bars.height * data.length +
    parameters.margin.top +
    parameters.margin.bottom;

  // Scale: X
  // const maxCount = d3.max(data.map(d => d.count))!;
  const max = useMemo(
    () => Math.ceil(d3.max(data.map(d => d.count))! / 10) * 10,
    [data],
  ); //round to nearest ten
  const scaleX = useMemo(
    () =>
      d3
        .scaleLinear()
        .domain([0, max])
        .range([
          parameters.margin.left,
          parameters.width - parameters.margin.right,
        ]),
    [max],
  );

  // Scale: Y
  const range = useMemo(
    () =>
      d3.range(
        0,
        (data.length + 1) * parameters.bars.height,
        parameters.bars.height,
      ),
    [data.length],
  );

  const scaleY = useMemo(
    () =>
      d3
        .scaleOrdinal<string, number>()
        .domain(data.map(d => d.term))
        .range(range),
    [data, range],
  );

  const createBarChart = useCallback(
    svg => {
      const chart = svg
        .append('g')
        .attr('class', 'bar-chart')
        .attr('transform', `translate(0, ${parameters.margin.top})`);

      const bars = chart
        .selectAll('rect')
        .data(data)
        .join('rect')
        .attr('fill', (d: Datum) => d.fill)
        .attr('x', () => scaleX(0))
        .attr('y', (d: Datum) => scaleY(d.term) + parameters.bars.padding / 2)
        .attr('height', parameters.bars.height - parameters.bars.padding / 2)
        .style('cursor', 'pointer')
        .on('click', (_: any, d: Datum) =>
          updateFilters({ [d.type]: [d.term] }),
        )
        .on('mouseover', (_: any, node: Datum) => {
          setHovered(node);
        })
        .on('mouseleave', () => {
          setHovered(null);
        });

      bars
        .transition()
        .delay((_: Datum, i: number) => i * 50)
        .duration(1000)
        .attr('width', (d: Datum) => scaleX(d.count) - scaleX(0));

      svg
        .append('g')
        .attr('class', 'x-axis')
        .attr('transform', `translate(0, ${parameters.margin.top})`)
        .call(
          d3.axisTop(scaleX).tickFormat((v, i) => {
            return i % 2 === 0 ? `${v}` : '';
          }),
        )
        .selectAll('text')
        .attr('fill', 'white')
        .style('text-anchor', 'middle');
    },
    [data, scaleX, scaleY, setHovered, updateFilters],
  );

  useEffect(() => {
    const svg = d3.select(svgRef.current);

    createBarChart(svg);
    return () => {
      svg.selectAll('.bar-chart').remove();
      svg.selectAll('.x-axis').remove();
    };
  }, [createBarChart]);

  if (!data || data === undefined) {
    return <></>;
  }
  return (
    <Box w='100%' h='200px' overflowY='scroll'>
      <Flex position='relative' flexDirection='column' w='100%'>
        {data.map(d => {
          return (
            <Box
              width={parameters.width}
              key={d.term}
              position='absolute'
              top={`${scaleY(d.term) + parameters.margin.top}px`}
              left={`${parameters.margin.left}px`}
              transform={`translate(0, 50%)`}
            >
              <Text
                color={parameters.text.color}
                fontSize={parameters.text.fontSize}
                noOfLines={1}
              >
                {d.term}
              </Text>
            </Box>
          );
        })}
      </Flex>
      <Box>
        <svg
          ref={svgRef}
          width={parameters.width}
          height={HEIGHT}
          viewBox={`0 0  ${parameters.width} ${HEIGHT}`}
        />
      </Box>
    </Box>
  );
};
