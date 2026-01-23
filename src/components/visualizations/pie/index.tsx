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
import { arc as d3Arc } from 'd3-shape';
import { useTooltip, useTooltipInPortal } from '@visx/tooltip';
import { InfoLabel } from 'src/components/info-label';
import { FacetTerm } from 'src/utils/api/types';
import {
  customTooltipStyles,
  TooltipSubtitle,
  TooltipTitle,
  TooltipWrapper,
} from 'src/views/diseases/disease/components/tooltip';
import { schemeObservable10 } from 'd3-scale-chromatic';
import { ChartDatum } from 'src/views/search/components/summary/types';
import { MORE_ID } from 'src/views/search/components/summary/helpers';
import { theme } from 'src/theme';
import { getMaxLabelWidthPx } from './helpers';

interface Datum {
  count: number;
  label: string;
  pieValue: number;
  term: string;
}

const defaultMargin = { top: 50, right: 50, bottom: 50, left: 50 };

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
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  // Use parent div to measure size for responsive rendering.
  const { parentRef, ...dimensions } = useParentSize({ debounceTime: 150 });

  // Dimensions accounting for margins.
  const width = dimensions.width || initialWidth;
  const height = dimensions.height || initialHeight;
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;
  const outerRadius = Math.min(innerWidth, innerHeight) / 2;
  const donutThickness = Math.max(24, Math.min(150, outerRadius * 0.75));
  const innerRadius = Math.max(0, outerRadius - donutThickness);
  const centerY = innerHeight / 2;
  const centerX = innerWidth / 2;

  // Color scale for the pie slices.
  const colorScale = useMemo(() => getTermColor(data), [data]);
  const viewKey = useMemo(() => data.map(d => d.id).join('|'), [data]);

  return (
    <Flex ref={parentRef} w='100%' h='100%'>
      <svg width={width} height={height} onClick={() => setHoveredId(null)}>
        <Group top={centerY + margin.top} left={centerX + margin.left}>
          <Pie
            key={viewKey}
            data={data}
            pieValue={d => d.value}
            cornerRadius={3}
            outerRadius={outerRadius}
            innerRadius={innerRadius}
          >
            {pie => (
              <AnimatedPie<ChartDatum>
                {...pie}
                viewKey={viewKey}
                margin={margin}
                innerRadius={innerRadius}
                outerRadius={outerRadius}
                animate={animate}
                getKey={({ data: { id } }) => id}
                getLabel={({ data: { label } }) => label}
                onClickDatum={({ data: { id } }) => onSliceClick?.(id)}
                getColor={({ data: { id } }) => colorScale(id)}
                hoveredId={hoveredId}
                setHoveredId={setHoveredId}
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
  delay?: number;
  hoveredId: string | null;
  innerRadius: number;
  margin: typeof defaultMargin;
  outerRadius: number;
  viewKey: string;
  getKey: (d: PieArcDatum<Datum>) => string;
  getLabel: (d: PieArcDatum<Datum>) => string;
  getColor: (d: PieArcDatum<Datum>) => string;
  onClickDatum: (d: PieArcDatum<Datum>) => void;
  setHoveredId: (id: string | null) => void;
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
  hoveredId,
  margin,
  innerRadius,
  outerRadius,
  path,
  viewKey,
  getKey,
  getLabel,
  getColor,
  onClickDatum,
  setHoveredId,
}: AnimatedPieProps<Datum>) {
  const MIN_LABEL_ANGLE = 0.14; // ~8 degrees; avoids overlapping labels on tiny slices
  const LABEL_PADDING = 16; // padding from outer edge of pie to label
  const DIM_OPACITY = 0.5; // opacity for non-hovered slices
  const HOVER_RAISE = Math.max(6, Math.min(8, outerRadius * 0.08));
  // Handlers for hover state
  const handleHoverOn = (id: string) => setHoveredId(id);
  const handleHoverOff = () => setHoveredId(null);
  const handleHoverReset = () => setHoveredId(null);

  // Click handler for a slice and label
  const handleClick = (arc: PieArcDatum<Datum>) => {
    // Reset hover so the “dimmed” state doesn’t stick after interaction.
    handleHoverReset();
    onClickDatum(arc);
  };

  const transitions = useTransition<PieArcDatum<Datum>, AnimatedStyles>(arcs, {
    from: animate ? fromLeaveTransition : enterUpdateTransition,
    enter: enterUpdateTransition,
    update: enterUpdateTransition,
    leave: animate ? fromLeaveTransition : enterUpdateTransition,
    keys: arc => `${viewKey}:${getKey(arc)}`,
  });

  return transitions((spring, arc, { key }) => {
    const id = getKey(arc);
    const label = getLabel(arc);
    const isHovered = hoveredId === id;

    // Determine if label should be shown based on slice angle
    const sliceAngle = arc.endAngle - arc.startAngle;
    const showLabel = sliceAngle >= MIN_LABEL_ANGLE;

    // Determine if this slice is dimmed due to another slice being hovered
    const isDimmed = hoveredId !== null && !isHovered;

    // Multiply spring opacity by dimming
    const sliceOpacity = to(
      [spring.opacity],
      o => o * (isDimmed ? DIM_OPACITY : 1),
    );
    const labelOpacity = isDimmed ? DIM_OPACITY : 1;

    // Subject (dot) and label positions are based on the arc mid-angle.
    // Subject position is at the outer edge of the pie.
    const { x: sx, y: sy } = midArcPoint(
      arc.startAngle,
      arc.endAngle,
      outerRadius,
      0,
    );

    // Label position is outside the pie with some padding.
    const { x: lx, y: ly } = midArcPoint(
      arc.startAngle,
      arc.endAngle,
      outerRadius + LABEL_PADDING,
      0,
    );

    // Determine label anchor based on which side of the pie it is on.
    const horizontalAnchor: 'start' | 'end' = sx < 0 ? 'end' : 'start';

    // Determine max label width (for truncation) based on which side of the chart it's on.
    const maxWidthPx = getMaxLabelWidthPx({
      horizontalAnchor,
      labelX: lx,
      outerRadius,
      margin,
    });

    // Some slices are grouped into a "More" category.
    const isMore = id === MORE_ID;

    // For hover "raise" effect
    const effectiveOuterRadius = outerRadius + (isHovered ? HOVER_RAISE : 0);

    const arcPath = d3Arc<any>()
      .innerRadius(innerRadius)
      .outerRadius(effectiveOuterRadius)
      .cornerRadius(5);

    return (
      <g key={key}>
        <animated.path
          d={to(
            [spring.startAngle, spring.endAngle],
            (startAngle, endAngle) =>
              arcPath({ ...arc, startAngle, endAngle }) ?? '',
          )}
          fill={getColor(arc)}
          style={{ opacity: 0.5, cursor: 'pointer' }}
          onClick={() => onClickDatum(arc)}
          onTouchStart={() => handleClick(arc)}
          onMouseEnter={() => handleHoverOn(id)}
          onMouseLeave={handleHoverOff}
        />

        <animated.path
          d={to([spring.startAngle, spring.endAngle], (startAngle, endAngle) =>
            path({ ...arc, startAngle, endAngle }),
          )}
          fill={getColor(arc)}
          stroke='white'
          strokeLinejoin='round'
          strokeWidth='0.4'
          style={{ opacity: sliceOpacity, cursor: 'pointer' }}
          onClick={() => handleClick(arc)}
          onTouchStart={() => handleClick(arc)}
          onMouseEnter={() => handleHoverOn(id)}
          onMouseLeave={handleHoverOff}
        />

        {showLabel && (
          <Annotation x={sx} y={sy} dx={lx - sx} dy={ly - sy}>
            <CircleSubject radius={3} fill='none' stroke='none' />
            <Connector type='elbow' stroke={getColor(arc)} />
            <PieSliceLabel<Datum>
              label={label}
              maxWidthPx={maxWidthPx}
              opacity={labelOpacity}
              horizontalAnchor={horizontalAnchor}
              isMore={isMore}
              handleClick={() => handleClick(arc)}
              handleHoverOn={() => handleHoverOn(id)}
              handleHoverOff={handleHoverOff}
            />
          </Annotation>
        )}
      </g>
    );
  });
}

type PieSliceLabelProps<Datum> = {
  label: string;
  maxWidthPx: number;
  opacity: number;
  horizontalAnchor: 'start' | 'end';
  isMore: boolean;
  handleClick: () => void;
  handleHoverOn: () => void;
  handleHoverOff: () => void;
};

function PieSliceLabel<Datum>({
  label,
  maxWidthPx,
  opacity,
  horizontalAnchor,
  isMore,
  handleClick,
  handleHoverOn,
  handleHoverOff,
}: PieSliceLabelProps<Datum>) {
  return (
    <HtmlLabel
      showAnchorLine={false}
      horizontalAnchor={horizontalAnchor}
      containerStyle={{
        fontSize: '10px',
        fontWeight: 'bold',
        maxWidth: `${maxWidthPx}px`,
        opacity,
        color: isMore ? theme.colors.link.color : theme.colors.heading,
      }}
    >
      {/* native tooltip */}
      <title>{label}</title>
      <div
        role='button'
        tabIndex={0}
        onBlur={handleHoverOff}
        onFocus={handleHoverOn}
        onMouseEnter={handleHoverOn}
        onMouseLeave={handleHoverOff}
        onClick={e => {
          e.stopPropagation();
          handleClick();
        }}
        onKeyDown={e => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            e.stopPropagation();
            handleClick();
          }
        }}
        style={{
          maxWidth: `${maxWidthPx}px`,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          cursor: 'pointer',
          display: 'inline-block',
          pointerEvents: 'auto',
          textDecoration: isMore ? 'underline' : 'none',
        }}
      >
        {label}
      </div>
    </HtmlLabel>
  );
}
