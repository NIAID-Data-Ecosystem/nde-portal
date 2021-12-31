import type {NextPage} from 'next';
import Head from 'next/head';
import PageContainer from 'src/components/page-container';
import SearchBar from 'src/components/search-bar';
import {Flex} from '@chakra-ui/react';
import {useEffect, useState} from 'react';

const Home: NextPage = () => {
  // Search term entered in search bar
  const [searchTerm, setSearchTerm] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void =>
    setSearchTerm(e.target.value);

  return (
    <div>
      <Head>
        <title>NDE Portal</title>
        <meta name='description' content='Discovery Portal home page.' />
        <link rel='icon' href='/favicon.ico' />
      </Head>

      <PageContainer hasNavigation>
        <Flex
          w={'100%'}
          justifyContent='center'
          alignItems={'center'}
          px={[0, 0, 8]}
        >
          <SearchBar
            value={searchTerm}
            onChange={handleChange}
            href={`/search?q=${searchTerm}`}
          />
        </Flex>
        {/* <Box
          w={'100%'}
          backgroundImage={'url(/assets/bg-option.png)'}
          backgroundSize={'cover'}
        >
          <h1>Main</h1>
        </Box> */}
        {/* <Image src={'/assets/bg-option.png'} w='100%' h='100%' /> */}
      </PageContainer>
    </div>
  );
};

export default Home;
