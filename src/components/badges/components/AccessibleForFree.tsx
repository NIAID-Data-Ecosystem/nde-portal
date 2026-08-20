import { FormattedResource } from 'src/utils/api/types';
import { BadgeWithTooltip, BadgeWithTooltipProps } from 'src/components/badges';

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
    return (
      <BadgeWithTooltip
        colorScheme={isAccessibleForFree ? 'green' : 'gray'}
        value={isAccessibleForFree ? 'No Cost Access' : 'Paid  Access'}
        tooltipLabel={
          isAccessibleForFree
            ? 'The resource is accessible for free.'
            : 'The resource is not accessible for free.'
        }
        {...props}
      />
    );
  }
  return <></>;
};
