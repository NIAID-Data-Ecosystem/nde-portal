import React, { useCallback, useMemo } from 'react';
import { Box, Flex, Text } from '@chakra-ui/react';
import { theme } from 'src/theme';
import { Group } from '@visx/group';
import { scaleBand, scaleLinear } from '@visx/scale';
import { Bar } from '@visx/shape';
import { AxisBottom } from '@visx/axis';
import { useTooltip, useTooltipInPortal, defaultStyles } from '@visx/tooltip';
import { formatNumber } from 'src/utils/helpers';
import { addMissingYears } from '../helpers';
import { useDateRangeContext } from '../hooks/useDateRangeContext';
import { FilterTermType } from '../../../types';
import { DateBrush } from './date-brush';
import { useParentSize } from '@visx/responsive';

interface HistogramProps {
  updatedData: FilterTermType[];
  handleClick: (args: string[]) => void;
}

const Histogram = ({ updatedData, handleClick }: HistogramProps) => {
  const { filteredData, dates, allData } = useDateRangeContext();
  const brushSectionHeight = 50;
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
      height: 180,
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

  const { parentRef, height } = useParentSize({
    debounceTime: 150,
    initialSize: { height: params.height },
  });
  const range_min = useMemo(() => dates[0], [dates]);
  const range_max = useMemo(() => dates[1], [dates]);

  const {
    tooltipData,
    tooltipLeft,
    tooltipTop,
    tooltipOpen,
    showTooltip,
    hideTooltip,
  } = useTooltip({
    tooltipData: {
      count: 0,
      term: '',
      label: '',
      updatedCount: 0,
      display: {
        label: '',
        total: '',
        count: '',
        updatedCount: '',
        countText: '',
      },
    },
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

  // Type-cast to fix React 18+ type compatibility issue
  const TooltipComponent = TooltipInPortal as any;

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

      // Show "updatedCount of count" if updatedCount is smaller than total count (addressing issue with use_ai_search facet counts) and greater than 0, otherwise just show count
      const showFullDisplayText =
        range_min &&
        range_max &&
        datum.term >= range_min &&
        datum.term <= range_max &&
        datum.updatedCount !== datum.count &&
        datum.updatedCount < datum.count &&
        datum.updatedCount > 0;

      const display = {
        label: datum.label,
        total: formatNumber(datum.count),
        count: formatNumber(datum.count),
        updatedCount: formatNumber(datum.updatedCount),
        countText: '',
      };

      display.countText = showFullDisplayText
        ? `${display.updatedCount} of ${display.total}`
        : display.total;

      // const displayText =
      showTooltip({
        tooltipLeft: coordsX,
        tooltipTop: coordsY,
        tooltipData: { ...datum, display },
      });
    },
    [
      containerBounds.left,
      containerBounds.top,
      range_min,
      range_max,
      showTooltip,
    ],
  );

  // visibleData is filteredData (already filtered by date range in context)
  const visibleData = filteredData;

  // Check if there's any data with count > 0 in the visible range
  const hasDataInRange = useMemo(
    () =>
      visibleData &&
      visibleData.length > 0 &&
      visibleData.some(d => d.count > 0),
    [visibleData],
  );

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

  // Set svg width
  const svgWidth = useMemo(
    () => (xScale(visibleData.length - 1) || 0) + xScale.bandwidth(),
    [visibleData.length, xScale],
  );

  // Ensure minimum width for message display
  const effectiveSvgWidth = useMemo(
    () => (hasDataInRange ? svgWidth : Math.max(svgWidth, 360)),
    [svgWidth, hasDataInRange],
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

  // Calculate tick values for x-axis. Only show min and max.
  const xAxisTickValues = useMemo(() => {
    if (visibleData.length === 0) return [];
    if (visibleData.length === 1) return [0];
    return [0, visibleData.length - 1];
  }, [visibleData.length]);

  // Early return if no data at all in the complete dataset
  if (!allData || allData.length === 0) {
    return <></>;
  }
  return (
    <div
      id='date-histogram'
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
      }}
    >
      {/* Show tooltip when hovering in any vertical space to bar. */}
      {tooltipOpen && tooltipData && tooltipData.label && (
        <TooltipComponent
          // set this to random so it correctly updates with parent bounds
          key={Math.random()}
          top={tooltipTop}
          left={tooltipLeft}
          style={{
            ...defaultStyles,
            zIndex: 2000, // needed for when housed in a modal.
          }}
        >
          {tooltipData.label}: {tooltipData.display.countText}
        </TooltipComponent>
      )}

      <Flex ref={containerRef} justifyContent='center' h='100%'>
        <Flex w='100%' h='100%' flexDirection='column'>
          <Flex ref={parentRef} justifyContent='center' width='100%' minH={0}>
            <Box
              as='svg'
              id='filters-histogram'
              width={effectiveSvgWidth}
              height={height}
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
              <Group>
                {hasDataInRange ? (
                  <>
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

                      const defaultBarHeight = Math.ceil(
                        height - yScale(count),
                      );
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
                              style={{
                                transition: 'y 0.1s ease, height 0.1s ease',
                              }}
                            />
                          )}
                          {/* Bars that show the full count. */}
                          <Bar
                            className='full-bar'
                            x={barX}
                            width={barWidth}
                            opacity={
                              hovered
                                ? params.opacity.hover
                                : params.opacity.active
                            }
                            y={barY}
                            height={barHeight}
                            fill={fill}
                            style={{
                              transition: 'y 0.1s ease, height 0.1s ease',
                            }}
                          />
                        </React.Fragment>
                      );
                    })}
                  </>
                ) : (
                  <>
                    {/* Show message when no data in range */}
                    <text
                      x={effectiveSvgWidth / 2}
                      y={height / 2}
                      dy='1rem'
                      textAnchor='middle'
                      fill={theme.colors.gray[800]}
                      fontSize='14'
                    >
                      No data available. Please use a different date range.
                    </text>
                  </>
                )}
              </Group>

              {/* Invisible bars for tooltip triggers */}
              {hasDataInRange && (
                <Group>
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
                            // Set filter to single year
                            const year = term.split('-')[0];
                            handleClick([`${year}-01-01`, `${year}-12-31`]);
                          }}
                        />
                      </React.Fragment>
                    );
                  })}
                </Group>
              )}
              {/* x-axis */}
              {hasDataInRange && (
                <Group>
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
              )}
            </Box>
          </Flex>
          {/* brush */}
          <Flex
            w='100%'
            justifyContent='center'
            mt={8}
            flexShrink={0}
            minHeight={brushSectionHeight}
          >
            <DateBrush containerWidth={width} />
          </Flex>
        </Flex>
      </Flex>
    </div>
  );
};

export default Histogram;
