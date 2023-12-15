import { Box, Text } from 'nde-design-system';
import { LinearGradient } from '@visx/gradient';
import { Group } from '@visx/group';
import { Arc } from '@visx/shape';
import Pie from '@visx/shape/lib/shapes/Pie';
import { TooltipContent } from './TooltipContent';
import Tooltip from 'src/components/tooltip';
import { FormattedResource } from 'src/utils/api/types';

export const CompletenessBadgeCircle = ({
  stats,
}: {
  stats: FormattedResource['_meta'];
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

  const requireData = [
    {
      label: 'Required',
      score: required_score / required_max_score,
      // fill: "url('#required-pie-gradient')",
      fill: colors['required'].dark,
    },
    {
      score: (required_max_score - required_score) / required_max_score,
      fill: 'transparent',
    },
  ];

  const recommendedData = [
    {
      label: 'Recommended',
      score: recommended_score / recommended_max_score,
      fill: "url('#recommended-pie-gradient')",
    },
    {
      score:
        (recommended_max_score - recommended_score) / recommended_max_score,
      fill: 'transparent',
    },
  ];

  const dimensions = {
    width: 96,
    height: 96,
    margin: { top: 2, right: 2, bottom: 2, left: 2 },
  };

  const innerWidth =
    dimensions.width - dimensions.margin.left - dimensions.margin.right;
  const innerHeight =
    dimensions.height - dimensions.margin.top - dimensions.margin.bottom;

  const donutThickness = 8;
  const spacing = 6;
  const radius = {
    required: Math.min(innerWidth, innerHeight) / 2 - donutThickness - spacing,
    recommended: Math.min(innerWidth, innerHeight) / 2,
  };
  const centerY = innerHeight / 2;
  const centerX = innerWidth / 2;

  return (
    <Box position='relative'>
      <Tooltip
        label={
          <TooltipContent
            stats={{
              required: {
                label: 'Core fields',
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
            left={`${centerX + dimensions.margin.left / 2}px`}
            top={`${centerY + dimensions.margin.top / 2}px`}
            transform={`translate(-50%, -50%)`}
            fontWeight='semibold'
            fontSize='lg'
            lineHeight='none'
          >
            {total_score}
          </Text>
          <svg
            width={`${dimensions.width}px`}
            height={`${dimensions.height}px`}
          >
            <LinearGradient
              id='required-pie-gradient'
              to={colors.required.dark}
              from={colors.required.light}
              vertical={false}
            />
            <LinearGradient
              id='recommended-pie-gradient'
              from={colors.recommended.dark}
              to={colors.recommended.light}
              vertical={false}
            />

            <Group
              top={centerY + dimensions.margin.top}
              left={centerX + dimensions.margin.left}
            >
              {/* background circle for required pie */}
              <circle
                cx='0'
                cy='0'
                r={radius.required - donutThickness / 2}
                fill='transparent'
                strokeWidth={donutThickness}
                stroke={colors.required.bg}
                opacity={0.2}
              />
              {/* Required */}
              <Pie
                data={requireData}
                pieValue={d => d.score}
                pieSort={(a, b) => (b.label ? 1 : 0) - (a.label ? 1 : 0)}
                outerRadius={radius.required}
                innerRadius={radius.required - donutThickness}
                cornerRadius={d => (d.data.label ? 3 : 0)}
                fill={d => d.data.fill}
              >
                {pie => {
                  const arc = pie.arcs[0];

                  const startDeg = arc.startAngle * (180 / Math.PI);
                  const endDeg = arc.endAngle * (180 / Math.PI);

                  return (
                    <>
                      {/* use this to get a consistent conic gradient */}
                      <foreignObject
                        x={0 - dimensions.width / 2}
                        y={0 - dimensions.height / 2}
                        width={dimensions.width}
                        height={dimensions.height}
                        clip-path='url(#required-bg)'
                      >
                        <div
                          style={{
                            width: '100%',
                            height: '100%',
                            background: `conic-gradient(${colors.required.dark} ${startDeg}deg,  ${colors.required.light} ${endDeg}deg)`,
                          }}
                        />
                      </foreignObject>

                      <clipPath id='required-bg'>
                        <Arc
                          key='arc-required'
                          outerRadius={radius.required}
                          innerRadius={radius.required - donutThickness}
                          {...arc}
                          cornerRadius={3}
                        />
                      </clipPath>
                    </>
                  );
                }}
              </Pie>

              {/* Recommended */}
              <circle
                cx='0'
                cy='0'
                r={radius.recommended - donutThickness / 2}
                fill='transparent'
                strokeWidth={donutThickness}
                stroke={colors.recommended.bg}
                opacity={0.2}
              />
              <Pie
                data={recommendedData}
                pieValue={d => d.score}
                pieSort={(a, b) => (b.label ? 1 : 0) - (a.label ? 1 : 0)}
                outerRadius={radius.recommended}
                innerRadius={radius.recommended - donutThickness}
                cornerRadius={d => (d.data.label ? 3 : 0)}
                fill={d => d.data.fill}
              >
                {pie => {
                  const arc = pie.arcs[0];

                  const startDeg = arc.startAngle * (180 / Math.PI);
                  const endDeg = arc.endAngle * (180 / Math.PI);

                  return (
                    <>
                      {/* use this to get a consistent conic gradient */}
                      <foreignObject
                        x={0 - dimensions.width / 2}
                        y={0 - dimensions.height / 2}
                        width={dimensions.width}
                        height={dimensions.height}
                        clip-path='url(#recommended-bg)'
                      >
                        <div
                          style={{
                            width: '100%',
                            height: '100%',
                            background: `conic-gradient(${colors.recommended.dark} ${startDeg}deg,  ${colors.recommended.light} ${endDeg}deg)`,
                          }}
                        />
                      </foreignObject>

                      <clipPath id='recommended-bg'>
                        <Arc
                          key='arc-recommended'
                          outerRadius={radius.recommended}
                          innerRadius={radius.recommended - donutThickness}
                          {...arc}
                          cornerRadius={3}
                        />
                      </clipPath>
                    </>
                  );
                }}
              </Pie>
            </Group>
          </svg>
        </span>
      </Tooltip>
    </Box>
  );
};
