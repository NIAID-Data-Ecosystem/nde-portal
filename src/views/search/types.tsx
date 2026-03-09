export type TabType = {
  id: 'ct' | 'd' | 's';
  types: {
    label: string;
    type: string;
  }[];
  isDefault?: boolean;
};

export interface SearchQueryParams {
  q: string;
  facets?: string[];
  facet_size?: number;
  fields?: string[];
  filters?: Record<string, string[]>;
  extra_filter?: string;
  from?: number;
  size?: number;
  sort?: string;
  shouldUseMetadataScore?: boolean;
  use_ai_search?: string;
  advancedSearch?: string;
}
