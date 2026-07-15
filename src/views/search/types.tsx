import { APIResourceType } from 'src/utils/formatting/formatResourceType';
import { SelectedFilterType } from './components/filters';

export type TabType = {
  id: 'ct' | 'd' | 's' | 'dc';
  types: {
    label: string;
    accordionLabel?: string;
    type: APIResourceType | 'Disease' | 'Other';
  }[];
  isDefault?: boolean;
};

export interface SearchQueryParams {
  q: string;
  facets?: string[];
  facet_size?: number;
  fields?: string[];
  filters?: SelectedFilterType;
  extra_filter?: string;
  additionalFilter?: string;
  from?: number;
  size?: number;
  sort?: string;
  shouldUseMetadataScore?: boolean;
  use_ai_search?: string;
  advancedSearch?: string;
}
