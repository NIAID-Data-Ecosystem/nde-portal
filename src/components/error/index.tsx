import React from 'react';
import {Flex, Heading, Text} from 'nde-design-system';
import {PageContent} from 'src/components/page-container';

interface ErrorMessageProps {
  message: string;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({children, message}) => {
  return (
    <PageContent alignItems='center' justifyContent='center'>
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
export default ErrorMessage;
