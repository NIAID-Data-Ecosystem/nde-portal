import React, { useMemo, useRef, useCallback, useState } from 'react';
import { Box } from '@chakra-ui/react';
import { Group } from '@visx/group';
import { scaleLinear } from '@visx/scale';
import { AxisBottom } from '@visx/axis';
import { Brush } from '@visx/brush';
import { Bounds } from '@visx/brush/lib/types';
import BaseBrush from '@visx/brush/lib/BaseBrush';
import { BrushHandleRenderProps } from '@visx/brush/lib/BrushHandle';
import { theme } from 'src/theme';
import { useDateRangeContext } from '../hooks/useDateRangeContext';

interface BrushComponentProps {
  width: number;
  maxBarWidth: number;
  padding: number;
}

const BRUSH_HEIGHT = 30;
const AXIS_HEIGHT = 20;
const TOTAL_HEIGHT = BRUSH_HEIGHT + AXIS_HEIGHT;

export const BrushComponent = ({
  width,
  maxBarWidth,
  padding,
}: BrushComponentProps) => {
  const { allData } = useDateRangeContext();
  const brushRef = useRef<BaseBrush | null>(null);

  // Track current brush selection years
  const [brushYears, setBrushYears] = useState<{
    startYear: string;
    endYear: string;
  } | null>(null);

  // Get the earliest year from allData
  const earliestYear = useMemo(() => {
    if (!allData || allData.length === 0) return null;
    return allData[0]?.label || null;
  }, [allData]);

  // Get current year
  const currentYear = useMemo(() => new Date().getFullYear().toString(), []);

  // Calculate the chart width
  const horizontalPadding = 60;
  const chartWidth = useMemo(() => {
    if (!allData || allData.length === 0) return 0;

    const availableWidth = Math.max(0, width - horizontalPadding);
    return availableWidth / allData.length > maxBarWidth
      ? allData.length * maxBarWidth
      : availableWidth;
  }, [allData, width, maxBarWidth]);

  const xScale = useMemo(() => {
    if (!allData || allData.length === 0) return null;
    return scaleLinear<number>({
      domain: [0, chartWidth],
      range: [0, chartWidth],
    });
  }, [allData, chartWidth]);

  // Helper to convert pixel position to data index
  const pixelToIndex = useCallback(
    (pixelPos: number): number => {
      if (!allData || allData.length === 0 || chartWidth === 0) return 0;
      const ratio = pixelPos / chartWidth;
      return ratio * (allData.length - 1);
    },
    [allData, chartWidth],
  );

  // Helper to convert data index to pixel position
  const indexToPixel = useCallback(
    (index: number): number => {
      if (!allData || allData.length === 0) return 0;
      return (index / (allData.length - 1)) * chartWidth;
    },
    [allData, chartWidth],
  );

  // Only show ticks at the extremes (first and last index in pixel space)
  const tickValues = useMemo(() => {
    if (!allData || allData.length === 0) return [];
    if (allData.length === 1) return [0];
    return [0, chartWidth];
  }, [allData, chartWidth]);

  // Format ticks to show earliest year and current year
  const tickFormat = useMemo(() => {
    if (!earliestYear) return () => '';

    return (value: number | { valueOf(): number }) => {
      const pixelPos = typeof value === 'number' ? value : value.valueOf();
      const index = Math.round(pixelToIndex(pixelPos));
      if (index === 0) return earliestYear;
      if (index === allData.length - 1) return currentYear;
      return '';
    };
  }, [earliestYear, currentYear, allData, pixelToIndex]);

  // Find the index for year 2000 or the closest year after it
  const initialStartIndex = useMemo(() => {
    if (!allData || allData.length === 0) return 0;
    const index = allData.findIndex(d => {
      const year = parseInt(d.label, 10);
      return year >= 2000;
    });
    return index === -1 ? 0 : index;
  }, [allData]);

  // Initial brush selection bounds (2000 to current year)
  const initialBrushPosition = useMemo(() => {
    if (!xScale || !allData || allData.length === 0 || chartWidth === 0)
      return null;

    return {
      start: { x: indexToPixel(initialStartIndex) },
      end: { x: indexToPixel(allData.length - 1) },
    };
  }, [xScale, allData, initialStartIndex, indexToPixel, chartWidth]);

  // Set initial brush years
  React.useEffect(() => {
    if (allData && allData.length > 0 && !brushYears) {
      setBrushYears({
        startYear: allData[initialStartIndex]?.label || earliestYear || '',
        endYear: allData[allData.length - 1]?.label || currentYear,
      });
    }
  }, [allData, initialStartIndex, brushYears, earliestYear, currentYear]);

  const onBrushChange = useCallback(
    (domain: Bounds | null) => {
      if (!domain || !allData) return;

      // Convert pixel positions to data indices
      const rawStartIndex = pixelToIndex(domain.x0);
      const rawEndIndex = pixelToIndex(domain.x1);

      // Round to nearest integer and clamp to valid range
      const startIndex = Math.max(
        0,
        Math.min(Math.round(rawStartIndex), allData.length - 1),
      );
      const endIndex = Math.max(
        0,
        Math.min(Math.round(rawEndIndex), allData.length - 1),
      );

      const startYear = allData[startIndex]?.label || '';
      const endYear = allData[endIndex]?.label || '';

      setBrushYears({
        startYear,
        endYear,
      });
    },
    [allData, pixelToIndex],
  );

  if (
    !allData ||
    allData.length === 0 ||
    !xScale ||
    !earliestYear ||
    !initialBrushPosition
  ) {
    return null;
  }

  return (
    <Box
      as='svg'
      width={width}
      height={TOTAL_HEIGHT}
      style={{ overflow: 'visible' }}
    >
      <Group left={horizontalPadding / 2}>
        {/* Brush selection area */}
        <Brush
          xScale={xScale}
          yScale={scaleLinear({ range: [0, BRUSH_HEIGHT], domain: [0, 1] })}
          width={chartWidth}
          height={BRUSH_HEIGHT}
          innerRef={brushRef}
          resizeTriggerAreas={['left', 'right']}
          brushDirection='horizontal'
          initialBrushPosition={initialBrushPosition}
          onChange={onBrushChange}
          onClick={() => {}}
          selectedBoxStyle={{
            fill: theme.colors.secondary?.[500],
            fillOpacity: 0.3,
            stroke: theme.colors.secondary?.[500],
            strokeWidth: 2,
          }}
          useWindowMoveEvents
          renderBrushHandle={props => (
            <BrushHandle {...props} brushYears={brushYears} />
          )}
        />

        {/* x-axis with fixed labels (earliest and current year) */}
        <AxisBottom
          top={BRUSH_HEIGHT}
          scale={xScale}
          tickValues={tickValues}
          tickFormat={tickFormat}
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
  );
};

