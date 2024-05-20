import React, { useMemo } from 'react';
import { scaleLinear, scaleBand, scaleOrdinal } from '@visx/scale';
import { extent } from '@visx/vendor/d3-array';
import { Button, Text } from '@chakra-ui/react';
import { useDisclosure } from '@chakra-ui/react';
import { ScrollContainer } from 'src/components/scroll-container';
import { formatNumber } from 'src/utils/helpers';
import { useRepoData } from 'src/hooks/api/useRepoData';
import { Pattern, PatternLines } from '@visx/pattern';

const barStyles = {
  bg: '#e2e2e2',
  barColor: '#503ADE',
  strokeWidth: 10,
};

export type SourcesChartProps = {
  width: number;
  height: number;
  margin?: { top: number; right: number; bottom: number; left: number };
  data: {
    term: string;
    count: number;
    updatedCount?: number;
    name?: string;
    displayAs: string;
    category: string;
  }[];
};
export const SourcesChartHorizontal = ({
  width,
  height,
  params,
  data,
}: SourcesChartProps) => {
  const { isLoading, data: repositories, error } = useRepoData();

  const { isOpen, onToggle } = useDisclosure();
  const sources = useMemo(
    () =>
      data
        .map(source => {
          const repo = repositories?.find(
            repo => repo.identifier === source.term,
          );
          return {
            ...source,
            conditionsOfAccess: repo?.conditionsOfAccess || 'Unknown',
          };
        })
        .sort((a, b) => b.count - a.count) || [],
    [data, repositories],
  );

  const xExtent = useMemo(() => extent(sources, d => +d.count), [sources]) as [
    number,
    number,
  ];
  const xScale = useMemo(
    () =>
      scaleLinear<number>({
        range: [4, width - 10],
        domain: xExtent,
      }),
    [xExtent, width],
  );
  const yScale = useMemo(
    () =>
      scaleBand({
        range: [10, height],
        domain: sources.map((_, idx) => idx),
        padding: 0.55,
      }),
    [height, sources],
  );

  const numBars = useMemo(
    () => (isOpen ? sources.length : 5),
    [sources.length, isOpen],
  );

  const colorScale = useMemo(
    () =>
      scaleOrdinal<string, string>({
        range: [
          'url(#Unknown)',
          'url(#Varied)',
          'url(#Open)',
          'url(#Restricted)',
        ],
        domain: sources.reduce((acc, source) => {
          if (!acc.includes(source.conditionsOfAccess)) {
            acc.push(source.conditionsOfAccess);
          }
          return acc;
        }, [] as string[]),
      }),
    [sources],
  );

  return (
    <>
      <ScrollContainer
        overflowY={isOpen ? 'auto' : 'hidden'}
        overflowX='hidden'
        width='100%'
        height={isOpen ? '150px' : `${(yScale(5) || 0) + yScale.bandwidth()}px`}
      >
        <svg
          version='1.1'
          id='Layer_1'
          xmlns='http://www.w3.org/2000/svg'
          x='0px'
          y='0px'
          enableBackground={`new 0 0 ${width} ${height}`}
          viewBox={`0 0 ${width} ${height}`}
          xmlSpace='preserve'
          width={width}
          height={height}
        >
          <PatternLines
            id='Unknown'
            height={8}
            width={8}
            // stroke='#ECE8FF'
            // strokeWidth={2}
            background='#503ADE'
            orientation={['diagonal']}
          />
          <PatternLines
            id='Varied'
            height={8}
            width={8}
            // stroke='#FEEBC8'
            // strokeWidth={2}
            background='#ED8936'
            orientation={['diagonal']}
          />
          <PatternLines
            id='Open'
            height={8}
            width={8}
            // stroke='#C6F6D5'
            // strokeWidth={2}
            background='#38A169'
            orientation={['diagonal']}
          />
          <PatternLines
            id='Restricted'
            height={8}
            width={8}
            // stroke='#FED7D7'
            // strokeWidth={2}
            background='#E53E3E'
            orientation={['diagonal']}
          />
          <g>
            {sources.slice(0, numBars).map((source, idx) => {
              return (
                <React.Fragment key={source.term}>
                  <line
                    stroke={barStyles.bg}
                    strokeWidth={yScale.bandwidth() / 2}
                    strokeLinecap='round'
                    strokeMiterlimit='10'
                    x1={xScale(xExtent[0])}
                    y1={yScale(idx)}
                    x2={xScale(xExtent[1])}
                    y2={yScale(idx)}
                  />
                  <line
                    stroke={colorScale(source.conditionsOfAccess)}
                    // stroke={barStyles.barColor}
                    strokeWidth={yScale.bandwidth() / 2}
                    strokeLinecap='round'
                    strokeMiterlimit='10'
                    x1={xScale(xExtent[0])}
                    y1={yScale(idx)}
                    x2={xScale(source.count)}
                    y2={yScale(idx)}
                  />
                  <Text
                    as='text'
                    x={xScale(xExtent[0])}
                    y={yScale(idx)}
                    dx='-0.2rem'
                    dy='-0.4rem'
                    fontSize='10px'
                  >
                    {source.displayAs} | Access: {source.conditionsOfAccess} |{' '}
                    {formatNumber(source.count)} records
                  </Text>
                </React.Fragment>
              );
            })}
          </g>
        </svg>
      </ScrollContainer>

      <Button
        size='xs'
        variant='outline'
        colorScheme='secondary'
        onClick={onToggle}
      >
        Show {isOpen ? 'Less' : 'All Sources'}
      </Button>
    </>
  );
};
