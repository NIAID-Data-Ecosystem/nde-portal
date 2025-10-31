import SchemaDefinitions from 'configs/schema-definitions.json';
import {
  TagWithTooltip,
  TagWithTooltipProps,
} from 'src/components/tag-with-tooltip';
import { FormattedResource } from 'src/utils/api/types';

interface AccessibleForFreeProps extends Omit<TagWithTooltipProps, 'value'> {
  isAccessibleForFree?: FormattedResource['isAccessibleForFree'];
  type?: FormattedResource['@type'];
}

export const AccessibleForFree = ({
  isAccessibleForFree,
  type,
  ...props
}: AccessibleForFreeProps) => {
  if ((isAccessibleForFree === true || isAccessibleForFree === false) && type) {
    const property = SchemaDefinitions['isAccessibleForFree'];
    return (
      <TagWithTooltip
        colorPalette={isAccessibleForFree ? 'green' : 'gray'}
        tooltipContent={property?.description[type]}
        {...props}
      >
        {isAccessibleForFree ? 'No Cost Access' : 'Paid Access'}
      </TagWithTooltip>
    );
  }
  return <></>;
};
