import { Badge, Box, Flex, Heading, Text } from '@candicecz/test-design-system';
import type { NextPage } from 'next';
import { PageContainer, PageContent } from 'src/components/page-container';
import ChangelogData from '../../CHANGELOG.md';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import React from 'react';
import { MDXComponents } from 'src/mdx';
import packageJsonData from '../../package.json';

interface ChangelogProps {}

const Changelog: NextPage<ChangelogProps> = () => {
  return (
    <PageContainer
      hasNavigation
      title='Changelog'
      metaDescription='Log of changes to the NDE System.'
      px={0}
      py={0}
      disableSearchBar
    >
      <PageContent bg='#fff' justifyContent={'center'}>
        <Flex w='1000px' flexDirection='column' mb={32}>
          <Heading as='h1' size='lg' mt={8}>
            Version {packageJsonData.version}
          </Heading>
          <Box>
            <Badge
              variant='subtle'
              bg='status.info'
              size='sm'
              mt={2}
              px={2}
              py={1}
            >
              <Text fontSize='sm' fontWeight='semibold' color='#fff'>
                V.{packageJsonData.version}
              </Text>
            </Badge>
          </Box>
          <ReactMarkdown
            rehypePlugins={[rehypeRaw, remarkGfm]}
            linkTarget='_blank'
            components={{
              ...MDXComponents,
              h1: (props: any) => {
                // Don't display changelog title
                if (props.children[0] === 'Changelog') {
                  return <></>;
                }
                return (
                  <>
                    <Heading as='h1' size='lg' mt={8} {...props}></Heading>
                  </>
                );
              },
              h2: (props: any) => {
                return (
                  <>
                    <Heading as='h2' size='lg' mt={8} {...props}></Heading>
                  </>
                );
              },
              h3: (props: any) => {
                return (
                  <>
                    <Heading as='h3' size='md' mt={8} {...props}></Heading>
                  </>
                );
              },
            }}
          >
            {ChangelogData.toString()}
          </ReactMarkdown>
        </Flex>
      </PageContent>
    </PageContainer>
  );
};

export default Changelog;
