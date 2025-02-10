import React from 'react';
import {
  Button,
  Flex,
  usePrefersReducedMotion,
  Stack,
  ButtonProps,
} from '@chakra-ui/react';
import { FormattedResource } from 'src/utils/api/types';
import NextLink from 'next/link';
import { FaArrowRight } from 'react-icons/fa6';
import {
  SourceLogo,
  getSourceDetails,
} from 'src/views/search-results-page/components/card/source-logo';

interface DataAccessProps {
  isLoading: boolean;
  includedInDataCatalog?: FormattedResource['includedInDataCatalog'];
  url?: FormattedResource['url'];
  recordType?: string | null;
  children?: React.ReactNode;
  colorScheme?: ButtonProps['colorScheme'];
}

const AccessResourceButton: React.FC<{ url: string; colorScheme: string }> = ({
  url,
  colorScheme,
}) => (
  <Flex mt={4} flexDirection='column' alignItems='flex-start'>
    <NextLink href={url} target='_blank'>
      <Button colorScheme={colorScheme} size='sm' rightIcon={<FaArrowRight />}>
        Access Resource
      </Button>
    </NextLink>
  </Flex>
);

export const DataAccess: React.FC<DataAccessProps> = ({
  isLoading,
  includedInDataCatalog,
  url,
  recordType,
  colorScheme = 'primary',
}) => {
  const prefersReducedMotion = usePrefersReducedMotion();

  if (!isLoading) {
    if (!includedInDataCatalog) return null;
    if (recordType === 'ResourceCatalog' && url) {
      return <AccessResourceButton url={url} colorScheme={colorScheme} />;
    }
  }

  const sources =
    !isLoading && includedInDataCatalog
      ? getSourceDetails(includedInDataCatalog)
      : [];

  return (
    <Stack mt={4} flexDirection='column' alignItems='flex-start' spacing={4}>
      {sources.map(source => (
        <React.Fragment key={source.name}>
          <SourceLogo
            sources={[source]}
            url={source.url}
            imageProps={{
              width: 'auto',
              height: 'unset',
              maxHeight: '80px',
              mb: 1,
            }}
          />
          {source.dataset && (
            <Flex
              w='100%'
              mt={2}
              justifyContent='flex-end'
              sx={{
                svg: {
                  transform: 'translateX(-2px)',
                  transition: 'transform 0.2s ease-in-out',
                },
              }}
              _hover={{
                svg: prefersReducedMotion
                  ? {}
                  : {
                      transform: 'translateX(4px)',
                      transition: 'transform 0.2s ease-in-out',
                    },
              }}
            >
              <AccessResourceButton
                url={source.dataset}
                colorScheme={colorScheme}
              />
            </Flex>
          )}
        </React.Fragment>
      ))}
    </Stack>
  );
};
