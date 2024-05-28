import React, { useRef, useState, useMemo, useEffect } from 'react';
import { scaleTime, scaleLinear } from '@visx/scale';
import { Brush } from '@visx/brush';
import { Bounds } from '@visx/brush/lib/types';
import BaseBrush, {
  BaseBrushState,
  UpdateBrush,
} from '@visx/brush/lib/BaseBrush';
import { PatternLines } from '@visx/pattern';
import { Group } from '@visx/group';
import { LinearGradient } from '@visx/gradient';
import { max, extent } from '@visx/vendor/d3-array';
import { BrushHandleRenderProps } from '@visx/brush/lib/BrushHandle';
import AreaChart from './area-chart';
import { useQuery } from 'react-query';
import { useQuerySearchResults } from 'src/components/search-results-page/hooks/useSearchResults';
import { Params } from 'src/utils/api';

export type BrushProps = {
  width: number;
  height: number;
  margin?: { top: number; right: number; bottom: number; left: number };
  compact?: boolean;
  params: Params;
};

export interface DateDatum {
  date: string;
  count: number;
}

// // Initialize some variables
const brushMargin = { top: 10, bottom: 15, left: 50, right: 20 };
const chartSeparation = 30;
const PATTERN_ID = 'brush_pattern';
const GRADIENT_ID = 'brush_gradient';

export const background = '#7766E7';
export const background2 = '#321EB5';
export const accentColor = '#FBD38D';
export const accentColorDark = '#FBD38D';
export const strokeWhiteColor = '#ffffffbd';

const selectedBrushStyle = {
  fill: `url(#${PATTERN_ID})`,
  stroke: '#F6AD55',
};

const margin = {
  top: 20,
  left: 50,
  bottom: 20,
  right: 20,
};
// accessors
export const getDate = (d: DateDatum) => new Date(d.term);
export const getCountValue = (d: DateDatum) => d.count;

