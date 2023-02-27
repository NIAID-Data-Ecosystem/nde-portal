import type { NextPage } from 'next';
import { PageContainer, PageContent } from 'src/components/page-container';
import { Box } from 'nde-design-system';
import { AdvancedSearch } from 'src/components/advanced-search';

const AdvancedSearchPage: NextPage = () => {
  return (
    <PageContainer
      hasNavigation
      title='Advanced Search'
      metaDescription='Advanced Search page.'
      px={0}
      py={0}
      disableSearchBar
    >
      <PageContent
        w='100%'
        flexDirection='column'
        alignItems='center'
        bg='#fff'
      >
        <Box w='100%' maxW='1000px' mb={32}>
          <AdvancedSearch />
        </Box>
      </PageContent>
    </PageContainer>
  );
};

export default AdvancedSearchPage;
