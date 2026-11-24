import React from 'react';
import {
  BadgeWithTooltip,
  getConditionsOfAccessPreset,
} from 'src/components/badges';
import type { AccessTypes } from 'src/utils/api/types';

import { EmptyValue } from './EmptyValue';

/**
 * Conditions of Access as the result cards show it: a coloured badge with an
 * explanatory tooltip. The "No data" placeholder when there's no value.
 */
export const AccessBadgeCell = ({ value }: { value?: AccessTypes | null }) =>
  value ? (
    <BadgeWithTooltip preset={getConditionsOfAccessPreset(value)} />
  ) : (
    <EmptyValue />
  );
