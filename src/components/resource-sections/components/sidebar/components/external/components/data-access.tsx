import React from 'react';
import { useMediaQuery } from 'usehooks-ts';
import { Button, Flex, Stack, ButtonProps } from '@chakra-ui/react';
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
  creativeWorkStatus?: FormattedResource['creativeWorkStatus'];
  children?: React.ReactNode;
  colorPalette?: ButtonProps['colorPalette'];
}

const AccessResourceButton: React.FC<{ url: string; colorPalette: string }> = ({
  url,
  colorPalette,
}) => {
  // Internal routes (e.g. the retired resources page) should navigate
  // in the same tab; external source links continue to open in a new tab.
  const isInternalLink = url.startsWith('/');

  return (
    <NextLink href={url} target={isInternalLink ? undefined : '_blank'}>
      <Button colorPalette={colorPalette} size='sm'>
        Access Resource
        <FaArrowRight />
      </Button>
    </NextLink>
  );
};

export const DataAccess: React.FC<DataAccessProps> = ({
  isLoading,
  includedInDataCatalog,
  url,
  recordType,
  creativeWorkStatus,
  colorPalette = 'secondary',
}) => {
  const prefersReducedMotion = useMediaQuery(
    '(prefers-reduced-motion: reduce)',
  );

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
    <Stack mt={4} flexDirection='column' alignItems='flex-start' gap={4}>
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
              css={{
                '& svg': {
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
                  creativeWorkStatus,
                })}
                colorPalette={colorPalette}
              />
            </Flex>
          )}
        </React.Fragment>
      ))}
    </Stack>
  );
};
