import React, { useEffect, useState } from 'react';
import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import {
  PageContainer,
  PageContent,
  PageHeader,
  SearchQueryLink,
} from 'src/components/page-container';
import { assetPrefix } from 'next.config';
import { Box, Flex, SearchInput, Text } from 'nde-design-system';
import {
  SummaryTable,
  Filters,
  displayQueryString,
  useFilterString,
  useQueryString,
  DylanVis,
  CirclePacking,
  MeasurementPathogenViz,
  ZoomNetwork,
  NetworkGraph,
  Network,
} from 'src/components/summary-page';
import { useHasMounted } from 'src/hooks/useHasMounted';
import { queryFilterObject2String } from 'src/components/filter';
import { FilterTags } from 'src/components/search-results-page/components/filters/components/tags';
import { useQuery } from 'react-query';
import { FacetTerm, FetchSearchResultsResponse } from 'src/utils/api/types';
import { fetchSearchResults } from 'src/utils/api';
import { CandiceNetwork } from 'src/components/summary-page/components/vis/components/candice-vis';

/*
 [COMPONENT INFO]:
 Summary Page displays data using visualizations so that the user can gather some insights.

 All vis share the same query string and filtering mechanism so that they update together. The table also updates accordingly.
*/
export interface SummaryQueryResponse {
  total: number;
  facets: { [key: string]: FacetTerm[] };
}
const WIP: NextPage = () => {
  return (
    <>
      <PageContainer
        hasNavigation
        title='Visual Summary'
        metaDescription='Visual summary of queries.'
        disableSearchBar
      >
        <Box w='100%' p={6} bg='tertiary.900'>
          <CandiceNetwork />
        </Box>
      </PageContainer>
    </>
  );
};

export default WIP;
