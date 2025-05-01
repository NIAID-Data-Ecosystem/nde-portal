import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { max } from 'd3-array';
import { Brush } from '@visx/brush';
import { Group } from '@visx/group';
import { useParentSize } from '@visx/responsive';
import { scaleBand, scaleLinear } from '@visx/scale';
import { Bar } from '@visx/shape';
import BaseBrush from '@visx/brush/lib/BaseBrush';
import { BrushProps } from '@visx/brush/lib/Brush';
import { BrushHandleRenderProps } from '@visx/brush/lib/BrushHandle';
import { Bounds } from '@visx/brush/lib/types';
import { FacetTerm } from 'src/utils/api/types';
import { FacetProps } from '../../../types';

interface BrushableBarChartProps {
  data: FacetTerm[];
  onBrushSelection: (selected: FacetTerm[]) => void;
  defaultWidth?: number;
  defaultHeight?: number;
  margin?: { top: number; right: number; bottom: number; left: number };
  colorScheme: FacetProps['colorScheme'];
}

const getTerm = (d: FacetTerm) => d.term;

export const BrushableBarChart = ({
  data,
  onBrushSelection,
  colorScheme,
  defaultWidth = 480,
  defaultHeight = 80,
  margin = { top: 20, right: 10, bottom: 20, left: 10 },
}: BrushableBarChartProps) => {
  const chartRef = useRef<HTMLDivElement>(null);

  const { parentRef, width, height } = useParentSize({
    debounceTime: 150,
    initialSize: { width: defaultWidth, height: defaultHeight },
    ignoreDimensions: ['height'],
  });

  const [selected, setSelected] = useState<string[]>(
    data.slice(0, Math.min(20, data.length - 1)).map(getTerm),
  );

  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  const xScale = useMemo(
    () =>
      scaleBand<string>({
        domain: data.map(getTerm),
        range: [0, innerWidth],
        padding: 0.4,
        paddingOuter: 0,
      }),
    [data, innerWidth],
  );

  const yScale = useMemo(
    () =>
      scaleLinear<number>({
        domain: [0, max(data, d => d.count) || 0],
        range: [innerHeight - 1, 0],
      }),
    [data, innerHeight],
  );

  //  Brush Handling
  const [isFocused, setIsFocused] = useState(false);

  const initialBrushPosition = useMemo(() => {
    const startX = xScale(getTerm(data[0])) ?? 0;
    const endX = xScale(getTerm(data[Math.min(20, data.length - 1)])) ?? 0;
    return { start: { x: startX }, end: { x: endX } };
  }, [data, xScale]);

  return (
    <div
      ref={parentRef}
      style={{ width: '100%', height: `${defaultHeight}px`, outline: 'none' }}
    >
      <div
        ref={chartRef}
        tabIndex={0}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        style={{ width: '100%', height: `${height}px`, outline: 'none' }}
        aria-label='Use the arrow keys to move the brush selection. Press Tab to toggle the brush handles.'
      >
        <svg width={width} height={height}>
          <Group left={margin.left} top={margin.top}>
            {/* Bar chart */}
            {data.map(d => {
              const x = xScale(d.term);
              const barHeight = innerHeight - yScale(d.count);
              return x !== undefined ? (
                <Bar
                  key={d.term}
                  x={x}
                  y={yScale(d.count)}
                  width={xScale.bandwidth()}
                  height={barHeight}
                  fill={
                    selected.some(term => term === d.term)
                      ? colorScheme?.[300] || '#ccc'
                      : '#f2f2f2'
                  }
                />
              ) : null;
            })}

            {/* Brush overlay */}
            <AccessibleBrush
              chartRef={chartRef}
              xScale={xScale}
              yScale={yScale}
              width={innerWidth}
              height={innerHeight}
              isFocused={isFocused}
              initialBrushPosition={initialBrushPosition}
              handleSelection={selection => {
                setSelected(selection);
                onBrushSelection(data.filter(d => selection.includes(d.term)));
              }}
            />
          </Group>
        </svg>
      </div>
    </div>
  );
};

interface AccessibleBrushProps extends Partial<BrushProps> {
  chartRef: React.RefObject<HTMLDivElement>;
  xScale: any;
  yScale: any;
  width: number;
  height: number;
  brushMargin?: { top: number; right: number; bottom: number; left: number };
  isFocused: boolean;
  handleSelection: (selection: string[]) => void;
}

const BRUSH_STATES = ['brush', 'left', 'right'];

