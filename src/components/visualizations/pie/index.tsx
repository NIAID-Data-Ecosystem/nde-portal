import React, { useMemo, useState } from 'react';
import { Box, Flex } from '@chakra-ui/react';
import { animated, useTransition, to } from '@react-spring/web';
import {
  Annotation,
  CircleSubject,
  Connector,
  HtmlLabel,
} from '@visx/annotation';
import { Group } from '@visx/group';
import { useParentSize } from '@visx/responsive';
import { scaleOrdinal } from '@visx/scale';
import Pie, { ProvidedProps, PieArcDatum } from '@visx/shape/lib/shapes/Pie';
import { arc as d3Arc } from 'd3-shape';
import { schemeObservable10 } from 'd3-scale-chromatic';
import { ChartDatum } from 'src/views/search/components/summary/types';
import { isMoreSlice } from 'src/views/search/components/summary/helpers';
import { theme } from 'src/theme';
import { getMaxLabelWidthPx } from './helpers';
import { useTooltip, useTooltipInPortal } from '@visx/tooltip';
import { localPoint } from '@visx/event';
import { TooltipBody, TooltipWrapper } from '../tooltip';

const defaultMargin = { top: 50, right: 50, bottom: 50, left: 50 };

/**
 * Props for the PieChart component.
 */
