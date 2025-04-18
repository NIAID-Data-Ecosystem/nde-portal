import { useMemo, useState } from 'react';
import NextLink from 'next/link';
import { useRouter } from 'next/router';
import { Box, Text as ChakraText, VisuallyHidden } from '@chakra-ui/react';
import { HtmlLabel, Annotation } from '@visx/annotation';
import { Group } from '@visx/group';
import { Treemap, hierarchy, stratify, treemapBinary } from '@visx/hierarchy';
import { useParentSize } from '@visx/responsive';
import { FacetTerm } from 'src/utils/api/types';
import { UrlObject } from 'url';
import { FacetProps } from '../types';
import { SectionTitle } from '../layouts/section';
import {
  TooltipWithBounds,
  useTooltip,
  useTooltipInPortal,
} from '@visx/tooltip';
import { customTooltipStyles, TooltipWrapper } from '../components/tooltip';

interface TreemapChartProps {
  /** Array of data values used to generate the chart. */
  data: FacetTerm[];
  /** Facet properties used to customize the chart. */
  facet: FacetProps;

  /** Function to generate the search route for each term. */
  getSearchRoute: (term: string) => UrlObject;

  /** Default dimensions of the chart in pixels */
  defaultDimensions: {
    width: number;
    height: number;
    margin: { top: number; right: number; bottom: number; left: number };
  };
  /** Accessibilty title for the chart. */
  title: string;

  /** Accessibility description for the chart. */
  description: string;
}

type FacetTermWithParent = FacetTerm & { parent: string | null };

// title='Resource Type Distribution'
// description=' A donut chart showing the distribution of different resource types
// by count. The chart is interactive and allows users to click on each segment to
// view more details about that resource type.'

