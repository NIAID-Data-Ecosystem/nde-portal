import { Badge, Box, Flex, Heading, Text } from '@chakra-ui/react';
import type { NextPage } from 'next';
import React from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import { useMDXComponents } from 'src/components/mdx/hooks/useMDXComponents';
import {
  getPageSeoConfig,
  PageContainer,
  PageContent,
} from 'src/components/page-container';

import ChangelogData from '../../CHANGELOG.md';
import packageJsonData from '../../package.json';

interface ChangelogProps {}

const Changelog: NextPage<ChangelogProps> = () => {
  const MDXComponents = useMDXComponents();
  return (
    <PageContainer meta={getPageSeoConfig('/changelog')} px={0} py={0}>
      <PageContent bg='#fff' justifyContent={'center'}>
        <Flex w='1000px' flexDirection='column' mb={32}>
          <Heading as='h1' textStyle='h4' mt={8}>
            Changelog
          </Heading>
          <Box>
            <Badge variant='subtle' bg='info.default' size='sm' mt={2}>
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
                    <Heading as='h1' textStyle='h4' mt={8} {...props}></Heading>
                  </>
                );
              },
              h2: (props: any) => {
                return (
                  <>
                    <Heading as='h2' textStyle='h5' {...props}></Heading>
                  </>
                );
              },
              h3: (props: any) => {
                return (
                  <>
                    <Heading as='h3' textStyle='xl' {...props}></Heading>
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
