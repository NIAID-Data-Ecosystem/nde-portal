import { FormattedResource } from 'src/utils/api/types';
import { Icon } from '@chakra-ui/react';
import { BadgeWithTooltip, BadgeWithTooltipProps } from 'src/components/badges';
import SchemaDefinitions from 'configs/schema-definitions.json';
import { FaCircleCheck, FaCircleXmark } from 'react-icons/fa6';
import { SchemaDefinitions as SchemaDefinitionsType } from 'scripts/generate-schema-definitions/types';

interface HasDownloadProps extends Omit<BadgeWithTooltipProps, 'value'> {
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
    <BadgeWithTooltip
      variant='outline'
      colorScheme={hasAPI ? 'green' : 'gray'}
      tooltipLabel={type ? property?.description?.[type] || '' : ''}
      {...props}
    >
      {hasAPI ? (
        <Icon as={FaCircleCheck} mr={1} />
      ) : (
        <Icon as={FaCircleXmark} mr={1} />
      )}
      API Available
    </BadgeWithTooltip>
  );
};
