import React, { useCallback, useMemo } from 'react';
import { Box, Flex, Heading, theme } from 'nde-design-system';
import { Bar } from '@visx/shape';
import { Group } from '@visx/group';
import { FacetTerm } from 'src/utils/api/types';
import { useTooltip, useTooltipInPortal } from '@visx/tooltip';
import { formatNumber } from 'src/utils/helpers';
import { PatternLines } from '@visx/pattern';
import { scaleBand, scaleLinear } from '@visx/scale';
import { addMissingYears } from '../helpers';

/*
  SCALES FOR HISTOGRAM
    [xScale]: Based on responsive container width.
    [yScale]: Based on count updating.
*/
const MAX_BAR_WIDTH = 50;
export const xScale = (width: number, data: any[]) => {
  const maxW =
    width / data.length > MAX_BAR_WIDTH ? data.length * MAX_BAR_WIDTH : width;

  return scaleBand<number>({
    range: [0, width === null ? 0 : maxW],
    domain: data.map((_, i) => i),
    padding: 0.3,
  });
};

export const yScale = (height: number, data: FacetTerm[]) =>
  scaleLinear<number>({
    range: [height - 1, 0],
    domain: [0, Math.max(...data.map(d => d.count))],
  });

interface HistogramProps {
  data: FacetTerm[];
  updatedData: FacetTerm[];
  range: string[];
  handleClick: (args: string) => void;
}

const params = {
  height: 150,
  fill: {
    active: theme.colors.primary[400],
    disabled: theme.colors.gray[200],
  },
  hover: { fill: theme.colors.primary[600] },
};

