import SchemaDefinitions from 'configs/schema-definitions.json';
import { Tag, TagProps } from 'src/components/tag';
import { FormattedResource } from 'src/utils/api/types';

interface AccessibleForFreeProps extends TagProps {
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
      <Tag
        colorPalette={isAccessibleForFree ? 'green' : 'gray'}
        tooltipProps={{ content: property?.description[type] }}
        {...props}
      >
        {isAccessibleForFree ? 'No Cost Access' : 'Paid Access'}
      </Tag>
    );
  }
  return <></>;
};
