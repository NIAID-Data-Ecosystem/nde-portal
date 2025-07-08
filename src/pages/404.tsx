import React from 'react';
import { NextPage } from 'next';
import { Button, Flex, Heading, Image, Text } from '@chakra-ui/react';
import { PageContainer, PageContent } from 'src/components/page-container';
import NextLink from 'next/link';

const NotFoundPage: NextPage = () => {
  return (
    <PageContainer
      meta={{
        title: '404 — Page Not Found',
        description: '404 Error: Page Not Found.',
        keywords: '404, page not found, error',
        url: `${process.env.NEXT_PUBLIC_BASE_URL}/404`,
        preventIndexing: true,
      }}
      includeSearchBar
    >
      <PageContent h='100vh' alignItems='center' justifyContent='center'>
        <Flex flexDirection='column' alignItems='center'>
          <Image
            w='80%'
            h='auto'
            src='/assets/404.webp'
            alt='404: Page Not Found'
            mb={8}
          />
          <Heading as='h1' my={4}>
            The page you’re looking for isn’t available.
          </Heading>
          <Text>
            It&apos;s possible that the page is temporarily unavailable, has
            been moved, renamed, or no longer exists.
          </Text>
          <NextLink href={{ pathname: '/' }}>
            <Button mt={4} variant='outline' h='unset'>
              Back to Home
            </Button>
          </NextLink>
        </Flex>
      </PageContent>
    </PageContainer>
  );
};
export default NotFoundPage;
