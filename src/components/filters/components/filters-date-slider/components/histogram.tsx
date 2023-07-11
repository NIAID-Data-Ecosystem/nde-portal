import React, { useCallback, useMemo } from 'react';
import { Box, Flex, theme } from 'nde-design-system';
import { Bar } from '@visx/shape';
import { Group } from '@visx/group';
import { FacetTerm } from 'src/utils/api/types';
import { useTooltip, useTooltipInPortal } from '@visx/tooltip';
import { formatNumber } from 'src/utils/helpers';
import { scaleBand, scaleLinear } from '@visx/scale';
import { addMissingYears } from '../helpers';
import { useDateRangeContext } from '../hooks/useDateRangeContext';
import { LinearGradient } from '@visx/gradient';

interface HistogramProps {
  updatedData: FacetTerm[];
  handleClick: (args: string[]) => void;
  children: React.ReactNode;
}

/*
Histogram consists of :
- default [data] (data unaffected by date filtering - represented by gray bars)
- [updatedData] (data updated to reflect filtered resources - represented by coloured bars)
*/

const Histogram: React.FC<HistogramProps> = ({
  children,
  updatedData,
  handleClick,
}) => {
  const {
    colorScheme,
    data = [],
    dates,
    setDateRange,
    isDragging,
  } = useDateRangeContext();

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
      opacity: { hover: 0.5, active: 1 },
    }),
    [],
  );

  const range_min = useMemo(() => dates[0], [dates]);
  const range_max = useMemo(() => dates[1], [dates]);

  ////////////////////////////////////////////////////////////////////////////////////
  ////////////////////////////     TOOLTIP      //////////////////////////////////////
  ////////////////////////////////////////////////////////////////////////////////////

  const {
    tooltipData,
    tooltipLeft,
    tooltipTop,
    tooltipOpen,
    showTooltip,
    hideTooltip,
  } = useTooltip({
    tooltipData: { count: 0, term: '', displayAs: '', updatedCount: 0 },
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
        displayAs: string;
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

  /////////////////////////////////////////p///////////////////////////////////////////
  ////////////////////////////     Scales      //////////////////////////////////////
  ////////////////////////////////////////////////////////////////////////////////////
  // x-axis is date, using index for domain
  const xScale = useMemo(() => {
    const maxW =
      width / data.length > params.maxBarWidth
        ? data.length * params.maxBarWidth
        : width;

    return scaleBand<number>({
      range: [0, width === null ? 0 : maxW],
      domain: data.map((_, i) => i),
      padding: params.padding,
    });
  }, [data, width, params.padding, params.maxBarWidth]);

  // y-axis is document count.
  const yScale = useMemo(
    () =>
      scaleLinear<number>({
        domain: [0, Math.max(...data.map(d => d.count))],
        range: [height - 1, 0],
      }),
    [data, height],
  );

  // color scale using provided color scheme
  const colorScale = useMemo(
    () =>
      scaleLinear({
        domain: [0, Math.max(...data.map(d => d.count))],
        range: ['#241683', '#e05e8f'],
      }),
    [data],
  );

  // Set svg width to the exact width of the barchart.
  const svgWidth = useMemo(
    () => (xScale(data.length - 1) || 0) + xScale.bandwidth(),
    [data.length, xScale],
  );

  // "Fill in" the data where years are missing.
  const updatedCounts = useMemo(
    () => addMissingYears(updatedData),
    [updatedData],
  );

  if (!data) {
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
          {tooltipData && tooltipData.displayAs && (
            <>
              {tooltipData.displayAs}:{' '}
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
      <Flex ref={containerRef} justifyContent='center' mb={10}>
        {data.length ? (
          <Box>
            <Box as='svg' id='filters-histogram' width={svgWidth}>
              <Group>
                {data.map((d, i) => {
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

                  // const updatedBarHeight = Math.ceil(
                  //   height - yScale(updatedCount),
                  // );
                  const hovered = term === tooltipData?.term;
                  let fill = params.fill.gray;

                  const termInRange =
                    range_min &&
                    range_max &&
                    term >= range_min &&
                    term <= range_max;

                  if (range_min && range_max) {
                    fill = termInRange
                      ? `url(#gradient-${term})`
                      : params.fill.gray;

                    // If bar is hovered over, fill with a different color.
                    // if count is zero we fill the bar with a lighter colors
                    if (count === 0) {
                      fill = termInRange
                        ? params.fill.inactive
                        : theme.colors.gray[200];
                    }
                  }

                  return (
                    <React.Fragment key={`bar-${term}`}>
                      <LinearGradient
                        id={`gradient-${term}`}
                        from={colorScale(barCount)}
                        to={colorScale(0)}
                      />

                      {/* Bars that depict the full count (without date filtering). */}
                      {/* <Bar
                        className='default-bar'
                        x={barX}
                        y={barY}
                        width={barWidth}
                        height={barHeight}
                        opacity={
                          hovered ? params.opacity.hover : params.opacity.active
                        }
                        fill={
                          termInRange &&
                          updatedCount > 0 &&
                          updatedCount !== count
                            ? params.fill.gray
                            : fill
                        }
                      /> */}

                      {/* Updated count bars. Fill color based on selection. */}
                      {/* <Bar
                        className='active-count-bg'
                        x={barX}
                        y={height - (isDragging ? barHeight : updatedBarHeight)}
                        width={barWidth}
                        height={isDragging ? barHeight : updatedBarHeight}
                        fill={fill}
                        opacity={
                          hovered ? params.opacity.hover : params.opacity.active
                        }
                      /> */}

                      {updatedCount > 0 && updatedCount < count && (
                        <Bar
                          x={barX}
                          width={barWidth}
                          opacity={
                            hovered
                              ? params.opacity.hover
                              : params.opacity.active
                          }
                          y={height - defaultBarHeight}
                          height={barY}
                          fill={params.fill.gray}
                        />
                      )}

                      {/* Bars that depict the full count (without date filtering). */}
                      <Bar
                        className='default-bar'
                        x={barX}
                        width={barWidth}
                        opacity={
                          hovered ? params.opacity.hover : params.opacity.active
                        }
                        y={barY}
                        height={barHeight}
                        fill={fill}
                        // fill={
                        //   termInRange &&
                        //   updatedCount > 0 &&
                        //   updatedCount !== count
                        //     ? params.fill.gray
                        //     : fill
                        // }
                      />

                      {/* Invisible bars that are used to trigger the tooltip. */}
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
                          setDateRange([i, i]);
                          const year = term.split('-')[0];
                          handleClick([`${year}-01-01`, `${year}-12-31`]);
                        }}
                      />
                    </React.Fragment>
                  );
                })}
              </Group>
            </Box>

            {/* SLIDER */}
            <Flex w='100%' position='relative'>
              {/* 
                Position slider under bars where
                [left]  = first bar's x-position + half bar width.
                [width] = last bar's x-position - half bar width. 
                */}
              {
                <Box
                  position='absolute'
                  left={`${(xScale(0) || 0) + xScale.bandwidth() / 2}px`}
                  w={`${xScale(data.length - 1) || 0}px`}
                >
                  {children}
                </Box>
              }
            </Flex>
          </Box>
        ) : (
          <></>
        )}
      </Flex>
    </div>
  );
};

export default Histogram;
