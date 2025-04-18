import React, { useCallback, useEffect, useMemo } from 'react';
import { Group } from '@visx/group';
import { scaleBand, scaleLinear } from '@visx/scale';
import { Brush } from '@visx/brush';
import { Bar } from '@visx/shape';
import { FacetTerm } from 'src/utils/api/types';
import { max } from 'd3-array';
import { BrushHandleRenderProps } from '@visx/brush/lib/BrushHandle';
import { Bounds } from '@visx/brush/lib/types';
import { FacetProps } from '../../types';
import { useParentSize } from '@visx/responsive';

interface BrushableBarChartProps {
  data: FacetTerm[];
  onBrushSelection: (selected: FacetTerm[]) => void;
  defaultWidth?: number;
  defaultHeight?: number;
  margin?: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  colorScheme: FacetProps['colorScheme'];
}
// Term data accessor
const getTerm = (d: FacetTerm) => d.term;

export const BrushableBarChart = ({
  data,
  onBrushSelection,
  colorScheme,
  defaultWidth = 480,
  defaultHeight = 80,
  margin = { top: 10, right: 10, bottom: 0, left: 10 },
}: BrushableBarChartProps) => {
  const { parentRef, width } = useParentSize({
    debounceTime: 150,
    initialSize: {
      width: defaultWidth,
      height: defaultHeight,
    },
    ignoreDimensions: ['height'],
  });
  const [selected, setSelected] = React.useState<FacetTerm[]>(data);
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = defaultHeight - margin.top - margin.bottom;

  const xScale = useMemo(
    () =>
      scaleBand<string>({
        domain: data.map(d => d.term),
        range: [0, innerWidth],
        padding: 0.4,
        paddingOuter: 0,
      }),
    [data, innerWidth],
  );

  const yMax = useMemo(() => max(data, d => d.count) || 0, [data]);

  const yScale = useMemo(
    () =>
      scaleLinear<number>({
        domain: [0, yMax],
        range: [innerHeight - 1, 0],
      }),
    [yMax, innerHeight],
  );

  ////////     Brush      //////////
  const brushMargin = { top: 0, bottom: 0, left: 0, right: 0 };
  const xBrushMax = Math.max(
    innerWidth - brushMargin.left - brushMargin.right,
    0,
  );
  const yBrushMax = Math.max(
    innerHeight - brushMargin.top - brushMargin.bottom,
    0,
  );

  const initialBrushPosition = useMemo(
    () => ({
      start: { x: xScale(getTerm(data[0])) },
      end: { x: xScale(getTerm(data[20])) },
    }),
    [data, xScale],
  );

  const handleBrushChange = useCallback(
    (bounds: Bounds | null) => {
      //  using xValues instead of x0 and x1 to get the selected range because x0 and x1 work better with continuous scales
      if (!bounds || !bounds.xValues) return;

      const selectedTerms = bounds.xValues as string[];

      const selected = data.filter(d => selectedTerms.includes(d.term));
      setSelected(selected);
    },
    [data],
  );

  useEffect(() => {
    onBrushSelection(selected);
  }, [onBrushSelection, selected]);

  return (
    <div
      ref={parentRef}
      style={{ width: '100%', height: `${defaultHeight}px` }}
    >
      <svg width={width} height={defaultHeight}>
        <Group left={margin.left} top={margin.top}>
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
                  selected.some(selectedItem => selectedItem.term === d.term)
                    ? colorScheme?.[300] || '#cccccc'
                    : '#f2f2f2'
                }
              />
            ) : null;
          })}
          <Brush
            xScale={xScale}
            yScale={yScale}
            width={xBrushMax}
            height={yBrushMax}
            initialBrushPosition={initialBrushPosition}
            brushDirection='horizontal'
            handleSize={8}
            margin={brushMargin}
            onChange={handleBrushChange}
            useWindowMoveEvents
            selectedBoxStyle={{
              fillOpacity: 0.2,
              fill: 'steelblue',
              stroke: 'steelblue',
              strokeOpacity: 0.8,
              strokeWidth: 0.5,
            }}
            renderBrushHandle={props => <BrushHandle {...props} />}
          />
        </Group>
      </svg>
    </div>
  );
};

function BrushHandle({ x, height, isBrushActive }: BrushHandleRenderProps) {
  const pathWidth = 7;
  const pathHeight = 15;
  if (!isBrushActive) {
    return null;
  }
  return (
    <Group left={x + pathWidth / 2} top={(height - pathHeight) / 2}>
      <path
        fill='#f2f2f2'
        d='M -4.5 0.5 L 3.5 0.5 L 3.5 15.5 L -4.5 15.5 L -4.5 0.5 M -1.5 4 L -1.5 12 M 0.5 4 L 0.5 12'
        stroke='#999999'
        strokeWidth='1'
        style={{ cursor: 'ew-resize' }}
      />
    </Group>
  );
}
