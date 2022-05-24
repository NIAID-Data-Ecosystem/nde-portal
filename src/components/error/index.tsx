import React from 'react';
import { Button, ButtonGroup, Flex, Heading, Text } from 'nde-design-system';
import { PageContent } from 'src/components/page-container';

interface Error {
  message: string;
}

// Default error container.
export const Error: React.FC<Error> = ({ children, message }) => {
  return (
    <PageContent alignItems='center' justifyContent='center' flex={1}>
      <Flex flexDirection='column' alignItems='center'>
        <Heading as='h1' my={4}>
          Oh no! Something went wrong.
        </Heading>
        <Text>{message}</Text>
        {children && (
          <Flex mt={4} flex={1} w='100%'>
            {children}
          </Flex>
        )}
      </Flex>
    </PageContent>
  );
};

// Error call to action to redirect user. Has default "Back to home page" button.
export const ErrorCTA: React.FC = ({ children }) => {
  return (
    <Flex
      flex={1}
      flexDirection={['column', 'column', 'row']}
      justifyContent='center'
    >
      {children}
      <Button as='a' href='/' ml={[0, 0, 4]}>
        Back to Home
      </Button>
    </Flex>
  );
};
