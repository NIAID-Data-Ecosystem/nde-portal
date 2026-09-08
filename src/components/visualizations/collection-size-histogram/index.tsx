import React, { useCallback, useMemo } from 'react';
import { useRouter } from 'next/router';
import { Box, Flex } from '@chakra-ui/react';
import { AxisBottom } from '@visx/axis';
import { Group } from '@visx/group';
import { useParentSize } from '@visx/responsive';
import { scaleBand, scaleLinear } from '@visx/scale';
import { Bar } from '@visx/shape';
import { defaultStyles, useTooltip, useTooltipInPortal } from '@visx/tooltip';
import { theme } from 'src/theme';
import { formatNumber } from 'src/utils/helpers';
import {
  COLLECTION_SIZE_VALUE_FIELD,
  RANGE_WILDCARD,
  getBucketByKey,
  getBucketRangeValues,
} from 'src/views/search/config/collection-size';
import { SelectedFilterType } from 'src/views/search/components/filters/types';
import {
  queryFilterObject2String,
  queryFilterString2Object,
} from 'src/views/search/components/filters/utils/query-string';
import { usePaginationContext } from 'src/views/search/context/pagination-context';
import { ChartDatum } from 'src/views/search/components/summary/types';
import { updateRoute } from 'src/views/search/utils/update-route';

export interface CollectionSizeHistogramProps {
  /** One datum per collection size bucket, ascending. */
  data: ChartDatum[];
  /** Whether the chart is expanded into a modal. */
  isExpanded?: boolean;
  /** Card label, used as the chart's accessible name. */
  label?: string;
}

const CHART_HEIGHT = 180;
const AXIS_HEIGHT = 28;

/**
 * A bar has to stay visible and clickable even when its count rounds to
 * nothing next to the largest bucket — the distribution spans hundreds of
 * thousands of records down to single digits.
 */
const MIN_BAR_HEIGHT = 3;

/** Applied range endpoints, `*` marking an open end. */
const appliedRangeValues = (selectedFilters: SelectedFilterType): string[] =>
  (selectedFilters[COLLECTION_SIZE_VALUE_FIELD] || []).filter(
    (value): value is string => typeof value === 'string',
  );

/** Endpoint as a number, or undefined when unbounded. */
const toBound = (value?: string): number | undefined => {
  if (!value || value === RANGE_WILDCARD) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
};

/**
 * Collection size histogram.
 *
 * Bars show the distribution of `collectionSize.minValue` across decades, and
 * clicking one applies that decade as the range filter. Like the date
 * histogram, it owns its own route updates rather than going through the
 * card's generic slice-click path, because a bar stands for a numeric range
 * rather than a facet term.
 */
