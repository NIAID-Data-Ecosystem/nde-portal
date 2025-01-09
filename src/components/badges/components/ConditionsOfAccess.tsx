import { FormattedResource } from 'src/utils/api/types';
import { Icon } from '@chakra-ui/react';
import { FaLock, FaUnlock } from 'react-icons/fa6';
import { BadgeWithTooltip, BadgeWithTooltipProps } from 'src/components/badges';
import SchemaDefinitions from 'configs/schema-definitions.json';
import { transformConditionsOfAccessLabel } from 'src/utils/formatting/formatConditionsOfAccess';

interface ConditionsOfAccessProps extends Omit<BadgeWithTooltipProps, 'value'> {
  conditionsOfAccess?: FormattedResource['conditionsOfAccess'];
  type?: FormattedResource['@type'];
  tooltipLabel?: string;
}

export const ConditionsOfAccess = ({
  conditionsOfAccess,
  type,
  ...props
}: ConditionsOfAccessProps) => {
  if (!conditionsOfAccess || !type) {
    return <></>;
  }

  const property = SchemaDefinitions['conditionsOfAccess'];

  const getColorScheme = (
    conditionsOfAccess: ConditionsOfAccessProps['conditionsOfAccess'],
  ) => {
    if (conditionsOfAccess?.includes('Open')) {
      return 'green';
    } else if (conditionsOfAccess?.includes('Restricted')) {
      return 'red';
    } else if (
      conditionsOfAccess?.includes('Controlled') ||
      conditionsOfAccess?.includes('Unknown') ||
      conditionsOfAccess?.includes('Registered')
    ) {
      return 'gray';
    } else if (
      conditionsOfAccess?.includes('Embargoed') ||
      conditionsOfAccess?.includes('Varied')
    ) {
      return 'orange';
    } else {
      return 'gray';
    }
  };

  const getIcon = (
    conditionsOfAccess: ConditionsOfAccessProps['conditionsOfAccess'],
  ) => {
    if (conditionsOfAccess?.includes('Open')) {
      return <Icon as={FaUnlock}></Icon>;
    } else if (
      conditionsOfAccess?.includes('Embargoed') ||
      conditionsOfAccess?.includes('Registered') ||
      conditionsOfAccess?.includes('Restricted') ||
      conditionsOfAccess?.includes('Controlled')
    ) {
      return <Icon as={FaLock}></Icon>;
    } else if (
      conditionsOfAccess?.includes('Varied') ||
      conditionsOfAccess?.includes('Unknown')
    ) {
      return <Icon as={FaUnlock}></Icon>;
    }
  };
  return (
    <BadgeWithTooltip
      colorScheme={getColorScheme(conditionsOfAccess)}
      value={transformConditionsOfAccessLabel(conditionsOfAccess)}
      tooltipLabel={property?.description[type]}
      leftIcon={getIcon(conditionsOfAccess)}
      {...props}
    />
  );
};
