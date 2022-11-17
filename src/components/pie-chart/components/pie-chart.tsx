import React from 'react';
import Pie, { ProvidedProps, PieArcDatum } from '@visx/shape/lib/shapes/Pie';
import { Group } from '@visx/group';
import { animated, useTransition, to } from 'react-spring';
import {
  Box,
  Flex,
  Heading,
  ListItem,
  Text,
  UnorderedList,
} from 'nde-design-system';
import { formatNumber } from 'src/utils/helpers';
import {
  useTooltip,
  defaultStyles as defaultTooltipStyles,
  useTooltipInPortal,
} from '@visx/tooltip';
import NextLink from 'next/link';
import { queryFilterObject2String } from 'src/components/filters';
import { DataProps, RawDataProps } from '../types';
import { colorScale, formatPieChartData, getCount } from '../helpers';

type PieProps = {
  width: number;
  height: number;
  margin?: typeof defaultMargin;
  animate?: boolean;
  data: RawDataProps[];
};

const defaultMargin = { top: 10, right: 10, bottom: 10, left: 10 };

export const PieChart = ({
  width,
  height,
  margin = defaultMargin,
  animate = true,
  data: rawData,
}: PieProps) => {
  const donutThickness = width / 6;

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
      zIndex: 1000,
    },
  );

  // Handles tooltip hover
  const handleMouseOver = (
    event: React.MouseEvent<HTMLDivElement>,
    datum: DataProps,
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

  // format data so that smaller values form their own section.
  const data = formatPieChartData(rawData);

  // Size of pie chart minus margins space.
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  // Size of pie chart radius.
  const radius = Math.min(innerWidth, innerHeight) / 2;

  // Values for center x and y coords
  const centerY = innerHeight / 2;
  const centerX = innerWidth / 2;

  // accessor function for pie slice values
  const total = data.reduce((r, d) => (r += getCount(d)), 0);

  return (
    <>
      <Flex m={[4]} flexDirection='column' alignItems='center' flex={1}>
        <svg width={width} height={height} ref={containerRef}>
          <Group top={centerY + margin.top} left={centerX + margin.left}>
            <Pie
              data={data}
              pieValue={getCount}
              outerRadius={radius}
              innerRadius={radius - donutThickness}
            >
              {pie => {
                return (
                  <AnimatedPie
                    {...pie}
                    animate={animate}
                    getKey={arc => arc.data.term}
                    getColor={arc => colorScale(data)(arc.data.term)}
                    onMouseOver={(e, datum) => handleMouseOver(e, datum)}
                    onMouseLeave={hideTooltip}
                  />
                );
              }}
            </Pie>
          </Group>
        </svg>
        {/* Total datasets */}
        <Heading
          as='h3'
          fontWeight='medium'
          size='h4'
          color='gray.900'
          textAlign={['center']}
        >
          {formatNumber(total)} Resources
        </Heading>
      </Flex>
      {/* Hover tooltip */}
      {tooltipOpen && tooltipData && (
        <TooltipInPortal
          key={Math.random()} // needed for bounds to update correctly
          left={tooltipLeft}
          top={tooltipTop}
          style={{
            ...defaultTooltipStyles,
            position: 'absolute',
            boxShadow: 'none',
            background: 'none',
          }}
        >
          <Box
            position='absolute'
            borderTop='4px solid'
            padding='1rem'
            borderColor={colorScale(data)(tooltipData.term)}
            boxShadow='low'
            zIndex={1000}
            bg='white'
            minWidth={['unset', '200px']}
          >
            <Text fontWeight='semibold' whiteSpace='nowrap'>
              {tooltipData.term}
            </Text>
            <br />
            <Text>{formatNumber(tooltipData.count)} records</Text>
            {tooltipData.data && (
              <UnorderedList
                ml={0}
                mt={4}
                py={0}
                borderTop='1px solid'
                borderColor='gray.100'
                display='flex'
                flexDirection='row'
                flexWrap='wrap'
                minWidth={['unset', '200px', '300px']}
              >
                {tooltipData.data.map((d, i) => (
                  <ListItem key={i} my={4} px={1} flex='1 1 50%' minW='100px'>
                    <Text fontWeight='semibold'>{d.term}</Text>
                    <Text>{formatNumber(d.count)} records</Text>
                  </ListItem>
                ))}
              </UnorderedList>
            )}
            <br />
            <Text fontStyle='italic'>Click on pie slice to view records.</Text>
          </Box>
        </TooltipInPortal>
      )}
    </>
  );
};

///////////////////////////////////////
/////// Animate the pie chart /////////
///////////////////////////////////////

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

// Draw pie arc.
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
    const source = arc.data as unknown as DataProps;

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
