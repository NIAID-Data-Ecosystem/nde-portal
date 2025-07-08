import type { NextPage } from 'next';
import { PageContainer, PageContent } from 'src/components/page-container';
import { Box, Heading } from '@chakra-ui/react';
import { AdvancedSearch } from 'src/components/advanced-search';

const AdvancedSearchPage: NextPage = () => {
  return (
    <PageContainer
      meta={{
        title: 'Advanced Search',
        description: 'Advanced Search page.',
        url: `${process.env.NEXT_PUBLIC_BASE_URL}/advanced-search`,
      }}
      px={0}
      py={0}
    >
      <PageContent
        w='100%'
        flexDirection='column'
        alignItems='center'
        bg='#fff'
        px={{ base: 1, sm: 6, lg: 10, xl: '5%' }}
      >
        <Box w='100%' maxW='1000px' mb={32}>
          <Heading as='h1' fontSize='4xl' textAlign='left'>
            Advanced Search
          </Heading>
          <AdvancedSearch />
        </Box>
      </PageContent>
    </PageContainer>
  );
};

export default AdvancedSearchPage;
