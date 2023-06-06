import { Box, Heading, HeadingProps, Spinner } from 'nde-design-system';
import React from 'react';
import { formatNumber } from 'src/utils/helpers';

// [COMPONENT INFO]: Displays total results count

interface ResultsCount extends HeadingProps {
  // Total number of results
  total: number;
  // Data loading mechanism
  isLoading: boolean;
}

const ResultsCount: React.FC<ResultsCount> = ({
  isLoading,
  total,
  ...props
}) => {
  return (
    <Box w={['100%', 'unset']}>
      <Heading
        as='h2'
        size='h6'
        display='flex'
        alignItems='baseline'
        fontWeight='semibold'
        mr={2}
        {...props}
      >
        <span
          style={{
            display: 'flex',
            alignItems: 'baseline',
            fontSize: '1.5rem',
          }}
        >
          {isLoading ? (
            <Spinner
              thickness='1px'
              speed='0.5s'
              emptyColor='gray.200'
              color='primary.500'
              size='md'
            />
          ) : (
            formatNumber(total)
          )}{' '}
          <span style={{ fontSize: '1rem', marginLeft: '0.5rem' }}>
            Result{total !== 1 ? 's' : ''}
          </span>
        </span>
      </Heading>
    </Box>
  );
};

export default ResultsCount;
