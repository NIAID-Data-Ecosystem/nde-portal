import {
  defaultConfig,
  defineSlotRecipe,
  mergeConfigs,
  type SlotRecipeConfig,
  type SystemConfig,
  type SystemStyleObject,
} from '@chakra-ui/react';

import { tagSlotRecipe } from './tag.slot-recipe';

/*
Styles for src/components/table/data-table.

The table renders plain <table>/<th>/<td> elements and styles them all from
this recipe's `root` slot with descendant selectors, rather than giving every
cell its own styled component: a populated table holds ~1,000 cells, and one
class on the root costs the same whatever the row count. State lives in data
attributes the component sets on the root:

  data-pinned        first column pinned (only from `md` up)
  data-interactive   rows highlight on hover
  data-column-border lines between columns
  data-overflow-x    content is wider than the viewport
  data-floating      the floating scrollbar is showing (native one off-screen)

and CSS variables it measures: --nde-table-header-h, --nde-table-pinned-w,
--nde-table-viewport-w.

The visuals follow the tables this replaces: uppercase grey bold headers, a
`bg.alt` header for the sorted column, `table.stripe` zebra rows, 1rem
horizontal cell padding.

The root sets a `colorPalette` (`primary` unless the `colorPalette` prop says
otherwise). Like Chakra's Table, the palette only drives the interactive
accents: row and header hover, the pressed header, the table's focus rings and
the loading spinner. The structure (stripes, borders, the sorted header, the
header text) stays neutral. Content in the cells that has no palette of its own
inherits it too.
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
TagsCell's tags are plain elements, not Chakra `Tag`s (a table can hold
thousands; see TagsCell), but their styles come from the tag recipe rather than
a copy of it, so they follow it when it changes. The recipe is Chakra's with the
repo's merged over it, as `createSystem` merges them, and a slot's styles are
resolved for a variant selection the way a `Tag` resolves them: the base, each
selected variant, then any matching compound variant. `mergeConfigs` is Chakra's
own deep merge, the one `createSystem` and the recipes use.
*/
const mergeStyles = (...styles: (SystemStyleObject | undefined)[]) =>
  mergeConfigs(
    ...(styles.filter(Boolean) as SystemConfig[]),
  ) as SystemStyleObject;

const tagRecipe = mergeConfigs(
  {
    theme: {
      slotRecipes: {
        tag: defaultConfig.theme?.slotRecipes?.tag as SlotRecipeConfig,
      },
    },
  },
  { theme: { slotRecipes: { tag: tagSlotRecipe } } },
).theme?.slotRecipes?.tag as SlotRecipeConfig;

const tagSlotStyles = (
  slot: 'root' | 'startElement' | 'label',
  selection: Record<string, string>,
) => {
  const { base, variants = {}, compoundVariants = [] } = tagRecipe;
  const compounds = compoundVariants.filter(({ css: _css, ...conditions }) =>
    Object.entries(conditions).every(([key, value]) =>
      Array.isArray(value)
        ? value.includes(selection[key])
        : value === selection[key],
    ),
  );
  return mergeStyles(
    base?.[slot],
    ...Object.entries(selection).map(
      ([key, value]) => variants[key]?.[value]?.[slot],
    ),
    ...compounds.map(({ css }) => css?.[slot]),
  );
};

// Both kinds of table tag are `<Tag variant='subtle' size='sm'>`s: the legacy
// Repository Matcher's tags and `TagWithUrl`.
const TAG_VARIANTS = { variant: 'subtle', size: 'sm' };

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
      // The accents' palette (see the top of this file). The `colorPalette`
      // prop, a style prop on the same element, overrides it.
      colorPalette: 'primary',
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
      // The full width of its container, whatever the parent's layout. A
      // block parent already gives it that, but a flex row (or a column that
      // centres its children) shrinks it to its content when few columns
      // show, leaving the table narrower than the toolbar above it.
      width: '100%',
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
        bg: 'colorPalette.50/50',
      },
      '& table :is(th, td)[data-align="end"]': { textAlign: 'end' },
      '& table td[data-wrap="anywhere"]': { overflowWrap: 'anywhere' },
      '& table td[data-wrap="nowrap"]': { whiteSpace: 'nowrap' },
      '& table tbody tr:last-of-type > td': { borderBottomWidth: 0 },
      // Lines between columns (`showColumnBorder`), like Chakra's Table. Each
      // takes its cell's border colour, so it matches the row lines: `gray.100`
      // in the body, `gray.200` in the header. None after the last column,
      // where the root's border already is; the status cell spans every column,
      // so it's the last and gets none either.
      '&[data-column-border] table :is(th, td):not(:last-child)': {
        borderInlineEndWidth: '1px',
      },

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
        // All sides, not just the bottom: column borders take it too.
        borderColor: 'gray.200',
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
          bg: 'colorPalette.50',
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
        bg: 'colorPalette.100',
      },
      // The info icon (InfoLabel's): above the sort hit area, so it never
      // sorts; a 26px target around the 14px icon; InfoLabel's blue on hover
      // and while the tooltip is open (from either trigger). Its focus ring is
      // the table's, like the sort button's beside it.
      '& .nde-header-info': {
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
        // `md` only, like the width: below it, column borders keep this edge
        // the same colour as the others.
        borderInlineEndColor: { md: 'gray.200' },
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

      /* Tags (TagsCell). */
      '& .nde-tags': {
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: 2,
      },
      // A plain tag: a `Tag.Root` and its `Tag.Label`, styled by the tag
      // recipe (see `tagSlotStyles`), with the legacy Repository Matcher's
      // overrides: full corners and neutral colours. The recipe's label is
      // clamped to a line, which still lets it wrap at spaces, so a column's
      // minimum width is its longest word, not its longest tag.
      '& .nde-tag': {
        ...tagSlotStyles('root', TAG_VARIANTS),
        borderRadius: 'full',
        bg: 'bg.alt',
        color: 'text.body',
      },
      '& .nde-tag-label': tagSlotStyles('label', TAG_VARIANTS),
      // A search link tag (TagsCell's `getSearchHref`): the result cards'
      // searchable `TagWithUrl`, built the same way: the tag recipe's root,
      // start element (the magnifying glass) and label, then what TagWithUrl
      // adds itself: the primary palette, `lineHeight='shorter'` and the value
      // underlined until the tag is hovered. The label keeps the recipe's
      // one-line clamp, where TagWithUrl's is inline.
      '& .nde-tag-link': {
        ...tagSlotStyles('root', TAG_VARIANTS),
        colorPalette: 'primary',
        lineHeight: 'shorter',
      },
      '& .nde-tag-link-start': tagSlotStyles('startElement', TAG_VARIANTS),
      '& .nde-tag-link-label': tagSlotStyles('label', TAG_VARIANTS),
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
