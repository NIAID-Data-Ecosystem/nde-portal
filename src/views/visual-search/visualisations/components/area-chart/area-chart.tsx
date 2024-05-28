import React, { useCallback } from 'react';
import { Group } from '@visx/group';
import { AreaClosed, Bar, Line } from '@visx/shape';
import { AxisLeft, AxisBottom, AxisScale } from '@visx/axis';
import { LinearGradient } from '@visx/gradient';
import { curveMonotoneX } from '@visx/curve';
import { GridRows, GridColumns } from '@visx/grid';
import {
  DateDatum,
  getCountValue,
  getDate,
  background,
  background2,
  accentColor,
  accentColorDark,
} from './';
import {
  withTooltip,
  Tooltip,
  TooltipWithBounds,
  defaultStyles,
} from '@visx/tooltip';
import { max, extent, bisector } from '@visx/vendor/d3-array';
import { useTooltip, useTooltipInPortal } from '@visx/tooltip';
import { localPoint } from '@visx/event';

const bisectDate = bisector<DateDatum, Date>(d => new Date(d.term)).left;

// Initialize some variables

const axisColor = '#C2C4C6';
const tickLabelColor = '#414141';
const axisBottomTickLabelProps = {
  textAnchor: 'middle' as const,
  fontFamily: 'Arial',
  fontSize: 10,
  fill: tickLabelColor,
  style: { userSelect: 'none' },
};
const axisLeftTickLabelProps = {
  dx: '-0.25em',
  dy: '0.25em',
  fontFamily: 'Arial',
  fontSize: 10,
  textAnchor: 'end' as const,
  fill: tickLabelColor,
  style: { userSelect: 'none' },
};

const tooltipStyles = {
  ...defaultStyles,
  border: '1px solid white',
  color: 'white',
};
export default function AreaChart({
  data,
  gradientColor,
  width,
  height,
  yMax,
  margin,
  xScale,
  yScale,
  hideBottomAxis = false,
  hideLeftAxis = false,
  top,
  left,
  children,
}: {
  data: DateDatum[];
  gradientColor: string;
  xScale: AxisScale<number>;
  yScale: AxisScale<number>;
  width: number;
  height: number;
  yMax: number;
  margin: { top: number; right: number; bottom: number; left: number };
  hideBottomAxis?: boolean;
  hideLeftAxis?: boolean;
  top?: number;
  left?: number;
  children?: React.ReactNode;
}) {
  const {
    tooltipData,
    tooltipLeft,
    tooltipTop,
    tooltipOpen,
    showTooltip,
    hideTooltip,
  } = useTooltip({
    tooltipData: { count: 0, term: '', displayAs: '', updatedCount: 0 },
  });

  const handleTooltip = useCallback(
    (
      event:
        | React.TouchEvent<SVGRectElement>
        | React.MouseEvent<SVGRectElement>,
    ) => {
      const { x } = localPoint(event) || { x: 0 };
      const x0 = xScale.invert(x);
      const index = bisectDate(data, x0, 1);
      const d0 = data[index - 1];
      const d1 = data[index];
      let d = d0;
      if (d1 && getDate(d1)) {
        d =
          x0.valueOf() - getDate(d0).valueOf() >
          getDate(d1).valueOf() - x0.valueOf()
            ? d1
            : d0;
      }
      showTooltip({
        tooltipData: d,
        tooltipLeft: x,
        tooltipTop: yScale(getCountValue(d)),
      });
    },
    [showTooltip, data, yScale, xScale],
  );

  if (width < 10) return null;
  return (
    <Group left={left || margin.left} top={top || margin.top}>
      <GridRows
        left={margin.left}
        scale={yScale}
        width={innerWidth}
        strokeDasharray='1,3'
        stroke={accentColor}
        strokeOpacity={0}
        pointerEvents='none'
      />
      <GridColumns
        top={0}
        scale={xScale}
        height={yMax}
        strokeDasharray='1,3'
        stroke={accentColor}
        strokeOpacity={0.2}
        pointerEvents='none'
      />
      <AreaClosed<DateDatum>
        data={data}
        x={d => xScale(getDate(d)) || 0}
        y={d => yScale(getCountValue(d)) || 0}
        yScale={yScale}
        strokeWidth={1.5}
        stroke='url(#area-stroke-gradient)'
        fill='url(#area-gradient)'
        curve={curveMonotoneX}
      />
      <Bar
        x={margin.left}
        y={margin.top}
        width={innerWidth}
        height={innerHeight}
        fill='transparent'
        rx={14}
        onTouchStart={handleTooltip}
        onTouchMove={handleTooltip}
        onMouseMove={handleTooltip}
        onMouseLeave={() => hideTooltip()}
      />
      {!hideBottomAxis && (
        <AxisBottom
          top={yMax}
          scale={xScale}
          numTicks={width > 200 ? 10 : 5}
          stroke={axisColor}
          tickStroke={axisColor}
          tickLabelProps={axisBottomTickLabelProps}
        />
      )}
      {!hideLeftAxis && (
        <AxisLeft
          scale={yScale}
          numTicks={10}
          hideZero={true}
          stroke={axisColor}
          tickStroke={axisColor}
          tickLabelProps={axisLeftTickLabelProps}
        />
      )}
      {children}
      {tooltipData && (
        <g>
          <Line
            from={{ x: tooltipLeft, y: 0 }}
            to={{ x: tooltipLeft, y: yMax }}
            stroke={accentColorDark}
            strokeWidth={2}
            pointerEvents='none'
            strokeOpacity={0.7}
            strokeDasharray='5,3'
          />
          <circle
            cx={tooltipLeft}
            cy={tooltipTop + 1}
            r={4}
            fill='black'
            fillOpacity={0.1}
            stroke='black'
            strokeOpacity={0.1}
            strokeWidth={2}
            pointerEvents='none'
          />
          <circle
            cx={tooltipLeft}
            cy={tooltipTop}
            r={4}
            fill={accentColorDark}
            stroke='white'
            strokeWidth={2}
            pointerEvents='none'
          />
        </g>
      )}
    </Group>
  );
}
