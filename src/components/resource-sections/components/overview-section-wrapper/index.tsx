import React from 'react';
import { BoxProps, Flex, Skeleton, SkeletonProps } from '@chakra-ui/react';
import { MetadataLabel, MetadataTooltip } from 'src/components/metadata';
import { ScrollContainer } from 'src/components/scroll-container';

interface OverviewSectionWrapper extends SkeletonProps {
  isLoading: boolean;
  label: string;
  children: React.ReactNode;
  tooltipLabel?: React.ReactNode;
  scrollContainerProps?: BoxProps;
}

export const OverviewSectionWrapper = ({
  children,
  isLoading,
  label,
  tooltipLabel,
  scrollContainerProps,
  ...props
}: OverviewSectionWrapper) => {
  return (
    <Skeleton isLoaded={!isLoading} width='100%' {...props}>
      <Flex alignItems='baseline' lineHeight='short' mb={1} minH={'22px'}>
        <MetadataLabel label={label} />
        {tooltipLabel && <MetadataTooltip tooltipLabel={tooltipLabel} />}
      </Flex>
      <ScrollContainer
        overflow='auto'
        maxHeight='200px'
        border='1px solid'
        borderColor='gray.100'
        borderRadius='semi'
        fontSize='xs'
        mx={0.5}
        py={2}
        px={0.5}
        {...scrollContainerProps}
      >
        {children}
      </ScrollContainer>
    </Skeleton>
  );
};
