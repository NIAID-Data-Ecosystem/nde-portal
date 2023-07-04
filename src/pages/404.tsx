import { Button, Flex, Heading, Image, Text } from 'nde-design-system';
import { NextPage } from 'next';
import React from 'react';
import { PageContainer, PageContent } from 'src/components/page-container';
import { assetPrefix } from 'next.config';

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
            src={`${assetPrefix || ''}/assets/404.png`}
            alt='404: Page Not Found'
            mb={8}
          ></Image>
          <Heading as='h1' my={4}>
            The page you’re looking for isn’t available.
          </Heading>
          <Text>
            It&apos;s possible that the page is temporarily unavailable, has
            been moved, renamed, or no longer exists.
          </Text>
          <Button as='a' href='/' mt={4} variant='outline' h='unset'>
            Back to Home
          </Button>
        </Flex>
      </PageContent>
    </PageContainer>
  );
};
export default NotFoundPage;
