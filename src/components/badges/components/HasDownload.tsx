import { FormattedResource } from 'src/utils/api/types';
import { Icon } from '@chakra-ui/react';
import { BadgeWithTooltip, BadgeWithTooltipProps } from 'src/components/badges';
import SchemaDefinitions from 'configs/schema-definitions.json';
import { FaDownload } from 'react-icons/fa6';
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
      variant='outline'
      colorScheme={getColorScheme()}
      tooltipLabel={type ? property?.description?.[type] || '' : ''}
      whiteSpace='wrap'
      alignItems='center'
      {...props}
    >
      <Icon as={FaDownload} mr={1} />
      Has Download: {hasDownload}
    </BadgeWithTooltip>
  );
};