export const CollectionSizeHistogram = ({
  data,
  isExpanded,
  label = 'Collection Size',
}: CollectionSizeHistogramProps) => {
  const router = useRouter();
  const { resetPagination } = usePaginationContext();

  const selectedFilters: SelectedFilterType = useMemo(() => {
    const queryFilters = router.query.filters;
    const filterString = Array.isArray(queryFilters)
      ? queryFilters.join('')
      : queryFilters || '';
    return queryFilterString2Object(filterString) || {};
  }, [router.query.filters]);

  // Which buckets the applied range covers. A bucket counts as selected when
  // the range overlaps it at all, so a partial range (e.g. 1,500–3,000) still
  // marks the decade it sits in.
  const isBucketSelected = useCallback(
    (bucketKey: string) => {
      const range = appliedRangeValues(selectedFilters);
      if (range.length === 0) return false;

      const bucket = getBucketByKey(bucketKey);
      if (!bucket) return false;

      const min = toBound(range[0]);
      const max = toBound(range[1]);
      const bucketMax = bucket.max ?? Infinity;

      return (
        (min === undefined || min <= bucketMax) &&
        (max === undefined || max >= bucket.min)
      );
    },
    [selectedFilters],
  );

  const hasAppliedRange = appliedRangeValues(selectedFilters).length > 0;

  // Clicking a bar applies its decade; clicking the only selected bar clears
  // the range. Spreading the current filters is what preserves the unit
  // selection and every other active filter.
  const handleBarClick = useCallback(
    (bucketKey: string) => {
      const bucket = getBucketByKey(bucketKey);
      if (!bucket) return;

      const current = appliedRangeValues(selectedFilters);
      const bucketRange = getBucketRangeValues(bucket);
      const isExactlyThisBucket =
        current.length === bucketRange.length &&
        current.every((value, index) => value === bucketRange[index]);

      resetPagination();
      updateRoute(router, {
        from: 1,
        filters: queryFilterObject2String({
          ...selectedFilters,
          [COLLECTION_SIZE_VALUE_FIELD]: isExactlyThisBucket ? [] : bucketRange,
        }),
      });
    },
    [resetPagination, router, selectedFilters],
  );

  const {
    tooltipData,
    tooltipLeft,
    tooltipTop,
    tooltipOpen,
    showTooltip,
    hideTooltip,
  } = useTooltip<{ id: string; tooltip: string }>();

  const { containerRef, containerBounds, TooltipInPortal } = useTooltipInPortal(
    { detectBounds: true, scroll: true, zIndex: 1000 },
  );

  // Type-cast to fix React 18+ type compatibility issue, as in the date
  // histogram.
  const TooltipComponent = TooltipInPortal as any;

  const { parentRef, height } = useParentSize({
    debounceTime: 150,
    initialSize: { height: CHART_HEIGHT },
  });

  const width = useMemo(
    () => containerBounds?.width || 0,
    [containerBounds?.width],
  );

  const chartHeight = Math.max(0, height - AXIS_HEIGHT);

  const xScale = useMemo(
    () =>
      scaleBand<string>({
        range: [0, width],
        domain: data.map(d => d.id),
        padding: 0.2,
      }),
    [data, width],
  );

  const yScale = useMemo(
    () =>
      scaleLinear<number>({
        domain: [0, Math.max(...data.map(d => d.value), 1)],
        range: [chartHeight, 0],
      }),
    [data, chartHeight],
  );

  const handleMouseOver = useCallback(
    (event: React.MouseEvent<SVGRectElement>, datum: ChartDatum) => {
      showTooltip({
        tooltipLeft:
          ('clientX' in event ? event.clientX : 0) - containerBounds.left,
        tooltipTop:
          ('clientY' in event ? event.clientY : 0) - containerBounds.top,
        tooltipData: { id: datum.id, tooltip: datum.tooltip || datum.label },
      });
    },
    [containerBounds.left, containerBounds.top, showTooltip],
  );

  if (data.length === 0) {
    return <></>;
  }

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      {tooltipOpen && tooltipData && (
        <TooltipComponent
          // Set to random so it correctly updates with parent bounds.
          key={Math.random()}
          top={tooltipTop}
          left={tooltipLeft}
          style={{ ...defaultStyles, zIndex: 2000 }}
        >
          {tooltipData.tooltip}
        </TooltipComponent>
      )}

      <Flex ref={containerRef} w='100%' h='100%'>
        <Flex ref={parentRef} w='100%' h='100%' minH={0}>
          <Box
            as='svg'
            id='collection-size-histogram'
            width={width}
            height={height}
            role='group'
            aria-label={`${label} distribution`}
            style={{ overflow: 'visible' }}
            // The UA focus outline is not reset for SVG the way it is for HTML
            // elements, so a mouse click would otherwise box a bar's full-height
            // hit area. Keyboard focus still gets a visible ring.
            sx={{
              '.hover-bar:focus': { outline: 'none' },
              '.hover-bar:focus-visible': {
                outline: `2px solid ${theme.colors.secondary[500]}`,
                outlineOffset: '-2px',
              },
            }}
          >
            <defs>
              <linearGradient
                id='collection-size-histogram-gradient'
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
              {data.map(datum => {
                const isSelected = isBucketSelected(datum.id);
                const barWidth = xScale.bandwidth();
                const barX = xScale(datum.id) ?? 0;
                const scaledHeight = Math.ceil(
                  chartHeight - yScale(datum.value),
                );
                const barHeight =
                  datum.value > 0
                    ? Math.max(scaledHeight, MIN_BAR_HEIGHT)
                    : scaledHeight;
                const hovered = tooltipData?.id === datum.id;

                // With a range applied, the buckets outside it drop to grey so
                // the selection reads against the full distribution.
                const fill =
                  hasAppliedRange && !isSelected
                    ? theme.colors.gray[200]
                    : `url("#collection-size-histogram-gradient")`;

                return (
                  <Bar
                    key={`bar-${datum.id}`}
                    x={barX}
                    y={chartHeight - barHeight}
                    width={barWidth}
                    height={barHeight}
                    fill={fill}
                    opacity={hovered ? 0.65 : 1}
                    style={{ transition: 'y 0.1s ease, height 0.1s ease' }}
                  />
                );
              })}
            </Group>

            {/* Full-height hit areas: the bars themselves are too short to
                click in the small buckets. */}
            <Group>
              {data.map(datum => {
                const isSelected = isBucketSelected(datum.id);
                return (
                  <Bar
                    key={`hover-bar-${datum.id}`}
                    className='hover-bar'
                    x={xScale(datum.id) ?? 0}
                    y={0}
                    width={xScale.bandwidth()}
                    height={chartHeight}
                    fill='transparent'
                    role='button'
                    tabIndex={0}
                    aria-pressed={isSelected}
                    aria-label={`${datum.tooltip || datum.label}. ${
                      isSelected ? 'Remove' : 'Apply'
                    } this ${label.toLowerCase()} range filter.`}
                    // No outline override: the browser's own focus-visible
                    // ring marks keyboard focus without boxing the full chart
                    // height on every mouse click.
                    style={{ cursor: 'pointer' }}
                    onMouseOver={event => handleMouseOver(event, datum)}
                    onMouseOut={hideTooltip}
                    onClick={() => handleBarClick(datum.id)}
                    onKeyDown={event => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        handleBarClick(datum.id);
                      }
                    }}
                  />
                );
              })}
            </Group>

            <Group>
              <AxisBottom
                top={chartHeight}
                scale={xScale}
                tickFormat={id =>
                  data.find(d => d.id === id)?.label ?? String(id)
                }
                stroke={theme.colors.gray[300]}
                tickStroke={theme.colors.gray[300]}
                tickLabelProps={() => ({
                  fill: theme.colors.gray[600],
                  fontSize: isExpanded ? 13 : 11,
                  textAnchor: 'middle',
                })}
              />
            </Group>
          </Box>
        </Flex>
      </Flex>
    </div>
  );
};

/** Formatted count for a bar's accessible label and tooltip. */
export const formatBucketCount = (count: number) =>
  `${formatNumber(count)} result${count === 1 ? '' : 's'}`;
