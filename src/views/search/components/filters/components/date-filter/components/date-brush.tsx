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
import { BrushHandle } from 'src/components/brush/components/brush-handle';
import { useBrushKeyboardNavigation } from 'src/components/brush/hooks/useBrushKeyboardNavigation';
import { theme } from 'src/theme';
import { useDateRangeContext } from '../hooks/useDateRangeContext';

interface DateBrushProps {
  containerWidth: number;
  margin?: { top: number; right: number; bottom: number; left: number };
}

const BRUSH_HEIGHT = 30;
const AXIS_HEIGHT = 20;
const TOTAL_HEIGHT = BRUSH_HEIGHT + AXIS_HEIGHT;
const DRAG_THRESHOLD = 6; // pixels (threshold for distinguishing click from drag)

export const DateBrush = ({
  containerWidth,
  margin = { top: 0, right: 20, bottom: 0, left: 20 },
}: DateBrushProps) => {
  const { allData, dateRange, setDateRange, onBrushChangeEnd, setIsDragging } =
    useDateRangeContext();
  const brushRef = useRef<BaseBrush | null>(null);
  const chartRef = useRef<HTMLDivElement>(null);

  // Track current brush selection years for handle labels
  const [brushYears, setBrushYears] = useState<{
    startYear: string;
    endYear: string;
  } | null>(null);

  // Track if user is currently interacting with brush
  const [isUserInteracting, setIsUserInteracting] = useState(false);

  // Track focus state
  const [isFocused, setIsFocused] = useState(false);

  // Track the external update counter to force remounts
  const [externalUpdateCounter, setExternalUpdateCounter] = useState(0);

  // Track the last dateRange that was applied from user interaction
  const lastUserDateRange = useRef<number[] | null>(null);

  // Track drag detection
  const dragDetection = useRef<{
    startX: number | null;
    startY: number | null;
    isDragging: boolean;
  }>({
    startX: null,
    startY: null,
    isDragging: false,
  });

  // Get the earliest year from allData
  const earliestYear = useMemo(() => {
    if (!allData || allData.length === 0) return null;
    return allData[0]?.label || null;
  }, [allData]);

  // Get current year
  const currentYear = useMemo(() => new Date().getFullYear().toString(), []);

  // Calculate inner dimensions
  const innerWidth = useMemo(() => {
    return Math.max(0, containerWidth - margin.left - margin.right);
  }, [containerWidth, margin]);

  // Use band scale with years as domain
  const xScale = useMemo(() => {
    if (!allData || allData.length === 0) return null;
    const scale = scaleBand<string>({
      domain: allData.map(d => d.label),
      range: [0, innerWidth],
      padding: 0.2,
      paddingOuter: 0.1,
    });
    return scale;
  }, [allData, innerWidth]);

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
      innerWidth === 0 ||
      dateRange.length !== 2
    )
      return null;

    const startYear = allData[dateRange[0]]?.label;
    const endYear = allData[dateRange[1]]?.label;

    if (!startYear || !endYear) return null;

    const startPos = xScale(startYear) || 0;
    const endPos = (xScale(endYear) || 0) + xScale.bandwidth();

    return {
      start: { x: startPos },
      end: { x: endPos },
    };
  }, [xScale, allData, dateRange, innerWidth]);

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

  // Key for forcing brush to remount on external changes only
  const brushKey = `brush-${externalUpdateCounter}`;

  // Handle debounced keyboard updates
  const handleKeyboardUpdate = useCallback(
    ({ newStartX, newEndX }: { newStartX: number; newEndX: number }) => {
      if (!allData || !xScale || !onBrushChangeEnd) return;

      const bandwidth = xScale.bandwidth();
      const selectedYears: string[] = [];

      allData.forEach(d => {
        const yearPos = xScale(d.label);
        if (yearPos !== undefined) {
          const yearStart = yearPos;
          const yearEnd = yearPos + bandwidth;
          const brushOverlapsYear =
            yearEnd >= newStartX && yearStart <= newEndX;

          if (brushOverlapsYear) {
            selectedYears.push(d.label);
          }
        }
      });

      if (selectedYears.length === 0) return;

      const startYear = selectedYears[0];
      const endYear = selectedYears[selectedYears.length - 1];

      onBrushChangeEnd(startYear, endYear);
    },
    [allData, xScale, onBrushChangeEnd],
  );

  // Handle immediate visual updates during keyboard navigation
  const handleKeyboardImmediate = useCallback(
    (newStartX: number, newEndX: number) => {
      if (!allData || !xScale) return;

      const bandwidth = xScale.bandwidth();
      const selectedYears: string[] = [];

      allData.forEach(d => {
        const yearPos = xScale(d.label);
        if (yearPos !== undefined) {
          const yearStart = yearPos;
          const yearEnd = yearPos + bandwidth;
          const brushOverlapsYear =
            yearEnd >= newStartX && yearStart <= newEndX;

          if (brushOverlapsYear) {
            selectedYears.push(d.label);
          }
        }
      });

      if (selectedYears.length === 0) return;

      const startYear = selectedYears[0];
      const endYear = selectedYears[selectedYears.length - 1];

      // Update brush year labels (real-time)
      setBrushYears({ startYear, endYear });

      // Update dateRange (real-time)
      const startIndex = allData.findIndex(d => d.label === startYear);
      const endIndex = allData.findIndex(d => d.label === endYear);

      if (startIndex !== -1 && endIndex !== -1) {
        setDateRange([startIndex, endIndex]);
        lastUserDateRange.current = [startIndex, endIndex];
      }
    },
    [allData, xScale, setDateRange],
  );

  // Use keyboard navigation hook
  const { activeHandle, isKeyboardNavigating } = useBrushKeyboardNavigation({
    chartRef,
    brushRef,
    xScale: xScale || undefined,
    width: innerWidth,
    height: BRUSH_HEIGHT,
    isFocused,
    updateStrategy: 'debounced',
    onUpdateDebounced: handleKeyboardUpdate,
    onUpdateImmediate: handleKeyboardImmediate,
    debounceDelay: 500,
    blockOnChange: true,
  });

  const onBrushChange = useCallback(
    (domain: Bounds | null) => {
      // Ignore onChange during keyboard navigation
      if (isKeyboardNavigating) {
        return;
      }

      // Only process changes if actual dragging detected
      if (!dragDetection.current.isDragging) {
        return;
      }

      if (!domain || !allData || !xScale || !brushRef.current) return;

      // Get brush extent from brushRef state
      const brushState = brushRef.current.state;
      const extent = brushState?.extent;
      const x0 = extent.x0;
      const x1 = extent.x1;
      const bandwidth = xScale.bandwidth();

      // Find all years whose band positions overlap with the brush extent
      const selectedYears: string[] = [];
      allData.forEach(d => {
        const yearPos = xScale(d.label);
        if (yearPos !== undefined) {
          const yearStart = yearPos;
          const yearEnd = yearPos + bandwidth;

          // Check if this year's band overlaps with brush extent
          const brushOverlapsYear = yearEnd >= x0 && yearStart <= x1;

          if (brushOverlapsYear) {
            selectedYears.push(d.label);
          }
        }
      });

      if (selectedYears.length === 0) return;

      const startYear = selectedYears[0];
      const endYear = selectedYears[selectedYears.length - 1];

      // Update brush year labels for visual feedback (real-time)
      setBrushYears({
        startYear,
        endYear,
      });

      // Find indices in allData / update dateRange for visual feedback (real-time)
      const startIndex = allData.findIndex(d => d.label === startYear);
      const endIndex = allData.findIndex(d => d.label === endYear);

      if (startIndex !== -1 && endIndex !== -1) {
        setDateRange([startIndex, endIndex]);
      }
    },
    [allData, xScale, setDateRange, isKeyboardNavigating],
  );

  // Handle brush interaction end (delayed filter update)
  const handleBrushEnd = useCallback(
    (domain: Bounds | null) => {
      setIsDragging(false);
      setIsUserInteracting(false);

      // Check if this was actually a drag or just a click
      const wasDragging = dragDetection.current.isDragging;

      // Reset drag detection
      dragDetection.current = {
        startX: null,
        startY: null,
        isDragging: false,
      };

      // Only trigger updates if it was an actual drag
      if (!wasDragging) {
        return;
      }

      if (
        !domain ||
        !allData ||
        !xScale ||
        !onBrushChangeEnd ||
        !brushRef.current
      )
        return;

      // Get brush extent from brushRef state
      const brushState = brushRef.current.state;
      const extent = brushState?.extent;

      if (!extent) {
        return;
      }

      const x0 = extent.x0;
      const x1 = extent.x1;
      const bandwidth = xScale.bandwidth();

      const selectedYears: string[] = [];
      allData.forEach(d => {
        const yearPos = xScale(d.label);
        if (yearPos !== undefined) {
          const yearStart = yearPos;
          const yearEnd = yearPos + bandwidth;

          // Catch even tiny brush extents
          const brushOverlapsYear = yearEnd >= x0 && yearStart <= x1;

          if (brushOverlapsYear) {
            selectedYears.push(d.label);
          }
        }
      });

      if (selectedYears.length === 0) return;

      const startYear = selectedYears[0];
      const endYear = selectedYears[selectedYears.length - 1];

      // Update lastUserDateRange to reflect the user's selection
      const startIndex = allData.findIndex(d => d.label === startYear);
      const endIndex = allData.findIndex(d => d.label === endYear);
      if (startIndex !== -1 && endIndex !== -1) {
        lastUserDateRange.current = [startIndex, endIndex];
      }

      // Trigger the callback to update filters (delayed)
      onBrushChangeEnd(startYear, endYear);
    },
    [allData, xScale, onBrushChangeEnd, setIsDragging],
  );

  // Handle brush interaction start
  const handleBrushStart = useCallback(
    (start: { x: number; y: number }) => {
      setIsDragging(true);
      setIsUserInteracting(true);

      // Initialize drag detection (record starting position)
      dragDetection.current = {
        startX: start.x,
        startY: start.y,
        isDragging: false, // Not yet dragging
      };
    },
    [setIsDragging],
  );

  // Listen to mouse/touch move events to detect actual dragging
  useEffect(() => {
    const handleMouseMove = (event: MouseEvent | TouchEvent) => {
      if (!isUserInteracting) return;

      const { startX, startY, isDragging } = dragDetection.current;

      // If already detected as dragging, no need to check again
      if (isDragging || startX === null || startY === null) return;

      // Get current position
      let currentX: number;
      let currentY: number;

      if (event instanceof MouseEvent) {
        currentX = event.clientX;
        currentY = event.clientY;
      } else {
        const touch = event.touches[0];
        if (!touch) return;
        currentX = touch.clientX;
        currentY = touch.clientY;
      }

      // Calculate distance moved
      const deltaX = Math.abs(currentX - startX);
      const deltaY = Math.abs(currentY - startY);

      // Check if movement exceeds threshold
      if (deltaX >= DRAG_THRESHOLD || deltaY >= DRAG_THRESHOLD) {
        dragDetection.current.isDragging = true;
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchmove', handleMouseMove);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleMouseMove);
    };
  }, [isUserInteracting]);

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
    <div
      ref={chartRef}
      tabIndex={0}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      style={{
        width: '100%',
        outline: 'none',
        display: 'flex',
        justifyContent: 'center',
      }}
      aria-label='Use the arrow keys to move the brush selection. Press Tab to toggle the brush handles.'
    >
      <Box
        as='svg'
        width={containerWidth}
        height={TOTAL_HEIGHT}
        style={{ overflow: 'visible' }}
      >
        <Group left={margin.left} top={margin.top}>
          {/* Brush selection area. key forces remount only on external changes.*/}
          <Brush
            key={brushKey}
            xScale={xScale}
            yScale={yScale}
            width={innerWidth}
            height={BRUSH_HEIGHT}
            innerRef={brushRef}
            resizeTriggerAreas={['left', 'right']}
            brushDirection='horizontal'
            initialBrushPosition={calculatedBrushPosition}
            onChange={onBrushChange}
            onBrushEnd={handleBrushEnd}
            onBrushStart={handleBrushStart}
            selectedBoxStyle={{
              fill: theme.colors.secondary?.[500],
              fillOpacity: 0.3,
              stroke: theme.colors.secondary?.[500],
              strokeWidth: isFocused ? 2 : 1.5,
              strokeOpacity: isFocused ? 1 : 0.8,
            }}
            useWindowMoveEvents
            renderBrushHandle={props => {
              const isLeftHandle = props.className?.includes('left');
              const label = brushYears
                ? isLeftHandle
                  ? brushYears.startYear
                  : brushYears.endYear
                : undefined;

              return (
                <BrushHandle
                  {...props}
                  isFocused={Boolean(
                    activeHandle && props.className?.includes(activeHandle),
                  )}
                  label={label}
                  strokeColor={theme.colors.secondary?.[500]}
                  labelColor={theme.colors.secondary?.[500]}
                  labelOptions={{
                    padding: 6,
                    fontSize: 13,
                    fontWeight: 600,
                    verticalAdjustment: (BRUSH_HEIGHT - 15) / 8,
                  }}
                />
              );
            }}
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
    </div>
  );
};