export const TreemapChart = ({
  title,
  description,
  data,
  facet,
  defaultDimensions,
  getSearchRoute,
}: TreemapChartProps) => {
  // State to manage hover and focus interactions
  const [hoveredTerm, setHoveredTerm] = useState<string | null>(null);
  const [focusedTerm, setFocusedTerm] = useState<string | null>(null);

  // Default dimensions for the chart
  const { height, margin } = defaultDimensions;
  const router = useRouter();

  const { parentRef, width } = useParentSize({
    debounceTime: 150,
    initialSize: {
      width: defaultDimensions.width,
      height,
    },
    ignoreDimensions: ['height'],
  });

  // Calculate usable chart area
  const xMax = useMemo(
    () => width - margin.left - margin.right,
    [width, margin],
  );
  const yMax = useMemo(
    () => height - margin.top - margin.bottom,
    [height, margin],
  );

  // Create a root node with a dummy parent
  // This is necessary for the stratify function to work correctly
  // and to create a hierarchy with a single root node.
  const root = useMemo(() => {
    const stratified = stratify<FacetTermWithParent>()
      .id(d => d.term)
      .parentId(d => d.parent)([
        { term: 'root', count: 0, parent: '' },
        ...data.map(d => ({
          ...d,
          parent: 'root',
        })),
      ])
      .sum(d => d.count ?? 0);

    return hierarchy(stratified).sort(
      (a, b) => (b.value || 0) - (a.value || 0),
    );
  }, [data]);

  // Create a unique ID for the aria-labelledby and aria-describedby attributes
  const aria_title = `treemap-chart-title-${facet.value
    .replace('.', '-')
    .toLowerCase()}`;

  const aria_desc = `treemap-chart-desc-${facet.value
    .replace('.', '-')
    .toLowerCase()}`;

  // Tooltip content for the hovered term
  const {
    tooltipData,
    tooltipLeft,
    tooltipTop,
    tooltipOpen,
    showTooltip,
    hideTooltip,
  } = useTooltip<FacetTermWithParent>();

  const { containerRef, containerBounds } = useTooltipInPortal({
    detectBounds: true,
    scroll: true,
  });
  // Show tooltip and track hovered term on pointer move
  const handlePointerMove = (
    event:
      | React.PointerEvent<SVGPathElement>
      | React.FocusEvent<SVGGElement, Element>,
    datum: FacetTermWithParent,
  ) => {
    // coordinates should be relative to the container in which Tooltip is rendered
    const containerX =
      ('clientX' in event ? event.clientX : 0) - containerBounds.left;
    const containerY =
      ('clientY' in event ? event.clientY : 0) - containerBounds.top;

    showTooltip({
      tooltipLeft: containerX,
      tooltipTop: containerY,
      tooltipData: datum,
    });
  };

  return (
    <>
      <SectionTitle as='h5'>{facet.label}</SectionTitle>
      <div ref={parentRef} style={{ width: '100%', height: `${height}px` }}>
        <div
          ref={containerRef}
          style={{
            position: 'relative',
            width,
            height,
          }}
        >
          <VisuallyHidden>
            <p id={aria_title}>{title}</p>
            <p id={aria_desc}>{description}</p>
          </VisuallyHidden>
          <svg
            width={width}
            height={height}
            role='img'
            aria-labelledby={aria_title}
            aria-describedby={aria_desc}
          >
            <Treemap
              top={margin.top}
              root={root}
              size={[xMax, yMax]}
              tile={treemapBinary}
              round
            >
              {treemap => {
                const nodes = treemap.descendants().reverse();
                const focusedNode = focusedTerm
                  ? nodes.find(n => n.data.id === focusedTerm)
                  : null;

                return (
                  <Group>
                    {nodes.map((node, i) => {
                      if (node.depth !== 1) return null;
                      const term = node.data.id || '';
                      const isHovered = hoveredTerm === term;
                      const isFocused = focusedTerm === term;

                      const nodeWidth = node.x1 - node.x0;
                      const nodeHeight = node.y1 - node.y0;
                      const strokeWidth = 2;
                      const labelWidth = nodeWidth - strokeWidth * 2 - 5;
                      const labelHeight = nodeHeight - strokeWidth * 2;

                      return (
                        <Group
                          key={term}
                          top={node.y0 + margin.top}
                          left={node.x0 + margin.left}
                        >
                          {/* Focusable interactive rect with URL via NextLink */}
                          <NextLink
                            href={getSearchRoute(term)}
                            passHref
                            tabIndex={-1} // Prevent link from being tabbable, rect is tabbable
                          >
                            <rect
                              width={nodeWidth}
                              height={nodeHeight}
                              fill={facet.colorScheme?.[300]}
                              fillOpacity={isHovered ? 0.8 : 1}
                              stroke='#fff'
                              strokeWidth={strokeWidth}
                              cursor='pointer'
                              tabIndex={0}
                              role='link'
                              aria-label={`${node.data.data.term}, ${node.data.data.count} items`}
                              onKeyDown={e => {
                                // Keyboard interaction handler for accessibility
                                if (e.key === 'Enter' || e.key === ' ') {
                                  e.preventDefault();
                                  router.push(getSearchRoute(term));
                                }
                              }}
                              onFocus={() => setFocusedTerm(term)}
                              onBlur={() => setFocusedTerm(null)}
                              onPointerMove={e => {
                                setHoveredTerm(term);
                                handlePointerMove(e, node.data.data);
                              }}
                              onPointerLeave={() => {
                                hideTooltip();
                                setHoveredTerm(null);
                              }}
                              style={{ outline: 'none' }}
                            />
                          </NextLink>
                          {/* Label rendered inside rectangle */}
                          <Annotation dx={5} dy={3}>
                            <HtmlLabel
                              showAnchorLine={false}
                              horizontalAnchor='start'
                              verticalAnchor='start'
                              containerStyle={{
                                width: labelWidth,
                                height: labelHeight,
                                overflow: 'hidden',
                                padding: '0.1em',
                                pointerEvents: 'none',
                              }}
                            >
                              <ChakraText
                                color='text.heading'
                                fontSize='xs'
                                lineHeight='normal'
                                style={{
                                  hyphens: 'auto',
                                }}
                              >
                                <ChakraText
                                  as='span'
                                  color='inherit'
                                  fontWeight='semibold'
                                  noOfLines={2}
                                  textDecoration={
                                    isHovered || isFocused
                                      ? 'underline'
                                      : 'none'
                                  }
                                  transition='text-decoration 0.2s ease'
                                >
                                  {node.data.data.term}
                                </ChakraText>{' '}
                                <ChakraText
                                  as='span'
                                  color='inherit'
                                  opacity={0.8}
                                >
                                  {node.data.data.count.toLocaleString()}
                                </ChakraText>
                              </ChakraText>
                            </HtmlLabel>
                          </Annotation>
                        </Group>
                      );
                    })}
                    {/* Custom focus ring for currently focused rect, otherwise it is overlapped by other rects */}
                    {focusedNode && (
                      <rect
                        x={focusedNode.x0 + margin.left - 2}
                        y={focusedNode.y0 + margin.top - 2}
                        width={focusedNode.x1 - focusedNode.x0 + 4}
                        height={focusedNode.y1 - focusedNode.y0 + 4}
                        stroke={facet.colorScheme?.[600]}
                        strokeWidth={2}
                        fill='none'
                        pointerEvents='none'
                      />
                    )}
                  </Group>
                );
              }}
            </Treemap>
          </svg>
          {/* Tooltip */}
          {tooltipOpen && tooltipData && (
            <TooltipWithBounds
              data-testid='tooltip'
              // set this to random so it correctly updates with parent bounds
              key={Math.random()}
              left={tooltipLeft}
              top={tooltipTop}
              style={{
                ...customTooltipStyles,
                borderTopColor: `${facet.colorScheme?.[600]}`,
              }}
              aria-live='polite'
            >
              <TooltipWrapper showsSearchHint>
                <Box fontSize='xs' lineHeight='shorter'>
                  <ChakraText fontWeight='semibold' color='text.heading'>
                    {tooltipData.term}
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
    </>
  );
};
