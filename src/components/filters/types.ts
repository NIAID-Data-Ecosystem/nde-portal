import { FacetTerm } from 'src/utils/api/types';

export type FacetTerms = {
  [key: string]: FacetTerm[];
};

export type SelectedFilterTypeValue = string | { [key: string]: string[] };

export interface SelectedFilterType {
  [key: string]: SelectedFilterTypeValue[];
}

export interface FiltersConfigProps {
  [key: string]: {
    name: string;
    glyph?: string;
    property: string;
    isDefaultOpen?: boolean;
  };
}

export interface FilterTerm extends FacetTerm {}

// union of all values from given Object type T.
export type ValueOf<T> = T[keyof T];
