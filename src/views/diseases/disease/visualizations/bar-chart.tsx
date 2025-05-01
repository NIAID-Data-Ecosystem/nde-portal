import React, { useMemo, useState } from 'react';
import NextLink from 'next/link';
import {
  Text as ChakraText,
  Checkbox,
  Flex,
  HStack,
  VisuallyHidden,
  VStack,
} from '@chakra-ui/react';
import { useSpring, animated } from '@react-spring/web';
import { Annotation, HtmlLabel } from '@visx/annotation';
import { localPoint } from '@visx/event';
import { Group } from '@visx/group';
import { PatternLines } from '@visx/pattern';
import { useParentSize } from '@visx/responsive';
import { scaleBand, scaleLinear, scaleLog } from '@visx/scale';
import { Bar } from '@visx/shape';
import {
  TooltipWithBounds,
  useTooltip,
  useTooltipInPortal,
} from '@visx/tooltip';
import { UrlObject } from 'url';
import { InfoLabel } from 'src/components/info-label';
import { MetadataSource } from 'src/hooks/api/types';
import { theme } from 'src/theme';
import { FacetTerm } from 'src/utils/api/types';
import { customTooltipStyles, TooltipWrapper } from '../components/tooltip';
import { getFillColor } from '../../helpers';

export interface SourceFacet {
  term: FacetTerm['term'];
  count: FacetTerm['count'];
  type: string;
  info: Pick<
    MetadataSource['sourceInfo'],
    'abstract' | 'genre' | 'identifier' | 'name' | 'description'
  > | null;
}

interface BarChartProps {
  /** Unique identifier for the chart. */
  id: string;

  /** Accessibilty title for the chart. */
  title: string;

  /** Accessibility description for the chart. */
  description: string;

  /** Data for the chart. */
  data: { terms: SourceFacet[]; total: number };

  /** Default dimensions of the chart in pixels */
  defaultDimensions: {
    width: number;
    height: number;
    margin: { top: number; right: number; bottom: number; left: number };
  };

  /** State of the data loading. */
  isLoading?: boolean;

  /** Function to get the route for a given term. */
  getRoute: (term: string) => UrlObject;

  /** Whether to apply logarithmic scaling to values. @default true */
  useLogScale?: boolean;
}

const barStyles = { minHeight: 10, padding: 25, rx: 2.5 };
const domainStyles = {
  IID: {
    fillOpacity: 0.6,
    stroke: theme.colors.page.placeholder,
  },
  Generalist: {
    fill: theme.colors.page.placeholder,
    fillOpacity: 0.2,
  },
};