export const Histogram: React.FC<HistogramProps> = React.memo(
  ({ children, data, updatedData, range, handleClick }) => {
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

    const { containerRef, containerBounds, TooltipInPortal } =
      useTooltipInPortal({
        detectBounds: true,
        scroll: true,
        zIndex: 1000,
      });

    const width = useMemo(
      () => containerBounds?.width || 0,
      [containerBounds?.width],
    );
    const height = params.height;

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

    ////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////     Scales      //////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////
    // set a max width for bars
    const scaleDate = useMemo(
      () =>
        xScale(
          width,
          data.map((_, i) => i),
        ),
      [data, width],
    );

    // Set svg width to the exact width of the barchart.
    const svgWidth = useMemo(
      () => (scaleDate(data.length - 1) || 0) + scaleDate.bandwidth(),
      [data.length, scaleDate],
    );

    const updatedCounts = useMemo(
      () => addMissingYears(updatedData),
      [updatedData],
    );

    const scaleCount = useMemo(() => yScale(height, data), [height, data]);
    const resourcesWithNoDatesIndex = useMemo(
      () => data.findIndex(d => d.term === '-_exists_'),
      [data],
    );
    const resourcesWithDatesIndex = useMemo(
      () => data.findIndex(d => d.term !== '-_exists_'),
      [data],
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
                {tooltipData.updatedCount > 0 &&
                  tooltipData.updatedCount !== tooltipData.count &&
                  `${formatNumber(tooltipData.updatedCount)} of `}
                {formatNumber(tooltipData.count)}
              </>
            )}
          </TooltipInPortal>
        )}

        <Flex ref={containerRef} mb={10} justifyContent='center'>
          {/* Bar representing resources with no dates. */}
          {data.length ? (
            <Box>
              <Box as='svg' id='filters-histogram' width={svgWidth}>
                <Group>
                  {data.map((d, i) => {
                    const { term, count, displayAs } = d;
                    const barWidth = scaleDate.bandwidth();
                    const barX = scaleDate(i);

                    const barHeight = Math.ceil(
                      height - (scaleCount(count) ?? 0),
                    );
                    const barY = height - barHeight;

                    /* Updated counts when date has changed */
                    const updatedCount =
                      updatedCounts.find(u => u.term === term)?.count || 0;

                    const updatedBarHeight = Math.ceil(
                      height - (scaleCount(updatedCount) ?? 0),
                    );

                    let fill = range.includes(d.term)
                      ? params.fill.active
                      : params.fill.disabled;

                    // If bar is hovered over, fill with a different color.
                    if (d.term === tooltipData?.term) {
                      fill = params.hover.fill;
                    }
                    // If no count, keep as grey even when hovered over.
                    if (updatedCount === 0) {
                      fill = params.fill.disabled;
                    }

                    return (
                      <React.Fragment key={`bar-${term}`}>
                        {/* Texture for "none" bar */}
                        <PatternLines
                          id='texture'
                          height={6}
                          width={6}
                          stroke={
                            range.includes(d.term)
                              ? params.fill.active
                              : params.fill.disabled
                          }
                          strokeWidth={1}
                          orientation={['diagonal']}
                        />

                        {/* Bars that depict the initial data (without date filtering). */}
                        <Bar
                          x={barX}
                          y={barY}
                          width={barWidth}
                          height={barHeight}
                          fill={
                            d.term === '-_exists_'
                              ? `url(#texture)`
                              : params.fill.disabled
                          }
                        />

                        {/* Bars. Fill color based on selection. */}
                        <Bar
                          x={barX}
                          y={height - updatedBarHeight}
                          width={barWidth}
                          height={updatedBarHeight}
                          fill={d.term === '-_exists_' ? `url(#texture)` : fill}
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
                          onClick={() => handleClick(d.term)}
                        />
                      </React.Fragment>
                    );
                  })}
                </Group>
              </Box>

              {/* Label for resources with no dates */}
              <Flex w='100%' position='relative'>
                {resourcesWithNoDatesIndex > -1 && (
                  <Box
                    position='absolute'
                    left={scaleDate(resourcesWithNoDatesIndex) || 0}
                  >
                    <Heading
                      as='h5'
                      fontSize='0.85rem'
                      mt={1}
                      textAlign='center'
                    >
                      N/A
                    </Heading>
                  </Box>
                )}

                {/* Position slider under bars */}
                {resourcesWithDatesIndex > -1 && (
                  <Box
                    position='absolute'
                    left={`${
                      (scaleDate(resourcesWithDatesIndex) || 0) +
                      scaleDate.bandwidth() / 2
                    }px`}
                    w={
                      (scaleDate(
                        data.length - (resourcesWithNoDatesIndex > -1 ? 2 : 1),
                      ) || 0) -
                      scaleDate.bandwidth() / 2
                    }
                  >
                    {children}
                  </Box>
                )}
              </Flex>
            </Box>
          ) : (
            <></>
          )}
        </Flex>
      </div>
    );
  },
);

// {aggregateDatesByYear(updatedData).map((d, i) => {
//   const { term, count } = d;
//   const barWidth = scaleDate.bandwidth();
//   const barHeight = Math.ceil(height - (scaleCount(count) ?? 0));
//   const barX = scaleDate(i);
//   const barY = height - barHeight;
//   let fill =
//     range.includes(d.term) && d.count !== 0
//       ? params.fill.active
//       : 'transparent';

//   return (
//     <React.Fragment key={`bar-${term}-color`}>
//       {/* Bars. Fill color based on selection. */}
//       <Bar
//         x={barX}
//         y={barY}
//         width={barWidth}
//         height={barHeight}
//         fill={fill}
//       />
//       {/* Transparent full height bar used for detecting mouse over tooltip. */}
//       {/* <Bar
//         x={barX}
//         y={0}
//         width={barWidth}
//         height={height}
//         fill='transparent'
//         onMouseOver={e => handleMouseOver(e, d)}
//         onMouseOut={hideTooltip}
//         style={{ cursor: 'pointer' }}
//         onClick={() => handleClick(d.term)}
//       /> */}
//     </React.Fragment>
//   );
// })}
