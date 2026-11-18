import { defineSlotRecipe } from '@chakra-ui/react';

/*
Styles for src/components/table/data-table.

The table renders plain <table>/<th>/<td> elements and styles them all from
this recipe's `root` slot with descendant selectors, rather than giving every
cell its own styled component: a populated table holds ~1,000 cells, and one
class on the root costs the same whatever the row count. State lives in data
attributes the component sets on the root:

  data-pinned        first column pinned (only from `md` up)
  data-interactive   rows highlight on hover
  data-overflow-x    content is wider than the viewport
  data-floating      the floating scrollbar is showing (native one off-screen)

and CSS variables it measures: --nde-table-header-h, --nde-table-pinned-w,
--nde-table-viewport-w.

The visuals follow the tables this replaces: uppercase grey bold headers, a
`bg.alt` header for the sorted column, `table.stripe` zebra rows, 1rem
horizontal cell padding.
*/

/*
The viewport's scrollbars are the browser's own, thinned and tinted with the
standard properties, not `::-webkit-scrollbar`. Chrome paints those custom
scrollbars itself, so at 1x pixel density a scroller that has them repaints the
whole document on every scroll step. Measured 2026-11-17 (headed Chrome,
Repository Matcher, 1,200px horizontal scroll): 40-60 table repaints and
~250 ms of paint, down to 1 and ~30 ms.
No hover tint: `scrollbar-color` is inherited, so changing it on hover would
restyle every cell each time the pointer entered or left the table.
*/
const viewportScrollbarStyles = {
  scrollbarWidth: 'thin',
  scrollbarColor: '{colors.gray.300} {colors.blackAlpha.100}',
} as const;

/*
The synced scrollbars (top and floating) keep custom scrollbars: they hold
nothing but a 1px phantom, so repainting them is cheap, and a custom scrollbar
stays visible where the platform's own would be an overlay that only shows
while scrolling (macOS), leaving an empty strip.
*/
const syncedScrollbarStyles = {
  '&::-webkit-scrollbar': { width: '10px', height: '10px' },
  '&::-webkit-scrollbar-track': {
    background: 'blackAlpha.100',
    borderRadius: '13px',
  },
  '&::-webkit-scrollbar-thumb': {
    background: 'gray.300',
    borderRadius: '13px',
  },
  '&:hover::-webkit-scrollbar-thumb': { background: 'text.placeholder' },
} as const;

const firstCells = 'table :is(th, td):first-child';

// The pinned column, whenever the table is wide enough to scroll under it.
// Not only once scrolled away from the start: a scroll-position attribute on
// the root restyled every cell whenever a scroll left or returned to the
// start (~16 ms style + ~11 ms layout at 4x CPU, 840 cells, 2026-11-12).
const pinnedShadow = '&[data-pinned][data-overflow-x]';
const pinnedShadowStrip = {
  // Only from `md` up, like the pinning: below it there's no sticky cell to
  // position against, and no pseudo-element is generated at all.
  content: { md: '""' },
  position: 'absolute',
  insetInlineStart: '100%',
  width: '32px',
  pointerEvents: 'none',
  boxShadow: 'inset 8px 0 8px -8px rgba(0, 0, 0, 0.16)',
} as const;

