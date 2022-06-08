import React from 'react';
import { Button, Flex, FlexProps, Heading, Text } from 'nde-design-system';
import { PageContent } from 'src/components/page-container';

interface Error extends FlexProps {
  message: string;
}

// Default error container.
export const Error: React.FC<Error> = ({ children, message, ...props }) => {
  return (
    <PageContent
      alignItems='center'
      justifyContent='center'
      flex={1}
      {...props}
    >
      <Flex flexDirection='column' alignItems='center'>
        <Heading as='h1' my={4} color='inherit'>
          Oh no! Something went wrong.
        </Heading>
        <Text color='inherit'>{message}</Text>
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
