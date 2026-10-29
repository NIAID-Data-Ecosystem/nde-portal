import { Button, ButtonProps, Flex, Stack, VStack } from '@chakra-ui/react';
import NextLink from 'next/link';
import React from 'react';
import { FaArrowRight } from 'react-icons/fa6';
import { SourceLogo } from 'src/components/source-logo';
import {
  formatSourcesWithLogos,
  getAccessResourceURL,
  getDDECatalog,
  getSourceLogoLinkOut,
} from 'src/components/source-logo/helpers';
import { FormattedResource } from 'src/utils/api/types';

interface DataAccessProps {
  loading: boolean;
  includedInDataCatalog?: FormattedResource['includedInDataCatalog'];
  url?: FormattedResource['url'];
  recordType?: string | null;
  creativeWorkStatus?: FormattedResource['creativeWorkStatus'];
  children?: React.ReactNode;
  colorPalette?: ButtonProps['colorPalette'];
  submittingDataUrl: FormattedResource['publishingPrinciples'];
}

const AccessResourceButton: React.FC<
  ButtonProps & { label: string; url: string; showIcon?: boolean }
> = ({ url, colorPalette, label, showIcon = true, ...buttonProps }) => {
  // Internal routes (e.g. the retired resources page) should navigate
  // in the same tab; external source links continue to open in a new tab.
  const isInternalLink = url.startsWith('/');

  return (
    <Button
      asChild
      colorPalette={colorPalette}
      size='sm'
      width='100%'
      {...buttonProps}
    >
      <NextLink href={url} target={isInternalLink ? undefined : '_blank'}>
        {label}
        {showIcon ? <FaArrowRight /> : undefined}
      </NextLink>
    </Button>
  );
};

export const DataAccess: React.FC<DataAccessProps> = ({
  loading,
  includedInDataCatalog,
  url,
  recordType,
  creativeWorkStatus,
  submittingDataUrl,
  colorPalette = 'secondary',
}) => {
  // If resource is part of a catalog, only show DDE as source
  const catalogForLookup =
    includedInDataCatalog && recordType === 'ResourceCatalog'
      ? getDDECatalog(includedInDataCatalog) || []
      : includedInDataCatalog || [];

  const sources =
    !loading && includedInDataCatalog
      ? formatSourcesWithLogos(catalogForLookup)
      : [];

  return (
    <Stack mt={4} flexDirection='row' flexWrap='wrap' gap={6}>
      {sources.map(source => (
        <Flex key={source.name} flexDirection='column'>
          <SourceLogo.Component
            imageProps={{
              width: 'auto',
              height: 'unset',
              maxHeight: '150px',
              mb: 1,
            }}
            source={source}
            url={getSourceLogoLinkOut(source)}
          />
          {source?.archivedAt && (
            <Flex w='100%' mt={2} justifyContent='flex-end'>
              <VStack w='100%' maxWidth='300px'>
                <AccessResourceButton
                  label='Access Resource'
                  url={getAccessResourceURL({
                    recordType,
                    source,
                    url,
                    creativeWorkStatus,
                  })}
                  colorPalette={colorPalette}
                />
                {submittingDataUrl && (
                  <AccessResourceButton
                    label='Submit Data'
                    url={submittingDataUrl}
                    colorPalette={colorPalette}
                    variant='outline'
                    showIcon={false}
                  />
                )}
              </VStack>
            </Flex>
          )}
        </Flex>
      ))}
    </Stack>
  );
};
