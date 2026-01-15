import React, { use, useMemo, useState } from 'react';
import NextLink from 'next/link';
import { UrlObject } from 'url';
import { Box, Checkbox, Flex, Text, VisuallyHidden } from '@chakra-ui/react';
import { animated, useTransition, to } from '@react-spring/web';
import {
  Annotation,
  CircleSubject,
  Connector,
  HtmlLabel,
} from '@visx/annotation';
import { localPoint } from '@visx/event';
import { Group } from '@visx/group';
import { useParentSize } from '@visx/responsive';
import { scaleLog, scaleOrdinal } from '@visx/scale';
import Pie, { ProvidedProps, PieArcDatum } from '@visx/shape/lib/shapes/Pie';
import { useTooltip, useTooltipInPortal } from '@visx/tooltip';
import { InfoLabel } from 'src/components/info-label';
import { FacetTerm } from 'src/utils/api/types';
import {
  customTooltipStyles,
  TooltipSubtitle,
  TooltipTitle,
  TooltipWrapper,
} from 'src/views/diseases/disease/components/tooltip';
import { schemeObservable10, schemeSet1 } from 'd3-scale-chromatic';
import { ChartDatum } from 'src/views/search/components/summary/types';
import { d } from 'node_modules/msw/lib/glossary-2792c6da';
import { MORE_ID } from 'src/views/search/components/summary/helpers';
import { theme } from 'src/theme';

interface Datum {
  count: number;
  label: string;
  pieValue: number;
  term: string;
}
// accessor functions
const usage = (d: Datum) => d.pieValue;

const defaultMargin = { top: 100, right: 100, bottom: 100, left: 100 };

type LabelProps = React.SVGProps<SVGTextElement> & {
  transformLabel?: (label: string) => string;
};

/**
 * Props for the DonutChart component.
 */
export interface DonutChartProps {
  /** Width of the chart in pixels. @default 400 */
  width?: number;

  /** Height of the chart in pixels. @default 400 */
  height?: number;

  /** Array of data values used to generate the chart. */
  data: ChartDatum[];

  /** @default "{ top: 20, right: 20, bottom: 20, left: 20 }" */
  margin?: typeof defaultMargin;

  /** Whether to animate the chart transitions. @default true */
  animate?: boolean;

  /** Accessibilty title for the chart. */
  title: string;

  /** Accessibility description for the chart. */
  description: string;

  /** Callback when a slice is clicked. */
  onSliceClick?: (id: string) => void;
}

/**
 * Renders a donut chart visualization with animations, tooltips,
 * logarithmic scaling, and slice selection/hovering.
 *
 * @param props - {@link DonutChartProps} to configure the chart.
 * @returns A React donut chart component.
 *
 * @example
 * ```tsx
 * <DonutChart
 *   width={500}
 *   height={500}
 *   data={[{ term: 'Dataset', count: 100 }]}
 *   getFillColor={(term) => (term === 'Dataset' ? 'blue' : 'gray')}
 * />
 * ```
 */
const donutThickness = 20;

const getTermColor = (data: ChartDatum[]) =>
  scaleOrdinal({
    domain: data.map(d => d.id),
    range: schemeObservable10 as string[],
  });

export const PieChart = ({
  width: initialWidth = 400,
  height: initialHeight = 400,
  margin = defaultMargin,
  animate = true,
  data,
  onSliceClick,
}: DonutChartProps) => {
  // Use parent div to measure size for responsive rendering.
  const { parentRef, ...dimensions } = useParentSize({ debounceTime: 150 });

  // Dimensions accounting for margins.
  const width = dimensions.width || initialWidth;
  const height = dimensions.height || initialHeight;
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;
  const radius = Math.min(innerWidth, innerHeight) / 2;
  const centerY = innerHeight / 2;
  const centerX = innerWidth / 2;
  // Color scale for the pie slices.
  const colorScale = useMemo(() => getTermColor(data), [data]);
  const viewKey = useMemo(() => data.map(d => d.id).join('|'), [data]);
  return (
    <Flex ref={parentRef} w='100%' h='100%'>
      <svg width={width} height={height}>
        <Group top={centerY + margin.top} left={centerX + margin.left}>
          <Pie
            key={viewKey}
            data={data}
            pieValue={d => d.value}
            cornerRadius={3}
            // pieSortValues={() => -1}
            outerRadius={radius}
            innerRadius={donutThickness}
          >
            {pie => (
              <AnimatedPie<ChartDatum>
                {...pie}
                viewKey={viewKey}
                margin={margin}
                outerRadius={radius}
                animate={animate}
                getKey={({ data: { id } }) => id}
                getLabel={({ data: { label, value } }) => {
                  return label;
                }}
                onClickDatum={({ data: { id } }) => {
                  onSliceClick?.(id);
                }}
                getColor={({ data: { id } }) => colorScale(id)}
              />
            )}
          </Pie>
        </Group>
      </svg>
    </Flex>
  );
};

