import {useState} from 'react';
import type {NextPage} from 'next';
import Head from 'next/head';
import {Box, Flex, SearchInput} from 'nde-design-system';
import PageContainer from 'src/components/page-container';
import {useRouter} from 'next/router';
import {useLocalStorage} from 'usehooks-ts';

const Home: NextPage = () => {
  const router = useRouter();
  const [localStorageSearchTerm, setLocalStorageSearchTerm] = useLocalStorage(
    'nde-search-query',
    '',
  );
  // Search term entered in search bar
  const [searchTerm, setSearchTerm] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void =>
    setSearchTerm(e.target.value);
  return (
    <>
      <Head>
        <title>NDE Portal</title>
      </Head>
      <PageContainer
        hasNavigation
        metaDescription='Discovery Portal home page.'
      >
        <Flex w='100%'>
          <SearchInput
            w='100%'
            colorScheme={'primary'}
            ariaLabel='Search for datasets or tools'
            value={searchTerm}
            handleChange={handleChange}
            handleSubmit={e => {
              e.preventDefault();
              // setLocalStorageSearchTerm(JSON.stringify({q: searchTerm}));
              searchTerm && router.push(`/search?q=${searchTerm}`);
            }}
          />
        </Flex>
      </PageContainer>
    </>
  );
};

export default Home;
