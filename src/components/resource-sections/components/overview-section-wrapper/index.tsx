import { BoxProps, Flex, Skeleton, SkeletonProps } from '@chakra-ui/react';
import React from 'react';
import { MetadataLabel } from 'src/components/metadata/components/block';
import { ScrollContainer } from 'src/components/scroll-container';

interface OverviewSectionWrapper extends SkeletonProps {
  loading: boolean;
  label: string;
  children: React.ReactNode;
  tooltipLabel?: React.ReactNode;
  scrollContainerProps?: BoxProps;
  hasScroll?: boolean;
}

export const OverviewSectionWrapper = ({
  children,
  loading,
  label,
  tooltipLabel,
  hasScroll = true,
  scrollContainerProps,
  ...props
}: OverviewSectionWrapper) => {
  return (
    <Skeleton loading={!!loading} width='100%' {...props}>
      <Flex alignItems='baseline' lineHeight='moderate' minH='22px'>
        {label && (
          <MetadataLabel
            label={label}
            tooltipProps={{
              content: tooltipLabel,
            }}
          />
        )}
      </Flex>
      <ScrollContainer
        overflow={hasScroll ? 'auto' : 'visible'}
        maxHeight={hasScroll ? '200px' : 'unset'}
        border={hasScroll ? '1px solid' : 'none'}
        borderColor='gray.100'
        borderRadius='semi'
        fontSize='sm'
        py={2}
        {...scrollContainerProps}
      >
        {children}
      </ScrollContainer>
    </Skeleton>
  );
};
