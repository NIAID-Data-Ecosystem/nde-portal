import React, { useEffect, useMemo } from 'react';
import { useQuery } from 'react-query';
import {
  Facet,
  FacetTerm,
  FetchSearchResultsResponse,
} from 'src/utils/api/types';
import {
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  Box,
  Button,
  Drawer,
  DrawerBody,
  DrawerFooter,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  Flex,
  Heading,
  Text,
  useDisclosure,
  useBreakpointValue,
  Icon,
} from 'nde-design-system';
import LoadingSpinner from 'src/components/loading';
import { Filter } from 'src/components/filter';
import { fetchSearchResults, Params } from 'src/utils/api';
import { FaFilter } from 'react-icons/fa';
import { NAV_HEIGHT } from 'src/components/page-container';
import { formatDate, formatType } from 'src/utils/api/helpers';
import { FaMinus, FaPlus } from 'react-icons/fa';
import { MetadataIcon, MetadataToolTip } from 'src/components/icon';
import { getMetadataColor } from 'src/components/icon/helpers';
import { useFacetsData } from 'src/components/filters/hooks/useFacetsData';
import { FiltersContainer } from 'src/components/filters';

/*
[COMPONENT INFO]:
  Fetches all filters based on initial query string.
  Note: only the counts are updated when the user toggles a filter.
*/

// Default facet size
export const FACET_SIZE = 1000;

export type SelectedFilterType = {
  [key: string]: string[];
};

interface FiltersConfigProps {
  [key: string]: { name: string; glyph?: string };
}

// Config for the naming/text of a filter.
export const filtersConfig: FiltersConfigProps = {
  '@type': { name: 'Type' },
  'includedInDataCatalog.name': { name: 'Source' },
  date: { name: 'Date ' },
  keywords: { name: 'Keywords' },
  'measurementTechnique.name': {
    name: 'Measurement Technique',
    glyph: 'measurementTechnique',
  },
  variableMeasured: { name: 'Variable Measured', glyph: 'variableMeasured' },
  'funding.funder.name': { name: 'Funding', glyph: 'funding' },
  'healthCondition.name': {
    name: 'Health Condition',
    glyph: 'healthCondition',
  },
  'infectiousAgent.name': { name: 'Pathogen', glyph: 'infectiousAgent' },
  'species.name': { name: 'Species', glyph: 'species' },
};

interface FiltersProps {
  // Search query term
  searchTerm: string;
  // Facets that update as the filters are selected
  facets?: { isLoading: boolean; data?: Facet };
  // Currently selected filters
  selectedFilters: SelectedFilterType;
  // fn to remove all selected filters
  removeAllFilters?: () => void;
  // fn to update filter selection
  handleSelectedFilters: (arg: SelectedFilterType) => void;
  queryParams: Params;
}

export const Filters: React.FC<FiltersProps> = ({
  queryParams,
  selectedFilters,
  removeAllFilters,
}) => {
  const [{ data, error, isLoading }] = useFacetsData({
    queryParams,
    facets: Object.keys(filtersConfig),
  });

  return (
    <FiltersContainer
      title='Filters'
      error={error}
      selectedFilters={selectedFilters}
      removeAllFilters={removeAllFilters}
    ></FiltersContainer>
  );
};