// A brush integrating keyboard functionality
const AccessibleBrush = ({
  chartRef,
  xScale,
  yScale,
  width,
  height,
  brushMargin = { top: 0, right: 0, bottom: 0, left: 0 },
  isFocused,
  initialBrushPosition,
  handleSelection,
}: AccessibleBrushProps) => {
  const brushRef = useRef<BaseBrush | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const [activeState, setActiveState] = useState<number | null>(null);

  // Brush dimensions
  const xBrushMax = Math.max(width - brushMargin.left - brushMargin.right, 0);
  const yBrushMax = Math.max(height - brushMargin.top - brushMargin.bottom, 0);

  // Update selection when the brush changes.
  const onBrushChange = (bounds: Bounds | null) => {
    if (!bounds?.xValues) return;
    handleSelection(bounds.xValues as string[]);
  };

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      const { key, shiftKey } = event;
      const step = xScale?.bandwidth() || 1;

      const startX = brushRef.current?.state?.start?.x ?? 0;
      const endX = brushRef.current?.state?.end?.x ?? 0;

      let newStartX = startX;
      let newEndX = endX;

      // Pressing Shift + Tab reverses the focus.
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
        // Pressing tab traps and cycles the focus through the brush states.
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
        //  Pressing the left or right arrow moves the entire brush selection.
        if (activeState === null || activeState === 0) {
          if (key === 'ArrowLeft') {
            newStartX = Math.max(0, startX - step);
            newEndX = Math.max(step, endX - step);
          } else if (key === 'ArrowRight') {
            newStartX = Math.min(endX, startX + step);
            newEndX = Math.min(xBrushMax, endX + step);
          }
        } else if (activeState === 1) {
          // Pressing the left or right arrow moves the left handle (expands / minimizes the selection).
          if (key === 'ArrowLeft') {
            newStartX = Math.max(0, startX - step);
          } else if (key === 'ArrowRight') {
            newStartX = Math.min(endX, startX + step);
          }
        } else if (activeState === 2) {
          // Pressing the left or right arrow moves the right handle (expands / minimizes the selection).
          if (key === 'ArrowLeft') {
            newEndX = Math.max(startX + step, endX - step);
          } else if (key === 'ArrowRight') {
            newEndX = Math.min(xBrushMax, endX + step);
          }
        }
      }
      // Cancel the previous animation frame if still pending
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }

      // Use requestAnimationFrame to batch brush updates and avoid overloading the render loop
      animationFrameRef.current = requestAnimationFrame(() => {
        if (!brushRef.current) return;
        brushRef.current.reset?.();

        const brushY0 = 0;
        const brushY1 = yBrushMax;

        const newState = {
          bounds: { x0: 0, x1: xBrushMax, y0: brushY0, y1: brushY1 },
          start: { x: newStartX, y: brushY0 },
          end: { x: newEndX, y: brushY1 },
          isBrushing: false,
          dragHandle: null,
          activeHandle: null,
          extent: { x0: newStartX, x1: newEndX, y0: brushY0, y1: brushY1 },
        };
        // Update the brush state. Which will in turn calculate the new xValues.
        brushRef.current.updateBrush?.(newState);

        // brushRef.current.state = { ...brushRef.current.state, ...newState };
      });
    },
    [xScale, isFocused, activeState, xBrushMax, yBrushMax],
  );

  // Set the initial brush state. Note: We need to manually set this because we are manually updating the brush state in OnKeyDown.
  useEffect(() => {
    if (!brushRef.current) return;
    brushRef.current.reset?.();

    const brushY0 = 0;
    const brushY1 = yBrushMax;
    const startX = brushRef.current?.state?.start?.x ?? 0;
    const endX = brushRef.current?.state?.end?.x ?? 0;

    const newState = {
      bounds: { x0: 0, x1: xBrushMax, y0: brushY0, y1: brushY1 },
      start: {
        x: startX,
        y: brushY0,
      },
      end: { x: endX, y: brushY1 },
      isBrushing: false,
      dragHandle: null,
      activeHandle: null,
      extent: {
        x0: startX,
        x1: endX,
        y0: brushY0,
        y1: brushY1,
      },
    };
    // Update the brush state. Which will in turn calculate the new xValues.
    brushRef.current.updateBrush?.(newState);
  }, [xBrushMax, yBrushMax]);

  // If the brush is not focused, reset the active state.
  useEffect(() => {
    if (!isFocused) {
      setActiveState(null);
    }
  }, [activeState, isFocused]);

  // Add keyboard event listeners to the chartRef
  useEffect(() => {
    const node = chartRef.current;
    if (!node) return;
    node.addEventListener('keydown', handleKeyDown);
    return () => {
      return node.removeEventListener('keydown', handleKeyDown);
    };
  }, [chartRef, handleKeyDown]);

  // Used to highlight the active handle when the brush is focused.
  const activeHandle = useMemo(() => {
    if (!isFocused || activeState === null || activeState === 0) return null;
    return BRUSH_STATES[activeState];
  }, [activeState, isFocused]);

  return (
    <Brush
      xScale={xScale}
      yScale={yScale}
      width={xBrushMax}
      height={yBrushMax}
      margin={brushMargin}
      handleSize={8}
      innerRef={brushRef}
      resizeTriggerAreas={['left', 'right']}
      brushDirection='horizontal'
      initialBrushPosition={initialBrushPosition}
      onChange={onBrushChange}
      selectedBoxStyle={{
        fillOpacity: 0.2,
        fill: 'steelblue',
        stroke: 'steelblue',
        strokeOpacity: isFocused ? 1 : 0.8,
        strokeWidth: isFocused ? 1.5 : 0.5,
      }}
      useWindowMoveEvents
      renderBrushHandle={props => (
        <BrushHandle
          isFocused={Boolean(
            activeHandle && props.className.includes(activeHandle),
          )}
          {...props}
        />
      )}
    />
  );
};

// A custom brush handle that is used to render the left and right handles of the brush.
function BrushHandle({
  x,
  height,
  isBrushActive,
  className,
  isFocused,
}: BrushHandleRenderProps & { isFocused: boolean }) {
  const pathWidth = 8;
  const pathHeight = 15;
  const isLeftHandle = className?.includes('left');
  if (!isBrushActive) {
    return null;
  }
  return (
    <Group
      left={x + pathWidth / 2}
      top={(height - pathHeight) / 2}
      role='slider'
      aria-label={`${isLeftHandle ? 'Left' : 'Right'} brush handle`}
    >
      <path
        fill='#f2f2f2'
        d='M -4.5 0.5 L 3.5 0.5 L 3.5 15.5 L -4.5 15.5 L -4.5 0.5 M -1.5 4 L -1.5 12 M 0.5 4 L 0.5 12'
        strokeWidth={isFocused ? '1.5' : '1'}
        stroke={isFocused ? 'steelblue' : '#999'}
        style={{ cursor: 'ew-resize' }}
      />
    </Group>
  );
}
