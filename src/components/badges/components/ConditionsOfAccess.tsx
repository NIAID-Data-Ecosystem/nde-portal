import { FormattedResource } from 'src/utils/api/types';
import { BadgeWithTooltip, BadgeWithTooltipProps } from 'src/components/badges';
import SchemaDefinitions from 'configs/schema-definitions.json';
import {
  getColorScheme,
  transformConditionsOfAccessLabel,
} from 'src/utils/formatting/formatConditionsOfAccess';

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

  return (
    <BadgeWithTooltip
      colorScheme={getColorScheme(conditionsOfAccess)}
      value={transformConditionsOfAccessLabel(conditionsOfAccess)}
      tooltipLabel={property?.description[type]}
      {...props}
    />
  );
};
