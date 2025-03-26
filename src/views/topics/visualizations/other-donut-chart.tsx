import React, { useMemo, useState } from 'react';
import Pie, { ProvidedProps, PieArcDatum } from '@visx/shape/lib/shapes/Pie';
import { scaleLog } from '@visx/scale';
import { Group } from '@visx/group';
import { animated, useTransition, to } from '@react-spring/web';
import { FacetTerm } from 'src/utils/api/types';
import { Box, Checkbox, Flex, Text } from '@chakra-ui/react';
import { InfoLabel } from 'src/components/info-label';

// accessor functions
const usage = (d: FacetTerm) => d.count;

const defaultMargin = { top: 20, right: 30, bottom: 20, left: 30 };

type LabelProps = React.SVGProps<SVGTextElement> & {
  transformLabel?: (label: string) => string;
};
export type PieProps = {
  width: number;
  height: number;
  donutThickness: number;
  margin?: typeof defaultMargin;
  animate?: boolean;
  data: FacetTerm[];
  getFillColor: (term: string) => string;
  labelStyles?: LabelProps;
  useLogScale?: boolean;
};

export const DonutChart = ({
  width = 400,
  height = 400,
  donutThickness = 50,
  data,
  getFillColor,
  margin = defaultMargin,
  animate = true,
  labelStyles,
  useLogScale = true,
}: PieProps) => {
  const [applyLogScale, setApplyLogScale] = useState<boolean>(useLogScale);
  const [selectedResourceType, setSelectedResourceType] = useState<
    string | null
  >(null);

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

  const transformedData = useMemo(
    () =>
      data.map(d => ({
        ...d,
        count: applyLogScale ? logScale(d.count) : d.count,
      })),
    [data, logScale, applyLogScale],
  );

  return (
    <Flex flexDirection='column' alignItems='center'>
      {useLogScale && (
        <Text
          fontSize='sm'
          fontStyle='italic'
          color='text.body'
          lineHeight='short'
          opacity={0.8}
          flex={1}
        >
          This chart uses a logarithmic scale to balance large differences in
          values, making smaller categories more visible while preserving
          proportions. Original counts are shown in tooltips.
        </Text>
      )}
      <Checkbox
        isChecked={applyLogScale}
        onChange={() => setApplyLogScale(!applyLogScale)}
      >
        <InfoLabel
          title='Apply log scale'
          tooltipText='Log scale compresses large values to make smaller counts more visible.'
        ></InfoLabel>
      </Checkbox>
      <Box as='svg' width={width} height={height}>
        <Group top={centerY + margin.top} left={centerX + margin.left}>
          <Pie
            data={
              selectedResourceType
                ? transformedData.filter(
                    ({ term }) => term === selectedResourceType,
                  )
                : transformedData
            }
            pieValue={usage}
            outerRadius={radius}
            innerRadius={Math.max(1, radius - donutThickness)}
            cornerRadius={2}
            padAngle={0.005}
          >
            {pie => (
              <AnimatedPie<FacetTerm>
                {...pie}
                animate={animate}
                getKey={arc => arc.data.term}
                onClickDatum={({ data: { term } }) =>
                  animate &&
                  setSelectedResourceType(
                    selectedResourceType && selectedResourceType === term
                      ? null
                      : term,
                  )
                }
                getColor={arc => getFillColor(arc.data.term)}
                labelStyles={labelStyles}
              />
            )}
          </Pie>
        </Group>
      </Box>
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
  getKey: (d: PieArcDatum<Datum>) => string;
  getColor: (d: PieArcDatum<Datum>) => string;
  onClickDatum: (d: PieArcDatum<Datum>) => void;
  delay?: number;
  labelStyles: PieProps['labelStyles'];
};

function AnimatedPie<Datum>({
  animate,
  arcs,
  path,
  labelStyles,
  getKey,
  getColor,
  onClickDatum,
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
        <animated.path
          // compute interpolated path d attribute from intermediate angle values
          d={to([props.startAngle, props.endAngle], (startAngle, endAngle) =>
            path({
              ...arc,
              startAngle,
              endAngle,
            }),
          )}
          fill={getColor(arc)}
          onClick={() => onClickDatum(arc)}
          onTouchStart={() => onClickDatum(arc)}
        />
        {hasSpaceForLabel && (
          <animated.g style={{ opacity: props.opacity }}>
            <text
              fill='#2f2f2f'
              x={centroidX}
              y={centroidY}
              dy='.33em'
              fontSize={9}
              textAnchor='middle'
              pointerEvents='none'
              {...svgTextProps}
            >
              {displayLabel}
            </text>
          </animated.g>
        )}
      </g>
    );
  });
}
