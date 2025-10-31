import SchemaDefinitions from 'configs/schema-definitions.json';
import { Tag, TagProps } from 'src/components/tag';
import { FormattedResource } from 'src/utils/api/types';
import {
  getColorScheme,
  transformConditionsOfAccessLabel,
} from 'src/utils/formatting/formatConditionsOfAccess';

interface ConditionsOfAccessProps extends TagProps {
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
    <Tag
      colorPalette={getColorScheme(conditionsOfAccess)}
      tooltipProps={{ content: property?.description[type] }}
      {...props}
    >
      {transformConditionsOfAccessLabel(conditionsOfAccess)}
    </Tag>
  );
};
