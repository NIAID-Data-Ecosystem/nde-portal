import type {NextPage} from 'next';
import {PageContainer, PageContent} from 'src/components/page-container';
import {assetPrefix, basePath} from 'next.config';

const About: NextPage = () => {
  console.log('base:', basePath);
  console.log('asset:', assetPrefix);
  return (
    <>
      <PageContainer
        hasNavigation
        title='About'
        metaDescription='About page.'
        px={0}
        py={0}
      >
        <PageContent w='100%' flexDirection='column' minW='740px'>
          About page
        </PageContent>
      </PageContainer>
    </>
  );
};

export default About;