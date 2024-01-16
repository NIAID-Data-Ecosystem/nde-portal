import { FormattedResource } from 'src/utils/api/types';
import { Box, Flex, Text } from '@chakra-ui/react';
import { TooltipContent } from './TooltipContent';
import Tooltip from 'src/components/tooltip';

export const CompletenessBadgeBar = ({
  stats,
}: {
  stats: FormattedResource['_meta'];
}) => {
  if (stats === undefined) return <></>;
  const {
    required_max_score,
    required_score,
    recommended_max_score,
    recommended_score,
    total_max_score,
    total_score,
  } = stats.completeness;

  const dimensions = {
    width: 165,
    height: 16,
    margin: { top: 0, right: 0, bottom: 0, left: 0 },
  };

  const spacing = 3;
  const bar = {
    width: dimensions.width / total_max_score - spacing,
    height: dimensions.height,
  };

  const colors = {
    required: 'accent.bg',
    recommended: 'secondary.500',
    default: 'gray.300',
  };

  const rects = Array(total_max_score)
    .fill(0)
    .map((_, idx) => {
      const isRequired = idx < required_score;
      const isRecommended =
        !isRequired && idx < recommended_score + required_score;

      const fill = isRequired
        ? colors['required']
        : isRecommended
        ? colors['recommended']
        : 'gray.300';

      return {
        key: idx,
        x: `${idx * (bar.width + spacing)}px`,
        y: 0,
        rx: '1px',
        ry: '1px',
        width: `${bar.width}px`,
        height: `${bar.height}px`,
        fill,
      };
    });
  return (
    <Tooltip
      label={
        <TooltipContent
          stats={{
            required: {
              label: 'Fundamental fields',
              max_score: required_max_score,
              score: required_score,
              fill: colors['required'],
              augmented: stats.required_augmented_fields,
            },
            recommended: {
              label: 'Recommended fields',
              max_score: recommended_max_score,
              score: recommended_score,
              fill: colors['recommended'],
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
      <Box position='relative'>
        <Flex as='span' alignItems='center'>
          <Box
            as='svg'
            width={`${dimensions.width}px`}
            height={`${dimensions.height}px`}
          >
            {rects.map(({ key, ...props }) => {
              return <Box as='rect' key={key} {...props}></Box>;
            })}
          </Box>
          <Text
            fontSize='12px'
            lineHeight='short'
            color='gray.800'
            fontWeight='semibold'
            ml={2}
          >
            {Math.round((total_score / total_max_score) * 100)}%
          </Text>
        </Flex>
      </Box>
    </Tooltip>
  );
};
