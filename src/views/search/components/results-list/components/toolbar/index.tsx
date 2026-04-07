import React from 'react';
import { useRouter } from 'next/router';
import { DownloadMetadata } from 'src/components/download-metadata';
import { Params } from 'src/utils/api';
import { usePaginationContext } from 'src/views/search/context/pagination-context';
import { updateRoute } from 'src/views/search/utils/update-route';
import { TabType } from 'src/views/search/types';
import { SelectWithLabel } from './components/select-input';
import {
  PAGE_SIZE_OPTIONS,
  SORT_OPTIONS,
} from 'src/views/search/config/defaultQuery';
import { Flex, Stack } from '@chakra-ui/react';
import { MetadataScoreToggle } from './components/metadata-score-toggle';

/*
[COMPONENT INFO]:
 Search results toolbar displays sort/size controls, an optional extra-actions
 slot, and the Download Metadata button.

 `extraActions` is an optional render prop for inserting additional controls
 (e.g. "Customize Columns") to the left of the Download Metadata button.
*/

export const SearchResultsToolbar = ({
  id,
  params,
  extraActions,
}: {
  id: TabType['id'];
  params: Params;
  /** Optional content rendered to the left of the Download Metadata button. */
  extraActions?: React.ReactNode;
}) => {
  const router = useRouter();

  const { getPagination, setPagination } = usePaginationContext();
  const { size, sort } = getPagination(id);

  return (
    <>
      {/* Apply metadata score (optional) */}
      {process.env.NEXT_PUBLIC_APP_ENV !== 'production' && (
        <MetadataScoreToggle
          isChecked={params.use_metadata_score === 'true'}
          isDisabled={params.sort !== '_score'}
          handleToggle={() => {
            const newUseMetadataScore =
              params.use_metadata_score === 'true' ? 'false' : 'true';
            const update = { use_metadata_score: newUseMetadataScore, from: 1 };
            setPagination(id, update);
            updateRoute(router, update);
          }}
        />
      )}
      <Flex
        borderBottom={{ base: '1px solid' }}
        borderColor={{ base: 'page.alt' }}
        flexDirection={{ base: 'column-reverse', md: 'row' }}
        alignItems={{ base: 'unset', md: 'center' }}
        justifyContent={'space-between'}
        flexWrap={{ base: 'nowrap', md: 'wrap' }}
        rowGap={2}
        pb={2}
        w='100%'
      >
        <Stack flexDirection={{ base: 'column', sm: 'row' }} spacing={[1, 4]}>
          {/* Sort menu */}
          <SelectWithLabel
            id='sort-results'
            label='Sort search results by:'
            options={SORT_OPTIONS}
            value={sort}
            handleChange={newSort => {
              const update = { sort: newSort, from: 1 };
              setPagination(id, update);
              updateRoute(router, update);
            }}
            minWidth='200px'
          />

          {/* Size menu */}
          <SelectWithLabel
            id='size-results'
            label='Show number of results per page:'
            options={PAGE_SIZE_OPTIONS}
            value={size}
            handleChange={newSize => {
              const update = { size: +newSize, from: 1 };
              // Update pagination state for the current tab.
              setPagination(id, update);
              updateRoute(router, update);
            }}
          />
        </Stack>

        {/* Right-side actions: optional extra slot + Download Metadata */}
        <Flex flexWrap='wrap' columnGap={2} rowGap={2} alignItems='center'>
          {extraActions && <Flex pb={{ base: 2, md: 0 }}>{extraActions}</Flex>}
          {/* Download CTA */}
          <DownloadMetadata
            pb={{ base: 2, md: 0 }}
            exportFileName={`nde-results-${(params.q ?? '').replaceAll(
              ' ',
              '_',
            )}`}
            params={params}
            buttonProps={{ variant: 'outline' }}
          >
            Download Metadata
          </DownloadMetadata>
        </Flex>
      </Flex>
    </>
  );
};
