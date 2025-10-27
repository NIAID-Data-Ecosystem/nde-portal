import SchemaDefinitions from 'configs/schema-definitions.json';
import {
  TagWithTooltip,
  TagWithTooltipProps,
} from 'src/components/tag-with-tooltip';
import { FormattedResource } from 'src/utils/api/types';
import {
  getColorScheme,
  transformConditionsOfAccessLabel,
} from 'src/utils/formatting/formatConditionsOfAccess';

interface ConditionsOfAccessProps extends Omit<TagWithTooltipProps, 'value'> {
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
    <TagWithTooltip
      colorPalette={getColorScheme(conditionsOfAccess)}
      tooltipContent={property?.description[type]}
      {...props}
    >
      {transformConditionsOfAccessLabel(conditionsOfAccess)}
    </TagWithTooltip>
  );
};
