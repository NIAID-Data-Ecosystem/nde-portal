import React, { useCallback } from 'react';
import Pie, { ProvidedProps, PieArcDatum } from '@visx/shape/lib/shapes/Pie';
import { scaleOrdinal } from '@visx/scale';
import { Group } from '@visx/group';
import { animated, useTransition, to, a } from 'react-spring';
import {
  Box,
  Flex,
  Heading,
  Link,
  ListItem,
  Text,
  UnorderedList,
} from 'nde-design-system';
import { LegendOrdinal, LegendItem } from '@visx/legend';
import { formatNumber } from 'src/utils/helpers';
import {
  useTooltip,
  defaultStyles as defaultTooltipStyles,
  useTooltipInPortal,
} from '@visx/tooltip';
import { schemeTableau10 } from 'd3-scale-chromatic';
import NextLink from 'next/link';
import { queryFilterObject2String } from 'src/components/filter';

interface RawDataProps {
  term: string;
  count: number;
}

interface DataProps {
  term: string;
  count: number;
  data?: RawDataProps[];
}

export type PieProps = {
  width: number;
  height: number;
  margin?: typeof defaultMargin;
  animate?: boolean;
  data: RawDataProps[];
};

const defaultMargin = { top: 10, right: 10, bottom: 10, left: 10 };

const formatPieChartData = (data: RawDataProps[]) => {
  const MIN_COUNT = 10000;

  const formatted = data.reduce((r, d, i) => {
    // if the data has records that are less than the minimum count (MIN_COUNT) we group them together to make a larger slice of pie
    if (d.count < MIN_COUNT) {
      if (!r['Other']) {
        r['Other'] = { count: 0, term: 'Other', data: [] };
      }
      r['Other'].count += d.count;
      r['Other'].data?.push(d);
    } else {
      r[d.term] = d;
    }

    return r;
  }, {} as { [key: string]: DataProps });

  return Object.values(formatted).sort((a, b) => b.count - a.count);
};

