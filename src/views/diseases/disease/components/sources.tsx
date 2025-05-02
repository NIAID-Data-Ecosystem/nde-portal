import { Flex } from '@chakra-ui/react';
import { useQuery } from '@tanstack/react-query';
import { fetchMetadata } from 'src/hooks/api/helpers';
import { Metadata } from 'src/hooks/api/types';
import { fetchSearchResults } from 'src/utils/api';
import { FacetTerm } from 'src/utils/api/types';
import { getSearchResultsRoute } from 'src/views/diseases/helpers';
import { TopicQueryProps } from '../../types';
import { ChartWrapper } from '../layouts/chart-wrapper';
import { BarChart, SourceFacet } from '../visualizations/bar-chart';

export const Sources = ({
  id,
  query,
  topic,
}: TopicQueryProps & { id: string }) => {
  const params = {
    ...query,
    q: query.q,
    facet_size: query.facet_size,
    facets: 'includedInDataCatalog.name',
    size: 0,
  };

  const { data, isLoading, error } = useQuery<
    | {
        facets: (FacetTerm & { type: string })[] | undefined;
        sources: Metadata;
        total: number;
      }
    | undefined,
    Error,
    { terms: SourceFacet[]; total: number }
  >({
    queryKey: ['search-results', params],
    queryFn: async () => {
      const data = await fetchSearchResults({
        ...params,
        facets: '',
        multi_terms_fields: 'includedInDataCatalog.name,@type',
        multi_terms_size: '1000',
      });
      const facets = (data?.facets?.['multi_terms_agg']?.terms || []).map(
        (facet: FacetTerm) => {
          const [term, type] = facet.term.split('|');
          return {
            ...facet,
            term,
            type,
          };
        },
      );
      const sourcesMetadata = await fetchMetadata();
      return {
        facets,
        sources: sourcesMetadata,
        total: data?.total,
      };
    },
    select: data => {
      if (!data || !data.facets) {
        return {
          terms: [],
          total: data?.total || 0,
        };
      }

      // Merge duplicate terms i.e. in the case where a repository has multiple types
      const mergedFacetsMap = new Map<string, FacetTerm & { type: string }>();

      for (const facet of data.facets) {
        const existing = mergedFacetsMap.get(facet.term);

        if (!existing) {
          mergedFacetsMap.set(facet.term, { ...facet });
        } else {
          const combinedCount = existing.count + facet.count;
          const chosenType =
            facet.count > existing.count ? facet.type : existing.type;
          mergedFacetsMap.set(facet.term, {
            ...existing,
            count: combinedCount,
            type: chosenType,
          });
        }
      }

      const mergedFacets = Array.from(mergedFacetsMap.values());

      // Add details from source info
      const facetsWithSourceInfo = mergedFacets.map(facet => {
        const matchingSourceEntry = Object.values(data.sources.src).find(
          src => src.sourceInfo?.identifier === facet.term,
        );

        if (!matchingSourceEntry) {
          return { ...facet, info: null };
        }

        return {
          ...facet,
          info: {
            abstract: matchingSourceEntry?.sourceInfo?.abstract || '',
            genre: matchingSourceEntry?.sourceInfo?.genre,
            identifier: matchingSourceEntry?.sourceInfo?.identifier || '',
            name: matchingSourceEntry?.sourceInfo?.name || '',
            description: matchingSourceEntry?.sourceInfo?.description || '',
          },
        };
      });

      return {
        terms: facetsWithSourceInfo,
        total: data?.total || 0,
      };
    },

    enabled: !!query.q,
  });

  return (
    <Flex flexWrap='wrap' width='100%'>
      <Flex flex={3} flexDirection='column' minWidth={200}>
        <ChartWrapper
          title='Data Sources'
          description={
            <>
              The NIAID Data Ecosystem Discovery Portal harvests metadata from a
              number of different data sources. This chart highlights the
              origins of results related to {topic}, tracing their provenance
              across different repositories.
            </>
          }
          error={error}
          isLoading={isLoading}
          skeletonProps={{
            minHeight: '200px',
            width: '100%',
          }}
        >
          {/* Bar Chart */}
          {data && (
            <BarChart
              id={id}
              data={data}
              title={'Data Sources'}
              description={'Data Sources'}
              isLoading={isLoading}
              defaultDimensions={{
                width: 300,
                height: 200,
                margin: { top: 0, right: 0, bottom: 20, left: 0 },
              }}
              getRoute={(term: string) => {
                return getSearchResultsRoute({
                  query: params,
                  facet: params.facets,
                  term: term as string,
                });
              }}
            />
          )}
        </ChartWrapper>
      </Flex>
    </Flex>
  );
};
