import { HStack, Skeleton, Text, VStack } from '@chakra-ui/react';
import { CreativeWorkStatus } from 'src/components/badges';
import { CopyIconButton } from 'src/components/copy-button';
import { FormattedResource } from 'src/utils/api/types';

interface IdentifiersProps {
  loading: boolean;
  id?: FormattedResource['id'];
  doi?: FormattedResource['doi'];
  nctid?: FormattedResource['nctid'];
  type?: FormattedResource['@type'];
  creativeWorkStatus?: FormattedResource['creativeWorkStatus'];
}

const Identifiers = ({
  loading,
  id,
  doi,
  nctid,
  type,
  creativeWorkStatus,
}: IdentifiersProps) => {
  const isRetiredResourceCatalog =
    type === 'ResourceCatalog' && creativeWorkStatus === 'Retired';

  if (!loading && !id && !nctid && !doi && !isRetiredResourceCatalog) {
    return null;
  }

  return (
    <Skeleton loading={loading} px={[4, 6]}>
      <VStack
        alignItems='flex-start'
        lineHeight='shorter'
        gap={0.25}
        fontSize='sm'
      >
        {id && (
          <IdWithCopyButton
            id={id}
            label='Resource ID'
            buttonText='Copy Resource ID'
            copiedText='Resource ID Copied!'
          />
        )}

        {nctid && (
          <IdWithCopyButton
            id={nctid}
            label='NCTID'
            buttonText='Copy NCTID'
            copiedText='NCTID Copied!'
          />
        )}

        {doi && (
          <IdWithCopyButton
            id={doi}
            label='DOI'
            buttonText='Copy DOI'
            copiedText='DOI Copied!'
          />
        )}

        {/* Retired badge for ResourceCatalog records that have been retired. */}
        {isRetiredResourceCatalog && (
          <CreativeWorkStatus
            creativeWorkStatus={creativeWorkStatus}
            type={type}
            mt={1}
          />
        )}
      </VStack>
    </Skeleton>
  );
};

const IdWithCopyButton = ({
  id,
  label,
  buttonText,
  copiedText,
}: {
  id: string;
  label?: string;
  buttonText?: string;
  copiedText?: string;
}) => {
  return (
    <HStack flexWrap='wrap' gap={1} alignItems='baseline'>
      {label && (
        <Text fontWeight='medium' whiteSpace='nowrap'>
          {label} :
        </Text>
      )}
      <HStack gap={1} alignItems='baseline'>
        <Text wordBreak='break-all'>{id}</Text>
        <CopyIconButton
          textToCopy={id}
          buttonText={buttonText || 'Copy ID'}
          copiedText={copiedText || 'ID Copied!'}
          buttonProps={{
            size: '2xs',
            flexShrink: 0,
          }}
        />
      </HStack>
    </HStack>
  );
};

export default Identifiers;
