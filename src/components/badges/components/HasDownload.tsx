import SchemaDefinitions from 'configs/schema-definitions.json';
import { SchemaDefinition } from 'scripts/generate-schema-definitions/types';
import {
  TagWithTooltip,
  TagWithTooltipProps,
} from 'src/components/tag-with-tooltip';
import { FormattedResource } from 'src/utils/api/types';

interface HasDownloadProps extends Omit<TagWithTooltipProps, 'value'> {
  hasDownload?: FormattedResource['hasDownload'];
  type?: FormattedResource['@type'];
  tooltipLabel?: string;
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
    <TagWithTooltip
      colorPalette={getColorScheme()}
      tooltipContent={type ? property?.description?.[type] || '' : ''}
      {...props}
    >
      Has Download: {hasDownload}
    </TagWithTooltip>
  );
};
