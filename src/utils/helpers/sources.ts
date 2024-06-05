import { FormattedResource } from 'src/utils/api/types';
import { getFundedByNIAID } from '../helpers';

export const isSourceFundedByNiaid = (
  includedInDataCatalog?: FormattedResource['includedInDataCatalog'],
) => {
  if (!includedInDataCatalog) return false;

  // some resources have multiple sources
  const sources = includedInDataCatalog
    ? Array.isArray(includedInDataCatalog)
      ? includedInDataCatalog
      : [includedInDataCatalog]
    : [];

  return (
    sources
      .map(source => getFundedByNIAID(source.name))
      .filter(isNiaidFunded => !!isNiaidFunded).length > 0
  );
};
