import { Flex, Stack } from '@chakra-ui/react';
import { useRouter } from 'next/router';
import React from 'react';
import { DownloadMetadata } from 'src/components/download-metadata';
import { Params } from 'src/utils/api';
import {
  PAGE_SIZE_OPTIONS,
  SORT_OPTIONS,
} from 'src/views/search/config/defaultQuery';
import { usePaginationContext } from 'src/views/search/context/pagination-context';
import { TabType } from 'src/views/search/types';
import { updateRoute } from 'src/views/search/utils/update-route';

import { SelectWithLabel } from './components/select-input';

/*
[COMPONENT INFO]:
 Search results toolbar displays sort/size controls, an optional extra-actions
 slot, and the Download Metadata button.

 `extraActions` is an optional render prop for inserting additional controls
 (e.g. "Customize Columns") to the left of the Download Metadata button.

 `viewModeControl` is an optional slot rendered on its own row above the other
 controls, so that the sort/size/actions line is left intact.
*/

export const SearchResultsToolbar = ({
  id,
  params,
  extraActions,
  viewModeControl,
}: {
  id: TabType['id'];
  params: Params;
  /** Optional content rendered to the left of the Download Metadata button. */
  extraActions?: React.ReactNode;
  /** Optional content rendered on its own row above the other controls. */
  viewModeControl?: React.ReactNode;
}) => {
  const router = useRouter();

  const { getPagination, setPagination } = usePaginationContext();
  const { size, sort } = getPagination(id);

  return (
    <>
      {/* View mode (optional), on its own row above the other controls */}
      {viewModeControl && (
        <Flex w='100%' pb={2}>
          {viewModeControl}
        </Flex>
      )}
      <Flex
        borderBottom={{ base: '1px solid' }}
        borderColor={{ base: 'bg.alt' }}
        flexDirection={{ base: 'column-reverse', md: 'row' }}
        alignItems={{ base: 'unset', md: 'center' }}
        justifyContent={'space-between'}
        flexWrap={{ base: 'nowrap', md: 'wrap' }}
        rowGap={2}
        pb={2}
        w='100%'
      >
        <Stack
          flexDirection={{ base: 'column', sm: 'row' }}
          flexWrap='wrap'
          gap={[1, 4]}
        >
          {/* Sort menu */}
          <SelectWithLabel
            id='sort-results'
            label='Sort by:'
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
            label='Rows per page:'
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
