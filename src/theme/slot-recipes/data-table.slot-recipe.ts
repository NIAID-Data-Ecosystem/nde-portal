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
  data-at-start/end  horizontal scroll position
  data-floating      the floating scrollbar is showing (native one off-screen)

and CSS variables it measures: --nde-table-header-h, --nde-table-pinned-w,
--nde-table-viewport-w, --nde-table-scrollbar-w.

The visuals follow the tables this replaces: uppercase grey bold headers, a
`bg.alt` header for the sorted column, `table.stripe` zebra rows, 1rem
horizontal cell padding.
*/

const scrollbarStyles = {
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
      [`&[data-pinned][data-overflow-x]:not([data-at-start]) ${firstCells}`]: {
        boxShadow: { md: '4px 0 6px -4px rgba(0, 0, 0, 0.2)' },
      },

      /* Off-screen columns: fade the right edge while there is more to see. */
      '&[data-overflow-x]:not([data-at-end])::after': {
        content: '""',
        position: 'absolute',
        top: 0,
        bottom: 0,
        insetInlineEnd: 'var(--nde-table-scrollbar-w, 0px)',
        width: 6,
        pointerEvents: 'none',
        bgImage: 'linear-gradient(to left, rgba(0, 0, 0, 0.07), transparent)',
        zIndex: 4,
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

      /* Pager (client pagination): below the rows, inside the root. */
      '& > .nde-table-pager': {
        // Keeps its height when a bounded root shrinks the viewport.
        flexShrink: 0,
        // Above the right-edge fade, which spans the root's full height.
        position: 'relative',
        zIndex: 5,
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
      ...scrollbarStyles,
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
      ...scrollbarStyles,
    },
  },
});
