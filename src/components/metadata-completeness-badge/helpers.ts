import METADATA_COMPLETENESS_FIELDS from 'src/components/metadata-completeness-badge/fields.json';
import { FormattedResource } from 'src/utils/api/types';

import { getMetadataNameByDotfield } from '../advanced-search/utils/query-helpers';

// Use the same list of required and recommended fields
// https://github.com/NIAID-Data-Ecosystem/nde-crawlers/blob/main/biothings-hub/files/nde-hub/scores.py
export const getMetadataListByType = (type: FormattedResource['@type']) => {
  return METADATA_COMPLETENESS_FIELDS[type] || [];
};

export const getTooltipDetails = (fields: string[]) => {
  return fields.map(field => {
    const label = getMetadataNameByDotfield(field);
    // if label and field are the same (ignore spaces within word and case) then showProperty is false.
    const showProperty =
      label.replace(/\s+/g, '').toLowerCase() !==
      field.replace(/\s+/g, '').toLowerCase();
    return {
      label,
      subLabel: showProperty ? field : '',
      property: field,
    };
  });
};
