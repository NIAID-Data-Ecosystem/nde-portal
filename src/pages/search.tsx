import type {NextPage} from 'next';
import Head from 'next/head';
import {useRouter} from 'next/router';
import {useQuery} from 'react-query';
import Empty from 'src/components/empty';
import PageContainer from 'src/components/page-container';
import {SearchResultCard, List} from 'src/components/search-results';
import {getSearchResults} from 'src/utils/api';
import {SearchResultsData} from 'src/utils/api/types';

const Search: NextPage = () => {
  // Get search term from url params
  const router = useRouter();

  const querystring = Object.entries(router.query).reduce(
    (r, [prop, value]) => {
      return (r += `&${prop}=${value}`);
    },
    '',
  );

  const {isLoading, error, data} = useQuery<SearchResultsData, Error>(
    ['search-results', {searchTerm: querystring}],
    () => getSearchResults(querystring),
  );

  return (
    <PageContainer
      hasNavigation
      title='Search results'
      metaDescription='Search results page.'
    >
      {/* filters */}
      {data?.hits.length === 0 ? (
        <Empty message='Search yielded no results.' />
      ) : (
        <List isLoading={isLoading} error={error}>
          <ul>
            {data?.hits.map(result => {
              // Card
              return (
                <SearchResultCard
                  key={result._id}
                  id={result._id}
                  title={result.name}
                  authorDetails={result.creator}
                  description={result.description}
                  accessType={'unrestricted'}
                  keywords={result.keywords || []}
                  sourceDetails={{
                    id: result._id,
                    imageUrl: result.image,
                    name: result.curatedBy.name,
                    url: result.url,
                  }}
                />
              );
            })}
          </ul>
        </List>
      )}
    </PageContainer>
  );
};

export default Search;
