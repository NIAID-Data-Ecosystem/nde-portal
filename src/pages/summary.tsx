import React from 'react';
import type {NextPage} from 'next';
import {PageContainer, PageContent} from 'src/components/page-container';
import {useQueries} from 'react-query';
import {fetchSearchResults} from 'src/utils/api';
import {Box, Flex, Heading, Skeleton} from 'nde-design-system';
import {Error, ErrorCTA} from 'src/components/error';
import {queryFilterObject2String} from 'src/components/search-results-page/components/filters/helpers';

const sample_queries = [
  {
    title: 'Funding Group 1',
    'funding.identifier': [
      'U01AI124255',
      'AI124255',
      'U01AI124275',
      'AI124275',
      'U01AI124290',
      'AI124290',
      'U01AI124302',
      'AI124302',
      'U01AI124316',
      'AI124316',
      'U19AI135972',
      'AI135972',
      'U19AI135976',
      'AI135976',
      'U19AI135990',
      'AI135990',
      'U19AI135995',
      'AI135995',
      'U19Al135964',
      'Al135964',
    ],
  },
  {
    title: 'Funding Group 2',
    'funding.identifier': [
      'U01AI124255',
      'AI124255',
      'U01AI124275',
      'AI124275',
      'U01AI124290',
      'AI124290',
      'U01AI124302',
      'AI124302',
      'U01AI124316',
      'AI124316',
      'U19AI135972',
      'AI135972',
      'U19AI135976',
      'AI135976',
      'U19AI135990',
      'AI135990',
      'U19AI135995',
      'AI135995',
      'U19Al135964',
      'Al135964',
    ],
  },
];

const SummaryPage: NextPage = () => {
  const results = useQueries(
    sample_queries.map(query => {
      let querystring =
        query['funding.identifier'] &&
        queryFilterObject2String({
          'funding.identifier': query['funding.identifier'],
        });

      return {
        queryKey: ['funding', querystring],
        queryFn: () => querystring && fetchSearchResults({q: querystring}),
      };
    }),
  );

  return (
    <>
      <PageContainer
        hasNavigation
        title='Resource'
        metaDescription='Selected search result page.'
      >
        <PageContent>
          <Box w='100%'>
            <Heading as='h1' mb={4}>
              Summary Page
            </Heading>
            {results.map((result, i) => {
              const {isLoading, data, error} = result;

              return (
                <Flex key={i} p={4}>
                  {error ? (
                    // [ERROR STATE]: API response error
                    <Error message="It's possible that the server is experiencing some issues.">
                      <ErrorCTA />
                    </Error>
                  ) : !isLoading && !data ? (
                    // [EMPTY STATE]: No Results
                    <div>No results</div>
                  ) : (
                    <Box w='100%' bg='white' p={4}>
                      <Heading size='h6'>{sample_queries[i].title}</Heading>
                      <Skeleton isLoaded={!isLoading} p={4} w='100%'>
                        <Flex>Summary Page</Flex>
                      </Skeleton>
                    </Box>
                  )}
                </Flex>
              );
            })}
          </Box>
        </PageContent>
      </PageContainer>
    </>
  );
};

export default SummaryPage;
