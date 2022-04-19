import React, {useCallback} from 'react';
import Pie, {ProvidedProps, PieArcDatum} from '@visx/shape/lib/shapes/Pie';
import {scaleOrdinal} from '@visx/scale';
import {Group} from '@visx/group';
import {animated, useTransition, to} from 'react-spring';
import {Box, Flex, Heading, Text, theme} from 'nde-design-system';
import {LegendOrdinal, LegendItem} from '@visx/legend';
import {formatNumber, getRepositoryName} from 'src/utils/helpers';
import {
  useTooltip,
  defaultStyles as defaultTooltipStyles,
  useTooltipInPortal,
} from '@visx/tooltip';
import {schemeCategory10} from 'd3-scale-chromatic';

interface DataProps {
  term: string;
  count: number;
}

export type PieProps = {
  width: number;
  height: number;
  margin?: typeof defaultMargin;
  animate?: boolean;
  data: DataProps[];
};

const donutThickness = 40;

const defaultMargin = {top: 10, right: 10, bottom: 10, left: 10};

export default function PieChart({
  width,
  height,
  margin = defaultMargin,
  animate = true,
  data,
}: PieProps) {
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

  const {containerRef, containerBounds, TooltipInPortal} = useTooltipInPortal({
    scroll: true,
    detectBounds: true,
  });

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

  // accessor function for pie slice values
  const getCount = (d: DataProps) => d.count;
  const total = data.reduce((r, d) => (r += getCount(d)), 0);

  // colors for pie chart
  const colorScale = scaleOrdinal({
    domain: data.map(d => d.term),
    range: schemeCategory10,
  });

  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;
  const radius = Math.min(innerWidth, innerHeight) / 2;
  const centerY = innerHeight / 2;
  const centerX = innerWidth / 2;

  return (
    <Flex
      alignItems={['center', 'center']}
      justifyContent={['start', 'center', 'start']}
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
      <Box m={4} minWidth={[200, 200, 300]}>
        {/* Total datasets */}
        <Heading as={'h3'} fontWeight='semibold' size={'h4'} color='gray.900'>
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
                return (
                  <Flex key={i} maxWidth={'300px'} my={4}>
                    <LegendItem alignItems='center'>
                      <Box
                        width={5}
                        height={5}
                        minWidth={5}
                        minHeight={5}
                        bg={label.value}
                        mr={4}
                      />
                      <Box>
                        <Text lineHeight='short' fontWeight={'semibold'}>
                          {getRepositoryName(label.text)}
                        </Text>
                        <Text
                          lineHeight='shorter'
                          fontSize='sm'
                          fontWeight={'regular'}
                        >
                          {formatNumber(datum.count)} records
                        </Text>
                      </Box>
                    </LegendItem>
                  </Flex>
                );
              })}
            </>
          )}
        </LegendOrdinal>

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
              <Text fontWeight={'semibold'}>
                {getRepositoryName(tooltipData.term)}
              </Text>
              <br />
              <Text>{formatNumber(tooltipData.count)} records</Text>
            </Box>
          </TooltipInPortal>
        )}
      </Box>
    </Flex>
  );
}

// react-spring transition definitions
type AnimatedStyles = {startAngle: number; endAngle: number; opacity: number};

const fromLeaveTransition = ({endAngle}: PieArcDatum<any>) => ({
  // enter from 360° if end angle is > 180°
  startAngle: endAngle > Math.PI ? 2 * Math.PI : 0,
  endAngle: endAngle > Math.PI ? 2 * Math.PI : 0,
  opacity: 0,
});

const enterUpdateTransition = ({startAngle, endAngle}: PieArcDatum<any>) => ({
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
  return transitions((props, arc, {key}) => {
    return (
      <g key={key}>
        <animated.path
          style={{cursor: 'pointer'}}
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
      </g>
    );
  });
}
