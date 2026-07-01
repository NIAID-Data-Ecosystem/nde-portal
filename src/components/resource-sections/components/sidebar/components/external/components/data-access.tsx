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
import { SourceLogo } from 'src/components/source-logo';
import {
  formatSourcesWithLogos,
  getAccessResourceURL,
  getDDECatalog,
  getSourceLogoLinkOut,
} from 'src/components/source-logo/helpers';

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
  <NextLink href={url} target='_blank'>
    <Button colorScheme={colorScheme} size='sm' rightIcon={<FaArrowRight />}>
      Access Resource
    </Button>
  </NextLink>
);

export const DataAccess: React.FC<DataAccessProps> = ({
  isLoading,
  includedInDataCatalog,
  url,
  recordType,
  colorScheme = 'secondary',
}) => {
  const prefersReducedMotion = usePrefersReducedMotion();

  // If resource is part of a catalog, only show DDE as source

  const catalogForLookup =
    includedInDataCatalog && recordType === 'ResourceCatalog'
      ? getDDECatalog(includedInDataCatalog) || []
      : includedInDataCatalog || [];

  const sources =
    !isLoading && includedInDataCatalog
      ? formatSourcesWithLogos(catalogForLookup)
      : [];

  return (
    <Stack mt={4} flexDirection='column' alignItems='flex-start' spacing={4}>
      {sources.map(source => (
        <React.Fragment key={source.name}>
          <SourceLogo.Component
            imageProps={{
              width: 'auto',
              height: 'unset',
              maxHeight: '80px',
              mb: 1,
            }}
            source={source}
            url={getSourceLogoLinkOut(source)}
          />
          {source?.archivedAt && (
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
                url={getAccessResourceURL({
                  recordType,
                  source,
                  url,
                })}
                colorScheme={colorScheme}
              />
            </Flex>
          )}
        </React.Fragment>
      ))}
    </Stack>
  );
};
