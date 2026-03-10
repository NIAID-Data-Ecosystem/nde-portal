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
const DRAG_THRESHOLD = 6;

export const DateBrush = ({
  containerWidth,
  margin = { top: 0, right: 20, bottom: 0, left: 20 },
}: DateBrushProps) => {
  const { allData, dateRange, setDateRange, onBrushChangeEnd, setIsDragging } =
    useDateRangeContext();
  const brushRef = useRef<BaseBrush | null>(null);
  const chartRef = useRef<HTMLDivElement>(null);

  const [brushYears, setBrushYears] = useState<{
    startYear: string;
    endYear: string;
  } | null>(null);

  const [isUserInteracting, setIsUserInteracting] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [externalUpdateCounter, setExternalUpdateCounter] = useState(0);
  const lastUserDateRange = useRef<number[] | null>(null);

  const dragDetection = useRef<{
    startX: number | null;
    startY: number | null;
    isDragging: boolean;
  }>({
    startX: null,
    startY: null,
    isDragging: false,
  });

  const earliestYear = useMemo(() => {
    if (!allData || allData.length === 0) return null;
    return allData[0]?.label || null;
  }, [allData]);

  const currentYear = useMemo(() => new Date().getFullYear().toString(), []);

  const innerWidth = useMemo(() => {
    return Math.max(0, containerWidth - margin.left - margin.right);
  }, [containerWidth, margin]);

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

  const yScale = useMemo(() => {
    return scaleBand<number>({
      domain: [0, 1],
      range: [0, BRUSH_HEIGHT],
    });
  }, []);

  const tickValues = useMemo(() => {
    if (!allData || allData.length === 0) return [];
    if (allData.length === 1) return [allData[0].label];
    return [allData[0].label, allData[allData.length - 1].label];
  }, [allData]);

  const tickFormat = useMemo(() => {
    if (!earliestYear) return () => '';
    return (value: string) => {
      if (value === allData[0]?.label) return earliestYear;
      if (value === allData[allData.length - 1]?.label) return currentYear;
      return '';
    };
  }, [earliestYear, currentYear, allData]);

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

  useEffect(() => {
    if (isUserInteracting) return;

    if (lastUserDateRange.current === null) {
      lastUserDateRange.current = [...dateRange];
      return;
    }

    const hasChanged =
      lastUserDateRange.current[0] !== dateRange[0] ||
      lastUserDateRange.current[1] !== dateRange[1];

    if (hasChanged) {
      setExternalUpdateCounter(prev => prev + 1);
      lastUserDateRange.current = [...dateRange];

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

  const brushKey = `brush-${externalUpdateCounter}`;

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

      setBrushYears({ startYear, endYear });

      const startIndex = allData.findIndex(d => d.label === startYear);
      const endIndex = allData.findIndex(d => d.label === endYear);

      if (startIndex !== -1 && endIndex !== -1) {
        setDateRange([startIndex, endIndex]);
        lastUserDateRange.current = [startIndex, endIndex];
      }
    },
    [allData, xScale, setDateRange],
  );

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
      if (isKeyboardNavigating) {
        return;
      }

      if (!dragDetection.current.isDragging) {
        return;
      }

      if (!domain || !allData || !xScale || !brushRef.current) return;

      const brushState = brushRef.current.state;
      const extent = brushState?.extent;
      const x0 = extent.x0;
      const x1 = extent.x1;
      const bandwidth = xScale.bandwidth();

      const selectedYears: string[] = [];
      allData.forEach(d => {
        const yearPos = xScale(d.label);
        if (yearPos !== undefined) {
          const yearStart = yearPos;
          const yearEnd = yearPos + bandwidth;
          const brushOverlapsYear = yearEnd >= x0 && yearStart <= x1;

          if (brushOverlapsYear) {
            selectedYears.push(d.label);
          }
        }
      });

      if (selectedYears.length === 0) return;

      const startYear = selectedYears[0];
      const endYear = selectedYears[selectedYears.length - 1];

      setBrushYears({
        startYear,
        endYear,
      });

      const startIndex = allData.findIndex(d => d.label === startYear);
      const endIndex = allData.findIndex(d => d.label === endYear);

      if (startIndex !== -1 && endIndex !== -1) {
        setDateRange([startIndex, endIndex]);
      }
    },
    [allData, xScale, setDateRange, isKeyboardNavigating],
  );

  const handleBrushEnd = useCallback(
    (domain: Bounds | null) => {
      setIsDragging(false);
      setIsUserInteracting(false);

      const wasDragging = dragDetection.current.isDragging;

      dragDetection.current = {
        startX: null,
        startY: null,
        isDragging: false,
      };

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
          const brushOverlapsYear = yearEnd >= x0 && yearStart <= x1;

          if (brushOverlapsYear) {
            selectedYears.push(d.label);
          }
        }
      });

      if (selectedYears.length === 0) return;

      const startYear = selectedYears[0];
      const endYear = selectedYears[selectedYears.length - 1];

      const startIndex = allData.findIndex(d => d.label === startYear);
      const endIndex = allData.findIndex(d => d.label === endYear);
      if (startIndex !== -1 && endIndex !== -1) {
        lastUserDateRange.current = [startIndex, endIndex];
      }

      onBrushChangeEnd(startYear, endYear);
    },
    [allData, xScale, onBrushChangeEnd, setIsDragging],
  );

  const handleBrushStart = useCallback(
    (start: { x: number; y: number }) => {
      setIsDragging(true);
      setIsUserInteracting(true);

      dragDetection.current = {
        startX: start.x,
        startY: start.y,
        isDragging: false,
      };
    },
    [setIsDragging],
  );

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent | TouchEvent) => {
      if (!isUserInteracting) return;

      const { startX, startY, isDragging } = dragDetection.current;

      if (isDragging || startX === null || startY === null) return;

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

      const deltaX = Math.abs(currentX - startX);
      const deltaY = Math.abs(currentY - startY);

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
