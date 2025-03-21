import { FormattedResource } from 'src/utils/api/types';
import { BadgeWithTooltip, BadgeWithTooltipProps } from 'src/components/badges';
import SchemaDefinitions from 'configs/schema-definitions.json';

interface AccessibleForFreeProps extends Omit<BadgeWithTooltipProps, 'value'> {
  isAccessibleForFree?: FormattedResource['isAccessibleForFree'];
  type?: FormattedResource['@type'];
  tooltipLabel?: string;
}

export const AccessibleForFree = ({
  isAccessibleForFree,
  type,
  ...props
}: AccessibleForFreeProps) => {
  if ((isAccessibleForFree === true || isAccessibleForFree === false) && type) {
    const property = SchemaDefinitions['isAccessibleForFree'];
    return (
      <BadgeWithTooltip
        colorScheme={isAccessibleForFree ? 'green' : 'gray'}
        value={isAccessibleForFree ? 'No Cost Access' : 'Paid  Access'}
        tooltipLabel={property?.description[type]}
        {...props}
      />
    );
  }
  return <></>;
};
