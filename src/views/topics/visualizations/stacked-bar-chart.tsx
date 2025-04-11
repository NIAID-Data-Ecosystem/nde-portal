import React, { useMemo } from 'react';
import { useSpring, animated } from '@react-spring/web';
import { Box, Text as ChakraText, VisuallyHidden } from '@chakra-ui/react';
import { Annotation, Connector, HtmlLabel } from '@visx/annotation';
import { Group } from '@visx/group';
import { useParentSize } from '@visx/responsive';
import { scaleLinear } from '@visx/scale';
import {
  TooltipWithBounds,
  useTooltip,
  useTooltipInPortal,
} from '@visx/tooltip';
import NextLink from 'next/link';
import { UrlObject } from 'url';
import { customTooltipStyles, TooltipWrapper } from '../components/tooltip';
import { AccessTypes, FacetTerm } from 'src/utils/api/types';
import { Link } from 'src/components/link';

export interface FacetTermsWithDetails
  extends Pick<FacetTerm, 'term' | 'count'> {
  label: AccessTypes | string;
  description: string;
  colorScheme: string;
  fill: string;
}

interface StackedBarChartProps {
  /** Accessibilty title for the chart. */
  title: string;

  /** Accessibility description for the chart. */
  description: string;
  /** Data for the chart. */
  data: { terms: FacetTermsWithDetails[]; total: number };

  /** Default dimensions of the chart in pixels */
  defaultDimensions: {
    width: number;
    height: number;
    margin: { top: number; right: number; bottom: number; left: number };
  };
  /** Function to handle slice click events. */
  getRoute: (term: string) => UrlObject;
}

const bar = { height: 10, minWidth: 10, xPadding: 4, rx: 2.5 };

export const StackedBarChart = ({
  title,
  description,
  data,
  defaultDimensions,
  getRoute,
}: StackedBarChartProps) => {
  const { height, margin } = defaultDimensions;
  const { parentRef, width } = useParentSize({
    debounceTime: 150,
    initialSize: { width: defaultDimensions.width, height },
    ignoreDimensions: ['height'],
  });

  const svgWidth = width + margin.left + margin.right;
  const svgHeight = height + margin.top + margin.bottom;

  // Calculate the usable chart area.
  const xMax = useMemo(() => {
    const n = data.terms.length;
    return (
      width - margin.left - margin.right - n * (bar.xPadding + bar.minWidth)
    );
  }, [width, margin, data]);

  const widthScale = useMemo(
    () =>
      scaleLinear<number>({
        domain: [0, data.total],
        range: [0, xMax],
      }),
    [data.total, xMax],
  );

  let cumulativeX = 0;
  const processedData = data.terms.map(datum => {
    const barWidth = widthScale(datum.count) + bar.minWidth;
    const barData = {
      data: datum,
      x: cumulativeX,
      y: margin.top,
      height: bar.height,
      width: barWidth,
      fill: datum.fill,
    };
    cumulativeX += barWidth + bar.xPadding;
    return barData;
  });

  // For the tooltip
  const { containerRef, containerBounds } = useTooltipInPortal({
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
  } = useTooltip<FacetTermsWithDetails>();

  const handlePointerMove = (
    event:
      | React.PointerEvent<SVGPathElement>
      | React.FocusEvent<SVGGElement, Element>,
    datum: FacetTermsWithDetails,
  ) => {
    const x = ('clientX' in event ? event.clientX : 0) - containerBounds.left;
    const y = ('clientY' in event ? event.clientY : 0) - containerBounds.top;

    showTooltip({
      tooltipLeft: x,
      tooltipTop: y,
      tooltipData: datum,
    });
  };

  return (
    <div ref={parentRef} style={{ width: '100%', height: `${height}px` }}>
      <div
        ref={containerRef}
        style={{ position: 'relative', width: svgWidth, height: svgHeight }}
      >
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
          <Group top={margin.top} left={margin.left}>
            {processedData.map(bar => (
              <Group
                key={`stacked-bar-${bar.data.term}`}
                cursor='pointer'
                onPointerMove={e => handlePointerMove(e, bar.data)}
                onPointerLeave={hideTooltip}
              >
                <AnimatedRect bar={bar} getRoute={getRoute} />
                <Annotation
                  x={bar.x + bar.width}
                  y={bar.y}
                  dy={bar.height + 10}
                >
                  <Connector type='elbow' stroke={bar.fill} />
                  <HtmlLabel
                    showAnchorLine={false}
                    horizontalAnchor='end'
                    verticalAnchor='start'
                    containerStyle={{
                      overflow: 'hidden',
                      pointerEvents: 'none',
                    }}
                  >
                    <ChakraText
                      color='text.heading'
                      pr={1.5}
                      fontSize='xs'
                      lineHeight='normal'
                      style={{ hyphens: 'auto' }}
                      maxWidth={`${bar.width / 2}px`}
                    >
                      <ChakraText
                        as='span'
                        color='inherit'
                        fontWeight='semibold'
                        noOfLines={1}
                      >
                        {bar.data.label}
                      </ChakraText>
                      <ChakraText as='span' color='inherit' opacity={0.8}>
                        {bar.data.count.toLocaleString()}
                      </ChakraText>
                    </ChakraText>
                  </HtmlLabel>
                </Annotation>
              </Group>
            ))}
          </Group>
        </svg>
        {tooltipOpen && tooltipData && (
          <TooltipWithBounds
            key={Math.random()}
            data-testid='tooltip'
            left={tooltipLeft}
            top={tooltipTop}
            style={{
              ...customTooltipStyles,
              borderTopColor: tooltipData.fill,
            }}
            aria-live='polite'
          >
            <TooltipWrapper borderColor='red' showsSearchHint>
              <Box fontSize='xs' lineHeight='shorter'>
                <ChakraText fontWeight='semibold' color='text.heading'>
                  {tooltipData.label}
                </ChakraText>
                <ChakraText fontWeight='normal'>
                  {tooltipData.count.toLocaleString()} results
                </ChakraText>
              </Box>
            </TooltipWrapper>
          </TooltipWithBounds>
        )}
      </div>
    </div>
  );
};

export const AnimatedRect = ({ bar, getRoute }) => {
  const spring = useSpring({
    width: bar.width,
  });
  return (
    <NextLink href={getRoute(bar.data.term)}>
      <animated.rect
        x={bar.x}
        y={bar.y}
        width={spring.width}
        height={bar.height}
        fill={bar.fill}
        rx={bar.rx}
      />
    </NextLink>
  );
};
