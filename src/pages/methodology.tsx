import { Box, Flex, Heading, Text } from 'nde-design-system';
import type { NextPage } from 'next';
import { PageContainer, PageContent } from 'src/components/page-container';
import { useMDXComponents } from 'mdx-components';
import LocalNavigation from 'src/components/resource-sections/components/navigation';
import mdxComponents from 'src/views/docs/components/mdx';
import IntegrationContent from 'content/integration.mdx';
import { MDXProvider } from '@mdx-js/react';

const Methodology: NextPage = () => {
  const MDXComponents = useMDXComponents({
    ...mdxComponents,
    h3: (props: any) => {
      return mdxComponents.h3({
        ...props,
        id: props.children.split(' ').join('_'),
        hash: props.children.toLowerCase().split(' ').join('-'),
        scrollMarginTop: '2rem',
      });
    },
  });

  const sections = [
    {
      title: 'Suggest a repository or dataset',
      hash: 'suggest-a-repository-or-dataset',
    },
    {
      title: 'Our team works on integration',
      hash: 'our-team-works-on-integration',
    },
    {
      title: 'Your content is findable',
      hash: 'your-content-is-findable',
    },
    {
      title: 'Contact Us',
      hash: 'contact-us',
    },
  ];

  return (
    <PageContainer
      hasNavigation
      title='Methodology'
      metaDescription='Information on integrating your data into the NIAID Data Ecosystem Discovery Portal.'
      px={0}
      py={0}
      disableSearchBar
    >
      <PageContent
        bg='#fff'
        // maxW={{ base: 'unset', lg: '1600px' }}
        margin='0 auto'
        // mb={32}
        px={0}
        py={0}
        justifyContent='center'
        flex={1}
      >
        <Flex
          flexDirection='column'
          alignItems='center'
          // px={[0, 8]}
          // maxW={{ base: 'unset', lg: '60%' }}
          flex={1}
          width='100%'
          m='0 auto'
        >
          <MDXProvider components={MDXComponents}>
            <IntegrationContent />
          </MDXProvider>
          {/* <ReactMarkdown
            rehypePlugins={[rehypeRaw, remarkGfm]}
            linkTarget='_blank'
            components={MDXComponents}
          >
            <IntegrationContent />
          </ReactMarkdown> */}
        </Flex>
        <Box
          flex={1}
          position='sticky'
          top='0px'
          w='100%'
          h='100vh'
          minW='250px'
          maxW='350px'
          display={{ base: 'none', lg: 'block' }}
          flexDirection='column'
        >
          <Box position='sticky' top='0px' py={4}>
            <LocalNavigation
              routes={sections}
              itemProps={{
                borderLeftColor: 'primary.400',
              }}
            />
          </Box>
        </Box>
      </PageContent>
    </PageContainer>
  );
};

export default Methodology;
