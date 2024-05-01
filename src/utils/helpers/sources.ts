import REPOSITORIES from 'configs/repositories.json';
import { FormattedResource } from 'src/utils/api/types';

export const isSourceFundedByNiaid = (
  includedInDataCatalog?: FormattedResource['includedInDataCatalog'],
) => {
  if (!includedInDataCatalog) return false;
  const repositories = REPOSITORIES.repositories as {
    id: string;
    label: string;
    isNIAID?: boolean;
  }[];

  const sources = includedInDataCatalog
    ? Array.isArray(includedInDataCatalog)
      ? includedInDataCatalog
      : [includedInDataCatalog]
    : [];

  const sources_names = sources.map(source => source.name);
  const isNiaidFunded =
    sources &&
    repositories.filter(
      ({ label, isNIAID }) => sources_names.includes(label) && isNIAID,
    ).length > 0;

  return isNiaidFunded;
};
