import React, { useMemo, useState } from 'react';
import { Flex, Text } from '@chakra-ui/react';
import { useSpring, animated } from '@react-spring/web';
import { Annotation, HtmlLabel } from '@visx/annotation';
import { AxisBottom } from '@visx/axis';
import { localPoint } from '@visx/event';
import { Group } from '@visx/group';
import { useParentSize } from '@visx/responsive';
import { scaleBand, scaleLinear, scaleLog } from '@visx/scale';
import { Bar } from '@visx/shape';
import {
  TooltipWithBounds,
  useTooltip,
  useTooltipInPortal,
} from '@visx/tooltip';
import { theme } from 'src/theme';
import {
  TooltipWrapper,
  TooltipTitle,
} from 'src/components/visualizations/tooltip/index';
import { ChartDatum } from 'src/views/search/components/summary/types';
import { schemeObservable10 } from 'd3-scale-chromatic';
import { scaleOrdinal } from '@visx/scale';
import { MORE_ID } from 'src/views/search/components/summary/helpers';
import { BarChartProps, TooltipEvt } from './types';
import { getMaxLabelWidthPx } from '../pie/helpers';
import { GridColumns } from '@visx/grid';
import { makeNiceTicks } from './helpers';

const barStyles = {
  height: {
    // cap the bar height to prevent overly tall bars with few items or in expanded mode
    max: 10,
    expanded: {
      max: 20,
    },
  },
  selected: {
    fillOpacity: 0.3,
    padding: {
      x: 2,
      y: 6,
    },
  },
  padding: { y: 8 },
  rx: 2.5,
  fill: theme.colors.gray[200],
  fillOpacity: 0.6,
};
// label styles are minimal since we're hiding the axis line and ticks, but we need to reserve space for the tick labels
const labelStyles = {
  width: 100,
  padding: 8,
  horizontalAnchor: 'end',
  verticalAnchor: 'middle',
} as const;

// axis styles are minimal since we're hiding the axis line and ticks, but we need to reserve space for the tick labels
const axisStyles = {
  height: 24,
} as const;

const getTermColor = (data: ChartDatum[]) =>
  scaleOrdinal({
    domain: data.map(d => d.id),
    range: schemeObservable10 as string[],
  });