export interface PieChartProps {
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

const getTermColor = (data: ChartDatum[]) =>
  scaleOrdinal({
    domain: data.map(d => d.id),
    range: schemeObservable10 as string[],
  });

const PIE_SCALE = 1;

type TooltipEvt =
  | React.MouseEvent<Element>
  | React.PointerEvent<Element>
  | React.FocusEvent<Element>;

/**
 * Renders a pie chart visualization with animations, labels, tooltips,
 * and slice selection/hovering.
 *
 * @param props - {@link PieChartProps} to configure the chart.
 * @returns A React pie chart component.
 *
 */
export const PieChart = ({
  width: initialWidth = 400,
  height: initialHeight = 400,
  margin = defaultMargin,
  animate = true,
  data,
  onSliceClick,
}: PieChartProps) => {
  // Tooltip handling
  const {
    tooltipData,
    tooltipLeft,
    tooltipTop,
    tooltipOpen,
    showTooltip,
    hideTooltip,
  } = useTooltip<ChartDatum>();

  const { containerRef, TooltipInPortal } = useTooltipInPortal({
    detectBounds: true,
    scroll: true,
  });

  // Use parent div to measure size for responsive rendering.
  const { parentRef, ...dimensions } = useParentSize({ debounceTime: 150 });

  // Dimensions accounting for margins.
  const width = dimensions.width || initialWidth;
  const height = dimensions.height || initialHeight;
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;
  const outerRadius = (Math.min(innerWidth, innerHeight) / 2) * PIE_SCALE;
  const donutThickness = Math.max(24, Math.min(150, outerRadius * 0.75));
  const innerRadius = Math.max(0, outerRadius - donutThickness);
  const centerY = innerHeight / 2;
  const centerX = innerWidth / 2;
  const groupLeft = centerX + margin.left;
  const groupTop = centerY + margin.top;

  // Color scale for the pie slices.
  const colorScale = useMemo(() => getTermColor(data), [data]);
  const viewKey = useMemo(() => data.map(d => d.id).join('|'), [data]);

  // Show tooltip and track hovered id on pointer move
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const handleMouseOver = (event: TooltipEvt, datum: ChartDatum) => {
    const targetEl = (event.target as SVGPathElement)?.ownerSVGElement;
    if (!targetEl) return;
    const coords = localPoint(targetEl, event);
    if (!coords) return;
    setHoveredId(datum.id);
    showTooltip({
      tooltipLeft: coords.x,
      tooltipTop: coords.y,
      tooltipData: datum,
    });
  };

  return (
    <Flex w='100%' h='100%'>
      <Flex ref={parentRef} w='100%' h='100%'>
        <Box ref={containerRef} width={width} height={height}>
          <svg width={width} height={height} onClick={() => setHoveredId(null)}>
            <Group top={groupTop} left={groupLeft}>
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
                    svgWidth={width}
                    groupLeft={groupLeft}
                    viewKey={viewKey}
                    innerRadius={innerRadius}
                    outerRadius={outerRadius}
                    animate={animate}
                    getKey={({ data: { id } }) => id}
                    getLabel={({ data: { label } }) => label}
                    onClickDatum={({ data: { id } }) => onSliceClick?.(id)}
                    getColor={({ data: { id } }) => colorScale(id)}
                    hoveredId={hoveredId}
                    handleMouseOver={handleMouseOver}
                    handleMouseOut={() => {
                      setHoveredId(null);
                      hideTooltip();
                    }}
                  />
                )}
              </Pie>
            </Group>
          </svg>
        </Box>
      </Flex>
      {/* Tooltip */}
      {tooltipOpen && tooltipData && (
        <TooltipInPortal
          data-testid='tooltip'
          // set this to random so it correctly updates with parent bounds
          key={Math.random()}
          left={tooltipLeft}
          top={tooltipTop}
          aria-live='polite'
        >
          <TooltipWrapper>
            <TooltipBody fontSize='xs'>{tooltipData.label}</TooltipBody>
          </TooltipWrapper>
        </TooltipInPortal>
      )}
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
  outerRadius: number;
  viewKey: string;
  svgWidth: number;
  groupLeft: number;
  getKey: (d: PieArcDatum<Datum>) => string;
  getLabel: (d: PieArcDatum<Datum>) => string;
  getColor: (d: PieArcDatum<Datum>) => string;
  onClickDatum: (d: PieArcDatum<Datum>) => void;
  handleMouseOut: () => void;
  handleMouseOver: (event: TooltipEvt, datum: Datum) => void;
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

function AnimatedPie<ChartDatum>({
  animate,
  arcs,
  hoveredId,
  innerRadius,
  outerRadius,
  path,
  groupLeft,
  svgWidth,
  viewKey,
  getKey,
  getLabel,
  getColor,
  onClickDatum,
  handleMouseOver,
  handleMouseOut,
}: AnimatedPieProps<ChartDatum>) {
  const MIN_LABEL_ANGLE = 0.22; // avoids overlapping labels on tiny slices
  const MIN_LABEL_DISPLAY_WIDTH = 40; // cutoff width in px to show label
  const LABEL_PADDING = 16; // padding from outer edge of pie to label
  const DIM_OPACITY = 0.5; // opacity for non-hovered slices
  const HOVER_RAISE = Math.max(6, Math.min(8, outerRadius * 0.08));

  // Click handler for a slice and label
  const handleClick = (arc: PieArcDatum<ChartDatum>) => {
    // Reset hover so the “dimmed” state doesn’t stick after interaction.
    handleMouseOut();
    onClickDatum(arc);
  };

  const transitions = useTransition<PieArcDatum<ChartDatum>, AnimatedStyles>(
    arcs,
    {
      from: animate ? fromLeaveTransition : enterUpdateTransition,
      enter: enterUpdateTransition,
      update: enterUpdateTransition,
      leave: animate ? fromLeaveTransition : enterUpdateTransition,
      keys: arc => `${viewKey}:${getKey(arc)}`,
    },
  );

  // If none (excluding "More") would show, we will force-show one fallback label so that the chart isn't empty of labels.
  const fallbackLabelId = useMemo(() => {
    const candidates = arcs
      .map(a => {
        const id = getKey(a);
        const isMore = isMoreSlice(id);
        const sliceAngle = a.endAngle - a.startAngle;

        // positions for width calculation (same as render)
        const { x: sx } = midArcPoint(a.startAngle, a.endAngle, outerRadius, 0);
        const { x: lx } = midArcPoint(
          a.startAngle,
          a.endAngle,
          outerRadius,
          LABEL_PADDING,
        );

        const horizontalAnchor: 'start' | 'end' = sx < 0 ? 'end' : 'start';
        const maxWidthPx = getMaxLabelWidthPx({
          horizontalAnchor,
          labelX: lx,
          svgWidth,
          groupLeft,
        });

        const qualifies =
          sliceAngle >= MIN_LABEL_ANGLE && maxWidthPx > MIN_LABEL_DISPLAY_WIDTH;

        return {
          id,
          isMore,
          sliceAngle,
          maxWidthPx,
          qualifies,
        };
      })
      .filter(c => !c.isMore); // only consider non-"More" for fallback

    // If at least one non-"More" qualifies, no fallback needed.
    if (candidates.some(c => c.qualifies)) return null;

    // Otherwise pick the "best" label to force-show:
    // largest angle first; tie-breaker by available label width.
    const best = candidates
      .filter(c => c.maxWidthPx > 10)
      .sort(
        (a, b) => b.sliceAngle - a.sliceAngle || b.maxWidthPx - a.maxWidthPx,
      )[0];

    return best?.id ?? null;
  }, [arcs, getKey, outerRadius, svgWidth, groupLeft]);

  return transitions((spring, arc, { key }, i) => {
    const id = getKey(arc);
    const label = getLabel(arc);
    const isHovered = hoveredId === id;

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
      outerRadius,
      LABEL_PADDING,
    );

    // ---- Render the labels ----
    // Determine if label should be shown based on slice angle
    const sliceAngle = arc.endAngle - arc.startAngle;

    // Some slices are grouped into a "More" category.
    const isMore = isMoreSlice(id);

    // Determine label anchor based on which side of the pie it is on.
    const horizontalAnchor: 'start' | 'end' = sx < 0 ? 'end' : 'start';

    // Determine max label width (for truncation) based on which side of the chart it's on.
    const maxWidthPx = getMaxLabelWidthPx({
      horizontalAnchor,
      labelX: lx,
      svgWidth,
      groupLeft,
    });

    //  Always show label for "More" slice
    const qualifies =
      sliceAngle >= MIN_LABEL_ANGLE && maxWidthPx > MIN_LABEL_DISPLAY_WIDTH;

    const forceShowFallback = fallbackLabelId != null && id === fallbackLabelId;

    const showLabel = qualifies || isMore || forceShowFallback;

    // ---- Render the hover effect pie slice ----
    const effectiveOuterRadius = outerRadius + (isHovered ? HOVER_RAISE : 0);

    // Arc generator for the hover slice path
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
          style={{ opacity: 0.5, cursor: 'pointer', pointerEvents: 'none' }}
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
          onMouseEnter={event => handleMouseOver(event, arc.data)}
          onMouseLeave={() => handleMouseOut()}
        />

        {showLabel && (
          <Annotation x={sx} y={sy} dx={lx - sx} dy={ly - sy}>
            <CircleSubject radius={3} fill='none' stroke='none' />
            <Connector type='elbow' stroke={getColor(arc)} />
            <PieSliceLabel<ChartDatum>
              label={`${label}`}
              maxWidthPx={maxWidthPx}
              opacity={labelOpacity}
              horizontalAnchor={horizontalAnchor}
              isMore={isMore}
              handleClick={() => handleClick(arc)}
              handleMouseOver={e => handleMouseOver(e, arc.data)}
              handleMouseOut={() => handleMouseOut()}
            />
          </Annotation>
        )}
      </g>
    );
  });
}

