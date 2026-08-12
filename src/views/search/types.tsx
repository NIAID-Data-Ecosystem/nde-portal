import { SelectedFilterType } from './components/filters';

export type TabType = {
  id: 'ct' | 'd' | 's' | 'dc';
  types: {
    label: string;
    accordionLabel?: string;
    type: string;
  }[];
  isDefault?: boolean;
};

// How the results for a tab are laid out.
// See TABS_WITH_VIEW_MODE in `../config/view-mode`.
export type SearchViewMode = 'card' | 'table';

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
