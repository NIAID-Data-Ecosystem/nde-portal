import {Box, Button, Flex, Heading, Image, Link, Text} from 'nde-design-system';
import {NextPage} from 'next';
import React from 'react';
import PageContainer, {PageContent} from 'src/components/page-container';

const NotFoundPage: NextPage = () => {
  return (
    <PageContent h='100vh' alignItems='center' justifyContent='center'>
      <Flex flexDirection='column' alignItems='center'>
        <Image
          w='80%'
          src='/assets/404.png'
          alt='404: Page Not Found'
          mb={8}
        ></Image>
        <Heading as='h1' my={4}>
          The page you’re looking for isn’t available.
        </Heading>
        <Text>
          It&apos;s possible that the page is temporarily unavailable, has been
          moved, renamed, or no longer exists.
        </Text>
        <Button as='a' href='/' mt={4} variant='outline' h='unset'>
          Back to Home
        </Button>
      </Flex>
    </PageContent>
  );
};
export default NotFoundPage;
