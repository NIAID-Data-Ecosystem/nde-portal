import React from 'react';

import { muted, visuallyHidden } from './styles';

/**
 * The placeholder for a genuinely missing value. The dash is decorative, so a
 * screen reader hears "No data" once rather than "dash, No data".
 */
export const EmptyValue = () => (
  <>
    <span aria-hidden='true' style={muted}>
      —
    </span>
    <span style={visuallyHidden}>No data</span>
  </>
);
