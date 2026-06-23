import { Heading, HStack, Skeleton, Text, VStack } from '@chakra-ui/react';
import { FormattedResource } from 'src/utils/api/types';
import { DisplayHTMLString } from 'src/components/html-content';
import { TagWithUrl } from 'src/components/tag-with-url';
import { CopyIconButton } from 'src/components/copy-button';
import { BookmarkIconButton } from 'src/components/bookmark-buttons/icon-button';
import { useUserData } from 'src/hooks/useUserData';
import { ENABLE_AUTH } from 'src/utils/feature-flags';
import { useAuth } from 'src/hooks/useAuth';
import { CreativeWorkStatus } from 'src/components/badges';

interface HeaderProps {
  isLoading: boolean;
  name?: FormattedResource['name'];
  alternateName?: FormattedResource['alternateName'];
  id?: FormattedResource['id'];
  doi?: FormattedResource['doi'];
  nctid?: FormattedResource['nctid'];
  type?: FormattedResource['@type'];
  creativeWorkStatus?: FormattedResource['creativeWorkStatus'];
}

const Header = ({
  isLoading,
  name,
  alternateName,
  id,
  doi,
  nctid,
  type,
  creativeWorkStatus,
}: HeaderProps) => {
  const { user, login } = useAuth();

  const { savedDatasets, addSavedDataset, removeSavedDataset } = useUserData();

  const isFavorited = id
    ? savedDatasets.some(fd => fd.dataset_id === id)
    : false;

  const showBookmarkButton = ENABLE_AUTH;

  const isRetiredResourceCatalog =
    type === 'ResourceCatalog' && creativeWorkStatus === 'Retired';

  return (
    <>
      <Skeleton
        isLoaded={!isLoading}
        w='100%'
        overflow='unset'
        position={['unset', 'unset', 'sticky']}
        top='0px'
        zIndex='docked'
        bg='white'
        borderBottom='2px solid'
        borderBottomColor='gray.100'
        px={6}
        pt={4}
        pb={2}
      >
        <HStack alignItems='flex-start' justifyContent='space-between' w='100%'>
          <Heading as='h1' fontSize='xl' fontWeight='bold' lineHeight='short'>
            <DisplayHTMLString>{name || alternateName}</DisplayHTMLString>
            {!!name && alternateName && (
              <Heading
                as='span'
                size='sm'
                color='gray.800'
                fontWeight='normal'
                wordBreak='break-word'
                my={0}
              >
                Alternate name: {alternateName}
              </Heading>
            )}
          </Heading>
          {showBookmarkButton && (
            <BookmarkIconButton
              isFavorited={isFavorited}
              onClick={() => {
                // Redirect logged-out users to the login page.
                if (!user) {
                  login();
                  return;
                }
                if (!id) return;
                if (isFavorited) {
                  removeSavedDataset(id);
                } else {
                  addSavedDataset({
                    dataset_id: id,
                    name: name || alternateName || 'Untitled Dataset',
                    saved_at: new Date().toISOString(),
                  });
                }
              }}
              disabled={!id}
            />
          )}
        </HStack>
        <VStack alignItems='flex-start' mt={2} lineHeight='shorter'>
          {id && (
            <IdWithCopyButton
              id={id}
              label='Resource ID'
              buttonText='Copy Resource ID'
              copiedText='Resource ID Copied!'
            />
          )}

          {(nctid || doi) && (
            <>
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
            </>
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
    </>
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
    <HStack
      alignItems={{ base: 'flex-start', md: 'baseline' }}
      flexDirection={{ base: 'column', md: 'row' }}
      fontSize='sm'
      gap={1}
    >
      <HStack flexWrap='wrap' spacing={1} alignItems='baseline'>
        {label && (
          <Text fontWeight='semibold' whiteSpace='nowrap'>
            {label} |
          </Text>
        )}
        <HStack spacing={1} alignItems='baseline'>
          <Text>{id}</Text>
          <CopyIconButton
            textToCopy={id}
            buttonText={buttonText || 'Copy ID'}
            copiedText={copiedText || 'ID Copied!'}
            buttonProps={{
              size: 'xs',
              flexShrink: 0,
            }}
          />
        </HStack>
      </HStack>
    </HStack>
  );
};
export default Header;
