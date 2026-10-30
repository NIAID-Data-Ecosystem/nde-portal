import { Flex, Spinner, Text } from '@chakra-ui/react';
import Tooltip from 'src/components/tooltip';

import { CountsType } from '../types';

/**
 * Retrieves the tooltip label for the count type.
 * @param type - The count type to retrieve the label for.
 * @returns - The tooltip label for the specified count type.
 *
 */
export const getTooltipContentByCountType = (type: keyof CountsType) => {
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

/*
Width of each count column below `md`. Rows stack there (term on one line,
counts on the next), so the columns get a fixed width that the header labels in
`tree-headers.tsx` share, which keeps the two right-aligned rows in line. From
`md` up the v2 min/max widths apply instead.
*/
export const COUNT_COLUMN_WIDTH = { base: '88px', md: 'auto' };

export const OntologyBrowserCountTag = ({
  children,
  loading,
  tooltipLabel,
}: {
  children: React.ReactNode;
  loading?: boolean;
  tooltipLabel: React.ReactNode;
}) => {
  return (
    <Flex w={COUNT_COLUMN_WIDTH} minW={{ md: 120 }} maxW={{ md: 130 }}>
      <Tooltip content={tooltipLabel} contentProps={{ mx: 1 }}>
        {loading ? (
          <Spinner size='sm' color='primary.500' />
        ) : (
          <Text fontWeight='medium' lineHeight='shorter' fontSize='sm'>
            {children}
          </Text>
        )}
      </Tooltip>
    </Flex>
  );
};
