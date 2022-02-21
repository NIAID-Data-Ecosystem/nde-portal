import {useState} from 'react';
import type {NextPage} from 'next';
import Head from 'next/head';
import {Flex, SearchBar} from 'nde-design-system';
import PageContainer from 'src/components/page-container';
import {useRouter} from 'next/router';

const Home: NextPage = () => {
  const router = useRouter();
  // Search term entered in search bar
  const [searchTerm, setSearchTerm] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void =>
    setSearchTerm(e.target.value);

  return (
    <div>
      <Head>
        <title>NDE Portal</title>
      </Head>

      <PageContainer
        hasNavigation
        metaDescription='Discovery Portal home page.'
      >
        <Flex
          w={'100%'}
          justifyContent='center'
          alignItems={'center'}
          px={[0, 0, 8]}
        >
          <SearchBar
            value={searchTerm}
            handleChange={handleChange}
            handleClick={e => {
              e.preventDefault();
              searchTerm && router.push(`/search?q=${searchTerm}`);
            }}
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
