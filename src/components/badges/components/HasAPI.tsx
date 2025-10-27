import SchemaDefinitions from 'configs/schema-definitions.json';
import { SchemaDefinitions as SchemaDefinitionsType } from 'scripts/generate-schema-definitions/types';
import {
  TagWithTooltip,
  TagWithTooltipProps,
} from 'src/components/tag-with-tooltip';
import { FormattedResource } from 'src/utils/api/types';

interface HasDownloadProps extends Omit<TagWithTooltipProps, 'value'> {
  hasAPI?: FormattedResource['hasAPI'];
  type?: FormattedResource['@type'];
  tooltipLabel?: string;
}
const schema = SchemaDefinitions as SchemaDefinitionsType;

export const HasAPI = ({ hasAPI, type, ...props }: HasDownloadProps) => {
  if (!type) {
    return <></>;
  }
  const property = schema['hasAPI'];

  return (
    <TagWithTooltip
      colorPalette={hasAPI ? 'green' : 'gray'}
      tooltipContent={type ? property?.description?.[type] || '' : ''}
      {...props}
    >
      {hasAPI ? 'API Available' : 'API Not Available'}
    </TagWithTooltip>
  );
};
