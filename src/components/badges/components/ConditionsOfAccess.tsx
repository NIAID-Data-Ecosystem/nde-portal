import { FormattedResource } from 'src/utils/api/types';
import { Icon } from '@chakra-ui/react';
import { FaLock, FaUnlock } from 'react-icons/fa6';
import { BadgeWithTooltip, BadgeWithTooltipProps } from 'src/components/badges';
import SchemaDefinitions from 'configs/schema-definitions.json';

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
    if (conditionsOfAccess === 'Open') {
      return 'green';
    } else if (conditionsOfAccess === 'Restricted') {
      return 'red';
    } else if (conditionsOfAccess === 'Controlled') {
      return 'gray';
    } else if (
      conditionsOfAccess === 'Embargoed' ||
      conditionsOfAccess === 'Varied'
    ) {
      return 'orange';
    } else {
      return 'gray';
    }
  };

  const getIcon = (
    conditionsOfAccess: ConditionsOfAccessProps['conditionsOfAccess'],
  ) => {
    if (conditionsOfAccess === 'Open') {
      return <Icon as={FaUnlock}></Icon>;
    } else if (
      conditionsOfAccess === 'Restricted' ||
      conditionsOfAccess === 'Controlled' ||
      conditionsOfAccess === 'Embargoed'
    ) {
      return <Icon as={FaLock}></Icon>;
    } else if (conditionsOfAccess === 'Varied') {
      return <Icon as={FaUnlock}></Icon>;
    }
  };
  return (
    <BadgeWithTooltip
      colorScheme={getColorScheme(conditionsOfAccess)}
      value={conditionsOfAccess}
      tooltipLabel={property?.description[type]}
      leftIcon={getIcon(conditionsOfAccess)}
      {...props}
    />
  );
};
