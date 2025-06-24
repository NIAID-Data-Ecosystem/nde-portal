import { Badge, Box, Flex, Heading, Text } from '@chakra-ui/react';
import type { NextPage } from 'next';
import { PageContainer, PageContent } from 'src/components/page-container';
import ChangelogData from '../../CHANGELOG.md';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import React from 'react';
import packageJsonData from '../../package.json';
import { useMDXComponents } from 'mdx-components';

interface ChangelogProps {}

const Changelog: NextPage<ChangelogProps> = () => {
  const MDXComponents = useMDXComponents();
  return (
    <PageContainer
      title='Changelog'
      metaDescription='Log of changes to the NDE System.'
      px={0}
      py={0}
    >
      <PageContent bg='#fff' justifyContent={'center'}>
        <Flex w='1000px' flexDirection='column' mb={32}>
          <Heading as='h1' size='lg' mt={8}>
            Changelog
          </Heading>
          <Box>
            <Badge variant='subtle' bg='status.info' size='sm' mt={2}>
              <Text
                fontSize='sm'
                fontWeight='semibold'
                color='#fff'
                lineHeight='inherit'
              >
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
                    <Heading as='h2' fontSize='2xl' mt={8} {...props}></Heading>
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