function BrushHandle({
  x,
  height,
  isBrushActive,
  className,
  brushYears,
}: BrushHandleRenderProps & {
  brushYears: { startYear: string; endYear: string } | null;
}) {
  const pathWidth = 8;
  const pathHeight = 15;
  const labelPadding = 6; // Spacing between handle and label
  const LABEL_VERTICAL_ADJUSTMENT = (height - pathHeight) / 8;

  if (!isBrushActive) {
    return null;
  }

  const isLeftHandle = className?.includes('left');
  const leftPosition = isLeftHandle ? x + pathWidth / 4 : x + pathWidth / 4;

  // Get the year label for the handle
  const yearLabel = brushYears
    ? isLeftHandle
      ? brushYears.startYear
      : brushYears.endYear
    : '';

  // Calculate label position
  const labelX = isLeftHandle
    ? -(pathWidth / 2) - labelPadding
    : pathWidth / 2 + labelPadding;

  const labelAnchor = isLeftHandle ? 'end' : 'start';

  return (
    <Group left={leftPosition} top={(height - pathHeight) / 2}>
      {/* Handle rectangle with grip lines */}
      <path
        fill='#f2f2f2'
        d='M -4.5 0.5 L 3.5 0.5 L 3.5 15.5 L -4.5 15.5 L -4.5 0.5 M -1.5 4 L -1.5 12 M 0.5 4 L 0.5 12'
        strokeWidth='1'
        stroke='#999'
        style={{ cursor: 'ew-resize' }}
      />

      {/* Year label positioned next to the handle */}
      <text
        x={labelX}
        y={pathHeight / 2 + LABEL_VERTICAL_ADJUSTMENT}
        textAnchor={labelAnchor}
        dominantBaseline='middle'
        fill={theme.colors.secondary?.[500]}
        fontSize={13}
        fontWeight={600}
        style={{ userSelect: 'none', pointerEvents: 'none' }}
      >
        {yearLabel}
      </text>
    </Group>
  );
}

export { BrushComponent as Brush };
