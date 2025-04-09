import { Box } from '@chakra-ui/react';
import { FacetTerm } from 'src/utils/api/types';
import { UrlObject } from 'url';
import { FacetProps } from '../types';
import { SectionTitle } from '../layouts/section';

interface TreemapChartProps {
  data: FacetTerm[];
  facet: FacetProps;
  getSearchRoute: (term: string) => UrlObject;
}

export const TreemapChart = ({
  facet,
  data,
  getSearchRoute,
}: TreemapChartProps) => {
  return (
    <Box flex={1} width='400px' minWidth='400px' maxWidth='480px'>
      <SectionTitle as='h5'>{facet.label}</SectionTitle>
      {/* Add Chart */}
    </Box>
  );
};
