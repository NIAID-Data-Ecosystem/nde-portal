import SchemaDefinitions from 'configs/schema-definitions.json';
import { SchemaDefinitions as SchemaDefinitionsType } from 'scripts/generate-schema-definitions/types';
import { Tag, TagProps } from 'src/components/tag';
import { FormattedResource } from 'src/utils/api/types';

interface HasDownloadProps extends TagProps {
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
    <Tag
      borderRadius='full'
      colorPalette={hasAPI ? 'green' : 'gray'}
      tooltipProps={{
        content: type ? property?.description?.[type] || '' : '',
      }}
      {...props}
    >
      {hasAPI ? 'API Available' : 'API Not Available'}
    </Tag>
  );
};
