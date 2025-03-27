import React, { useMemo, useState } from 'react';
import Pie, { ProvidedProps, PieArcDatum } from '@visx/shape/lib/shapes/Pie';
import { scaleLog } from '@visx/scale';
import { Group } from '@visx/group';
import { animated, useTransition, to } from '@react-spring/web';
import { FacetTerm } from 'src/utils/api/types';
import { Box, Checkbox, Flex, Text } from '@chakra-ui/react';
import { InfoLabel } from 'src/components/info-label';
import { useTooltip, useTooltipInPortal } from '@visx/tooltip';
import { localPoint } from '@visx/event';
import { TooltipWrapper } from '../components/tooltip';
import NextLink from 'next/link';
import { UrlObject } from 'url';

interface Datum {
  count: number;
  label: string;
  pieValue: number;
  term: string;
}
// accessor functions
const usage = (d: Datum) => d.pieValue;

const defaultMargin = { top: 20, right: 20, bottom: 20, left: 20 };

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
  data: FacetTerm[];

  /** Thickness of the donut's inner radius. @default 50 */
  donutThickness?: number;

  /** Function to determine the fill color of each slice by term. */
  getFillColor: (term: string) => string;

  /** Function to handle slice click events. */
  getRoute: (term: string) => UrlObject;

  /** Optional label style and transform function. */
  labelStyles?: LabelProps;

  /** @default "{ top: 20, right: 20, bottom: 20, left: 20 }" */
  margin?: typeof defaultMargin;

  /** Whether to animate the chart transitions. @default true */
  animate?: boolean;

  /** Whether to apply logarithmic scaling to values. @default true */
  useLogScale?: boolean;
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
export const DonutChart = ({
  width = 400,
  height = 400,
  data,
  donutThickness = 50,
  getFillColor,
  getRoute,
  labelStyles,
  margin = defaultMargin,
  animate = true,
  useLogScale = true,
}: DonutChartProps) => {
  // State: whether to apply log scale or raw counts
  const [applyLogScale, setApplyLogScale] = useState<boolean>(useLogScale);

  // State: currently selected slice (for filtering)
  const [selectedResourceType, setSelectedResourceType] = useState<
    string | null
  >(null);

  // State: currently hovered slice (for opacity highlighting)
  const [hoveredTerm, setHoveredTerm] = useState<string | null>(null);

  // Dimensions
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;
  const radius = Math.min(innerWidth, innerHeight) / 2;
  const centerY = innerHeight / 2;
  const centerX = innerWidth / 2;

  const logScale = useMemo(
    () =>
      scaleLog({
        domain: [1, Math.max(...data.map(d => d.count))],
        range: [1, 100],
      }),
    [data],
  );

  // Tooltip handling
  const {
    tooltipData,
    tooltipLeft,
    tooltipTop,
    tooltipOpen,
    showTooltip,
    hideTooltip,
  } = useTooltip<Datum>();

  const { containerRef, TooltipInPortal } = useTooltipInPortal({
    detectBounds: true,
    scroll: true,
  });

  // Show tooltip and track hovered term on pointer move
  const handleMouseOver = (
    event: React.PointerEvent<SVGPathElement>,
    datum: Datum,
  ) => {
    const targetEl = (event.target as SVGPathElement)?.ownerSVGElement;
    if (!targetEl) return;

    const coords = localPoint(targetEl, event);
    setHoveredTerm(datum.term);

    if (!coords) return;
    showTooltip({
      tooltipLeft: coords.x,
      tooltipTop: coords.y,
      tooltipData: datum,
    });
  };

  // Transform data to apply log scale if needed.
  const transformedData = useMemo(
    () =>
      data.map(d => ({
        ...d,
        // count: applyLogScale ? logScale(d.count) : d.count,
        label: labelStyles?.transformLabel
          ? labelStyles.transformLabel(d.term)
          : d.term,
        pieValue: applyLogScale ? logScale(d.count) : d.count,
      })),
    [applyLogScale, data, logScale, labelStyles],
  );

  return (
    <Flex flexDirection='column' alignItems='center' position='relative'>
      {/* Toggle log scale */}
      <Checkbox
        isChecked={applyLogScale}
        onChange={() => setApplyLogScale(!applyLogScale)}
        alignSelf='flex-start'
      >
        <InfoLabel
          title='Apply log scale'
          tooltipText='Log scale compresses large values, making smaller categories more visible while preserving
          proportions. Original counts are shown in tooltips.'
        ></InfoLabel>
      </Checkbox>

      {/* Donut Chart */}
      <Box ref={containerRef} width={width} height={height}>
        <svg width={width} height={height}>
          <Group top={centerY + margin.top} left={centerX + margin.left}>
            <Pie
              cornerRadius={2}
              data={
                selectedResourceType
                  ? transformedData.filter(
                      ({ term }) => term === selectedResourceType,
                    )
                  : transformedData
              }
              innerRadius={Math.max(1, radius - donutThickness)}
              outerRadius={radius}
              padAngle={0.005}
              pieValue={usage}
            >
              {pie => (
                <AnimatedPie<Datum>
                  {...pie}
                  animate={animate}
                  getKey={arc => arc.data.term}
                  getColor={arc => getFillColor(arc.data.term)}
                  getRoute={getRoute}
                  handleMouseOver={handleMouseOver}
                  handleMouseOut={() => {
                    hideTooltip();
                    setHoveredTerm(null);
                  }}
                  hoveredTerm={hoveredTerm}
                  labelStyles={labelStyles}
                  onClickDatum={({ data: { term } }) => {
                    animate &&
                      setSelectedResourceType(
                        selectedResourceType && selectedResourceType === term
                          ? null
                          : term,
                      );
                  }}
                />
              )}
            </Pie>
          </Group>
        </svg>
      </Box>

      {/* Tooltip */}
      {tooltipOpen && tooltipData && (
        <TooltipInPortal
          // set this to random so it correctly updates with parent bounds
          key={Math.random()}
          style={{
            position: 'absolute',
            top: tooltipTop,
            left: tooltipLeft,
          }}
        >
          <TooltipWrapper
            borderColor={getFillColor(tooltipData.term)}
            isClickSearchable
          >
            <Text fontWeight='semibold' lineHeight='short'>
              {tooltipData.count.toLocaleString()}{' '}
              <Text as='span' textTransform='capitalize' fontWeight='normal'>
                {`${tooltipData.label}${tooltipData.count == 1 ? '' : 's'}`}
              </Text>
            </Text>
          </TooltipWrapper>
        </TooltipInPortal>
      )}
    </Flex>
  );
};

