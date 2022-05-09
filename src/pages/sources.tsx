import type { NextPage } from 'next';
import { PageContainer, PageContent } from 'src/components/page-container';
import SourcesUI, { Main, Sidebar } from 'src/components/sources';

const Sources: NextPage = () => {
  return (
    <PageContainer
      hasNavigation
      title='Sources'
      metaDescription='Sources page displays content related to the NIAID data Ecosystem API data sources.'
      px={0}
      py={0}
    >
      <PageContent w='100%' flexDirection='column' minW='740px'>
        <SourcesUI />
        <Main />
        <Sidebar />
      </PageContent>
    </PageContainer>
  );
};

export default Sources;
