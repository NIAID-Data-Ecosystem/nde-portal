import { FormattedResource } from 'src/utils/api/types';
import { BadgeWithTooltip, BadgeWithTooltipProps } from 'src/components/badges';
import SchemaDefinitions from 'configs/schema-definitions.json';

interface CreativeWorkStatusProps extends Omit<BadgeWithTooltipProps, 'value'> {
  creativeWorkStatus?: FormattedResource['creativeWorkStatus'];
  type?: FormattedResource['@type'];
}

// Only renders when the resource has been retired. All other
// creativeWorkStatus values (Draft, Active, Maintenance, etc.) render
// nothing, since only "Retired" currently has an associated badge.
export const CreativeWorkStatus = ({
  creativeWorkStatus,
  type,
  ...props
}: CreativeWorkStatusProps) => {
  if (creativeWorkStatus !== 'Retired') {
    return <></>;
  }

  const property = SchemaDefinitions['creativeWorkStatus'];

  return (
    <BadgeWithTooltip
      colorScheme='red'
      value='Retired'
      tooltipLabel={
        type
          ? property?.description?.[
              type as keyof (typeof property)['description']
            ] || ''
          : ''
      }
      {...props}
    />
  );
};
