import React from 'react';
import {
  Button,
  Flex,
  FlexProps,
  Heading,
  HeadingProps,
  Text,
} from '@chakra-ui/react';
import { PageContent } from 'src/components/page-container';

interface Error extends FlexProps {
  message?: string;
  headingProps?: HeadingProps;
}

// Default error container.
export const Error: React.FC<Error> = ({
  children,
  message,
  headingProps,
  ...props
}) => {
  return (
    <PageContent
      alignItems='center'
      justifyContent='center'
      flex={1}
      {...props}
    >
      <Flex flexDirection='column' alignItems='center'>
        <Heading as='h2' my={4} color='inherit' {...headingProps}>
          Oh no! Something went wrong.
        </Heading>
        {message ? <Text color='inherit'>{message}</Text> : <></>}
        {children && (
          <Flex flex={1} w='100%'>
            {children}
          </Flex>
        )}
      </Flex>
    </PageContent>
  );
};

// Error call to action to redirect user. Has default "Back to home page" button.
export const ErrorCTA: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
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
