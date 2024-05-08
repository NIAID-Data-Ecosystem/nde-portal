import React, { useMemo } from 'react';
import { uniqueId } from 'lodash';
import { animated, useTransition, to } from '@react-spring/web';
import {
  Box,
  Flex,
  FlexProps,
  Icon,
  Link,
  LinkProps,
  Text,
} from '@chakra-ui/react';
import { Group } from '@visx/group';
import Pie, { PieArcDatum, ProvidedProps } from '@visx/shape/lib/shapes/Pie';
import Tooltip from 'src/components/tooltip';
import { TooltipContent } from './TooltipContent';
import { FormattedResource } from 'src/utils/api/types';
import { getMetadataListByType } from './helpers';
import { FaInfo } from 'react-icons/fa6';

const colors = {
  required: { light: '#ffc678', dark: '#e05e8f', bg: '#F2BED2' },
  recommended: { light: '#ff8bff', dark: '#321eb5', bg: '#b8b3f4' },
};

// Dimensions for the different sizes of the badge
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

interface CompletenessBadgeCircleProps extends FlexProps {
  type: FormattedResource['@type'];
  stats: FormattedResource['_meta'];
  animate?: boolean;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  labelProps?: LinkProps;
}

export const CompletenessBadgeCircle = ({
  type,
  stats,
  animate = true,
  size = 'lg',
  labelProps,
  ...props
}: CompletenessBadgeCircleProps) => {
  const { donutThickness, fontSize, height, margin, spacing, width } = useMemo(
    () => dimensions[size],
    [size],
  );

  const innerWidth = useMemo(
    () => width - margin.left - margin.right,
    [width, margin.left, margin.right],
  );
  const innerHeight = useMemo(
    () => height - margin.top - margin.bottom,
    [height, margin.top, margin.bottom],
  );

  const radius = useMemo(
    () => ({
      required:
        Math.min(innerWidth, innerHeight) / 2 - donutThickness - spacing,
      recommended: Math.min(innerWidth, innerHeight) / 2,
    }),
    [innerWidth, innerHeight, donutThickness, spacing],
  );

  const centerY = useMemo(() => innerHeight / 2, [innerHeight]);
  const centerX = useMemo(() => innerWidth / 2, [innerWidth]);
  const metadataList = useMemo(() => getMetadataListByType(type), [type]);

  // Data Transformation. Required and Recommended are the only two categories.
  if (!stats) {
    return <></>;
  }

  const {
    required_score, // can change to length of required fields when available in api
    recommended_score, // can change to length of recommended fields when available in api
    total_score,
  } = stats.completeness;

  const requiredData = [
    {
      id: uniqueId('required'),
      label: 'Required',
      score: required_score / metadataList.required.length,
      fill: colors.required,
      radius: radius.required,
    },

    {
      score:
        (metadataList.required.length - required_score) /
        metadataList.required.length,
      fill: 'transparent',
      radius: radius.required,
    },
  ];

  const recommendedData = [
    {
      id: uniqueId('recommended'),
      label: 'Recommended',
      score: recommended_score / metadataList.recommended.length,
      fill: colors.recommended,
      radius: radius.recommended,
    },
    {
      score:
        (metadataList.recommended.length - recommended_score) /
        metadataList.recommended.length,
      fill: 'transparent',
      radius: radius.recommended,
    },
  ];

  return (
    <Flex
      p={2}
      justifyContent='center'
      alignItems='center'
      flexDirection='column'
      {...props}
    >
      <Box position='relative' cursor='default'>
        <Tooltip
          maxWidth='unset'
          maxW='90vw'
          label={
            <TooltipContent
              type={type}
              data={[
                {
                  label: 'Fundamental fields',
                  fields: metadataList.required,
                  included: stats?.required_fields || [],
                  augmented: stats.required_augmented_fields,
                  fill: colors['required'].dark,
                },
                {
                  label: 'Recommended fields',
                  fields: metadataList.recommended,
                  included: stats?.recommended_fields || [],
                  augmented: stats.recommended_augmented_fields,
                  fill: colors['recommended'].dark,
                },
              ]}
            />
          }
        >
          <span>
            <Text
              position='absolute'
              left={`${centerX + margin.left / 2}px`}
              top={`${centerY + margin.top / 2}px`}
              transform='translate(-50%, -50%)'
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
              viewBox={`0 0 ${dimensions[size].width} ${dimensions[size].height}`}
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
                      <Group key={id}>
                        <circle
                          className={id + '-circle'}
                          cx='0'
                          cy='0'
                          r={radius - donutThickness / 2}
                          fill='transparent'
                          strokeWidth={donutThickness}
                          stroke={datum.fill.bg}
                          opacity={0.2}
                        />

                        <Pie
                          className={id + '-Pie'}
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
                                <AnimatedArc
                                  animate={animate}
                                  size={size}
                                  {...pie}
                                />
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
      <Tooltip label='See metadata completeness documentation.'>
        <Link
          href='/docs/metadata-completeness-score'
          mt={2}
          textDecoration='underline'
          lineHeight='shorter'
          color='gray.800!important'
          fontSize='xs'
          textAlign='center'
          _hover={{ textDecoration: 'none' }}
        >
          Metadata Completeness{' '}
          <Icon
            as={FaInfo}
            boxSize={3.5}
            border='1px solid'
            borderRadius='full'
            p={0.5}
            color='gray.800!important'
          />
        </Link>
      </Tooltip>
    </Flex>
  );
};

type AnimatedStyles = { startAngle: number; endAngle: number; opacity: number };

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

type AnimatedPieProps<Datum> = ProvidedProps<Datum> & {
  animate?: boolean;
  delay?: number;
  size: 'xs' | 'sm' | 'md' | 'lg'; // Add the 'size' property to the type definition
};

const AnimatedArc = ({
  animate = true,
  arcs,
  path,
  size,
  ...rest
}: AnimatedPieProps<any>) => {
  const transitions = useTransition<PieArcDatum<any>, AnimatedStyles>(arcs, {
    from: animate ? fromLeaveTransition : enterUpdateTransition,
    enter: enterUpdateTransition,
    update: enterUpdateTransition,
    leave: animate ? fromLeaveTransition : enterUpdateTransition,
  });

  return transitions((props, arc, { key }) => {
    if (arc.index === 0) {
      // Using clipPathUnits='objectBoundingBox' to scale the clip path to the size of the object bounding box for mobile.
      // https://meyerweb.com/eric/thoughts/2017/02/24/scaling-svg-clipping-paths-for-css-use/
      return (
        <clipPath
          id={`${arc.data.id}-bg`}
          clipPathUnits='objectBoundingBox'
          transform={`scale(${1 / dimensions[size].width} ${
            1 / dimensions[size].height
          })`}
        >
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
            {...rest}
          />
        </clipPath>
      );
    }
    return <path key={key} fill='transparent' d={path(arc) || ''} {...rest} />;
  });
};
