import { FormattedResource } from 'src/utils/api/types';
import { BadgeWithTooltip, BadgeWithTooltipProps } from 'src/components/badges';
import SchemaDefinitions from 'configs/schema-definitions.json';
import { SchemaDefinitions as SchemaDefinitionsType } from 'scripts/generate-schema-definitions/types';

interface HasDownloadProps extends Omit<BadgeWithTooltipProps, 'value'> {
  hasDownload?: FormattedResource['hasDownload'];
  type?: FormattedResource['@type'];
  tooltipLabel?: string;
}
const schema = SchemaDefinitions as SchemaDefinitionsType;

export const HasDownload = ({
  hasDownload,
  type,
  ...props
}: HasDownloadProps) => {
  if (!hasDownload || !type) {
    return <></>;
  }

  const property = schema['hasAPI'];
  const hasDownloadLower = hasDownload.toLowerCase();

  // Tooltip text keyed by the hasDownload value.
  const getTooltipLabel = () => {
    if (hasDownloadLower === 'all content') {
      return 'The resource allows download of all content.';
    } else if (hasDownloadLower === 'partial content') {
      return 'The resource allows download of part of the content.';
    } else if (hasDownloadLower === 'record-level') {
      return 'The resource allows download of individual records, or selections of records.';
    } else if (hasDownloadLower === 'no downloads') {
      return 'Content is not downloadable.';
    } else {
      return '';
    }
  };

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
    <BadgeWithTooltip
      colorScheme={getColorScheme()}
      tooltipLabel={getTooltipLabel()}
      {...props}
    >
      Has Download: {hasDownload}
    </BadgeWithTooltip>
  );
};
