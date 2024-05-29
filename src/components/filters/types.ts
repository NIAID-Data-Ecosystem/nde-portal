import { FacetTerm } from 'src/utils/api/types';
import { APIResourceType } from 'src/utils/formatting/formatResourceType';

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
    description: string;
    isDefaultOpen?: boolean;
    '@type'?: APIResourceType[];
  };
}

export interface FilterTerm extends FacetTerm {}

// union of all values from given Object type T.
export type ValueOf<T> = T[keyof T];
