import { FacetTerm } from 'src/utils/api/types';

export type FacetTerms = {
  [key: string]: FacetTerm[];
};

export type SelectedFilterType = {
  [key: string]: (string | { [key: string]: string[] })[];
};

export interface FiltersConfigProps {
  [key: string]: { name: string; glyph?: string };
}

export interface FilterTerm extends FacetTerm {}
