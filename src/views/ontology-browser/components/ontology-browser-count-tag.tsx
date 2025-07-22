import { Flex, Spinner, TagProps, Text } from '@chakra-ui/react';
import Tooltip from 'src/components/tooltip';
import { OntologyLineageItemWithCounts } from '../types';

/**
 * Retrieves the tooltip label for the count type.
 * @param type - The count type to retrieve the label for.
 * @returns - The tooltip label for the specified count type.
 *
 */
export const getTooltipLabelByCountType = (
  type: keyof OntologyLineageItemWithCounts['counts'],
) => {
  if (type === 'termCount') {
    return (
      <>
        Number of datasets{' '}
        <Text as='span' textDecoration='underline'>
          for this term
        </Text>{' '}
        in the NIAID Discovery Portal
      </>
    );
  } else if (type === 'termAndChildrenCount') {
    return (
      <>
        Number of datasets{' '}
        <Text as='span' textDecoration='underline'>
          for this term and sub-terms
        </Text>{' '}
        in the NIAID Discovery Portal
      </>
    );
  }
};

export const OntologyBrowserCountTag = ({
  children,
  isLoading,
  tooltipLabel,
}: {
  children: React.ReactNode;
  isLoading?: boolean;
  tooltipLabel: React.ReactNode;
}) => {
  return (
    <Flex minW={120} maxW={130}>
      <Tooltip label={tooltipLabel} mx={1}>
        <Text fontWeight='medium' lineHeight='shorter' fontSize='sm'>
          {isLoading ? <Spinner size='sm' color='primary.500' /> : children}
        </Text>
      </Tooltip>
    </Flex>
  );
};
