import SchemaDefinitions from 'configs/schema-definitions.json';
import { SchemaDefinition } from 'scripts/generate-schema-definitions/types';
import { Tag, TagProps } from 'src/components/tag';
import { FormattedResource } from 'src/utils/api/types';

interface HasDownloadProps extends TagProps {
  hasDownload?: FormattedResource['hasDownload'];
  type?: FormattedResource['@type'];
}

export const HasDownload = ({
  hasDownload,
  type,
  ...props
}: HasDownloadProps) => {
  if (!hasDownload || !type) {
    return <></>;
  }
  const property = SchemaDefinitions['hasDownload'] as SchemaDefinition;

  const hasDownloadLower = hasDownload.toLowerCase();
  const getColorScheme = () => {
    if (
      hasDownloadLower === 'all content' ||
      hasDownloadLower === 'partial content' ||
      hasDownloadLower === 'record-level'
    ) {
      return 'green';
    } else if (hasDownload === 'no downloads') {
      return 'gray';
      ``;
    } else {
      return 'gray';
    }
  };

  return (
    <Tag
      borderRadius='full'
      colorPalette={getColorScheme()}
      tooltipProps={{
        content: type ? property?.description?.[type] || '' : '',
      }}
      {...props}
    >
      Has Download: {hasDownload}
    </Tag>
  );
};
