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
  margin?: { top: number; right: number; bottom: number; left: number };
}

const BRUSH_HEIGHT = 30;
const AXIS_HEIGHT = 20;
const TOTAL_HEIGHT = BRUSH_HEIGHT + AXIS_HEIGHT;
const BRUSH_STATES = ['brush', 'left', 'right'];

export const DateBrush = ({
  width,
  maxBarWidth,
  margin = { top: 0, right: 0, bottom: 0, left: 30 },
}: DateBrushProps) => {
  const { allData, dateRange, setDateRange, onBrushChangeEnd, setIsDragging } =
    useDateRangeContext();
  const brushRef = useRef<BaseBrush | null>(null);
  const chartRef = useRef<HTMLDivElement>(null);
  const keyboardUpdateTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Track current brush selection years for handle labels
  const [brushYears, setBrushYears] = useState<{
    startYear: string;
    endYear: string;
  } | null>(null);

  // Track if user is currently interacting with brush
  const [isUserInteracting, setIsUserInteracting] = useState(false);

  // Track focus state
  const [isFocused, setIsFocused] = useState(false);
  const [activeState, setActiveState] = useState<number | null>(null);

  // Track the external update counter to force remounts
  const [externalUpdateCounter, setExternalUpdateCounter] = useState(0);

  // Track the last dateRange that was applied from user interaction
  const lastUserDateRange = useRef<number[] | null>(null);

  // Track if keyboard navigation is taking place
  const isKeyboardNavigating = useRef(false);

  // Get the earliest year from allData
  const earliestYear = useMemo(() => {
    if (!allData || allData.length === 0) return null;
    return allData[0]?.label || null;
  }, [allData]);

  // Get current year
  const currentYear = useMemo(() => new Date().getFullYear().toString(), []);

  // Calculate inner dimensions
  const innerWidth = useMemo(() => {
    return Math.max(0, width - margin.left - margin.right);
  }, [width, margin]);

  // Calculate the chart width
  const chartWidth = useMemo(() => {
    if (!allData || allData.length === 0) return 0;

    return innerWidth / allData.length > maxBarWidth
      ? allData.length * maxBarWidth
      : innerWidth;
  }, [allData, innerWidth, maxBarWidth]);

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
      !isKeyboardNavigating.current &&
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
    if (isUserInteracting || isKeyboardNavigating.current) return;

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

  const onBrushChange = useCallback(
    (domain: Bounds | null) => {
      // Ignore onChange during keyboard navigation
      if (isKeyboardNavigating.current) {
        return;
      }

      if (!domain || !allData || !xScale) return;

      // Get the selected years from xValues
      const selectedYears = ((domain.xValues as string[]) || []).filter(
        (year): year is string => year != null,
      );

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
    [allData, xScale, setDateRange],
  );

  // Handle brush interaction end (delayed filter update)
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

      // Trigger the callback to update filters (delayed)
      onBrushChangeEnd(startYear, endYear);
    },
    [allData, xScale, onBrushChangeEnd, setIsDragging],
  );

  // Handle brush interaction start
  const handleBrushStart = useCallback(() => {
    setIsDragging(true);
    setIsUserInteracting(true);
  }, [setIsDragging]);

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!xScale || !allData || allData.length === 0 || !brushRef.current)
        return;

      const { key, shiftKey } = event;

      // Get current year indices from dateRange state (more reliable than brush state)
      let currentStartIndex = dateRange[0] ?? 0;
      let currentEndIndex = dateRange[1] ?? allData.length - 1;

      let newStartIndex = currentStartIndex;
      let newEndIndex = currentEndIndex;

      // Pressing Shift + Tab reverses the focus
      if (shiftKey) {
        if (key === 'Tab') {
          if (isFocused && (activeState === null || activeState === 0)) {
            return;
          } else {
            // Go to the previous state
            const currentIndex = activeState ?? 0;
            const nextIndex =
              (currentIndex - 1 + BRUSH_STATES.length) % BRUSH_STATES.length;
            setActiveState(nextIndex);
            event.preventDefault();
            return;
          }
        }
      } else if (key === 'Tab') {
        // Pressing tab traps and cycles the focus through the brush states
        if (activeState === BRUSH_STATES.length - 1) {
          setActiveState(null);
          return;
        } else {
          const currentIndex = activeState ?? 0;
          const nextIndex = (currentIndex + 1) % BRUSH_STATES.length;
          setActiveState(nextIndex);
          event.preventDefault();
          return;
        }
      }

      if (isFocused) {
        // Pressing the left or right arrow moves the entire brush selection
        if (activeState === null || activeState === 0) {
          const rangeSize = currentEndIndex - currentStartIndex;
          if (key === 'ArrowLeft') {
            // Move both handles left by 1, maintaining the range size
            newStartIndex = Math.max(0, currentStartIndex - 1);
            newEndIndex = newStartIndex + rangeSize;
            // If moving left would push end beyond bounds, adjust start
            if (newEndIndex > allData.length - 1) {
              newEndIndex = allData.length - 1;
              newStartIndex = newEndIndex - rangeSize;
            }
          } else if (key === 'ArrowRight') {
            // Move both handles right by 1, maintaining the range size
            newEndIndex = Math.min(allData.length - 1, currentEndIndex + 1);
            newStartIndex = newEndIndex - rangeSize;
            // If moving right would push start below 0, adjust end
            if (newStartIndex < 0) {
              newStartIndex = 0;
              newEndIndex = newStartIndex + rangeSize;
            }
          } else {
            return;
          }
        } else if (activeState === 1) {
          // Pressing the left or right arrow moves the left handle
          if (key === 'ArrowLeft') {
            // Move left handle to the left
            newStartIndex = Math.max(0, currentStartIndex - 1);
          } else if (key === 'ArrowRight') {
            // Move left handle to the right (but not past right handle)
            newStartIndex = Math.min(currentEndIndex, currentStartIndex + 1);
          } else {
            return;
          }
        } else if (activeState === 2) {
          // Pressing the left or right arrow moves the right handle
          if (key === 'ArrowLeft') {
            // Move right handle to the left (but not past left handle)
            newEndIndex = Math.max(currentStartIndex, currentEndIndex - 1);
          } else if (key === 'ArrowRight') {
            // Move right handle to the right
            newEndIndex = Math.min(allData.length - 1, currentEndIndex + 1);
          } else {
            return;
          }
        } else {
          return;
        }

        event.preventDefault();

        // Mark as keyboard navigating (this will block onBrushChange)
        isKeyboardNavigating.current = true;

        // Clear any pending keyboard update timeout
        if (keyboardUpdateTimeoutRef.current) {
          clearTimeout(keyboardUpdateTimeoutRef.current);
        }

        const domain = xScale.domain();
        const bandwidth = xScale.bandwidth();
        const startYear = domain[newStartIndex];
        const endYear = domain[newEndIndex];

        // Update brush year labels (real-time)
        setBrushYears({
          startYear,
          endYear,
        });

        // Update dateRange (real-time)
        setDateRange([newStartIndex, newEndIndex]);

        // Update lastUserDateRange to prevent external update detection
        lastUserDateRange.current = [newStartIndex, newEndIndex];

        // Calculate exact positions
        const exactStartX = xScale(startYear) || 0;
        const exactEndX = (xScale(endYear) || 0) + bandwidth;

        const brushY0 = 0;
        const brushY1 = BRUSH_HEIGHT;

        const newState = {
          bounds: { x0: 0, x1: chartWidth, y0: brushY0, y1: brushY1 },
          start: { x: exactStartX, y: brushY0 },
          end: { x: exactEndX, y: brushY1 },
          isBrushing: false,
          dragHandle: null,
          activeHandle: null,
          extent: { x0: exactStartX, x1: exactEndX, y0: brushY0, y1: brushY1 },
        };

        // Update the brush visually
        brushRef.current.updateBrush?.(newState);

        // Set a timeout to trigger the filter update after user stops pressing keys
        keyboardUpdateTimeoutRef.current = setTimeout(() => {
          if (onBrushChangeEnd) {
            onBrushChangeEnd(startYear, endYear);
          }
          isKeyboardNavigating.current = false;
        }, 500); // Wait 500ms after last keystroke
      }
    },
    [
      xScale,
      allData,
      isFocused,
      activeState,
      chartWidth,
      setDateRange,
      onBrushChangeEnd,
      dateRange,
    ],
  );

  // If the brush is not focused, reset the active state
  useEffect(() => {
    if (!isFocused) {
      setActiveState(null);

      // If user lost focus and keyboard navigating is taking place, trigger the update immediately
      if (isKeyboardNavigating.current) {
        if (keyboardUpdateTimeoutRef.current) {
          clearTimeout(keyboardUpdateTimeoutRef.current);
        }

        if (onBrushChangeEnd && allData && dateRange.length === 2) {
          const startYear = allData[dateRange[0]]?.label;
          const endYear = allData[dateRange[1]]?.label;
          if (startYear && endYear) {
            onBrushChangeEnd(startYear, endYear);
          }
        }
        isKeyboardNavigating.current = false;
      }
    }
  }, [isFocused, onBrushChangeEnd, allData, dateRange]);

  // Add keyboard event listeners
  useEffect(() => {
    const node = chartRef.current;
    if (!node) return;
    node.addEventListener('keydown', handleKeyDown);
    return () => {
      node.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (keyboardUpdateTimeoutRef.current) {
        clearTimeout(keyboardUpdateTimeoutRef.current);
      }
    };
  }, []);

  // Used to highlight the active handle when the brush is focused
  const activeHandle = useMemo(() => {
    if (!isFocused || activeState === null || activeState === 0) return null;
    return BRUSH_STATES[activeState];
  }, [activeState, isFocused]);

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
      style={{ width: '100%', outline: 'none' }}
      aria-label='Use the arrow keys to move the brush selection. Press Tab to toggle the brush handles.'
    >
      <Box
        as='svg'
        width={width}
        height={TOTAL_HEIGHT}
        style={{ overflow: 'visible' }}
      >
        <Group left={margin.left} top={margin.top}>
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
            selectedBoxStyle={{
              fill: theme.colors.secondary?.[500],
              fillOpacity: 0.3,
              stroke: theme.colors.secondary?.[500],
              strokeWidth: isFocused ? 2 : 1.5,
              strokeOpacity: isFocused ? 1 : 0.8,
            }}
            useWindowMoveEvents
            renderBrushHandle={props => (
              <BrushHandle
                {...props}
                brushYears={brushYears}
                isFocused={Boolean(
                  activeHandle && props.className?.includes(activeHandle),
                )}
              />
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
    </div>
  );
};

// Handle rendering
function BrushHandle({
  x,
  height,
  isBrushActive,
  className,
  brushYears,
  isFocused,
}: BrushHandleRenderProps & {
  brushYears: { startYear: string; endYear: string } | null;
  isFocused: boolean;
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
    <Group
      left={leftPosition}
      top={(height - pathHeight) / 2}
      role='slider'
      aria-label={`${isLeftHandle ? 'Left' : 'Right'} brush handle`}
    >
      {/* Handle rectangle with grip lines */}
      <path
        fill='#f2f2f2'
        d='M -4.5 0.5 L 3.5 0.5 L 3.5 15.5 L -4.5 15.5 L -4.5 0.5 M -1.5 4 L -1.5 12 M 0.5 4 L 0.5 12'
        strokeWidth={isFocused ? '1.5' : '1'}
        stroke={isFocused ? theme.colors.secondary?.[500] : '#999'}
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
