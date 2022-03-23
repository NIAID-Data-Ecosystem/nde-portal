import {useState} from 'react';
import type {NextPage} from 'next';
import {Flex, SearchInput} from 'nde-design-system';
import {PageContainer, PageContent} from 'src/components/page-container';
import {useRouter} from 'next/router';

const Home: NextPage = () => {
  const router = useRouter();

  // Search term entered in search bar
  const [searchTerm, setSearchTerm] = useState('');
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void =>
    setSearchTerm(e.target.value);
  return (
    <>
      <PageContainer
        hasNavigation
        title='Search'
        metaDescription='Discovery Portal home page.'
      >
        <PageContent>
          <Flex w='100%' justifyContent='center'>
            <SearchInput
              w='100%'
              maxW='600px'
              isResponsive={false}
              colorScheme='primary'
              ariaLabel='Search for datasets or tools'
              value={searchTerm}
              handleChange={handleChange}
              handleSubmit={e => {
                e.preventDefault();
                searchTerm && router.push(`/search?q=${searchTerm}`);
              }}
            />
          </Flex>
        </PageContent>
      </PageContainer>
    </>
  );
};

export default Home;
