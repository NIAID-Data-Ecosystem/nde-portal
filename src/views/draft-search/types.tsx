export type TabType = {
  id: 'ct' | 'd';
  types: {
    label: string;
    type: string;
  }[];
  isDefault?: boolean;
};

export interface SearchQueryParams {
  q: string;
  facets?: string[];
  fields?: string[];
  filters?: Record<string, string[]>;
  from: number;
  size: number;
  sort: string;
  shouldUseMetadataScore?: boolean;
}
