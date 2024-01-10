import React from 'react';
import { Flex, Heading } from 'nde-design-system';
import { MetadataTooltip } from 'src/components/metadata';

interface HeadingWithTooltip {
  label: string;
  tooltipLabel?: string;
}

export const HeadingWithTooltip: React.FC<HeadingWithTooltip> = ({
  label,
  tooltipLabel,
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
      {tooltipLabel && <MetadataTooltip tooltipLabel={tooltipLabel} />}
    </Flex>
  );
};