export default function PieChart({
  width,
  height,
  margin = defaultMargin,
  animate = true,
  data: rawData,
}: PieProps) {
  const donutThickness = width / 5;

  // Tooltip config
  const {
    showTooltip,
    hideTooltip,
    tooltipOpen,
    tooltipData,
    tooltipLeft = 0,
    tooltipTop = 0,
  } = useTooltip<DataProps | null>({
    // initial tooltip state
    tooltipOpen: true,
    tooltipLeft: width / 3,
    tooltipTop: height / 3,
    tooltipData: null,
  });

  const { containerRef, containerBounds, TooltipInPortal } = useTooltipInPortal(
    {
      scroll: true,
      detectBounds: true,
    },
  );

  // Handles tooltip hover
  const handleMouseOver = useCallback(
    (event: React.MouseEvent<HTMLDivElement>, datum: DataProps) => {
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
    },
    [showTooltip, containerBounds],
  );

  // format data so that smaller values form their own section.
  const data = formatPieChartData(rawData);

  // accessor function for pie slice values
  const getCount = (d: DataProps) => d.count;
  const total = data.reduce((r, d) => (r += getCount(d)), 0);

  // colors for pie chart
  const colorScale = scaleOrdinal({
    domain: data.map(d => d.term),
    // @ts-ignore
    range: schemeTableau10,
  });

  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;
  const radius = Math.min(innerWidth, innerHeight) / 2;
  const centerY = innerHeight / 2;
  const centerX = innerWidth / 2;

  return (
    <Flex
      alignItems={['center', 'start']}
      justifyContent={['flex-start', 'center', 'flex-start']}
      flexDirection={['row']}
      flexWrap={['wrap', 'wrap', 'wrap', 'nowrap']}
    >
      <Box width={width} height={height} m={[4]}>
        <svg width={width} height={height} ref={containerRef}>
          <Group top={centerY + margin.top} left={centerX + margin.left}>
            <Pie
              data={data}
              pieValue={getCount}
              outerRadius={radius}
              innerRadius={radius - donutThickness}
              // cornerRadius={3}
              // padAngle={0.005}
            >
              {pie => {
                return (
                  <AnimatedPie
                    {...pie}
                    animate={animate}
                    getKey={arc => arc.data.term}
                    getColor={arc => colorScale(arc.data.term)}
                    onMouseOver={(e, datum) => handleMouseOver(e, datum)}
                    onMouseLeave={hideTooltip}
                  />
                );
              }}
            </Pie>
          </Group>
        </svg>
      </Box>
      <Box my={4} mx={[4, 4, 8]} minWidth={[200, 200, 300]}>
        {/* Total datasets */}
        <Heading as='h3' fontWeight='semibold' size='h4' color='gray.900'>
          {formatNumber(total)} Resources
        </Heading>
        {/* Legend */}
        <LegendOrdinal scale={colorScale} direction='column'>
          {labels => (
            <>
              {labels.map((label, i) => {
                if (!label) {
                  return;
                }
                const datum = data.filter(d => d.term === label.text)[0];

                const Label = ({
                  text,
                  count,
                  source,
                }: {
                  text: string;
                  source: string;
                  count: number;
                }) => {
                  return (
                    <>
                      {source ? (
                        <NextLink
                          href={{
                            pathname: `/search`,
                            query: {
                              q: '',
                              filters: queryFilterObject2String({
                                'includedInDataCatalog.name': [source],
                              }),
                            },
                          }}
                          passHref
                        >
                          <Link
                            color='text.body'
                            _hover={{ color: 'text.body' }}
                            _visited={{ color: 'text.body' }}
                          >
                            <Text
                              lineHeight='short'
                              fontWeight='semibold'
                              cursor='pointer'
                            >
                              {text}
                            </Text>
                          </Link>
                        </NextLink>
                      ) : (
                        <Text lineHeight='short' fontWeight='semibold'>
                          {text}
                        </Text>
                      )}
                      <Text
                        lineHeight='shorter'
                        fontSize='sm'
                        fontWeight='regular'
                      >
                        {formatNumber(count)} records
                      </Text>
                    </>
                  );
                };

                return (
                  <Flex key={i} maxWidth='300px' my={4}>
                    <LegendItem
                      alignItems='start'
                      onMouseOver={e => handleMouseOver(e, datum)}
                      onMouseLeave={hideTooltip}
                    >
                      <Box
                        width={5}
                        height={5}
                        minWidth={5}
                        minHeight={5}
                        bg={label.value}
                        m={2}
                        mr={4}
                      />
                    </LegendItem>

                    <Box>
                      <Label
                        text={label.text}
                        count={datum.count}
                        source={!datum.data && datum.term}
                      />
                      {datum.data && (
                        <UnorderedList
                          borderLeft='1px solid'
                          borderColor='gray.200'
                          pl={3}
                          ml={1}
                          mt={4}
                        >
                          {datum.data.map((d, i) => (
                            <ListItem key={i} py={2}>
                              <Label
                                text={d.term}
                                count={d.count}
                                source={d.term}
                              />
                            </ListItem>
                          ))}
                        </UnorderedList>
                      )}
                    </Box>
                  </Flex>
                );
              })}
            </>
          )}
        </LegendOrdinal>
        <Box my={4}>
          <NextLink
            href={{
              pathname: '/sources/',
            }}
            passHref
          >
            <Link>Learn more about our sources</Link>
          </NextLink>
        </Box>
        {/* Hover tooltip */}
        {tooltipOpen && tooltipData && (
          <TooltipInPortal
            key={Math.random()} // needed for bounds to update correctly
            left={tooltipLeft}
            top={tooltipTop}
            style={{
              ...defaultTooltipStyles,
              borderTop: '4px solid',
              borderColor: colorScale(tooltipData.term),
              padding: '1rem',
            }}
          >
            <Box>
              <Text fontWeight='semibold'>{tooltipData.term}</Text>
              <br />
              <Text>{formatNumber(tooltipData.count)} records</Text>
              {tooltipData.data && (
                <UnorderedList
                  ml={0}
                  my={4}
                  py={4}
                  borderTop='1px solid'
                  borderColor='gray.100'
                >
                  {tooltipData.data.map((d, i) => (
                    <ListItem key={i}>
                      <Text fontWeight='semibold'>{d.term}</Text>
                      <Text>{formatNumber(d.count)} records</Text>
                      <br />
                    </ListItem>
                  ))}
                </UnorderedList>
              )}
            </Box>
          </TooltipInPortal>
        )}
      </Box>
    </Flex>
  );
}

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
  getColor: (d: PieArcDatum<Datum>) => string;
  delay?: number;
  onMouseOver: (e: any, datum: any) => void;
  onMouseLeave: () => void;
};

function AnimatedPie<Datum>({
  animate,
  arcs,
  path,
  getKey,
  getColor,
  onMouseOver,
  onMouseLeave,
}: AnimatedPieProps<Datum>) {
  const transitions = useTransition<PieArcDatum<Datum>, AnimatedStyles>(arcs, {
    from: animate ? fromLeaveTransition : enterUpdateTransition,
    enter: enterUpdateTransition,
    update: enterUpdateTransition,
    leave: animate ? fromLeaveTransition : enterUpdateTransition,
    keys: getKey,
  });
  return transitions((props, arc, { key }) => {
    const source = arc.data as DataProps;

    return (
      <g key={key}>
        <NextLink
          href={{
            pathname: `/search`,
            query: {
              q: '',
              filters: queryFilterObject2String({
                'includedInDataCatalog.name': source?.data
                  ? source.data.map(({ term }) => {
                      return term;
                    })
                  : [source.term],
              }),
            },
          }}
          passHref
        >
          <animated.path
            style={{ cursor: 'pointer' }}
            // compute interpolated path d attribute from intermediate angle values
            d={to([props.startAngle, props.endAngle], (startAngle, endAngle) =>
              path({
                ...arc,
                startAngle,
                endAngle,
              }),
            )}
            fill={getColor(arc)}
            onMouseOver={e => onMouseOver(e, arc.data)}
            onMouseLeave={() => onMouseLeave()}
          />
        </NextLink>
      </g>
    );
  });
}
