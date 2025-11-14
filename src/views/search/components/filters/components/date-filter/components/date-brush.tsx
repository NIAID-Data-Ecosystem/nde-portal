import React, {
  useMemo,
  useRef,
  useCallback,
  useState,
  useEffect,
} from 'react';
import { Box } from '@chakra-ui/react';
import { Group } from '@visx/group';
import { scaleBand } from '@visx/scale';
import { AxisBottom } from '@visx/axis';
import { Brush } from '@visx/brush';
import { Bounds } from '@visx/brush/lib/types';
import BaseBrush from '@visx/brush/lib/BaseBrush';
import { BrushHandleRenderProps } from '@visx/brush/lib/BrushHandle';
import { theme } from 'src/theme';
import { useDateRangeContext } from '../hooks/useDateRangeContext';

interface DateBrushProps {
  width: number;
  maxBarWidth: number;
}

const BRUSH_HEIGHT = 30;
const AXIS_HEIGHT = 20;
const TOTAL_HEIGHT = BRUSH_HEIGHT + AXIS_HEIGHT;

export const DateBrush = ({ width, maxBarWidth }: DateBrushProps) => {
  const { allData, dateRange, setDateRange, onBrushChangeEnd, setIsDragging } =
    useDateRangeContext();
  const brushRef = useRef<BaseBrush | null>(null);

  // Track current brush selection years for handle labels
  const [brushYears, setBrushYears] = useState<{
    startYear: string;
    endYear: string;
  } | null>(null);

  // Track if user is currently interacting with brush
  const [isUserInteracting, setIsUserInteracting] = useState(false);

  // Track the external update counter to force remounts
  const [externalUpdateCounter, setExternalUpdateCounter] = useState(0);

  // Track the last dateRange that was applied from user interaction
  const lastUserDateRange = useRef<number[] | null>(null);

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

  // Use band scale with years as domain
  const xScale = useMemo(() => {
    if (!allData || allData.length === 0) return null;
    return scaleBand<string>({
      domain: allData.map(d => d.label),
      range: [0, chartWidth],
      padding: 1,
      paddingOuter: 0,
    });
  }, [allData, chartWidth]);

  // Dummy y-scale for brush (not used for positioning)
  const yScale = useMemo(() => {
    return scaleBand<number>({
      domain: [0, 1],
      range: [0, BRUSH_HEIGHT],
    });
  }, []);

  // Only show ticks at the extremes
  const tickValues = useMemo(() => {
    if (!allData || allData.length === 0) return [];
    if (allData.length === 1) return [allData[0].label];
    return [allData[0].label, allData[allData.length - 1].label];
  }, [allData]);

  // Format ticks to show earliest year and current year
  const tickFormat = useMemo(() => {
    if (!earliestYear) return () => '';
    return (value: string) => {
      if (value === allData[0]?.label) return earliestYear;
      if (value === allData[allData.length - 1]?.label) return currentYear;
      return '';
    };
  }, [earliestYear, currentYear, allData]);

  // Calculate brush position from dateRange
  const calculatedBrushPosition = useMemo(() => {
    if (
      !xScale ||
      !allData ||
      allData.length === 0 ||
      chartWidth === 0 ||
      dateRange.length !== 2
    )
      return null;

    const startYear = allData[dateRange[0]]?.label;
    const endYear = allData[dateRange[1]]?.label;

    if (!startYear || !endYear) return null;

    return {
      start: { x: xScale(startYear) || 0 },
      end: { x: (xScale(endYear) || 0) + xScale.bandwidth() },
    };
  }, [xScale, allData, dateRange, chartWidth]);

  // Initialize brushYears when calculatedBrushPosition changes
  useEffect(() => {
    if (
      !isUserInteracting &&
      calculatedBrushPosition &&
      allData &&
      dateRange.length === 2
    ) {
      const startYear = allData[dateRange[0]]?.label;
      const endYear = allData[dateRange[1]]?.label;

      if (startYear && endYear) {
        setBrushYears({
          startYear,
          endYear,
        });
      }
    }
  }, [calculatedBrushPosition, allData, dateRange, isUserInteracting]);

  // Detect external changes to dateRange (not from user interaction)
  useEffect(() => {
    if (isUserInteracting) return;

    // Check if dateRange changed from an external source
    if (lastUserDateRange.current === null) {
      // First render: set initial state
      lastUserDateRange.current = [...dateRange];
      return;
    }

    const hasChanged =
      lastUserDateRange.current[0] !== dateRange[0] ||
      lastUserDateRange.current[1] !== dateRange[1];

    if (hasChanged) {
      // External change detected: increment counter to force remount
      setExternalUpdateCounter(prev => prev + 1);
      lastUserDateRange.current = [...dateRange];

      // Update brush years immediately
      if (allData && dateRange.length === 2) {
        const startYear = allData[dateRange[0]]?.label;
        const endYear = allData[dateRange[1]]?.label;

        if (startYear && endYear) {
          setBrushYears({
            startYear,
            endYear,
          });
        }
      }
    }
  }, [dateRange, isUserInteracting, allData]);

  // Key for forcing Brush to remount on external changes only
  const brushKey = `brush-${externalUpdateCounter}`;

  const onBrushChange = useCallback(
    (domain: Bounds | null) => {
      if (!domain || !allData || !xScale) return;

      // Get the selected years from xValues
      const selectedYears = ((domain.xValues as string[]) || []).filter(
        (year): year is string => year != null,
      );

      if (selectedYears.length === 0) return;

      const startYear = selectedYears[0];
      const endYear = selectedYears[selectedYears.length - 1];

      // Update brush year labels for visual feedback
      setBrushYears({
        startYear,
        endYear,
      });

      // Find indices in allData / update dateRange for visual feedback
      const startIndex = allData.findIndex(d => d.label === startYear);
      const endIndex = allData.findIndex(d => d.label === endYear);

      if (startIndex !== -1 && endIndex !== -1) {
        setDateRange([startIndex, endIndex]);
      }
    },
    [allData, xScale, setDateRange],
  );

  // Handle brush interaction end
  const handleBrushEnd = useCallback(
    (domain: Bounds | null) => {
      setIsDragging(false);
      setIsUserInteracting(false);

      if (!domain || !allData || !xScale || !onBrushChangeEnd) return;

      const selectedYears = ((domain.xValues as string[]) || []).filter(
        (year): year is string => year != null,
      );

      if (selectedYears.length === 0) return;

      const startYear = selectedYears[0];
      const endYear = selectedYears[selectedYears.length - 1];

      // Update lastUserDateRange to reflect the user's selection
      const startIndex = allData.findIndex(d => d.label === startYear);
      const endIndex = allData.findIndex(d => d.label === endYear);
      if (startIndex !== -1 && endIndex !== -1) {
        lastUserDateRange.current = [startIndex, endIndex];
      }

      // Trigger the callback to update filters
      onBrushChangeEnd(startYear, endYear);
    },
    [allData, xScale, onBrushChangeEnd, setIsDragging],
  );

  // Handle brush interaction start
  const handleBrushStart = useCallback(() => {
    setIsDragging(true);
    setIsUserInteracting(true);
  }, [setIsDragging]);

  if (
    !allData ||
    allData.length === 0 ||
    !xScale ||
    !earliestYear ||
    !calculatedBrushPosition
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
        {/* Brush selection area. key forces remount only on external changes.*/}
        <Brush
          key={brushKey}
          xScale={xScale}
          yScale={yScale}
          width={chartWidth}
          height={BRUSH_HEIGHT}
          innerRef={brushRef}
          resizeTriggerAreas={['left', 'right']}
          brushDirection='horizontal'
          initialBrushPosition={calculatedBrushPosition}
          onChange={onBrushChange}
          onBrushEnd={handleBrushEnd}
          onBrushStart={handleBrushStart}
          // onClick={() => {}}
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

// Handle rendering
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
  const labelPadding = 6;
  const LABEL_VERTICAL_ADJUSTMENT = (height - pathHeight) / 8;

  if (!isBrushActive || !brushYears) {
    return null;
  }

  const isLeftHandle = className?.includes('left');
  const leftPosition = isLeftHandle ? x + pathWidth / 4 : x + pathWidth / 4;

  // Get the year label for the handle
  const yearLabel = isLeftHandle ? brushYears.startYear : brushYears.endYear;

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

export default DateBrush;
