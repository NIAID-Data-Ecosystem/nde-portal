import React from 'react';
import { uniqueId } from 'lodash';
import { animated, useTransition, to } from '@react-spring/web';
import { Box, Text } from '@chakra-ui/react';
import { Group } from '@visx/group';
import Pie, { PieArcDatum, ProvidedProps } from '@visx/shape/lib/shapes/Pie';
import Tooltip from 'src/components/tooltip';
import { TooltipContent } from './TooltipContent';
import { FormattedResource } from 'src/utils/api/types';

export const CompletenessBadgeCircle = ({
  stats,
  animate = true,
  size = 'lg',
}: {
  stats: FormattedResource['_meta'];
  animate?: boolean;
  size?: 'xs' | 'sm' | 'md' | 'lg';
}) => {
  if (!stats) {
    return <></>;
  }

  const {
    required_max_score,
    required_score,
    recommended_max_score,
    recommended_score,
    total_max_score,
    total_score,
  } = stats.completeness;

  const colors = {
    required: { light: '#ffc678', dark: '#e05e8f', bg: '#F2BED2' },
    recommended: { light: '#ff8bff', dark: '#321eb5', bg: '#b8b3f4' },
  };

  const dimensions = {
    xs: {
      width: 48,
      height: 48,
      margin: { top: 1, right: 1, bottom: 1, left: 1 },
      donutThickness: 4,
      spacing: 3,
      fontSize: 'xs',
    },
    sm: {
      width: 64,
      height: 64,
      margin: { top: 1, right: 1, bottom: 1, left: 1 },
      donutThickness: 6,
      spacing: 4,
      fontSize: 'sm',
    },
    md: {
      width: 72,
      height: 72,
      margin: { top: 2, right: 2, bottom: 2, left: 2 },
      donutThickness: 6.5,
      spacing: 4,
      fontSize: 'sm',
    },
    lg: {
      width: 96,
      height: 96,
      margin: { top: 2, right: 2, bottom: 2, left: 2 },
      donutThickness: 8,
      spacing: 6,
      fontSize: 'lg',
    },
  };

  const { donutThickness, fontSize, height, margin, spacing, width } =
    dimensions[size];

  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  const radius = {
    required: Math.min(innerWidth, innerHeight) / 2 - donutThickness - spacing,
    recommended: Math.min(innerWidth, innerHeight) / 2,
  };
  const centerY = innerHeight / 2;
  const centerX = innerWidth / 2;

  // Data Transformation

  const requiredData = [
    {
      id: uniqueId('required'),
      label: 'Required',
      score: required_score / required_max_score,
      fill: colors.required,
      radius: radius.required,
    },
    {
      score: (required_max_score - required_score) / required_max_score,
      fill: 'transparent',
      radius: 0,
    },
  ];

  const recommendedData = [
    {
      id: uniqueId('recommended'),
      label: 'Recommended',
      score: recommended_score / recommended_max_score,
      fill: colors.recommended,
      radius: radius.recommended,
    },
    {
      score:
        (recommended_max_score - recommended_score) / recommended_max_score,
      fill: 'transparent',
      radius: 0,
    },
  ];

  return (
    <Box position='relative'>
      <Tooltip
        label={
          <TooltipContent
            stats={{
              required: {
                label: 'Fundamental fields',
                max_score: required_max_score,
                score: required_score,
                fill: colors['required'].dark,
                augmented: stats.required_augmented_fields,
              },
              recommended: {
                label: 'Recommended fields',
                max_score: recommended_max_score,
                score: recommended_score,
                fill: colors['recommended'].dark,
                augmented: stats.recommended_augmented_fields,
              },
              total: {
                label: 'Total Score',
                max_score: total_max_score,
                score: total_score,
              },
            }}
          />
        }
      >
        <span>
          <Text
            position='absolute'
            left={`${centerX + margin.left / 2}px`}
            top={`${centerY + margin.top / 2}px`}
            transform={`translate(-50%, -50%)`}
            fontWeight='bold'
            fontSize={fontSize}
            lineHeight='none'
            color='gray.800'
          >
            {total_score}
          </Text>
          <svg
            width={`${dimensions[size].width}px`}
            height={`${dimensions[size].height}px`}
          >
            <Group top={centerY + margin.top} left={centerX + margin.left}>
              {/* Required */}
              {/* background circle for required pie */}
              {[requiredData, recommendedData].map((data, idx) => {
                return data.map(datum => {
                  if (!datum || !datum?.label || !datum.radius) {
                    return <React.Fragment key={idx}></React.Fragment>;
                  }
                  const { id, radius } = datum;
                  return (
                    <Group key={id} id={id}>
                      <circle
                        cx='0'
                        cy='0'
                        r={radius - donutThickness / 2}
                        fill='transparent'
                        strokeWidth={donutThickness}
                        stroke={datum.fill.bg}
                        opacity={0.2}
                      />
                      <Pie
                        data={data}
                        pieValue={d => d.score}
                        pieSort={(a, b) =>
                          (b.label ? 1 : 0) - (a.label ? 1 : 0)
                        }
                        outerRadius={d => d.data.radius}
                        innerRadius={d => d.data.radius - donutThickness}
                        padAngle={0.001}
                        cornerRadius={5}
                      >
                        {pie => {
                          const arc = pie.arcs[0];

                          const startDeg = arc.startAngle * (180 / Math.PI);
                          const endDeg = arc.endAngle * (180 / Math.PI);

                          //  use the radius of the arc to get the correct conic gradient
                          const background = `conic-gradient(${
                            datum.fill.dark
                          } ${startDeg}deg, ${datum.fill.dark} ${
                            (startDeg + endDeg) / 2
                          }deg, ${datum.fill.light} ${endDeg}deg)`;
                          return (
                            <>
                              {/* use this to apply a conic gradient */}
                              <foreignObject
                                x={0 - width / 2}
                                y={0 - height / 2}
                                width={dimensions[size].width}
                                height={dimensions[size].height}
                                clipPath={`url(#${datum.id}-bg)`}
                              >
                                <div
                                  style={{
                                    width: '100%',
                                    height: '100%',
                                    background,
                                  }}
                                />
                              </foreignObject>

                              <clipPath id={`${datum.id}-bg`}>
                                <AnimatedArc
                                  key='arc-required'
                                  animate={animate}
                                  {...pie}
                                />
                              </clipPath>
                            </>
                          );
                        }}
                      </Pie>
                    </Group>
                  );
                });
              })}
            </Group>
          </svg>
        </span>
      </Tooltip>
    </Box>
  );
};

type AnimatedStyles = { startAngle: number; endAngle: number; opacity: number };
type AnimatedPieProps<Datum> = ProvidedProps<Datum> & {
  animate?: boolean;
  delay?: number;
};

const fromLeaveTransition = () => ({
  startAngle: 0,
  endAngle: 0,
  opacity: 0,
});
const enterUpdateTransition = ({ startAngle, endAngle }: PieArcDatum<any>) => ({
  startAngle,
  endAngle,
  opacity: 1,
});

const AnimatedArc = ({ animate = true, arcs, path }: AnimatedPieProps<any>) => {
  const transitions = useTransition<PieArcDatum<any>, AnimatedStyles>(arcs, {
    from: animate ? fromLeaveTransition : enterUpdateTransition,
    enter: enterUpdateTransition,
    update: enterUpdateTransition,
    leave: animate ? fromLeaveTransition : enterUpdateTransition,
  });

  return transitions((props, arc, { key }) => {
    return (
      <animated.path
        key={key}
        // compute interpolated path d attribute from intermediate angle values
        d={to([props.startAngle, props.endAngle], (startAngle, endAngle) =>
          path({
            ...arc,
            startAngle,
            endAngle,
          }),
        )}
      />
    );
  });
};
