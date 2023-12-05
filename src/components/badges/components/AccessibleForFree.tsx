import { FormattedResource } from 'src/utils/api/types';
import { Icon } from 'nde-design-system';
import { FaDollarSign } from 'react-icons/fa6';
import { BadgeWithTooltip, BadgeWithTooltipProps } from 'src/components/badges';
import MetadataConfig from 'configs/resource-metadata.json';

interface AccessibleForFreeProps extends Omit<BadgeWithTooltipProps, 'value'> {
  isAccessibleForFree?: FormattedResource['isAccessibleForFree'];
  tooltipLabel?: string;
}

export const AccessibleForFree = ({
  isAccessibleForFree,
  ...props
}: AccessibleForFreeProps) => {
  if (isAccessibleForFree === true || isAccessibleForFree === false) {
    const property = MetadataConfig.find(
      d => d.property === 'isAccessibleForFree',
    );
    return (
      <BadgeWithTooltip
        variant='solid'
        fontWeight='semibold'
        colorScheme={isAccessibleForFree ? 'green' : 'gray'}
        value={isAccessibleForFree ? 'Free Access' : 'Paid  Access'}
        tooltipLabel={property?.description['dataset']}
        leftIcon={<Icon as={FaDollarSign}></Icon>}
        {...props}
      />
    );
  }
  return <></>;
};
