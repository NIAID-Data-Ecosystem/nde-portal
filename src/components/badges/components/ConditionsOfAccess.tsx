import { FormattedResource } from 'src/utils/api/types';
import { Icon } from 'nde-design-system';
import { FaLock, FaUnlock } from 'react-icons/fa6';
import { BadgeWithTooltip, BadgeWithTooltipProps } from 'src/components/badges';
import MetadataConfig from 'configs/resource-metadata.json';

interface ConditionsOfAccessProps extends Omit<BadgeWithTooltipProps, 'value'> {
  conditionsOfAccess?: FormattedResource['conditionsOfAccess'];
  tooltipLabel?: string;
}

export const ConditionsOfAccess = ({
  conditionsOfAccess,
  ...props
}: ConditionsOfAccessProps) => {
  if (!conditionsOfAccess) {
    return <></>;
  }

  const property = MetadataConfig.find(
    d => d.property === 'conditionsOfAccess',
  );

  const getColorScheme = (
    conditionsOfAccess: ConditionsOfAccessProps['conditionsOfAccess'],
  ) => {
    if (conditionsOfAccess === 'Open') {
      return 'green';
    } else if (conditionsOfAccess === 'Restricted') {
      return 'red';
    } else if (conditionsOfAccess === 'Controlled') {
      return 'gray';
    } else if (conditionsOfAccess === 'Embargoed') {
      return 'orange';
    } else {
      return 'gray';
    }
  };

  const getIcon = (
    conditionsOfAccess: ConditionsOfAccessProps['conditionsOfAccess'],
  ) => {
    if (conditionsOfAccess === 'Open') {
      return FaUnlock;
    } else if (
      conditionsOfAccess === 'Restricted' ||
      conditionsOfAccess === 'Controlled' ||
      conditionsOfAccess === 'Embargoed'
    ) {
      return FaLock;
    }
  };
  return (
    <BadgeWithTooltip
      colorScheme={getColorScheme(conditionsOfAccess)}
      value={conditionsOfAccess}
      tooltipLabel={property?.description['dataset']}
      leftIcon={<Icon as={getIcon(conditionsOfAccess)}></Icon>}
      {...props}
    />
  );
};
