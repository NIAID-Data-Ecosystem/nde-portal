import type React from 'react';

/*
Plain elements with inline styles rather than Chakra components: a populated
table renders hundreds of these (and thousands of tags), and a styled component
per instance was most of the native table's mount cost. Inline style objects
are shared constants, so they work anywhere and cost one attribute each.
*/
export const visuallyHidden: React.CSSProperties = {
  position: 'absolute',
  width: 1,
  height: 1,
  padding: 0,
  margin: -1,
  overflow: 'hidden',
  clip: 'rect(0, 0, 0, 0)',
  whiteSpace: 'nowrap',
  borderWidth: 0,
};
export const muted: React.CSSProperties = {
  color: 'var(--chakra-colors-fg-muted)',
};
