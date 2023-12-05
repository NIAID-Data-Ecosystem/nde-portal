import React from 'react';
import {
  Flex,
  Heading,
  Icon,
  IconButton,
  IconButtonProps,
  TooltipProps,
} from 'nde-design-system';
import Tooltip from 'src/components/tooltip';
import { FaInfo } from 'react-icons/fa';

interface HeadingWithTooltip {
  'aria-label': string;
  label: string;
  tooltipLabel?: string;
  iconButtonProps?: IconButtonProps;
  tooltipProps?: TooltipProps;
}

export const HeadingWithTooltip: React.FC<HeadingWithTooltip> = ({
  ['aria-label']: ariaLabel,
  label,
  tooltipLabel,
  tooltipProps,
  iconButtonProps,
}) => {
  return (
    <Flex w='100%' pb={1} alignItems='baseline'>
      <Heading
        as='h3'
        fontSize='xs'
        color='gray.800'
        fontWeight='medium'
        mb={1}
      >
        {label}
      </Heading>
      {tooltipLabel && (
        <Tooltip
          label={tooltipLabel}
          hasArrow
          placement='bottom'
          closeDelay={300}
          {...tooltipProps}
        >
          <IconButton
            isRound
            icon={<Icon as={FaInfo} boxSize='0.75rem' p={0.5} />}
            variant='outline'
            colorScheme='gray'
            borderColor='gray.600'
            mx={2}
            aria-label={ariaLabel}
            {...iconButtonProps}
          />
        </Tooltip>
      )}
    </Flex>
  );
};
