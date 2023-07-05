import React from 'react';
import { NextPage } from 'next';
import { Button, Flex, Heading, Image, Text } from 'nde-design-system';
import { PageContainer, PageContent } from 'src/components/page-container';
import NextLink from 'next/link';

const NotFoundPage: NextPage = () => {
  return (
    <PageContainer
      hasNavigation
      title='Page Not Found'
      metaDescription='404 Error: Page Not Found.'
    >
      <PageContent h='100vh' alignItems='center' justifyContent='center'>
        <Flex flexDirection='column' alignItems='center'>
          <Image
            w='80%'
            src='/assets/404.png'
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
