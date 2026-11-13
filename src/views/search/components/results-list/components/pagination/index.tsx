import {
  ButtonGroup,
  IconButton,
  Pagination as ChakraPagination,
  Span,
  usePaginationContext,
  VisuallyHidden,
} from '@chakra-ui/react';
import React, { useEffect, useMemo, useState } from 'react';
import {
  FaAngleLeft,
  FaAngleRight,
  FaAnglesLeft,
  FaAnglesRight,
} from 'react-icons/fa6';
import { PageCombobox } from 'src/components/page-combobox';

/*
 [COMPONENT INFO]: Pagination
 Handles pagination for search results. Chakra's `Pagination` owns the page
 maths (page count, the window of pages around the current one and its
 ellipses), the disabled state of the edge triggers, and the ARIA wiring —
 `nav[aria-label]`, `aria-current='page'` on the active page and an accessible
 label on every trigger. What is left here is the API's result ceiling and the
 small-viewport page combobox.
*/

interface PaginationProps {
  // id for main element
  id: string;
  //  aria-label for nav element.
  ariaLabel: string;
  // Status of data loading.
  loading: boolean;
  // API page index
  selectedPage: number;
  // Number of items to display in a page
  selectedPerPage: number;
  // Total number of results for given query
  total: number;
  // Handler fn on page change.
  handleSelectedPage: (pageNumber: number) => void;
}

// Max results returned from the API.
export const MAX_RESULTS = 10000;

/*
Chakra derives the page count from `count / pageSize`, so the API ceiling is
applied to the count rather than to a page total: the largest count that still
resolves to an allowed page is the last whole page fitting under MAX_RESULTS.
Algebraically the same clamp the previous version applied to `totalPages`.
*/
const clampCount = (total: number, perPage: number) =>
  Math.min(total, Math.floor(MAX_RESULTS / perPage) * perPage);

/*
Pages rendered before the first response lands, so the control does not resize
as results arrive. Matches the placeholder count of the previous version.
*/
const PLACEHOLDER_PAGES = 10;

/*
`FirstTrigger` and `LastTrigger` exist in the underlying state machine but are
not re-exported from Chakra's `Pagination` namespace (v3.36), so the two edge
triggers read the pagination context directly. Hidden below `sm`, where prev /
next and the page select are enough.
*/
const EdgeTrigger: React.FC<{
  edge: 'first' | 'last';
  label: string;
  children: React.ReactNode;
}> = ({ edge, label, children }) => {
  const { page, totalPages, goToFirstPage, goToLastPage } =
    usePaginationContext();
  const isFirst = edge === 'first';

  return (
    <IconButton
      aria-label={label}
      disabled={isFirst ? page === 1 : page >= totalPages}
      display={{ base: 'none', sm: 'flex' }}
      onClick={isFirst ? goToFirstPage : goToLastPage}
      variant='outline'
    >
      {children}
    </IconButton>
  );
};

/*
Below `md` the row of page buttons is replaced by the shared page combobox, so a
page can be picked from the suggestions or typed straight in — the window around
the current page is often nowhere near the page someone wants, and the native
select this replaced could only ever offer that window.

Chakra's pagination machine already knows the page, the total, and the window its
button row shows, so the combobox is fed from context rather than from props.
*/
const PaginationPageCombobox = () => {
  const { page, pages, totalPages, setPage } = usePaginationContext();

  const suggestedPages = useMemo(
    () => pages.flatMap(item => (item.type === 'page' ? [item.value] : [])),
    [pages],
  );

  return (
    <PageCombobox
      display={{ base: 'flex', md: 'none' }}
      mx={2}
      onPageChange={setPage}
      page={page}
      suggestedPages={suggestedPages}
      totalPages={totalPages}
      width='5rem'
    />
  );
};

export const Pagination: React.FC<PaginationProps> = React.memo(
  ({
    id,
    ariaLabel,
    loading,
    selectedPage,
    selectedPerPage,
    total,
    handleSelectedPage,
  }) => {
    const [count, setCount] = useState(PLACEHOLDER_PAGES * selectedPerPage);

    /*
    Hold the last settled count while a query is in flight, so the control does
    not collapse to the new result total mid-fetch.
    */
    useEffect(() => {
      if (loading || !total) return;
      setCount(clampCount(total, selectedPerPage));
    }, [total, loading, selectedPerPage]);

    return (
      <ChakraPagination.Root
        alignItems='center'
        count={count}
        display='flex'
        ids={{ root: id }}
        justifyContent='center'
        onPageChange={({ page }) => handleSelectedPage(page)}
        page={selectedPage}
        pageSize={selectedPerPage}
        px={{ base: 0, sm: 4 }}
        translations={{
          rootLabel: ariaLabel,
          firstTriggerLabel: 'First page',
          prevTriggerLabel: 'Previous page',
          nextTriggerLabel: 'Next page',
          lastTriggerLabel: 'Last page',
          itemLabel: ({ page, totalPages }) => `Page ${page} of ${totalPages}`,
        }}
        w='100%'
      >
        <VisuallyHidden>
          <h2>Pagination</h2>
        </VisuallyHidden>

        <ButtonGroup
          colorPalette='primary'
          gap={1}
          justifyContent='center'
          size='sm'
          w={['100%', 'unset']}
        >
          <EdgeTrigger edge='first' label='First page'>
            <FaAnglesLeft />
          </EdgeTrigger>

          <ChakraPagination.PrevTrigger asChild>
            <IconButton variant='outline'>
              <FaAngleLeft />
            </IconButton>
          </ChakraPagination.PrevTrigger>

          {/* Mobile: pick or type a page number */}
          <PaginationPageCombobox />

          {/*
          `Pagination.Items` types only `render` and `ellipsis`, so the
          breakpoint that swaps the button row for the select above lives on
          each rendered item rather than on the group.
          */}
          <ChakraPagination.Items
            ellipsis={
              <Span
                alignSelf='flex-end'
                color='text.placeholder'
                display={{ base: 'none', md: 'flex' }}
                px={1}
              >
                ...
              </Span>
            }
            render={page => (
              <IconButton
                display={{ base: 'none', md: 'flex' }}
                px={2}
                variant={{ base: 'outline', _selected: 'solid' }}
              >
                {page.value}
              </IconButton>
            )}
          />

          <ChakraPagination.NextTrigger asChild>
            <IconButton variant='outline'>
              <FaAngleRight />
            </IconButton>
          </ChakraPagination.NextTrigger>

          <EdgeTrigger edge='last' label='Last page'>
            <FaAnglesRight />
          </EdgeTrigger>
        </ButtonGroup>
      </ChakraPagination.Root>
    );
  },
);
