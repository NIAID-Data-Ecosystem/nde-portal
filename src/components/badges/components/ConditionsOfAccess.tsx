import { FormattedResource } from 'src/utils/api/types';
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

  return (
    <BadgeWithTooltip
      colorScheme={getColorScheme(conditionsOfAccess)}
      value={transformConditionsOfAccessLabel(conditionsOfAccess)}
      tooltipLabel={property?.description[type]}
      {...props}
    />
  );
};
