import { Spinner, Tag, TagProps, Text } from '@chakra-ui/react';
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
  colorScheme,
  isLoading,
  label,
}: {
  children: React.ReactNode;
  colorScheme: TagProps['colorScheme'];
  isLoading?: boolean;
  label: React.ReactNode;
}) => {
  return (
    <Tooltip label={label}>
      <Tag
        borderRadius='full'
        variant='subtle'
        size='sm'
        colorScheme={colorScheme}
        cursor='default'
      >
        {isLoading ? <Spinner size='sm' color='primary.500' /> : children}
      </Tag>
    </Tooltip>
  );
};
