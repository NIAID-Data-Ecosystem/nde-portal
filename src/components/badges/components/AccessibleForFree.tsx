import { FormattedResource } from 'src/utils/api/types';
import { Icon } from '@chakra-ui/react';
import { FaDollarSign } from 'react-icons/fa6';
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
        variant='solid'
        fontWeight='semibold'
        bg={isAccessibleForFree ? 'green.600' : 'gray.800'}
        value={isAccessibleForFree ? 'Free Access' : 'Paid  Access'}
        tooltipLabel={property?.description[type]}
        leftIcon={<Icon as={FaDollarSign}></Icon>}
        {...props}
      />
    );
  }
  return <></>;
};
