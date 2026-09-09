import {
  ButtonGroup,
  Combobox,
  createListCollection,
  IconButton,
  Pagination as ChakraPagination,
  Portal,
  Span,
  usePaginationContext,
  VisuallyHidden,
} from '@chakra-ui/react';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  FaAngleLeft,
  FaAngleRight,
  FaAnglesLeft,
  FaAnglesRight,
} from 'react-icons/fa6';

/*
 [COMPONENT INFO]: Pagination
 Handles pagination for search results. Chakra's `Pagination` owns the page
 maths (page count, the window of pages around the current one and its
 ellipses), the disabled state of the edge triggers, and the ARIA wiring —
 `nav[aria-label]`, `aria-current='page'` on the active page and an accessible
 label on every trigger. What is left here is the API's result ceiling and the
 small-viewport select.
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

// How many rows to offer, so typing "1" does not list every page.
const PAGE_SUGGESTION_LIMIT = 10;

/*
The pages to offer for what has been typed, plus which of them to highlight.

With no digits to match on, offer the same window the button row shows.
Otherwise offer the pages whose number starts with what was typed. Building the
full range is cheap: the smallest page size is 10, so `totalPages` is at most
MAX_RESULTS / 10.

The current page is appended when it is not itself a match, because zag reverts
the input to the *selected item's* string and resolves that item through the
collection — a selection missing from it stringifies to '', which would blank
the field rather than restore it. (`resolveSelectedItems` does fall back to a
cache, but that cache is only written when `value` changes, so it is empty until
the first selection and cannot be relied on.)
*/
const getSuggestions = (
  inputValue: string,
  page: number,
  windowPages: number[],
  totalPages: number,
) => {
  const digits = inputValue.replace(/\D/g, '');

  const matches = digits
    ? Array.from({ length: totalPages }, (_, index) => index + 1)
        .filter(value => String(value).startsWith(digits))
        .slice(0, PAGE_SUGGESTION_LIMIT - 1)
    : windowPages;

  return {
    pages: matches.includes(page) ? matches : [...matches, page],
    // Highlighting the first match is what lets Enter commit a typed page; with
    // nothing matching there is deliberately no highlight, so Enter reverts.
    highlight: digits ? matches[0] ?? null : page,
  };
};

/*
Below `md` the row of page buttons is replaced by a combobox, so a page can be
picked from the suggestions or typed straight in — the window around the current
page is often nowhere near the page someone wants, and the native select this
replaced could only ever offer that window.

`allowCustomValue` is deliberately left off. It does not commit typed text: zag
still only selects the *highlighted* item on Enter, which is why Chakra's
"creatable" example has to fabricate a synthetic item. What the flag actually
does is suppress the revert. Leaving it off means an unparseable or out-of-range
entry reverts to the current page on Enter / Escape / blur — exactly the
validation wanted here.

`highlightedValue` is controlled rather than left to `inputBehavior`, which
highlights the *selected* item (always present, per `getSuggestions`) instead of
the page just typed, so Enter would re-select the current page and go nowhere.

The enclosing `nav` already carries `ariaLabel`, so the input only has to name
itself; zag sets no `aria-labelledby` on it, so a plain `aria-label` is enough.
*/
const PageCombobox = () => {
  const { page, pages, totalPages, setPage } = usePaginationContext();

  const windowPages = useMemo(
    () => pages.flatMap(item => (item.type === 'page' ? [item.value] : [])),
    [pages],
  );

  const suggest = useCallback(
    (value: string) => getSuggestions(value, page, windowPages, totalPages),
    [page, windowPages, totalPages],
  );

  /*
  What has been typed, tracked only to build the suggestions. The input's own
  text is left to zag: it is written imperatively from the machine, and also
  driving it from React state loses keystrokes to the race between the two.
  Page changes from elsewhere still reach the input, because `value` is
  controlled and zag rewrites the text whenever the selection changes.
  */
  const [query, setQuery] = useState('');
  const [highlightedValue, setHighlightedValue] = useState<string | null>(
    String(page),
  );

  // A page change from elsewhere puts the suggestions back to the window.
  useEffect(() => {
    setQuery('');
    setHighlightedValue(String(page));
  }, [page]);

  const collection = useMemo(() => {
    const items = suggest(query).pages.map(value => ({
      label: String(value),
      value: String(value),
    }));
    return createListCollection({ items });
  }, [suggest, query]);

  return (
    <Combobox.Root
      collection={collection}
      defaultInputValue={String(page)}
      display={{ base: 'flex', md: 'none' }}
      highlightedValue={highlightedValue}
      onHighlightChange={details =>
        setHighlightedValue(details.highlightedValue)
      }
      onInputValueChange={details => {
        /*
        Only the user's own edits should change what is suggested — ignore the
        machine's rewrites (`item-select`, `interact-outside`, `script`), which
        would otherwise narrow the list to just the page it had already picked.
        */
        if (
          details.reason !== 'input-change' &&
          details.reason !== 'clear-trigger'
        ) {
          return;
        }
        setQuery(details.inputValue);
        const { highlight } = suggest(details.inputValue);
        setHighlightedValue(highlight === null ? null : String(highlight));
      }}
      onValueChange={details => {
        const [value] = details.value;
        if (value) setPage(+value);
      }}
      openOnClick
      size='sm'
      value={[String(page)]}
      width='9rem'
    >
      <Combobox.Control>
        {/* `inputMode` gets the numeric keypad on the touch devices this serves. */}
        <Combobox.Input aria-label='Select page' inputMode='numeric' />
        <Combobox.IndicatorGroup>
          <Combobox.Trigger />
        </Combobox.IndicatorGroup>
      </Combobox.Control>
      {/* Portalled so an `overflow: hidden` ancestor cannot clip the list. */}
      <Portal>
        <Combobox.Positioner>
          {/* Wider than the 9rem control, so a row never wraps. */}
          <Combobox.Content minW='11rem'>
            <Combobox.Empty>No such page</Combobox.Empty>
            {collection.items.map(item => (
              <Combobox.Item item={item} key={item.value}>
                <Combobox.ItemText whiteSpace='nowrap'>
                  Page {item.label}
                </Combobox.ItemText>
                {item.value === String(page) && (
                  <Span color='fg.muted' textStyle='xs'>
                    current
                  </Span>
                )}
                <Combobox.ItemIndicator />
              </Combobox.Item>
            ))}
          </Combobox.Content>
        </Combobox.Positioner>
      </Portal>
    </Combobox.Root>
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
          <PageCombobox />

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
