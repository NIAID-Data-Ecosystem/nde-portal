import React from 'react';
import {
  Button,
  Flex,
  FlexProps,
  Heading,
  HeadingProps,
  Stack,
  StackProps,
  Text,
  VStack,
} from '@chakra-ui/react';
import { PageContent } from 'src/components/page-container';
import NextLink from 'next/link';

interface Error {
  title?: string;
  message?: string;
  headingProps?: HeadingProps;
}

// Default error container.
export const Error: React.FC<Error & FlexProps> = ({
  children,
  message,
  headingProps,
  title,
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
          {title || 'Something went wrong.'}
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
    <Stack
      w='100%'
      flexWrap='wrap'
      flexDirection='row'
      justifyContent='center'
      gap={2}
      css={{ '>*': { minWidth: '150px', maxWidth: '310px', flex: 1 } }}
    >
      {children}
      <NextLink href='/'>
        <Button w='100%' size='md'>
          Back to Home
        </Button>
      </NextLink>
    </Stack>
  );
};

// Basic error message
export const ErrorMessage: React.FC<Error & StackProps> = ({
  children,
  message,
  headingProps,
  title = 'Error:  ',
  ...props
}) => {
  return (
    <VStack
      px={2}
      bg='error.light'
      color='red.500'
      flex={1}
      alignItems='flex-start'
      gap={1}
      {...props}
    >
      <Text fontSize='sm' color='inherit'>
        <Text
          as='span'
          fontWeight='semibold'
          mr={1}
          color='inherit'
          fontSize='inherit'
        >
          {title}
        </Text>
        {message}
      </Text>
      {children && (
        <Flex flex={1} w='100%' fontSize='sm'>
          {children}
        </Flex>
      )}
    </VStack>
  );
};
