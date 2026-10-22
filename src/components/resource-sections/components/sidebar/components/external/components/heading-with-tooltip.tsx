import { Flex } from '@chakra-ui/react';
import React from 'react';
import type { InfoLabelProps } from 'src/components/info-label';
import { InfoLabel } from 'src/components/info-label';

interface HeadingWithTooltip extends Omit<InfoLabelProps, 'children'> {
  label: string;
  tooltipLabel?: string;
}

export const HeadingWithTooltip: React.FC<HeadingWithTooltip> = ({
  label,
  tooltipLabel,
  ...props
}) => {
  return (
    <Flex alignItems='baseline' textAlign='center'>
      <InfoLabel tooltipProps={{ content: tooltipLabel ?? '' }} {...props}>
        {label}
      </InfoLabel>
    </Flex>
  );
};
