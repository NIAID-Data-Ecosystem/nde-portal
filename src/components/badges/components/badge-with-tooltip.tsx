import { Badge, BadgeProps } from '@chakra-ui/react';
import Tooltip, { TooltipProps } from 'src/components/tooltip';

import type { BadgePreset } from '../types';

export interface BadgeWithTooltipProps extends BadgeProps {
  /** Label, color and tooltip copy for a known metadata value — see `../config`. */
  preset?: BadgePreset;
  /** Tooltip overrides. An explicit `content` wins over `preset.tooltip`. */
  tooltipProps?: Partial<TooltipProps>;
}

/**
 * Props accepted by every metadata badge in this folder: any `Badge` or tooltip
 * override, minus the parts the badge resolves from its own metadata value.
 */
export type MetadataBadgeProps = Omit<
  BadgeWithTooltipProps,
  'preset' | 'children'
>;

/**
 * A badge that explains itself on hover. Either pass `children` and
 * `tooltipProps.content` directly, or hand it a `preset` and let it supply the
 * label, color and tooltip copy. Explicit props always win, so callers can
 * recolor a preset badge.
 */
export const BadgeWithTooltip = ({
  children,
  preset,
  tooltipProps,
  variant = 'subtle',
  ...rest
}: BadgeWithTooltipProps) => {
  return (
    <Tooltip
      {...tooltipProps}
      content={tooltipProps?.content ?? preset?.tooltip}
    >
      <Badge variant={variant} colorPalette={preset?.colorPalette} {...rest}>
        {children ?? preset?.label}
      </Badge>
    </Tooltip>
  );
};
