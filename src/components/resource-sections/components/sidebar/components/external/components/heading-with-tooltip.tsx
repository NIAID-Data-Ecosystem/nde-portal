import React from 'react';
import { Flex, Heading, HeadingProps } from '@chakra-ui/react';
import { MetadataTooltip } from 'src/components/metadata';

interface HeadingWithTooltip extends HeadingProps {
  label: string;
  tooltipLabel?: string;
}

export const HeadingWithTooltip: React.FC<HeadingWithTooltip> = ({
  label,
  tooltipLabel,
  ...headingProps
}) => {
  return (
    <Flex alignItems='baseline' textAlign='center'>
      <Heading
        as='h3'
        fontSize='xs'
        color='gray.800'
        mb={1}
        fontWeight='medium'
        {...headingProps}
      >
        {label}
      </Heading>
      {tooltipLabel && <MetadataTooltip tooltipLabel={tooltipLabel} />}
    </Flex>
  );
};
