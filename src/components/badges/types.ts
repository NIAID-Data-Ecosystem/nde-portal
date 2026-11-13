import type { BadgeProps } from '@chakra-ui/react';

/**
 * The presentation of a single metadata value as a badge: the text on it, the
 * color it carries, and the sentence its tooltip explains it with.
 *
 * Every badge in this folder resolves its metadata value to one of these (see
 * `./config`), so re-wording copy or recoloring a badge is a data change rather
 * than a code change.
 */
export interface BadgePreset {
  /** Text rendered inside the badge. */
  label: string;
  colorPalette: BadgeProps['colorPalette'];
  /** Tooltip copy explaining what the value means. */
  tooltip: string;
}
