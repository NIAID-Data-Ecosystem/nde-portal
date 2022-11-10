import type { NextPage } from 'next';
import { PageContainer, PageContent } from 'src/components/page-container';
import { MDXProvider } from '@mdx-js/react';
import { MDXComponents } from 'src/mdx';
import AboutContent from 'content/about.mdx';
import { Box, Heading } from 'nde-design-system';

const About: NextPage = () => {
  return (
    <PageContainer
      hasNavigation
      title='About'
      metaDescription='About page.'
      px={0}
      bg='white'
      py={0}
    >
      <PageContent
        w='100%'
        flexDirection='column'
        alignItems='center'
        bg='white'
      >
        <Box maxW='1200px' mb={32}>
          <MDXProvider components={MDXComponents}>
            <AboutContent />
          </MDXProvider>
        </Box>
      </PageContent>
    </PageContainer>
  );
};

export default About;
