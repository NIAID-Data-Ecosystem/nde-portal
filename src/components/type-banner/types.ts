import { FlexProps } from '@chakra-ui/react';
import { FormattedResource } from 'src/utils/api/types';
import { APIResourceType } from 'src/utils/formatting/formatResourceType';

// Program-related variants of the ResourceCatalog banner:
// - 'resource': ResourceCatalog with a sourceOrganization.
// - 'info-and-resource': ResourceCatalog with a sourceOrganization
// whose sameAs links to its program collection.
// - 'info': program collection without a resource catalog.
export type ProgramVariant = 'resource' | 'info-and-resource' | 'info';

export interface TypeBannerProps extends FlexProps {
  label: string;
  type?: APIResourceType | 'Disease' | 'ProgramInfo';
  isNiaidFunded?: boolean;
  creativeWorkStatus?: FormattedResource['creativeWorkStatus'];
  // Set for ResourceCatalogs with a non-empty sourceOrganization. Renders the
  // matching program label with cyan styling instead of the default
  // ResourceCatalog treatment.
  programVariant?: ProgramVariant;
}
