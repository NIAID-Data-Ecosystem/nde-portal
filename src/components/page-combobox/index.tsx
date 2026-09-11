import {
  Combobox,
  ComboboxInputProps,
  ComboboxRootProps,
  createListCollection,
  Portal,
  Span,
} from '@chakra-ui/react';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

/*
 [COMPONENT INFO]: PageCombobox
 A compact page picker: choose a page from the suggestions, or type the number
 straight in. Built for the places a plain select stops working — a table or
 result set thousands of pages long, where the page someone wants is nowhere
 near the current one and listing every page is not an option.

 Pages are 1-based throughout. Callers holding a 0-based page index convert at
 the boundary.
*/

// How many rows to offer, so typing "1" does not list every page.
const PAGE_SUGGESTION_LIMIT = 10;

interface PageOption {
  label: string;
  value: string;
}

/*
Everything the combobox owns internally is omitted, so a caller is left with the
style props and the handful below.

`page` has to be omitted as well: it is a real CSS property, so Chakra types it
as a style prop on every component. (That is also why Chakra's own
`Pagination.Root` declares `forwardProps: ['page']`.) It is destructured out
below rather than spread, so it never reaches the DOM as a style.
*/
export interface PageComboboxProps
  extends Omit<
    ComboboxRootProps<PageOption>,
    | 'collection'
    | 'defaultInputValue'
    | 'defaultValue'
    | 'highlightedValue'
    | 'onHighlightChange'
    | 'onInputValueChange'
    | 'onValueChange'
    | 'page'
    | 'value'
  > {
  /** The current page, 1-based. */
  page: number;

  /** Total number of pages available. */
  totalPages: number;

  /** Called with the 1-based page to move to. */
  onPageChange: (page: number) => void;

  /**
   * Pages to offer before anything has been typed. Defaults to the current page
   * with one either side, bookended by the first and last.
   */
  suggestedPages?: number[];

  /** Accessible name for the input. */
  ariaLabel?: string;

  /**
   * Props for the input itself. The default `outline` variant leaves it
   * transparent, so a caller placing this on a tinted surface passes its own
   * `bg` here.
   */
  inputProps?: ComboboxInputProps;
}

/*
The default set of pages to offer when nothing has been typed. Deliberately the
same shape as the window Chakra's `Pagination` renders as buttons, so a caller
driven by that machine can hand over its own `pages` and get a list matching its
button row.
*/
const getDefaultSuggestions = (page: number, totalPages: number) =>
  [
    ...new Set(
      [1, page - 1, page, page + 1, totalPages].filter(
        value => value >= 1 && value <= totalPages,
      ),
    ),
  ].sort((a, b) => a - b);

/*
The pages to offer for what has been typed, plus which of them to highlight.

With no digits to match on, offer the suggestions as given. Otherwise offer the
pages whose number starts with what was typed.

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
  suggestedPages: number[],
  totalPages: number,
) => {
  const digits = inputValue.replace(/\D/g, '');

  const matches = digits
    ? Array.from({ length: totalPages }, (_, index) => index + 1)
        .filter(value => String(value).startsWith(digits))
        .slice(0, PAGE_SUGGESTION_LIMIT - 1)
    : suggestedPages;

  return {
    pages: matches.includes(page) ? matches : [...matches, page],
    // Highlighting the first match is what lets Enter commit a typed page; with
    // nothing matching there is deliberately no highlight, so Enter reverts.
    highlight: digits ? matches[0] ?? null : page,
  };
};

/*
`allowCustomValue` is deliberately left off. It does not commit typed text: zag
still only selects the *highlighted* item on Enter, which is why Chakra's
"creatable" example has to fabricate a synthetic item. What the flag actually
does is suppress the revert. Leaving it off means an unparseable or out-of-range
entry reverts to the current page on Enter / Escape / blur — exactly the
validation wanted here.

`highlightedValue` is controlled rather than left to `inputBehavior`, which
highlights the *selected* item (always present, per `getSuggestions`) instead of
the page just typed, so Enter would re-select the current page and go nowhere.

zag sets no `aria-labelledby` on the input, so a plain `aria-label` is enough —
even where an enclosing landmark is already labelled.
*/
export const PageCombobox: React.FC<PageComboboxProps> = ({
  page,
  totalPages,
  onPageChange,
  suggestedPages,
  ariaLabel = 'Select page',
  inputProps,
  size = 'sm',
  ...props
}) => {
  const pages = useMemo(
    () => suggestedPages ?? getDefaultSuggestions(page, totalPages),
    [suggestedPages, page, totalPages],
  );

  const suggest = useCallback(
    (value: string) => getSuggestions(value, page, pages, totalPages),
    [page, pages, totalPages],
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

  // A page change from elsewhere puts the suggestions back to the default set.
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
        if (value) onPageChange(+value);
      }}
      openOnClick
      size={size}
      value={[String(page)]}
      {...props}
    >
      <Combobox.Control>
        {/* `inputMode` gets the numeric keypad on touch devices. */}
        <Combobox.Input
          aria-label={ariaLabel}
          inputMode='numeric'
          {...inputProps}
        />
        <Combobox.IndicatorGroup>
          <Combobox.Trigger />
        </Combobox.IndicatorGroup>
      </Combobox.Control>
      {/* Portalled so an `overflow: hidden` ancestor cannot clip the list. */}
      <Portal>
        <Combobox.Positioner>
          {/* Wider than the control, so a row never wraps. */}
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