type PieSliceLabelProps<ChartDatum> = {
  label: string;
  maxWidthPx: number;
  opacity: number;
  horizontalAnchor: 'start' | 'end';
  isMore: boolean;
  handleClick: () => void;
  handleMouseOut: () => void;
  handleMouseOver: (event: TooltipEvt) => void;
};

function PieSliceLabel<ChartDatum>({
  label,
  maxWidthPx,
  opacity,
  horizontalAnchor,
  isMore,
  handleClick,
  handleMouseOver,
  handleMouseOut,
}: PieSliceLabelProps<ChartDatum>) {
  return (
    <HtmlLabel
      showAnchorLine={false}
      horizontalAnchor={horizontalAnchor}
      containerStyle={{
        color: isMore ? theme.colors.link.color : theme.colors.heading,
        fontSize: '10px',
        fontWeight: 'bold',
        maxWidth: `${maxWidthPx}px`,
        opacity,
      }}
    >
      {/* native tooltip */}
      <title>{label}</title>
      <div
        role='button'
        aria-label={label}
        tabIndex={0}
        onBlur={handleMouseOut}
        onFocus={handleMouseOver}
        onMouseEnter={handleMouseOver}
        onMouseLeave={handleMouseOut}
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
          cursor: 'pointer',
          display: 'block',
          lineHeight: 1.5,
          maxWidth: `${maxWidthPx}px`,
          overflow: 'hidden',
          paddingBottom: isMore ? '0.5rem' : 0,
          pointerEvents: 'auto',
          textAlign: horizontalAnchor === 'start' ? 'left' : 'right',
          textDecoration: isMore ? 'underline' : 'none',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {label}
      </div>
    </HtmlLabel>
  );
}
