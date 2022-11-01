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
}

type ThemeColorsKeys = keyof typeof theme.colors;

/*
Histogram consists of :
- default [data] (data unaffected by date filtering - represented by gray bars)
- [updatedData] (data updated to reflect filtered resources - represented by coloured bars)
*/

export const Histogram: React.FC<HistogramProps> = ({
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

  const themeColorScheme = useMemo(
    () => theme.colors[(colorScheme || 'primary') as ThemeColorsKeys],
    [colorScheme],
  );

  const params = useMemo(
    () => ({
      maxBarWidth: 40,
      height: 150,
      padding: 0.1,
      fill: {
        active: `url(#gradient)`,
        inactive: theme.colors.blackAlpha[100],
        gray: theme.colors.gray[200],
      },
      hover: {
        fill: `url(#gradient-hover)`,
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
        range: [height - 1, 0],
        domain: [0, Math.max(...data.map(d => d.count))],
      }),
    [data, height],
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
              {/* Gradient fill for bars. */}
              <LinearGradient
                id='gradient'
                from={theme.colors.accent.bg}
                to={themeColorScheme[600 as keyof typeof themeColorScheme]}
              />

              {/* Gradient fill for bars on hover. */}
              <LinearGradient
                id='gradient-hover'
                from={theme.colors.accent.bg}
                to={themeColorScheme[600 as keyof typeof themeColorScheme]}
                fromOpacity={0.5}
                toOpacity={0.5}
              />

              <Group>
                {data.map((d, i) => {
                  const { term, count } = d;

                  const barWidth = xScale.bandwidth();
                  const barX = xScale(i);

                  const barHeight = Math.ceil(height - (yScale(count) ?? 0));
                  const barY = height - barHeight;

                  /* Updated counts when date has changed */
                  const updatedCount =
                    updatedCounts.find(u => u.term === term)?.count || 0;

                  const updatedBarHeight = Math.ceil(
                    height - (yScale(updatedCount) ?? 0),
                  );

                  const hovered = term === tooltipData?.term;
                  let fill = params.fill.gray;

                  if (range_min && range_max) {
                    const termInRange = term >= range_min && term <= range_max;

                    // fill = termInRange ? `url(#gradient)` : params.fill.gray;
                    fill = termInRange ? params.fill.active : params.fill.gray;

                    // If bar is hovered over, fill with a different color.
                    // if count is zero we fill the bar with a lighter colors
                    if (count === 0) {
                      fill = termInRange
                        ? params.fill.inactive
                        : theme.colors.gray[200];
                    }
                    if (hovered) {
                      fill = termInRange
                        ? params.hover.fill
                        : params.hover.gray;
                    }
                  }

                  return (
                    <React.Fragment key={`bar-${term}`}>
                      {/* Bars that depict the initial data (without date filtering). */}
                      <Bar
                        x={barX}
                        y={barY}
                        width={barWidth}
                        height={barHeight}
                        fill={
                          updatedCount >= 0 && !isDragging
                            ? params.fill.gray
                            : fill
                        }
                      />

                      {/* Updated count bars. Fill color based on selection. */}
                      <Bar
                        x={barX}
                        y={height - updatedBarHeight}
                        width={barWidth}
                        height={updatedBarHeight}
                        fill={isDragging ? 'transparent' : fill}
                      />

                      {/* Transparent full height bar used for detecting mouse over tooltip. */}
                      <Bar
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
