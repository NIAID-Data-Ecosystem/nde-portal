import type {NextPage} from 'next';
import Head from 'next/head';
import {useRouter} from 'next/router';
import {useQuery} from 'react-query';
import PageContainer from 'src/components/page-container';
import {SearchResultCard, List} from 'src/components/search-results';
import {getSearchResults} from 'src/utils/api';
import {SearchResultsData} from 'src/utils/api/types';

const Search: NextPage = () => {
  // Get search term from url params
  const router = useRouter();
  const {q: searchTerm} = router.query;

  // Access query client
  const {isLoading, error, data} = useQuery<SearchResultsData, Error>(
    ['search-results', {searchTerm}],
    () => getSearchResults(searchTerm),
  );
  return (
    <div>
      <Head>
        <title>NDE Portal| Search results</title>
        <meta name='description' content='Search results page.' />
        <link rel='icon' href='/favicon.ico' />
      </Head>

      <PageContainer hasNavigation>
        {/* filters */}
        <List isLoading={isLoading} error={error}>
          <ul>
            {data?.hits.map(result => {
              console.log(result);
              // Card
              return (
                <SearchResultCard
                  key={result._id}
                  title={result.name}
                  url={result.url}
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
              return <li key={result['@id']}> - {result.name}</li>;
            })}
          </ul>
        </List>
      </PageContainer>
    </div>
  );
};

export default Search;
