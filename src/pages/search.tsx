import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import { PageContainer, PageContent } from 'src/components/page-container';
import { Box, Collapse, Flex, Heading } from 'nde-design-system';
import { useHasMounted } from 'src/hooks/useHasMounted';
import SearchResultsPage, {
  defaultQuery,
} from 'src/components/search-results-page';
import {
  Filters,
  filtersConfig,
} from 'src/components/search-results-page/components/filters';
import {
  FilterTags,
  queryFilterObject2String,
  queryFilterString2Object,
  updateRoute,
} from 'src/components/filters';
import { useCallback, useMemo } from 'react';
import {
  SelectedFilterType,
  SelectedFilterTypeValue,
} from 'src/components/filters/types';
import { encodeString } from 'src/utils/querystring-helpers';
import { AdvancedSearchWithModal } from 'src/components/advanced-search';

//  This page renders the search results from the search bar.
const Search: NextPage = () => {
  const hasMounted = useHasMounted();
  const router = useRouter();

  // Default query parameters.
  const defaultParams = {
    q: defaultQuery.queryString,
    extra_filter: '', // extra filter updates aggregate fields
    facet_size: defaultQuery.facetSize,
    size: `${defaultQuery.selectedPerPage}`,
    from: `${(defaultQuery.selectedPage - 1) * defaultQuery.selectedPerPage}`,
    sort: defaultQuery.sortOrder,
  };
  const queryString = Array.isArray(router.query.q)
    ? router.query.q.map(s => s.trim()).join('+')
    : router.query.q || defaultParams.q;

  const queryParams = {
    ...defaultParams,
    ...router.query,
    q:
      router.query.advancedSearch === 'true'
        ? queryString
        : encodeString(queryString),
    extra_filter: Array.isArray(router.query.filters)
      ? router.query.filters.join('')
      : router.query.filters || '',
  };

  const selectedFilters: SelectedFilterType =
    queryFilterString2Object(queryParams.extra_filter) || [];

  // Currently applied filters
  const applied_filters = Object.entries(selectedFilters).filter(
    ([_, filters]) => filters.length > 0,
  );

  // Filter out date tags that have a single value such as "exists" and not "exists"
  const tags = applied_filters.filter(
    tag =>
      !(
        tag[0] === 'date' &&
        tag[1].length === 1 &&
        (Object.keys(tag[1][0]).includes('_exists_') ||
          Object.keys(tag[1][0]).includes('-_exists_'))
      ),
  );

  // Default filters list.
  const defaultFilters = useMemo(
    () => Object.keys(filtersConfig).reduce((r, k) => ({ ...r, [k]: [] }), {}),
    [],
  );

  ////////////////////////////////////////////////////
  ////////////////// Update Router ///////////////////
  ////////////////////////////////////////////////////

  // Reset the filters to the default.
  const removeAllFilters = () => {
    return handleRouteUpdate({
      from: defaultQuery.selectedPage,
      filters: defaultFilters,
    });
  };
  // Update the route to reflect changes on page without re-render.
  const handleRouteUpdate = useCallback(
    (update: {}) => updateRoute(update, router),
    [router],
  );

  if (!hasMounted || !router.isReady) {
    return null;
  }
  return (
    <PageContainer
      hasNavigation
      title='Search'
      metaDescription='NDE Discovery Portal - Search results list based on query.'
      px={0}
      py={0}
    >
      <Box w='100%'>
        <Flex w='100%'>
          <PageContent w='100%' flexDirection='column'>
            <Heading
              as='h1'
              size='sm'
              color='text.body'
              fontWeight='semibold'
              mb={4}
            >
              {queryString === '__all__'
                ? `Showing all results`
                : `Showing results for`}

              {queryString !== '__all__' && (
                <Heading as='span' ml={2} fontWeight='bold' size='sm' w='100%'>
                  {queryString.replaceAll('\\', '')}
                </Heading>
              )}
            </Heading>
            <Box maxWidth='200px' my={2}>
              <AdvancedSearchWithModal
                querystring={queryString}
                buttonProps={{ children: 'View query in Advanced Search' }}
              />
            </Box>

            {/* Tags with the names of the currently selected filters */}
            <Collapse in={tags.length > 0}>
              {/* <FilterTagsWrapper filters={selectedFilters}> */}
              <FilterTags
                tags={tags}
                removeAllFilters={removeAllFilters}
                removeSelectedFilter={(
                  name: keyof SelectedFilterType,
                  value: SelectedFilterTypeValue | SelectedFilterTypeValue[],
                ) => {
                  let updatedFilter = {
                    [name]: selectedFilters[name].filter(v => {
                      if (Array.isArray(value)) {
                        return !value.includes(v);
                      } else if (typeof value === 'object' || v === 'object') {
                        return JSON.stringify(v) !== JSON.stringify(value);
                      }
                      return v !== value;
                    }),
                  };
                  let filters = queryFilterObject2String({
                    ...selectedFilters,
                    ...updatedFilter,
                  });
                  handleRouteUpdate({
                    from: defaultQuery.selectedPage,
                    filters,
                  });
                }}
              />
              {/* </FilterTagsWrapper> */}
            </Collapse>
            <Flex w='100%'>
              {/* Filters sidebar */}
              <Filters
                colorScheme='secondary'
                queryParams={queryParams}
                selectedFilters={selectedFilters}
                removeAllFilters={
                  applied_filters.length > 0 ? removeAllFilters : undefined
                }
              ></Filters>
              {/* Result cards */}
              <SearchResultsPage />
            </Flex>
          </PageContent>
        </Flex>
      </Box>
    </PageContainer>
  );
};

export default Search;
