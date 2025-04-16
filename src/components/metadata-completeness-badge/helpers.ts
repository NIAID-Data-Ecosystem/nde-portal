import { FormattedResource } from 'src/utils/api/types';
import METADATA_COMPLETENESS_FIELDS from 'src/components/metadata-completeness-badge/fields.json';

// Use the same list of required and recommended fields
// https://github.com/NIAID-Data-Ecosystem/nde-crawlers/blob/main/biothings-hub/files/nde-hub/scores.py
export const getMetadataListByType = (type: FormattedResource['@type']) => {
  return METADATA_COMPLETENESS_FIELDS[type] || [];
};
