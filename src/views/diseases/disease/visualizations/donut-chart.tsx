import React, { useMemo, useState } from 'react';
import NextLink from 'next/link';
import { UrlObject } from 'url';
import { Box, Checkbox, Flex, Text, VisuallyHidden } from '@chakra-ui/react';
import { animated, useTransition, to } from '@react-spring/web';
import { Annotation, HtmlLabel } from '@visx/annotation';
import { localPoint } from '@visx/event';
import { Group } from '@visx/group';
import { useParentSize } from '@visx/responsive';
import { scaleLog } from '@visx/scale';
import Pie, { ProvidedProps, PieArcDatum } from '@visx/shape/lib/shapes/Pie';
import { useTooltip, useTooltipInPortal } from '@visx/tooltip';
import { InfoLabel } from 'src/components/info-label';
import { FacetTerm } from 'src/utils/api/types';
import {
  customTooltipStyles,
  TooltipSubtitle,
  TooltipTitle,
  TooltipWrapper,
} from '../components/tooltip';

interface Datum {
  count: number;
  label: string;
  pieValue: number;
  term: string;
}
// accessor functions
const usage = (d: Datum) => d.pieValue;

const defaultMargin = { top: 50, right: 20, bottom: 50, left: 20 };

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
  /** Callback for handling click events on a pie slice. */
  handleGATracking: (event: { label: string; count: number }) => void;

  /** Optional label style and transform function. */
  labelStyles?: LabelProps;

  /** @default "{ top: 20, right: 20, bottom: 20, left: 20 }" */
  margin?: typeof defaultMargin;

  /** Whether to animate the chart transitions. @default true */
  animate?: boolean;

  /** Whether to apply logarithmic scaling to values. @default true */
  useLogScale?: boolean;

  /** Accessibilty title for the chart. */
  title: string;

  /** Accessibility description for the chart. */
  description: string;
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
  title,
  description,
  width: defaultWidth = 400,
  height: defaultHeight = 400,
  data,
  donutThickness = 50,
  getFillColor,
  getRoute,
  handleGATracking,
  labelStyles,
  margin = defaultMargin,
  animate = true,
  useLogScale = true,
}: DonutChartProps) => {
  const { parentRef, width, height } = useParentSize({
    debounceTime: 150,
    initialSize: { width: defaultWidth, height: defaultHeight },
  });
  // State: whether to apply log scale or raw counts
  const [applyLogScale, setApplyLogScale] = useState<boolean>(useLogScale);

  // State: currently selected slice (for filtering, interaction between the data visualizations)
  // const [selection, setSelection] = useState<string | null>(null);
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
    event:
      | React.PointerEvent<SVGPathElement>
      | React.FocusEvent<SVGGElement, Element>,
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
    <Flex
      flexDirection='column'
      alignItems='center'
      position='relative'
      minWidth={250}
      width={{ base: '100%', md: 'unset' }}
    >
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
      <div ref={parentRef} style={{ width: '100%', height: `${height}px` }}>
        <Box ref={containerRef} width={width} height={height}>
          <VisuallyHidden>
            <p id='donut-chart-title'>{title}</p>
            <p id='donut-chart-desc'>{description}</p>
          </VisuallyHidden>
          <svg
            role='img'
            width={width}
            height={height}
            aria-labelledby='donut-chart-title'
            aria-describedby='donut-chart-desc'
          >
            <Group top={centerY + margin.top} left={centerX + margin.left}>
              <Pie
                cornerRadius={2}
                data={
                  transformedData
                  // Uncomment to filter data based on selection
                  //  selection
                  //   ? transformedData.filter(({ term }) => term === selection)
                  //   : transformedData
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
                    outerRadius={radius}
                    hoveredTerm={hoveredTerm}
                    labelStyles={labelStyles}
                    dimensions={{ width, height }}
                    handleGATracking={handleGATracking}
                    // onClickDatum={({ data: { term } }) => {
                    //   animate &&
                    //     setSelection(
                    //       selection && selection === term ? null : term,
                    //     );
                    // }}
                  />
                )}
              </Pie>
            </Group>
          </svg>
        </Box>
      </div>

      {/* Tooltip */}
      {tooltipOpen && tooltipData && (
        <TooltipInPortal
          data-testid='tooltip'
          // set this to random so it correctly updates with parent bounds
          key={Math.random()}
          left={tooltipLeft}
          top={tooltipTop}
          style={{
            ...customTooltipStyles,
            borderTopColor: getFillColor(tooltipData.term),
          }}
          aria-live='polite'
        >
          <TooltipWrapper showsSearchHint>
            <TooltipTitle>{tooltipData.label}</TooltipTitle>
            <TooltipSubtitle>
              {`${tooltipData.count.toLocaleString()} result${
                tooltipData.count == 1 ? '' : 's'
              }`}
            </TooltipSubtitle>
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

type AnimatedPieProps<Datum extends { count: number }> =
  ProvidedProps<Datum> & {
    /** Whether to animate the pie chart transitions. */
    animate?: boolean;

    /** Array of pie arc data. */
    arcs: PieArcDatum<Datum>[];

    /** Dimensions of the chart */
    dimensions: {
      width: number;
      height: number;
    };

    /** The term currently being hovered over, or `null` if none. */
    hoveredTerm: string | null;

    /** Styles for the labels displayed on the pie chart. */
    labelStyles: DonutChartProps['labelStyles'];

    /** Number representing the outer radius of the pie chart. */
    outerRadius: number;

    /** Function to determine the color of each pie slice. */
    getColor: (d: PieArcDatum<Datum>) => string;

    /** Function to generate a unique key for each pie slice. */
    getKey: (d: PieArcDatum<Datum>) => string;

    /** Function to determine the route associated with a pie slice. */
    getRoute: DonutChartProps['getRoute'];

    /** Callback for handling mouse-over events on a pie slice. */
    handleMouseOver: (
      e:
        | React.PointerEvent<SVGPathElement>
        | React.FocusEvent<SVGGElement, Element>,
      d: PieArcDatum<Datum>['data'],
    ) => void;

    /** Callback for handling mouse-out events from a pie slice. */
    handleMouseOut: () => void;

    /** Callback for handling GA tracking events. */
    handleGATracking: (event: { label: string; count: number }) => void;

    /** Callback for handling click events on a pie slice. */
    // onClickDatum: (d: PieArcDatum<Datum>) => void;
  };

// Arc rendering with animated transitions
function AnimatedPie<Datum extends { count: number }>({
  animate,
  arcs,
  dimensions,
  hoveredTerm,
  path,
  labelStyles,
  getKey,
  getColor,
  getRoute,
  handleGATracking,
  handleMouseOver,
  handleMouseOut,
  outerRadius,
}: AnimatedPieProps<Datum>) {
  const transitions = useTransition<PieArcDatum<Datum>, AnimatedStyles>(arcs, {
    from: animate ? fromLeaveTransition : enterUpdateTransition,
    enter: enterUpdateTransition,
    update: enterUpdateTransition,
    leave: animate ? fromLeaveTransition : enterUpdateTransition,
    keys: getKey,
  });
  return transitions((props, arc, { key }) => {
    // For label positioning
    const displayLabel = labelStyles?.transformLabel
      ? labelStyles.transformLabel(getKey(arc))
      : getKey(arc);

    // Find mid-angle of arc for labeling
    const angle = (arc.startAngle + arc.endAngle) / 2;
    const labelPadding = { x: 5, y: 5 };
    const centroidX = Math.cos(angle - Math.PI / 2) * outerRadius;
    const centroidY = Math.sin(angle - Math.PI / 2) * outerRadius;

    // label width should fit within the chart area aroundt the donut
    const labelWidth =
      (dimensions.width - outerRadius * 2) / 2 -
      Math.max(labelPadding.x, labelPadding.y);

    // Check if there is enough space for the label
    // If the arc is too small, we won't show the label
    // If the label is too long, we won't show it
    const hasSpaceForLabel =
      arc.endAngle - arc.startAngle >= 0.1 && labelWidth > 50;

    return (
      <g
        key={key}
        tabIndex={arc.index}
        onFocus={e => {
          handleMouseOver(e, arc.data);
        }}
        onBlur={() => {
          handleMouseOut();
        }}
      >
        <NextLink
          onClick={() =>
            handleGATracking({ label: displayLabel, count: arc.data.count })
          }
          href={getRoute(getKey(arc))}
          passHref
        >
          <animated.path
            data-testid={`${getKey(arc)}-path`}
            style={{
              cursor: 'pointer',
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
            onPointerMove={e => {
              handleMouseOver(e, arc.data);
            }}
            onMouseOut={handleMouseOut}
          />
          {/* Optional labels */}
          {hasSpaceForLabel && (
            <Annotation
              x={centroidX}
              y={centroidY}
              dx={centroidX > 0 ? labelPadding.x : 0 - labelPadding.x}
              dy={centroidY > 0 ? labelPadding.y : 0 - labelPadding.y}
            >
              <HtmlLabel
                horizontalAnchor={centroidX > 0 ? 'start' : 'end'}
                verticalAnchor='end'
                containerStyle={{
                  maxWidth: `${labelWidth}px`,
                  overflow: 'hidden',
                  pointerEvents: 'none',
                  width: `${labelWidth}px`,
                  textAlign: centroidX > 0 ? 'start' : 'end',
                }}
                showAnchorLine={false}
              >
                <Text
                  color='text.heading'
                  fontSize='xs'
                  fontWeight='semibold'
                  lineHeight='normal'
                  sx={{
                    hyphens: 'auto',
                    whiteSpace: 'normal',
                  }}
                  noOfLines={2}
                >
                  {displayLabel}
                </Text>
              </HtmlLabel>
            </Annotation>
          )}
        </NextLink>
      </g>
    );
  });
}