export const BarChart = ({
  id,
  title,
  description,
  data,
  defaultDimensions,
  isLoading,
  getRoute,
  useLogScale = false,
}: BarChartProps) => {
  // State: whether to apply log scale or raw counts
  const [applyLogScale, setApplyLogScale] = useState<boolean>(useLogScale);

  const { height, margin } = defaultDimensions;
  const { parentRef, width } = useParentSize({
    debounceTime: 150,
    initialSize: { width: defaultDimensions.width, height },
    ignoreDimensions: ['height'],
  });

  const xMax = useMemo(() => {
    return width - margin.left - margin.right;
  }, [width, margin]);

  // Adjusted full height based on minBarHeight
  const numBars = data.terms.length;
  const idealBarHeight = barStyles.minHeight + barStyles.padding;

  const yMax = idealBarHeight * numBars;

  // Calculate the usable chart area.
  const svgWidth = width + margin.left + margin.right;
  const svgHeight = yMax + margin.top + margin.bottom;

  // Scales
  const xScale = useMemo(() => {
    return applyLogScale
      ? scaleLog({
          range: [0, xMax],
          domain: [1, Math.max(...data.terms.map(d => d.count))],
        })
      : scaleLinear({
          range: [0, xMax],
          domain: [0, Math.max(...data.terms.map(d => d.count))],
        });
  }, [xMax, data, applyLogScale]);

  const yScale = useMemo(
    () =>
      scaleBand({
        range: [0, yMax],
        domain: data.terms.map(d => d.term),
        paddingInner: 0,
        paddingOuter: 0,
        round: true,
      }),
    [yMax, data],
  );

  // For the tooltip
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
  } = useTooltip<SourceFacet>();

  const handlePointerMove = (
    event:
      | React.PointerEvent<SVGGElement>
      | React.FocusEvent<SVGGElement, Element>,
    datum: SourceFacet,
  ) => {
    const targetEl = (event.target as SVGPathElement)?.ownerSVGElement;
    if (!targetEl) return;
    const coords = localPoint(targetEl, event);

    showTooltip({
      tooltipLeft: coords?.x || 0,
      tooltipTop: coords?.y || 0,
      tooltipData: datum,
    });
  };

  return (
    <>
      <Flex justifyContent='space-between' alignItems='flex-end'>
        {/* Toggle for log scale */}
        <Checkbox
          isChecked={applyLogScale}
          onChange={() => setApplyLogScale(!applyLogScale)}
          alignSelf='flex-end'
        >
          <InfoLabel
            title='Apply log scale'
            tooltipText='Log scale compresses large values, making smaller categories more visible while preserving
              proportions. Original counts are shown in tooltips.'
          ></InfoLabel>
        </Checkbox>
        <Legend id={`${id}-iidpattern-swatch`} />
      </Flex>
      <div ref={parentRef} style={{ width: '100%', height: `${svgHeight}px` }}>
        <div
          ref={containerRef}
          style={{ position: 'relative', width: svgWidth, height: svgHeight }}
        >
          {/* Accessible title + description */}
          <VisuallyHidden>
            <p id='coa-stacked-title'>{title}</p>
            <p id='coa-stacked-desc'>{description}</p>
          </VisuallyHidden>
          <svg
            role='img'
            width={svgWidth}
            height={svgHeight}
            aria-labelledby='coa-stacked-title'
            aria-describedby='coa-stacked-desc'
          >
            <IIDPattern id={`${id}-iidpattern`} />
            <Group top={margin.top} left={margin.left}>
              {data.terms.map(datum => {
                const { term, count } = datum;
                const barWidth = xScale(count) || 0;
                const barHeight = yScale.bandwidth() - barStyles.padding;
                const barX = 0;
                const barY = (yScale(term) || 0) + barStyles.padding;
                const fill = getFillColor(datum.type);
                return (
                  <NextLink
                    key={`bar-${term}`}
                    href={getRoute(datum.term)}
                    passHref
                  >
                    <Group
                      onPointerMove={e => handlePointerMove(e, datum)}
                      onPointerLeave={hideTooltip}
                      onFocus={e => handlePointerMove(e, datum)}
                      onBlur={() => hideTooltip}
                    >
                      {/* filled default bar (rendered to fill the full width for hover purposes) */}
                      <Bar
                        x={barX}
                        y={barY}
                        width={xMax}
                        height={barHeight}
                        fill={domainStyles['Generalist'].fill}
                        fillOpacity={domainStyles['Generalist'].fillOpacity}
                        rx={barStyles.rx}
                      />

                      {/* bar with pattern (rendered to fill the full width for hover purposes) */}
                      {datum.info?.genre === 'IID' && (
                        <Bar
                          x={barX}
                          y={barY}
                          width={xMax}
                          height={barHeight}
                          fill={`url(#${id}-iidpattern)`}
                          fillOpacity={domainStyles['IID'].fillOpacity}
                          rx={barStyles.rx}
                        />
                      )}

                      {/* bar filled with color matching type */}
                      <AnimatedRect
                        bar={{
                          data: datum,
                          x: barX,
                          y: barY,
                          height: barHeight,
                          width: barWidth,
                          fill,
                          rx: barStyles.rx,
                        }}
                      />

                      {/* labels */}
                      <Annotation
                        x={barX}
                        y={barY}
                        dy={Math.max(0 - barStyles.padding / 2, 0 - 6)}
                      >
                        <HtmlLabel
                          showAnchorLine={false}
                          horizontalAnchor='start'
                          verticalAnchor='end'
                          containerStyle={{
                            overflow: 'hidden',
                            pointerEvents: 'none',
                            width: `${xMax}px`,
                          }}
                        >
                          <ChakraText
                            color='text.heading'
                            fontSize='xs'
                            lineHeight='normal'
                            maxWidth={`${xMax}px`}
                            noOfLines={1}
                            visibility={isLoading ? 'hidden' : 'visible'}
                          >
                            {datum?.info?.name || datum.term} |{' '}
                            {datum.count.toLocaleString()}
                          </ChakraText>
                        </HtmlLabel>
                      </Annotation>
                    </Group>
                  </NextLink>
                );
              })}
            </Group>
          </svg>

          {/* Tooltip */}
          {!isLoading && tooltipOpen && tooltipData && (
            <TooltipWithBounds
              key={Math.random()}
              data-testid='tooltip'
              left={tooltipLeft}
              top={tooltipTop}
              style={{
                ...customTooltipStyles,
                borderTopColor: getFillColor(tooltipData.type),
              }}
              aria-live='polite'
            >
              <TooltipWrapper showsSearchHint>
                <VStack
                  alignItems='flex-start'
                  fontSize='xs'
                  lineHeight='shorter'
                  spacing={1}
                >
                  <ChakraText fontWeight='semibold' color='text.heading'>
                    {tooltipData.info?.name || tooltipData.term}
                  </ChakraText>
                  <ChakraText fontWeight='medium'>
                    {tooltipData.info?.genre} |{' '}
                    {tooltipData.count.toLocaleString()} results
                  </ChakraText>

                  <ChakraText fontWeight='normal'>
                    {tooltipData.info?.abstract}
                  </ChakraText>
                </VStack>
              </TooltipWrapper>
            </TooltipWithBounds>
          )}
        </div>
      </div>
    </>
  );
};

export const AnimatedRect = ({
  bar,
}: {
  bar: {
    data: SourceFacet;
    x: number;
    y: number;
    height: number;
    width: number;
    fill: string;
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
      rx={barStyles.rx}
    />
  );
};

const IIDPattern = ({ id }: { id: string }) => {
  return (
    <PatternLines
      id={id}
      width={6}
      height={6}
      // stroke='black'
      stroke={theme.colors.page.placeholder}
      strokeWidth={1}
      orientation={['diagonal']}
    />
  );
};

const Legend = ({ id }: { id: string }) => {
  const swatchSize = 16;
  return (
    <VStack alignItems='flex-start' spacing={1}>
      {/* IID Pattern Swatch */}
      <HStack>
        <svg width={swatchSize} height={swatchSize}>
          <IIDPattern id={id} />
          <rect
            width={swatchSize}
            height={swatchSize}
            fill={`url(#${id})`}
            fillOpacity={domainStyles['IID'].fillOpacity}
            stroke={domainStyles['IID'].stroke}
          />
        </svg>
        <ChakraText as='span' fontSize='xs'>
          IID
        </ChakraText>
      </HStack>
      {/* Generalist Plain Placeholder */}
      <HStack>
        <svg width={swatchSize} height={swatchSize}>
          <rect
            width={swatchSize}
            height={swatchSize}
            fill={domainStyles['Generalist'].fill}
            fillOpacity={domainStyles['Generalist'].fillOpacity}
          />
        </svg>
        <ChakraText as='span' fontSize='xs'>
          Generalist
        </ChakraText>
      </HStack>
    </VStack>
  );
};
