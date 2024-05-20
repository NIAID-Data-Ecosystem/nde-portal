import type { NextPage } from 'next';
import { PageContainer, PageContent } from 'src/components/page-container';
import { MDXProvider } from '@mdx-js/react';
import AboutContent from 'content/about.mdx';
import { Box, Heading, VisuallyHidden } from '@chakra-ui/react';
import { useMDXComponents } from 'mdx-components';

const About: NextPage = () => {
  const MDXComponents = useMDXComponents({});
  return (
    <PageContainer title='About' metaDescription='About page.' px={0} py={0}>
      <PageContent
        w='100%'
        flexDirection='column'
        alignItems='center'
        bg='#fff'
      >
        <Box w='100%' maxW='1000px' mt={8} mb={32}>
          <Heading as='h1' fontSize='4xl'>
            About
          </Heading>
          <MDXProvider components={MDXComponents}>
            <AboutContent />
          </MDXProvider>
        </Box>
      </PageContent>
    </PageContainer>
  );
};

export default About;