export const dataTableSlotRecipe = defineSlotRecipe({
  className: 'nde-data-table',
  slots: ['root', 'viewport', 'table', 'scrollbar'],
  base: {
    root: {
      position: 'relative',
      // A column, so whatever bounds the root (this default, a `maxHeight`
      // from the parent, or a flex parent shrinking it) bounds the viewport
      // below, which then scrolls with its header stuck at the top.
      display: 'flex',
      flexDirection: 'column',
      // Bounded by default: never taller than one screen (a cap, so shorter
      // tables keep their natural size). The `maxHeight` prop overrides it
      // with any CSS value; `'none'` lets the table grow with its rows.
      maxHeight: '100dvh',
      // Lets a flex-column parent shrink the table into the space left by
      // its other children (e.g. a toolbar), so the page's layout decides
      // the height with no measuring.
      minHeight: 0,
      maxWidth: '100%',
      minWidth: 0,
      bg: 'white',
      borderWidth: '1px',
      borderColor: 'gray.200',
      borderRadius: 'semi',
      // `clip` rather than `hidden`: it rounds the corners without making the
      // root a scroll container, which would capture the floating scrollbar's
      // `position: sticky`.
      overflow: 'clip',

      /* Cells */
      '& table :is(th, td)': {
        // Each column's min/max is set on its cells and means content width,
        // so the padding comes on top (the preflight's `border-box` would take
        // it out of the column's bounds).
        boxSizing: 'content-box',
        px: 4,
        textAlign: 'start',
        verticalAlign: 'top',
        borderBottomWidth: '1px',
        borderColor: 'gray.100',
        overflowWrap: 'break-word',
      },
      '& table td': { py: 2.5, bg: 'white' },
      '& table tbody tr:nth-of-type(even) > td': { bg: 'table.stripe' },
      '&[data-interactive] table tbody tr:hover > td': {
        bg: 'table.hover',
      },
      '& table :is(th, td)[data-align="end"]': { textAlign: 'end' },
      '& table td[data-wrap="anywhere"]': { overflowWrap: 'anywhere' },
      '& table td[data-wrap="nowrap"]': { whiteSpace: 'nowrap' },
      '& table tbody tr:last-of-type > td': { borderBottomWidth: 0 },

      /* Header */
      '& table th': {
        // Sticks to the top of the viewport while rows scroll (a no-op when
        // nothing scrolls vertically, e.g. `maxHeight='none'`). Also the
        // containing block for the sort button's full-cell hit area.
        position: 'sticky',
        top: 0,
        zIndex: 2,
        py: 2,
        bg: 'white',
        color: 'gray.600',
        fontWeight: 'bold',
        textTransform: 'uppercase',
        // Every header is centred vertically, so single-line titles line up
        // with one that wraps.
        verticalAlign: 'middle',
        borderBottomColor: 'gray.200',
      },
      '& table th[aria-sort]': { bg: 'bg.alt' },
      // Title and info icon at the start, sort arrows pushed to the end.
      '& .nde-th': { display: 'flex', alignItems: 'center', gap: 2 },
      '& .nde-th-title': { display: 'flex', alignItems: 'center', minWidth: 0 },
      // Titles wrap at word boundaries, up to two lines. The column's own
      // min/max sizes decide where; headers never widen a column beyond its
      // longest word.
      '& .nde-header-label': { lineClamp: 2 },

      /*
      Sort button: the title and its carets, with a hit area (`::after`) that
      covers the whole cell, padding included. Hover, pressed and focus states
      are drawn on the cell so they match that area.
      */
      '& .nde-sort-button': {
        colorPalette: 'primary',
        display: 'inline-flex',
        alignItems: 'center',
        gap: 1.5,
        minWidth: 0,
        textAlign: 'start',
        textTransform: 'inherit',
        fontWeight: 'inherit',
        color: 'inherit',
        cursor: 'pointer',
        outline: 'none',
        '&::after': { content: '""', position: 'absolute', inset: 0 },
        '&:focus-visible::after': {
          outlineWidth: '2px',
          outlineStyle: 'solid',
          outlineColor: 'colorPalette.focusRing',
          outlineOffset: '-2px',
        },
        '&:disabled': { cursor: 'not-allowed', opacity: 0.6 },
      },
      // The title sits above that hit area, so it can be hovered on its own
      // (a described title opens its description). It's inside the button,
      // so clicking it still sorts.
      '& .nde-sort-button > .nde-header-label': {
        position: 'relative',
        zIndex: 1,
      },
      '@media (hover: hover)': {
        '& table th:has(.nde-sort-button:hover:not(:disabled))': {
          bg: 'table.hover',
          color: 'gray.700',
        },
        // Hovering a described title highlights its icon at once, like
        // InfoLabel, before the tooltip's open delay.
        '& .nde-th-title:has(.nde-header-label:hover) .tooltip-icon': {
          bg: 'blue.100',
          color: 'blue.500',
        },
      },
      '& table th:has(.nde-sort-button:active:not(:disabled))': {
        bg: 'primary.100',
      },
      // The info icon (InfoLabel's): above the sort hit area, so it never
      // sorts; a 26px target around the 14px icon; InfoLabel's blue on hover
      // and while the tooltip is open (from either trigger).
      '& .nde-header-info': {
        colorPalette: 'primary',
        position: 'relative',
        zIndex: 1,
        flexShrink: 0,
        display: 'inline-flex',
        p: 1,
        m: -1,
        borderRadius: 'full',
        cursor: 'pointer',
        focusVisibleRing: 'outside',
      },
      '& .nde-header-info:is(:hover, [data-state="open"]) .tooltip-icon': {
        bg: 'blue.100',
        color: 'blue.500',
      },
      '& .nde-sort-icon': {
        flexShrink: 0,
        marginInlineStart: 'auto',
        '& path': { fill: 'gray.500' },
      },
      '& .nde-sort-icon[data-direction="asc"] [data-arrow="asc"], & .nde-sort-icon[data-direction="desc"] [data-arrow="desc"]':
        { fill: 'gray.800' },
      '& .nde-sort-icon[data-direction="asc"] [data-arrow="desc"], & .nde-sort-icon[data-direction="desc"] [data-arrow="asc"]':
        { fill: 'gray.300' },

      /* Pinned first column — only from `md` up, where there is room. */
      [`&[data-pinned] ${firstCells}`]: {
        position: { md: 'sticky' },
        insetInlineStart: { md: 0 },
        borderInlineEndWidth: { md: '1px' },
        borderInlineEndColor: 'gray.200',
      },
      '&[data-pinned] table td:first-child': { zIndex: { md: 1 } },
      '&[data-pinned] table th:first-child': { zIndex: { md: 3 } },
      // Its shadow, while columns can scroll under it: a strip just past each
      // cell's edge, rather than a `box-shadow` on the cell, which fades out at
      // the top and bottom of every row and so notched the column's edge.
      // Strips overlap the 1px row borders so they join up: the header's
      // reaches down over its own, each body row's up over the one above.
      // Reaching down instead would push the last row's (it has no border)
      // past the table and add a pixel of vertical scroll.
      [`${pinnedShadow} table th:first-child::after`]: {
        ...pinnedShadowStrip,
        top: 0,
        bottom: '-1px',
      },
      // Not on the status row: it spans every column, so its strip would
      // hang past the table's end and widen the scroll.
      [`${pinnedShadow} table td:first-child:not(.nde-status-cell)::after`]: {
        ...pinnedShadowStrip,
        top: '-1px',
        bottom: 0,
      },

      /* Synced scrollbars only exist while there is something to scroll. */
      '&:not([data-overflow-x]) .nde-synced-scrollbar': { display: 'none' },
      // Fixed to the window bottom and lined up with the viewport in JS (see
      // useScrollViewport): `sticky` would be captured by any ancestor with
      // `overflow: hidden`. Takes no layout space, so it never shifts the page.
      // Touch screens scroll by swiping, so it isn't shown there.
      '& .nde-floating-scrollbar': {
        position: 'fixed',
        bottom: 0,
        zIndex: 'sticky',
        visibility: 'hidden',
        bg: 'white',
        borderTopWidth: '1px',
        borderColor: 'gray.200',
        boxShadow: '0 -2px 6px rgba(0, 0, 0, 0.06)',
        '@media (hover: none)': { display: 'none' },
      },
      '&[data-floating] .nde-floating-scrollbar': { visibility: 'visible' },

      /* Loading indicator: rows are up and newer ones are loading. */
      // Centred just under the header, over the rows, in the root rather than
      // the viewport, so it stays put while the rows scroll either way. Fades
      // in after a short delay, so a quick refetch doesn't flash it.
      '& > .nde-table-loading': {
        position: 'absolute',
        top: 'calc(var(--nde-table-header-h, 0px) + 0.5rem)',
        left: '50%',
        transform: 'translateX(-50%)',
        // Above the sticky header cells (2) and the pinned header cell (3).
        zIndex: 4,
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        px: 3,
        py: 1,
        bg: 'white',
        borderWidth: '1px',
        borderColor: 'gray.200',
        borderRadius: 'full',
        boxShadow: 'sm',
        color: 'text.body',
        fontSize: 'sm',
        lineHeight: 'moderate',
        whiteSpace: 'nowrap',
        pointerEvents: 'none',
        animation: 'fade-in 0.2s ease-out 0.3s both',
      },

      /* Pager (client pagination): below the rows, inside the root. */
      '& > .nde-table-pager': {
        // Keeps its height when a bounded root shrinks the viewport.
        flexShrink: 0,
      },

      /* Tags (TagsCell): the repo's subtle, small, full-radius Tag look. */
      '& .nde-tags': {
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: 2,
      },
      // One element per tag (a table can hold thousands), clamped to a line.
      // A line clamp rather than `nowrap` + ellipsis: a clamped tag can still
      // wrap at spaces, so the column's minimum width is its longest word, not
      // its longest tag.
      '& .nde-tag': {
        lineClamp: 1,
        maxWidth: '100%',
        px: 2.5,
        borderRadius: 'full',
        bg: 'bg.alt',
        color: 'text.body',
        fontSize: 'sm',
        lineHeight: '24px',
      },
      // A search link tag (TagsCell's `getSearchHref`): the result cards'
      // searchable TagWithUrl (subtle primary `sm` Tag: its layout, corners,
      // colours and focus ring; a magnifying glass; the text underlined until
      // hovered), as plain elements, with the tag recipe's one-line label.
      '& .nde-tag-link': {
        colorPalette: 'primary',
        display: 'inline-flex',
        alignItems: 'center',
        gap: 1.5,
        maxWidth: '100%',
        minHeight: 6,
        px: 2.5,
        borderRadius: 'l2',
        bg: 'colorPalette.subtle',
        color: 'colorPalette.fg',
        lineHeight: 'shorter',
        verticalAlign: 'top',
        userSelect: 'none',
        textUnderlineOffset: '0.15rem',
        focusVisibleRing: 'outside',
      },
      '& .nde-tag-link-icon': {
        flexShrink: 0,
        boxSize: 3,
        marginInlineStart: '-2px',
      },
      '& .nde-tag-link-label': { lineClamp: 1, textStyle: 'sm' },
      '& .nde-tag-link-label > span': { textDecoration: 'underline' },
      '& .nde-tag-link:hover .nde-tag-link-label > span': {
        textDecorationColor: 'transparent',
      },

      /* Status rows (loading/empty/error) span the visible width, not the full scroll width. */
      '& .nde-status-cell > div': {
        position: 'sticky',
        insetInlineStart: 0,
        width: 'var(--nde-table-viewport-w, 100%)',
        maxWidth: '100%',
        py: 10,
        px: 4,
      },
    },
    viewport: {
      flex: '1 1 auto',
      minHeight: 0,
      overflow: 'auto',
      // The scroller's own opaque background is what lets Chrome scroll it on
      // the compositor at 1x pixel density (it won't otherwise, to keep LCD
      // text). Without it (the root's white isn't enough) every scroll step
      // repaints and re-layerizes the visible table on the main thread: 30
      // dropped frames per vertical scroll at 4x CPU instead of 15, and
      // horizontal p95 33 ms instead of 17. Measured 2026-11-09.
      bg: 'white',
      // A sideways swipe shouldn't trigger the browser's back gesture.
      overscrollBehaviorX: 'contain',
      scrollPaddingTop: 'var(--nde-table-header-h, 0px)',
      scrollPaddingInlineStart: 'var(--nde-table-pinned-w, 0px)',
      focusVisibleRing: 'inside',
      ...viewportScrollbarStyles,
    },
    table: {
      width: '100%',
      // `separate` + no spacing: with `collapse`, borders on sticky cells
      // scroll away from the cells they belong to.
      borderCollapse: 'separate',
      borderSpacing: 0,
      fontSize: 'sm',
      lineHeight: 'moderate',
      fontVariantNumeric: 'lining-nums tabular-nums',
    },
    scrollbar: {
      height: '12px',
      // The root is a flex column: when it's bounded, its children shrink in
      // proportion to their size, and a scroller's flex minimum is 0. Without
      // this the top scrollbar shrank to under a pixel next to a tall viewport.
      flexShrink: 0,
      overflowX: 'auto',
      overflowY: 'hidden',
      ...syncedScrollbarStyles,
    },
  },
});
