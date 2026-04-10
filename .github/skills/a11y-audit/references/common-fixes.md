# Common A11y Fixes for This Codebase

## Icon-Only Buttons

React Icons render `<svg>` with no accessible text. Any button containing only
an icon needs `aria-label`.

```tsx
// ❌ axe: button-name violation
<IconButton onClick={onCopy}>
  <FiCopy />
</IconButton>

// ✅
<IconButton aria-label='Copy to clipboard' onClick={onCopy}>
  <FiCopy aria-hidden='true' />
</IconButton>
```

## Color-Only Status

`StatusDot` and similar badge-only indicators convey information with color
alone (WCAG 1.4.1). Pair with visually-hidden text or `aria-label`.

```tsx
// ❌ Color alone
<Box bg={PAGE_STATUS_COLORS[status]} borderRadius='full' w='10px' h='10px' />

// ✅ Supplement with visually-hidden label
<Box role='img' aria-label={`Status: ${PAGE_STATUS_LABELS[status]}`}
  bg={PAGE_STATUS_COLORS[status]} borderRadius='full' w='10px' h='10px' />
```

## Chakra Collapse / Accordion (Disclosure)

Chakra's `useDisclosure` + `<Collapse>` requires manual ARIA wiring.

```tsx
const { isOpen, onToggle } = useDisclosure();
const contentId = useId();

// ❌ No accessible relationship
<Button onClick={onToggle}><FiChevronDown /></Button>
<Collapse in={isOpen}>...</Collapse>

// ✅
<Button
  onClick={onToggle}
  aria-expanded={isOpen}
  aria-controls={contentId}
  aria-label='Toggle page list'
>
  <FiChevronDown aria-hidden='true' />
</Button>
<Collapse in={isOpen} id={contentId}>...</Collapse>
```

## Interactive Tables

Tables with sortable headers or row actions need proper ARIA.

```tsx
// Sortable column header
<Th
  as='button'
  aria-sort={
    sortDir === 'asc' ? 'ascending' : sortDir === 'desc' ? 'descending' : 'none'
  }
>
  Name
</Th>
```

## Semantic Headings

Never skip heading levels. `<Heading as='h3'>` inside a section that already has
`<h2>` is fine; jumping from `<h2>` to `<h4>` is not.

## Live Regions for Dynamic Content

Search results and loading states should notify screen readers.

```tsx
// Search result count update
<Box aria-live='polite' aria-atomic='true'>
  {isLoading ? 'Loading…' : `${total} results`}
</Box>
```

## Form Labels

Every `<Input>` needs a visible label or `aria-label`/`aria-labelledby`.
Placeholder text does not count.

```tsx
// ❌
<Input placeholder='Search datasets' />

// ✅ with visible label
<FormControl>
  <FormLabel>Search datasets</FormLabel>
  <Input />
</FormControl>

// ✅ without visible label
<Input aria-label='Search datasets' placeholder='Search datasets' />
```

## Focus Trap in Modals and Drawers

Use Chakra's `<Modal>` and `<Drawer>` built-ins — they handle focus trap
automatically. Custom overlay components must use `focus-trap-react` or
equivalent.

## Canvas-Backed Visualizations (@visx)

visx renders to `<canvas>` or `<svg>`. For `<canvas>` charts:

- Provide a fallback `<table>` or `role='img'` with `aria-label` describing the
  data
- SVG charts: add `<title>` and `<desc>` as first children, reference with
  `aria-labelledby` and `aria-describedby`

```tsx
<svg role='img' aria-labelledby='chart-title chart-desc'>
  <title id='chart-title'>Uptime over 90 days</title>
  <desc id='chart-desc'>Bar chart showing daily operational status</desc>
  {/* ...bars */}
</svg>
```

## jsdom Test Setup Notes

- `HTMLCanvasElement.prototype.getContext = () => null` — already in
  `jest.setup.js`
- `IntersectionObserver` — already mocked in `jest.setup.js`
- `next/router` — mocked via `next-router-mock` in `jest.setup.js`
- `usePageAvailability` — mock per-test:
  `jest.mock('src/hooks/usePageAvailability', () => ({ usePageAvailability: () => ({}) }))`