// Transition config for react-spring
type AnimatedStyles = { startAngle: number; endAngle: number; opacity: number };

// Initial state for leave/enter transition (from full or zero rotation)
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
  /** Whether to animate the pie chart transitions. */
  animate?: boolean;

  /** Array of pie arc data. */
  arcs: PieArcDatum<Datum>[];

  /** The term currently being hovered over, or `null` if none. */
  hoveredTerm: string | null;

  /** Styles for the labels displayed on the pie chart. */
  labelStyles: DonutChartProps['labelStyles'];

  /** Function to determine the color of each pie slice. */
  getColor: (d: PieArcDatum<Datum>) => string;

  /** Function to generate a unique key for each pie slice. */
  getKey: (d: PieArcDatum<Datum>) => string;

  /** Function to determine the route associated with a pie slice. */
  getRoute: DonutChartProps['getRoute'];

  /** Callback for handling mouse-over events on a pie slice. */
  handleMouseOver: (
    e: React.PointerEvent<SVGPathElement>,
    d: PieArcDatum<Datum>['data'],
  ) => void;

  /** Callback for handling mouse-out events from a pie slice. */
  handleMouseOut: () => void;

  /** Callback for handling click events on a pie slice. */
  onClickDatum: (d: PieArcDatum<Datum>) => void;
};

// Arc rendering with animated transitions
function AnimatedPie<Datum>({
  animate,
  arcs,
  hoveredTerm,
  path,
  labelStyles,
  getKey,
  getColor,
  getRoute,
  handleMouseOver,
  handleMouseOut,
}: AnimatedPieProps<Datum>) {
  const transitions = useTransition<PieArcDatum<Datum>, AnimatedStyles>(arcs, {
    from: animate ? fromLeaveTransition : enterUpdateTransition,
    enter: enterUpdateTransition,
    update: enterUpdateTransition,
    leave: animate ? fromLeaveTransition : enterUpdateTransition,
    keys: getKey,
  });
  return transitions((props, arc, { key }) => {
    const [centroidX, centroidY] = path.centroid(arc);
    const hasSpaceForLabel = arc.endAngle - arc.startAngle >= 0.1;
    const { transformLabel, ...svgTextProps } = labelStyles || {};
    const displayLabel = transformLabel
      ? transformLabel(getKey(arc))
      : getKey(arc);

    return (
      <g key={key}>
        <NextLink href={getRoute(getKey(arc))} passHref>
          <animated.path
            style={{
              cursor: 'pointer',
              // prevent accidental text selection
              userSelect: 'none',
              transition: 'fill 0.2s, opacity 0.2s',
              opacity: !hoveredTerm || getKey(arc) === hoveredTerm ? 1 : 0.5, // dim non-hovered arcs
            }}
            // compute interpolated path d attribute from intermediate angle values
            d={to([props.startAngle, props.endAngle], (startAngle, endAngle) =>
              path({
                ...arc,
                startAngle,
                endAngle,
              }),
            )}
            fill={getColor(arc)}
            onClick={() => {
              handleMouseOut();
              // onClickDatum(arc);
            }}
            // onTouchStart={() => onClickDatum(arc)}
            onPointerMove={e => {
              handleMouseOver(e, arc.data);
            }}
            onMouseOut={handleMouseOut}
          />
          {/* Optional labels */}
          {/* {hasSpaceForLabel && (
          <animated.g style={{ opacity: props.opacity }}>
            <text
              fill='#2f2f2f'
              x={centroidX}
              y={centroidY}
              dy='.33em'
              fontSize={9}
              textAnchor='end'
              pointerEvents='none'
              {...svgTextProps}
            >
              {displayLabel}
            </text>
          </animated.g>
        )} */}
        </NextLink>
      </g>
    );
  });
}