export const BrushChart = ({
  height,
  params,
  width,
  compact = false,
}: BrushProps) => {
  const brushRef = useRef<BaseBrush | null>(null);
  const { isLoading, isRefetching, error, data } = useQuerySearchResults(
    { ...params, facet_size: 1000, hist: 'date' },
    {
      // Don't refresh everytime window is touched.
      refetchOnWindowFocus: false,
    },
  );
  const datesWithCounts = useMemo(
    () =>
      data?.facets?.hist_dates?.terms.filter(item => {
        return new Date(item.term).getFullYear() <= new Date().getFullYear();
      }) || [],
    [data],
  );
  const [filteredStock, setFilteredStock] = useState(datesWithCounts);
  useEffect(() => {
    setFilteredStock(datesWithCounts);
  }, [datesWithCounts]);

  const onBrushChange = (domain: Bounds | null) => {
    if (!domain) return;
    const { x0, x1, y0, y1 } = domain;
    const stockCopy = datesWithCounts?.filter(s => {
      const x = getDate(s).getTime();
      const y = getCountValue(s);
      return x > x0 && x < x1 && y > y0 && y < y1;
    });
    setFilteredStock(stockCopy);
  };

  const innerHeight = height - margin.top - margin.bottom;
  const topChartBottomMargin = compact
    ? chartSeparation / 2
    : chartSeparation + 10;
  const topChartHeight = 0.8 * innerHeight - topChartBottomMargin;
  const bottomChartHeight = innerHeight - topChartHeight - chartSeparation;

  // bounds
  const xMax = Math.max(width - margin.left - margin.right, 0);
  const yMax = Math.max(topChartHeight, 0);
  const xBrushMax = Math.max(width - brushMargin.left - brushMargin.right, 0);
  const yBrushMax = Math.max(
    bottomChartHeight - brushMargin.top - brushMargin.bottom,
    0,
  );

  // scales
  const dateScale = useMemo(
    () =>
      scaleTime<number>({
        range: [0, xMax],
        domain: extent(filteredStock, getDate) as [Date, Date],
      }),
    [xMax, filteredStock],
  );

  const countScale = useMemo(
    () =>
      scaleLinear<number>({
        range: [yMax, 0],
        domain: [0, max(filteredStock, getCountValue) || 0],
        nice: true,
      }),
    [yMax, filteredStock],
  );

  const brushDateScale = useMemo(
    () =>
      scaleTime<number>({
        range: [0, xBrushMax],
        domain: extent(datesWithCounts, getDate) as [Date, Date],
      }),
    [datesWithCounts, xBrushMax],
  );

  const brushStockScale = useMemo(
    () =>
      scaleLinear({
        range: [yBrushMax, 0],
        domain: [0, max(datesWithCounts, getCountValue) || 0],
        nice: true,
      }),
    [datesWithCounts, yBrushMax],
  );

  const initialBrushPosition = useMemo(
    () => ({
      start: {
        x:
          datesWithCounts.length && brushDateScale(getDate(datesWithCounts[0])),
      },
      end: {
        x:
          datesWithCounts.length && brushDateScale(getDate(datesWithCounts[0])),
      },
    }),
    [datesWithCounts, brushDateScale],
  );

  // event handlers
  const handleClearClick = () => {
    if (brushRef?.current) {
      setFilteredStock(datesWithCounts);
      brushRef.current.reset();
    }
  };

  const handleResetClick = () => {
    if (brushRef?.current) {
      const updater: UpdateBrush = prevBrush => {
        const newExtent = brushRef.current!.getExtent(
          initialBrushPosition.start,
          initialBrushPosition.end,
        );

        const newState: BaseBrushState = {
          ...prevBrush,
          start: { y: newExtent.y0, x: newExtent.x0 },
          end: { y: newExtent.y1, x: newExtent.x1 },
          extent: newExtent,
        };

        return newState;
      };
      brushRef.current.updateBrush(updater);
    }
  };

  return (
    <div>
      <svg width={width} height={height}>
        <LinearGradient
          id='area-background-gradient'
          from={background}
          to={background2}
        />
        <LinearGradient
          id='area-gradient'
          // from='#000'
          // to='#000'
          from={background}
          to={background2}
          fromOpacity={0.4}
          toOpacity={0.1}
        />
        <LinearGradient
          id='area-stroke-gradient'
          // from='#000'
          // to='#000'
          from={background}
          to={background2}
          toOpacity={0.5}
          fromOpacity={1}
        />
        {/* <rect
          x={0}
          y={0}
          width={width}
          height={height}
          fill='url(#area-background-gradient)'
          rx={14}
        /> */}
        <AreaChart
          hideBottomAxis={compact}
          data={filteredStock}
          width={width}
          height={height}
          margin={{ ...margin, bottom: topChartBottomMargin }}
          yMax={yMax}
          xScale={dateScale}
          yScale={countScale}
          gradientColor={background2}
        />
        <AreaChart
          hideBottomAxis
          hideLeftAxis
          data={datesWithCounts}
          width={width}
          yMax={yBrushMax}
          xScale={brushDateScale}
          yScale={brushStockScale}
          margin={brushMargin}
          top={topChartHeight + topChartBottomMargin + margin.top}
          gradientColor={background2}
        >
          <PatternLines
            id={PATTERN_ID}
            height={8}
            width={8}
            stroke={accentColor}
            strokeWidth={1}
            orientation={['diagonal']}
          />
          <Brush
            xScale={brushDateScale}
            yScale={brushStockScale}
            width={xBrushMax}
            height={yBrushMax}
            margin={brushMargin}
            handleSize={8}
            innerRef={brushRef}
            resizeTriggerAreas={['left', 'right']}
            brushDirection='horizontal'
            initialBrushPosition={initialBrushPosition}
            onChange={onBrushChange}
            onClick={() => setFilteredStock(datesWithCounts)}
            selectedBoxStyle={selectedBrushStyle}
            useWindowMoveEvents
            renderBrushHandle={props => <BrushHandle {...props} />}
          />
        </AreaChart>
      </svg>
      <button onClick={handleClearClick}>Clear</button>&nbsp;
    </div>
  );
};
// We need to manually offset the handles for them to be rendered at the right position
function BrushHandle({ x, height, isBrushActive }: BrushHandleRenderProps) {
  const pathWidth = 8;
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