export const BarChart = ({
  width: initialWidth = 400,
  height: initialHeight = 400,
  margin = { top: 10, right: 30, bottom: 0, left: 0 },
  data,
  onSliceClick,
  isSliceSelected,
  useLogScale = false,
  isExpanded = false,
}: BarChartProps) => {
  // State: whether to apply log scale or raw counts (potentially remove depending on NIAID feedback)
  const [applyLogScale, setApplyLogScale] = useState<boolean>(useLogScale);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const { parentRef, width, height } = useParentSize({
    debounceTime: 150,
    initialSize: { width: initialWidth, height: initialHeight },
  });
  const svgRef = React.useRef<SVGSVGElement | null>(null);

  const svgWidth = width;
  const svgHeight = height;
  const innerWidth = Math.max(0, width - margin.left - margin.right);

  // Calculate the usable bar width after accounting for label space.
  const barMaxWidth = Math.max(0, innerWidth - labelStyles.width);

  // Axis max value for formatting
  const maxVal = useMemo(() => Math.max(...data.map(d => d.value), 1), [data]);
  const { niceMax, tickValues } = useMemo(() => {
    return makeNiceTicks({ maxValue: maxVal });
  }, [maxVal]);
  const xScale = useMemo(() => {
    return applyLogScale
      ? scaleLog({
          range: [0, barMaxWidth],
          domain: [1, maxVal],
        })
      : scaleLinear({
          range: [0, barMaxWidth],
          domain: [0, niceMax],
          nice: false, // important: don't double-nice it
        });
  }, [barMaxWidth, maxVal, niceMax, applyLogScale]);

  // Fill the available vertical space, but shrink the chart when bars are few.
  const numBars = Math.max(1, data.length);

  const barHeightMax = isExpanded
    ? barStyles.height.expanded.max
    : barStyles.height.max;

  // Natural compact height: just enough to render bars snugly.
  const compactRowHeight = barHeightMax + 12;
  const naturalSvgHeight =
    numBars * compactRowHeight + axisStyles.height + margin.top + margin.bottom;
  const effectiveSvgHeight = Math.min(svgHeight, naturalSvgHeight);
  const plotHeight = Math.max(
    0,
    effectiveSvgHeight - margin.top - margin.bottom - axisStyles.height,
  );

  const yScale = useMemo(
    () =>
      scaleBand({
        range: [0, plotHeight],
        domain: data.map(d => d.term),
        paddingInner: 0,
        paddingOuter: 0,
        round: true,
      }),
    [plotHeight, data, isExpanded],
  );
  const barHeight = Math.min(barHeightMax, yScale.bandwidth());

  const colorScale = useMemo(() => getTermColor(data), [data]);

  // --- Tooltip setup ---
  const { containerRef } = useTooltipInPortal({
    detectBounds: true,
    scroll: true,
  });

  const {
    tooltipData,
    tooltipLeft,
    tooltipTop,
    tooltipOpen,
    showTooltip,
    hideTooltip,
  } = useTooltip<ChartDatum>();

  const handlePointerMove = (event: TooltipEvt, datum: ChartDatum) => {
    const svgEl = svgRef.current;
    if (!svgEl) return;

    const coords = localPoint(svgEl, event.nativeEvent); // <-- key change
    setHoveredId(datum.id);

    showTooltip({
      tooltipLeft: coords?.x || 0,
      tooltipTop: coords?.y || 0,
      tooltipData: datum,
    });
  };
  const handlePointerLeave = () => {
    setHoveredId(null);
    hideTooltip();
  };

  return (
    <>
      <Flex ref={parentRef} w='100%' h='100%'>
        <div
          ref={containerRef}
          style={{
            position: 'relative',
            width: svgWidth,
            height: effectiveSvgHeight,
          }}
        >
          {/* Accessible title + description */}
          {/* <VisuallyHidden>
            <p id='summary-stacked-title'>{title}</p>
            <p id='summary-stacked-desc'>{description}</p>
          </VisuallyHidden> */}
          <svg
            ref={svgRef}
            role='img'
            width={svgWidth}
            height={effectiveSvgHeight}
            // aria-labelledby='summary-stacked-title'
            // aria-describedby='summary-stacked-desc'
          >
            <Group top={margin.top} left={margin.left}>
              <AxisBottom
                top={plotHeight}
                left={labelStyles.width}
                scale={xScale}
                tickValues={tickValues}
                tickFormat={v => Number(v).toLocaleString()}
                tickLabelProps={() => ({
                  style: {
                    fontFamily: theme.fonts.body,
                    fontSize: theme.fontSizes['2xs'],
                    fontWeight: theme.fontWeights.semibold,
                    fill: theme.colors.text.heading,
                    textAnchor: 'middle',
                  },
                })}
              />
              <GridColumns
                scale={xScale}
                width={innerWidth}
                height={plotHeight}
                left={labelStyles.width}
                tickValues={tickValues}
                stroke='#e0e0e0'
              />

              {data.map(datum => {
                const { id, term, label, value } = datum;

                const barX = labelStyles.width;
                const barWidth = xScale(value) || 0;

                const rowY = yScale(term) ?? 0;
                const barY =
                  rowY + Math.max(0, (yScale.bandwidth() - barHeight) / 2);

                const fill = colorScale(id);
                const isHovered = hoveredId === id;
                const isSelected = isSliceSelected?.(id) ?? false;

                // Determine if this bar is dimmed due to another bar being hovered
                const isDimmed = hoveredId !== null && !isHovered;

                // Label is anchored just before the bars
                const labelX = barX - labelStyles.padding;
                const labelY = barY + barHeight / 2;

                const maxLabelWidth = getMaxLabelWidthPx({
                  horizontalAnchor: 'end',
                  labelX,
                  svgWidth,
                  groupLeft: margin.left,
                  minWidth: 40,
                  edgePadding: labelStyles.padding,
                  maxWidthCap: svgWidth * 0.55,
                });
                return (
                  <Group
                    key={id}
                    onClick={() => onSliceClick?.(id)}
                    onPointerMove={e => handlePointerMove(e, datum)}
                    onPointerLeave={handlePointerLeave}
                    onFocus={e => handlePointerMove(e, datum)}
                    onBlur={handlePointerLeave}
                    style={{
                      cursor: 'pointer',
                      opacity: isDimmed ? 0.6 : 1,
                    }}
                  >
                    {/* filled default bar (rendered to fill the full width for hover purposes) */}
                    <Bar
                      x={barX}
                      y={barY}
                      width={barMaxWidth}
                      height={barHeight}
                      fill={barStyles.fill}
                      fillOpacity={barStyles.fillOpacity}
                      rx={barStyles.rx}
                    />

                    {/* if selected, add bar to mark selection */}
                    {isSelected && (
                      <AnimatedRect
                        bar={{
                          x: barX,
                          y: barY - barStyles.selected.padding.y / 2,
                          width:
                            barWidth +
                            barStyles.selected.padding.x +
                            (isHovered ? 4 : 0),
                          height: barHeight + barStyles.selected.padding.y,
                          data: datum,
                          fill,
                          fillOpacity: barStyles.selected.fillOpacity,
                          rx: barStyles.rx,
                        }}
                      />
                    )}
                    {/* bar filled with color matching type */}
                    <AnimatedRect
                      bar={{
                        x: barX,
                        y: barY,
                        width: barWidth + (isHovered ? 4 : 0),
                        height: barHeight,
                        data: datum,
                        fill,
                        rx: barStyles.rx,
                      }}
                    />

                    {/* labels */}
                    <Annotation x={labelX} y={labelY}>
                      <HtmlLabel
                        showAnchorLine={false}
                        horizontalAnchor={labelStyles.horizontalAnchor}
                        verticalAnchor={labelStyles.verticalAnchor}
                        containerStyle={{
                          fontSize: '10px',
                          fontWeight: 'bold',
                          pointerEvents: 'auto',
                          textAlign: labelStyles.horizontalAnchor,
                          width: `${maxLabelWidth}px`,
                          overflow: 'hidden',
                        }}
                      >
                        <Text
                          color={id === MORE_ID ? 'link.color' : 'text.heading'}
                          width='100%'
                          display='block'
                          overflow='hidden'
                          textOverflow='ellipsis'
                          whiteSpace='nowrap'
                          textDecoration={id === MORE_ID ? 'underline' : 'none'}
                          style={{ cursor: 'pointer' }}
                          onClick={e => {
                            e.stopPropagation();
                            onSliceClick?.(id);
                          }}
                          onPointerEnter={e => handlePointerMove(e, datum)}
                          onPointerMove={e => handlePointerMove(e, datum)}
                          onPointerLeave={handlePointerLeave}
                        >
                          {label}
                        </Text>
                      </HtmlLabel>
                    </Annotation>
                  </Group>
                );
              })}
            </Group>
          </svg>

          {/* Tooltip */}
          {tooltipOpen && tooltipData && (
            <TooltipWithBounds
              key={Math.random()}
              data-testid='tooltip'
              left={tooltipLeft}
              top={tooltipTop}
              aria-live='polite'
            >
              <TooltipWrapper>
                <TooltipTitle>{tooltipData.tooltip}</TooltipTitle>
              </TooltipWrapper>
            </TooltipWithBounds>
          )}
        </div>
      </Flex>
    </>
  );
};

export const AnimatedRect = ({
  bar,
}: {
  bar: {
    data: ChartDatum;
    x: number;
    y: number;
    height: number;
    width: number;
    fill: string;
    fillOpacity?: number;
    rx: number;
  };
}) => {
  const spring = useSpring({
    width: bar.width,
  });
  return (
    <animated.rect
      x={bar.x}
      y={bar.y}
      width={spring.width}
      height={bar.height}
      fill={bar.fill}
      fillOpacity={bar.fillOpacity}
      rx={bar.rx}
    />
  );
};
