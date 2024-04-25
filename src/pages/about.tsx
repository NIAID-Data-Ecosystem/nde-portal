import type { NextPage } from 'next';
import { PageContainer, PageContent } from 'src/components/page-container';
import { MDXProvider } from '@mdx-js/react';
import AboutContent from 'content/about.mdx';
import { Box, VisuallyHidden } from '@chakra-ui/react';
import { useMDXComponents } from 'mdx-components';

const About: NextPage = () => {
  const MDXComponents = useMDXComponents({});
  return (
    <PageContainer
      title='About'
      metaDescription='About page.'
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
          <VisuallyHidden as='h1'>About</VisuallyHidden>
          <MDXProvider components={MDXComponents}>
            <AboutContent />
          </MDXProvider>
        </Box>
      </PageContent>
    </PageContainer>
  );
};

export default About;
