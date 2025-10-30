import React, { useCallback, useMemo } from 'react';
import { Box, Flex, Text } from '@chakra-ui/react';
import { theme } from 'src/theme';
import { Group } from '@visx/group';
import { scaleBand, scaleLinear } from '@visx/scale';
import { Bar } from '@visx/shape';
import { AxisBottom } from '@visx/axis';
import { useTooltip, useTooltipInPortal } from '@visx/tooltip';
import { formatNumber } from 'src/utils/helpers';
import { addMissingYears } from '../helpers';
import { useDateRangeContext } from '../hooks/useDateRangeContext';
import { FacetTermWithDetails } from '../../../types';

interface HistogramProps {
  updatedData: FacetTermWithDetails[];
  handleClick: (args: string[]) => void;
  children: React.ReactNode;
}

const Histogram: React.FC<HistogramProps> = ({
  children,
  updatedData,
  handleClick,
}) => {
  const { allData, filteredData, dates } = useDateRangeContext();

  // Filter updatedData to remove any future years
  const currentYear = new Date().getFullYear();
  const sanitizedUpdatedData = useMemo(
    () =>
      updatedData.filter(d => {
        const year = parseInt(d.term.split('-')[0], 10);
        return year <= currentYear;
      }),
    [updatedData, currentYear],
  );

  const params = useMemo(
    () => ({
      maxBarWidth: 40,
      height: 150,
      padding: 0.1,
      fill: {
        inactive: theme.colors.blackAlpha[100],
        gray: theme.colors.gray[200],
      },
      hover: {
        gray: theme.colors.blackAlpha[200],
      },
      opacity: { hover: 0.65, active: 1 },
    }),
    [],
  );

  const range_min = useMemo(() => dates[0], [dates]);
  const range_max = useMemo(() => dates[1], [dates]);

  // tooltip

  const {
    tooltipData,
    tooltipLeft,
    tooltipTop,
    tooltipOpen,
    showTooltip,
    hideTooltip,
  } = useTooltip({
    tooltipData: { count: 0, term: '', label: '', updatedCount: 0 },
  });

  const { containerRef, containerBounds, TooltipInPortal } = useTooltipInPortal(
    {
      detectBounds: true,
      scroll: true,
      zIndex: 1000,
    },
  );

  const width = useMemo(
    () => containerBounds?.width || 0,
    [containerBounds?.width],
  );

  const height = params.height;

  // Show tooltip when user mouses over histogram bars.
  const handleMouseOver = useCallback(
    (
      event: React.MouseEvent<SVGRectElement>,
      datum: {
        count: number;
        term: string;
        label: string;
        updatedCount: number;
      },
    ) => {
      const coordsX =
        ('clientX' in event ? event.clientX : 0) - containerBounds.left;
      const coordsY =
        ('clientY' in event ? event.clientY : 0) - containerBounds.top;
      showTooltip({
        tooltipLeft: coordsX,
        tooltipTop: coordsY,
        tooltipData: datum,
      });
    },
    [containerBounds.left, containerBounds.top, showTooltip],
  );

  // visibleData is filteredData (already filtered by date range in context)
  const visibleData = filteredData;

  // x-axis is date, using index for domain
  const xScale = useMemo(() => {
    const maxW =
      width / visibleData.length > params.maxBarWidth
        ? visibleData.length * params.maxBarWidth
        : width;

    return scaleBand<number>({
      range: [0, width === null ? 0 : maxW],
      domain: visibleData.map((_, i) => i),
      padding: params.padding,
    });
  }, [visibleData, width, params.padding, params.maxBarWidth]);

  // y-axis is document count
  const yScale = useMemo(
    () =>
      scaleLinear<number>({
        domain: [0, Math.max(...visibleData.map(d => d.count))],
        range: [height - 1, 0],
      }),
    [visibleData, height],
  );

  // Set svg width to the exact width of the barchart
  const svgWidth = useMemo(
    () => (xScale(visibleData.length - 1) || 0) + xScale.bandwidth(),
    [visibleData.length, xScale],
  );

  // "Fill in" the data where years are missing
  const updatedCounts = useMemo(() => {
    const filled = addMissingYears([...sanitizedUpdatedData]);
    // Filter again after addMissingYears to ensure no future years
    return filled.filter(d => {
      const year = parseInt(d.term.split('-')[0], 10);
      return year <= currentYear;
    });
  }, [sanitizedUpdatedData, currentYear]);

  // Calculate tick values for x-axis - only show min and max
  const xAxisTickValues = useMemo(() => {
    if (visibleData.length === 0) return [];
    if (visibleData.length === 1) return [0];
    return [0, visibleData.length - 1];
  }, [visibleData.length]);

  if (!filteredData) {
    return <></>;
  }

  return (
    <div
      id='date-histogram'
      style={{
        position: 'relative',
        width: '100%',
      }}
    >
      {/* Show tooltip when hovering in any vertical space to bar. */}
      {tooltipOpen && (
        <TooltipInPortal
          // set this to random so it correctly updates with parent bounds
          key={Math.random()}
          top={tooltipTop}
          left={tooltipLeft}
        >
          {tooltipData && tooltipData.label && (
            <>
              {tooltipData.label}:{' '}
              {/* Show the updated count and initial count when they differ and the bar is selected. */}
              {range_min &&
                range_max &&
                tooltipData.term >= range_min &&
                tooltipData.term <= range_max &&
                tooltipData.updatedCount !== tooltipData.count &&
                tooltipData.updatedCount! > 0 &&
                `${formatNumber(tooltipData.updatedCount)} of `}
              {formatNumber(tooltipData.count)}
            </>
          )}
        </TooltipInPortal>
      )}

      {/* Bars */}
      <Flex ref={containerRef} justifyContent='center'>
        {visibleData.length ? (
          <Box>
            <Box
              as='svg'
              id='filters-histogram'
              width={svgWidth + 40}
              height={height + 30}
              style={{ overflow: 'visible' }}
            >
              <defs>
                <linearGradient
                  id='histogram-gradient'
                  gradientUnits='userSpaceOnUse'
                  x1='0'
                  y1='0'
                  x2='0'
                  y2='100%'
                >
                  <stop offset='0' stopColor='#e05e8f'></stop>
                  <stop offset='1' stopColor='#241683'></stop>
                </linearGradient>
              </defs>
              <Group left={20}>
                {visibleData.map((d, i) => {
                  const { term, count } = d;
                  /* Updated counts when date has changed */
                  const updatedCount =
                    updatedCounts.find(u => u.term === term)?.count || 0;

                  const barWidth = xScale.bandwidth();
                  const barX = xScale(i);

                  const barCount =
                    updatedCount > 0 && updatedCount < count
                      ? updatedCount
                      : count;

                  const defaultBarHeight = Math.ceil(height - yScale(count));
                  const barHeight = Math.ceil(height - yScale(barCount));
                  const barY = height - barHeight;

                  const hovered = term === tooltipData?.term;
                  let fill = `url("#histogram-gradient")`;

                  if (count === 0 && updatedCount === 0) {
                    fill = theme.colors.gray[200];
                  }

                  return (
                    <React.Fragment key={`bar-${term}`}>
                      {/* Used only when the bar is selected and the updated count is less than the full count. */}
                      {updatedCount > 0 && updatedCount < count && (
                        <Bar
                          className='partial-bar'
                          x={barX}
                          width={barWidth}
                          opacity={
                            hovered
                              ? params.opacity.hover
                              : params.opacity.active
                          }
                          y={height - defaultBarHeight}
                          height={defaultBarHeight}
                          fill={params.fill.gray}
                        />
                      )}

                      {/* Bars that show the full count.*/}
                      <Bar
                        className='full-bar'
                        x={barX}
                        width={barWidth}
                        opacity={
                          hovered ? params.opacity.hover : params.opacity.active
                        }
                        y={barY}
                        height={barHeight}
                        fill={fill}
                      />
                    </React.Fragment>
                  );
                })}
              </Group>

              {/* Invisible bars for tooltip triggers */}
              <Group left={20}>
                {visibleData.map((d, i) => {
                  const { term } = d;
                  /* Updated counts when date has changed */
                  const updatedCount =
                    updatedCounts.find(u => u.term === term)?.count || 0;

                  const barWidth = xScale.bandwidth();
                  const barX = xScale(i);

                  return (
                    <React.Fragment key={`invisible-bar-${term}`}>
                      <Bar
                        className='hover-bar'
                        x={barX}
                        y={0}
                        width={barWidth}
                        height={height}
                        fill='transparent'
                        onMouseOver={e =>
                          handleMouseOver(e, {
                            ...d,
                            updatedCount,
                          })
                        }
                        onMouseOut={hideTooltip}
                        style={{ cursor: 'pointer' }}
                        onClick={() => {
                          const year = term.split('-')[0];
                          handleClick([`${year}-01-01`, `${year}-12-31`]);
                        }}
                      />
                    </React.Fragment>
                  );
                })}
              </Group>

              {/* x-axis */}
              <Group left={20}>
                <AxisBottom
                  top={height}
                  scale={xScale}
                  tickValues={xAxisTickValues}
                  tickFormat={i => visibleData[i as number]?.label || ''}
                  stroke={theme.colors.gray[300]}
                  tickStroke={theme.colors.gray[300]}
                  tickLabelProps={() => ({
                    fill: theme.colors.gray[600],
                    fontSize: 13,
                    textAnchor: 'middle',
                  })}
                />
              </Group>
            </Box>

            {/* slider */}
            <Flex w='100%' position='relative' mt={0}>
              {/*
                Position slider under bars where
                [left]  = first bar's x-position + half bar width.
                [width] = last bar's x-position - half bar width.
                */}
              <Box
                position='absolute'
                left={`${(xScale(0) || 0) + xScale.bandwidth() / 2 + 20}px`}
                w={`${xScale(visibleData.length - 1) || 0}px`}
              >
                {children}
              </Box>
            </Flex>
          </Box>
        ) : (
          <Text fontStyle='italic' color='gray.800' mt={1}>
            No results with date information.
          </Text>
        )}
      </Flex>
    </div>
  );
};

export default Histogram;
