import type { CreativeWorkStatusDatasetType } from 'src/hooks/api/types';
import type { AccessTypes, FormattedResource } from 'src/utils/api/types';
import {
  getColorPalette,
  getConditionsOfAccessTooltip,
  transformConditionsOfAccessLabel,
} from 'src/utils/formatting/formatConditionsOfAccess';

import type { BadgePreset } from './types';

/**
 * Badge copy and coloring, keyed by the metadata value it describes.
 *
 * Values that map to a fixed set of badges live in a lookup below. Values whose
 * badge is derived elsewhere (conditions of access) or partly dynamic (has
 * download) get a `get*Preset` helper instead, so the components stay free of
 * branching.
 */

/** `isAccessibleForFree` — whether the resource costs money to use. */
export const ACCESSIBLE_FOR_FREE: Record<'free' | 'paid', BadgePreset> = {
  free: {
    label: 'No Cost Access',
    colorPalette: 'green',
    tooltip: 'The resource is accessible for free.',
  },
  paid: {
    label: 'Paid Access',
    colorPalette: 'gray',
    tooltip: 'The resource is not accessible for free.',
  },
};

/** `hasAPI` — whether the resource can be queried programmatically. */
export const HAS_API: Record<'available' | 'unavailable', BadgePreset> = {
  available: {
    label: 'API Available',
    colorPalette: 'green',
    tooltip: 'The resource supports programmatic access to data.',
  },
  unavailable: {
    label: 'API Not Available',
    colorPalette: 'gray',
    tooltip: 'The resource does not support programmatic access to data.',
  },
};

/**
 * `creativeWorkStatus` — only "Retired" carries a badge today. Give another
 * status a badge by adding an entry here; the component needs no change.
 */
export const CREATIVE_WORK_STATUS: Partial<
  Record<CreativeWorkStatusDatasetType, BadgePreset>
> = {
  Retired: {
    label: 'Retired',
    colorPalette: 'red',
    tooltip: 'The resource is no longer available.',
  },
};

/**
 * `hasDownload` — how much of the resource can be downloaded. Keyed by the
 * lowercased API value, since the casing the API sends is not guaranteed; the
 * label spells the value back out in its canonical casing.
 */
type HasDownloadKey = Lowercase<FormattedResource['hasDownload']>;

const HAS_DOWNLOAD: Record<HasDownloadKey, BadgePreset> = {
  'all content': {
    label: 'Has Download: All content',
    colorPalette: 'green',
    tooltip: 'The resource allows download of all content.',
  },
  'partial content': {
    label: 'Has Download: Partial content',
    colorPalette: 'green',
    tooltip: 'The resource allows download of part of the content.',
  },
  'record-level': {
    label: 'Has Download: Record-level',
    colorPalette: 'green',
    tooltip:
      'The resource allows download of individual records, or selections of records.',
  },
  'no downloads': {
    label: 'Has Download: No downloads',
    colorPalette: 'gray',
    tooltip: 'Content is not downloadable.',
  },
};

/**
 * Unrecognized values still render — the record reported something, so say what
 * it was — but there is no copy to explain them with.
 */
export const getHasDownloadPreset = (
  hasDownload: FormattedResource['hasDownload'],
): BadgePreset =>
  HAS_DOWNLOAD[hasDownload?.toLowerCase() as HasDownloadKey] ?? {
    label: `Has Download: ${hasDownload}`,
    colorPalette: 'gray',
    tooltip: '',
  };

/**
 * `conditionsOfAccess` — built from the shared formatter rather than a lookup
 * here, because the search filters and disease charts label and explain the
 * same values and must not drift from the badge.
 */
export const getConditionsOfAccessPreset = (
  conditionsOfAccess: AccessTypes,
): BadgePreset => ({
  label: transformConditionsOfAccessLabel(conditionsOfAccess),
  colorPalette: getColorPalette(conditionsOfAccess),
  tooltip: getConditionsOfAccessTooltip(conditionsOfAccess),
});
