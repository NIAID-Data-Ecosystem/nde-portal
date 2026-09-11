import React from 'react';
import { Box, Button, Flex, Text, List } from '@chakra-ui/react';
import { ErrorCTA } from 'src/components/error';
import { Error } from 'src/components/error';
import { getQueryStatusError } from 'src/components/error/utils';
import { validateQueryString } from 'src/components/advanced-search/components/EditableQueryText/utils';
import { useRouter } from 'next/router';
import { Link } from 'src/components/link';

interface ErrorMessageProps {
  error: Error;
  querystring: string;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({
  error,
  querystring,
}) => {
  const router = useRouter();
  const queryStatusError =
    error && getQueryStatusError(error as unknown as { status: string });

  const validation = validateQueryString(querystring);

  return (
    <Error>
      <Flex flexDirection='column'>
        {/* Query string validation error */}
        {!validation.isValid && (
          <>
            <Text>
              It looks like something may be wrong with the format of your
              query. Here are some suggestions:
            </Text>
            <List.Root as='ul' listStyleType='disc' p={4} gap={2}>
              {!validation.isValid && validation.errors.length > 0
                ? validation.errors.map(error => (
                    <List.Item key={error.id} listStyleType='inherit'>
                      <Text lineHeight='moderate' mt={0.5}>
                        {error.message}
                      </Text>
                    </List.Item>
                  ))
                : null}
            </List.Root>
          </>
        )}

        {/* Query status error */}
        {validation.isValid && (
          <Text>
            {queryStatusError?.message ||
              'It’s possible that the server is experiencing some issues.'}{' '}
            {queryStatusError?.relatedLinks &&
              queryStatusError?.relatedLinks?.length > 0 &&
              queryStatusError.relatedLinks.map(
                ({ label, href, isExternal }, idx) => {
                  return (
                    <Link
                      key={`${label}-${idx}`}
                      href={href}
                      isExternal={isExternal}
                    >
                      {label}
                    </Link>
                  );
                },
              )}
          </Text>
        )}
        <Box mt={4}>
          <ErrorCTA>
            {validation.isValid && (
              <Button
                onClick={() => router.reload()}
                variant='outline'
                size='md'
              >
                Retry
              </Button>
            )}
          </ErrorCTA>
        </Box>
      </Flex>
    </Error>
  );
};
