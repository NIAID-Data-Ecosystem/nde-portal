import React from 'react';
import {
  Button,
  Flex,
  FlexProps,
  Heading,
  HeadingProps,
  Stack,
  Text,
} from '@chakra-ui/react';
import { PageContent } from 'src/components/page-container';
import NextLink from 'next/link';

interface Error extends FlexProps {
  title?: string;
  message?: string;
  headingProps?: HeadingProps;
}

// Default error container.
export const Error: React.FC<Error> = ({
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
      spacing={2}
      sx={{ '>*': { minWidth: '150px', maxWidth: '310px', flex: 1 } }}
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
