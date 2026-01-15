import type { NextPage } from 'next';
import SummaryGrid from 'src/views/search/components/summary';
import { useSearchQueryFromURL } from 'src/views/search/hooks/useSearchQueryFromURL';
import { ChartType } from 'src/views/search/components/summary/types';

// initial testing with strings, definedTerm, number, date.
const VIZ_CONFIG = [
  {
    id: 'sources',
    label: 'Sources',
    property: 'includedInDataCatalog.name',
    chart: {
      availableOptions: ['bar', 'pie'] as ChartType[],
      defaultOption: 'bar' as const,
    },
  },
];

// Area to work on the visual summary components for the search page
const VisualSummaryPage: NextPage = () => {
  const queryParams = useSearchQueryFromURL();
  return (
    <SummaryGrid
      searchParams={queryParams}
      onFilterUpdate={() => {}}
      activeVizIds={['sources']}
      configs={VIZ_CONFIG}
    />
  );
};

export default VisualSummaryPage;
