import React from 'react';
import {
  Button,
  ButtonProps,
  Flex,
  Icon,
  Stack,
  VStack,
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
  creativeWorkStatus?: FormattedResource['creativeWorkStatus'];
  children?: React.ReactNode;
  colorScheme?: ButtonProps['colorScheme'];
  submittingDataUrl: FormattedResource['publishingPrinciples'];
}

const AccessResourceButton: React.FC<
  ButtonProps & { label: string; url: string; showIcon?: boolean }
> = ({ url, colorScheme, label, showIcon = true, ...buttonProps }) => {
  // Internal routes (e.g. the retired resources page) should navigate
  // in the same tab; external source links continue to open in a new tab.
  const isInternalLink = url.startsWith('/');

  return (
    <NextLink
      href={url}
      target={isInternalLink ? undefined : '_blank'}
      style={{ width: '100%' }}
      passHref
    >
      <Button
        colorScheme={colorScheme}
        size='sm'
        rightIcon={showIcon ? <Icon as={FaArrowRight} /> : undefined}
        width='100%'
        {...buttonProps}
      >
        {label}
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
  submittingDataUrl,
  colorScheme = 'secondary',
}) => {
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
                  colorScheme={colorScheme}
                />
                {/* [TO DO]: add data submission functionality when property is added to source */}
                {submittingDataUrl && (
                  <AccessResourceButton
                    label='Submit Data'
                    url={submittingDataUrl}
                    colorScheme={colorScheme}
                    variant='outline'
                    showIcon={false}
                  />
                )}
              </VStack>
            </Flex>
          )}
        </React.Fragment>
      ))}
    </Stack>
  );
};
