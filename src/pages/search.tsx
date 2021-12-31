import type {NextPage} from 'next';
import Head from 'next/head';
import PageContainer from 'src/components/page-container';
import SearchBar from 'src/components/search-bar';
import {Flex} from '@chakra-ui/react';
import {useEffect, useState} from 'react';
import {useRouter} from 'next/router';
import {useQuery} from 'react-query';
import {getSearchResults} from 'src/utils/api';
import {SearchResultsData} from 'src/utils/api/types';

import {List} from 'src/components/search-results';

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
              // Card
              return <li key={result['@id']}> - {result.name}</li>;
            })}
          </ul>
        </List>
      </PageContainer>
    </div>
  );
};

export default Search;