// react-spring transition definitions
type AnimatedStyles = { startAngle: number; endAngle: number; opacity: number };

const fromLeaveTransition = ({ endAngle }: PieArcDatum<any>) => ({
  // enter from 360° if end angle is > 180°
  startAngle: endAngle > Math.PI ? 2 * Math.PI : 0,
  endAngle: endAngle > Math.PI ? 2 * Math.PI : 0,
  opacity: 0,
});
const enterUpdateTransition = ({ startAngle, endAngle }: PieArcDatum<any>) => ({
  startAngle,
  endAngle,
  opacity: 1,
});

type AnimatedPieProps<Datum> = ProvidedProps<Datum> & {
  animate?: boolean;
  getKey: (d: PieArcDatum<Datum>) => string;
  getLabel: (d: PieArcDatum<Datum>) => string;
  getColor: (d: PieArcDatum<Datum>) => string;
  onClickDatum: (d: PieArcDatum<Datum>) => void;
  delay?: number;
  outerRadius: number;
  margin: typeof defaultMargin;
  viewKey: string;
};

function midArcPoint(
  startAngle: number,
  endAngle: number,
  outerRadius: number,
  padding = 0,
) {
  // Calculate the middle angle of the arc.
  const midAngle = (startAngle + endAngle) / 2;
  // Add padding to position label outside the pie's outer edge
  const r = outerRadius + padding;
  return {
    // Subtract PI/2 to convert from standard trig (0° = right) to pie orientation (0° = top)
    x: Math.cos(midAngle - Math.PI / 2) * r,
    y: Math.sin(midAngle - Math.PI / 2) * r,
    angle: midAngle,
  };
}
function AnimatedPie<Datum>({
  animate,
  arcs,
  path,
  margin,
  outerRadius,
  viewKey,
  getKey,
  getLabel,
  getColor,
  onClickDatum,
}: AnimatedPieProps<Datum>) {
  const transitions = useTransition<PieArcDatum<Datum>, AnimatedStyles>(arcs, {
    from: animate ? fromLeaveTransition : enterUpdateTransition,
    enter: enterUpdateTransition,
    update: enterUpdateTransition,
    leave: animate ? fromLeaveTransition : enterUpdateTransition,
    keys: arc => `${viewKey}:${getKey(arc)}`,
  });

  // tweak this:
  const MIN_LABEL_ANGLE = 0.14; // ~8 degrees

  return transitions((props, arc, { key }) => {
    const sliceAngle = arc.endAngle - arc.startAngle;
    const showLabel = sliceAngle >= MIN_LABEL_ANGLE;

    // Subject position
    const { x: sx, y: sy } = midArcPoint(
      arc.startAngle,
      arc.endAngle,
      outerRadius,
      0,
    );

    // Label position
    const { x: lx, y: ly } = midArcPoint(
      arc.startAngle,
      arc.endAngle,
      outerRadius + 10,
      0,
    );

    const horizontalAnchor: 'start' | 'end' = sx < 0 ? 'end' : 'start';

    // Truncate labels
    const edgeRight = outerRadius + margin.right;
    const edgeLeft = -(outerRadius + margin.left);
    const edgePad = 2;

    const maxWidthPx =
      horizontalAnchor === 'start'
        ? Math.max(20, edgeRight - lx - edgePad)
        : Math.max(20, lx - edgeLeft - edgePad);
    return (
      <g key={key}>
        <animated.path
          d={to([props.startAngle, props.endAngle], (startAngle, endAngle) =>
            path({ ...arc, startAngle, endAngle }),
          )}
          fill={getColor(arc)}
          stroke='white'
          strokeLinejoin='round'
          strokeWidth='0.4'
          style={{ opacity: props.opacity, cursor: 'pointer' }}
          onClick={() => onClickDatum(arc)}
          onTouchStart={() => onClickDatum(arc)}
        />

        {showLabel && (
          <Annotation x={sx} y={sy} dx={lx - sx} dy={ly - sy}>
            <CircleSubject radius={3} fill='none' stroke='none' />
            <Connector type='elbow' stroke={getColor(arc)} />
            <HtmlLabel
              showAnchorLine={false}
              horizontalAnchor={horizontalAnchor}
              containerStyle={{
                fontSize: '10px',
                fontWeight: 'bold',
                maxWidth: `${maxWidthPx}px`,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                textDecoration: getKey(arc) === MORE_ID ? 'underline' : 'none',
                color:
                  getKey(arc) === MORE_ID
                    ? theme.colors.link.color
                    : theme.colors.heading,
              }}
            >
              <title>{getLabel(arc)}</title>
              <div
                style={{
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {getLabel(arc)}
              </div>
            </HtmlLabel>
          </Annotation>
        )}
      </g>
    );
  });
}
