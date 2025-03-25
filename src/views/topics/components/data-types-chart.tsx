import React from 'react';
import { Box, Text } from '@chakra-ui/react';
import { SectionTitle } from '../layouts/section';
import { Link } from 'src/components/link';
import { TopicPageProps } from '../types';

interface DataTypesChartProps {
  query: TopicPageProps['attributes']['query'];
  topic: string;
}

export const DataTypesChart = ({ query, topic }: DataTypesChartProps) => {
  return (
    <Box>
      <SectionTitle as='h4'>Data Types</SectionTitle>
      <Text>
        An overview of resource types retrieved from a search on{' '}
        <Link href={`/search?q=${query.q}`}>{topic}</Link>.
      </Text>
      <Text
        fontSize='sm'
        fontStyle='italic'
        color='text.body'
        lineHeight='short'
        opacity={0.8}
      >
        This chart uses a logarithmic scale to balance large differences in
        values, making smaller categories more visible while preserving
        proportions. Original counts are shown in tooltips.
      </Text>
      {/* Pie Chart */}
    </Box>
  );
};
