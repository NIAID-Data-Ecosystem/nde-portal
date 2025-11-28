import React, { useMemo, useRef, useState } from 'react';
import { max } from 'd3-array';
import { Brush } from '@visx/brush';
import { Group } from '@visx/group';
import { useParentSize } from '@visx/responsive';
import { scaleBand, scaleLinear } from '@visx/scale';
import { Bar } from '@visx/shape';
import BaseBrush from '@visx/brush/lib/BaseBrush';
import { BrushProps } from '@visx/brush/lib/Brush';
import { BrushHandle } from 'src/components/brush/components/brush-handle';
import { useBrushKeyboardNavigation } from 'src/components/brush/hooks/useBrushKeyboardNavigation';
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

  // Brush dimensions
  const xBrushMax = Math.max(width - brushMargin.left - brushMargin.right, 0);
  const yBrushMax = Math.max(height - brushMargin.top - brushMargin.bottom, 0);

  // Update selection when the brush changes.
  const onBrushChange = (bounds: Bounds | null) => {
    if (!bounds?.xValues) return;
    handleSelection(bounds.xValues as string[]);
  };

  // Use keyboard navigation hook with immediate update strategy
  const { activeHandle } = useBrushKeyboardNavigation({
    chartRef,
    brushRef,
    xScale,
    width: xBrushMax,
    height: yBrushMax,
    isFocused,
    updateStrategy: 'immediate',
    onUpdateImmediate: () => {
      // Selection update is handled automatically by brush onChange
    },
  });

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
          {...props}
          isFocused={Boolean(
            activeHandle && props.className.includes(activeHandle),
          )}
          strokeColor={isFocused ? 'steelblue' : '#999'}
        />
      )}
    />
  );
};
