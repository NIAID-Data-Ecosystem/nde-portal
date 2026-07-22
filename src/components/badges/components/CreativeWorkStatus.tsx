import { FormattedResource } from 'src/utils/api/types';
import { BadgeWithTooltip, BadgeWithTooltipProps } from 'src/components/badges';
import { SHOW_RETIRED_RESOURCE_CATALOG_UI } from 'src/utils/feature-flags';

interface CreativeWorkStatusProps extends Omit<BadgeWithTooltipProps, 'value'> {
  creativeWorkStatus?: FormattedResource['creativeWorkStatus'];
  type?: FormattedResource['@type'];
}

// Only renders when the resource has been retired. All other
// creativeWorkStatus values (Draft, Active, Maintenance, etc.) render
// nothing, since only "Retired" currently has an associated badge.
// Gated behind SHOW_RETIRED_RESOURCE_CATALOG_UI until the retired-resource
// treatment is approved for production.
export const CreativeWorkStatus = ({
  creativeWorkStatus,
  type,
  ...props
}: CreativeWorkStatusProps) => {
  if (!SHOW_RETIRED_RESOURCE_CATALOG_UI || creativeWorkStatus !== 'Retired') {
    return <></>;
  }

  return (
    <BadgeWithTooltip
      colorScheme='red'
      value='Retired'
      tooltipLabel='The resource is no longer available.'
      {...props}
    />
  );
};
