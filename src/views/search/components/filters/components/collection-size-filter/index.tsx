import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Flex, Skeleton, Text } from '@chakra-ui/react';
import { SearchQueryParams } from 'src/views/search/types';
import { FilterTermType, SelectedFilterType } from '../../types';
import { useCollectionSizeBounds } from './hooks/useCollectionSizeBounds';
import { RangeInputs } from './components/range-inputs';
import { UnitSelect } from './components/unit-select';
import {
  UnitOption,
  buildFilterPatch,
  buildUnitOptions,
  getSelectedUnitKey,
  parseRangeValues,
} from './utils';

interface CollectionSizeFilterProps {
  colorScheme: string;
  /** Facet terms for the unit field, including the `_exists_` rows. */
  terms: FilterTermType[];
  /** Applied unit values: every indexed spelling of one unit. */
  selectedUnits: string[];
  /** Applied range endpoints, `*` marking an unbounded end. */
  selectedRange: string[];
  isLoading: boolean;
  queryParams: SearchQueryParams;
  enabled: boolean;
  /**
   * Applies both of the filter's keys in one route update. Writing them
   * separately would push two routes and lose the first.
   */
  onApply: (patch: SelectedFilterType) => void;
}

/**
 * Collection Size filter.
 *
 * The filter spans two API fields: a unit (`collectionSize.unitText`) and a
 * numeric range over `collectionSize.minValue`, so every change is applied as
 * a patch holding both keys.
 */
export const CollectionSizeFilter: React.FC<CollectionSizeFilterProps> =
  React.memo(
    ({
      colorScheme,
      terms,
      selectedUnits,
      selectedRange,
      isLoading,
      queryParams,
      enabled,
      onApply,
    }) => {
      const unitOptions = useMemo(() => buildUnitOptions(terms), [terms]);
      const appliedUnitKey = useMemo(
        () => getSelectedUnitKey(selectedUnits),
        [selectedUnits],
      );
      const appliedRange = useMemo(
        () => parseRangeValues(selectedRange),
        [selectedRange],
      );

      /**
       * The last selection sent to `onApply`.
       *
       * Route updates are shallow and land a render or two later, so a patch
       * built straight from props can still describe the pre-update state.
       * Since every patch writes both of the filter's keys, that would clear
       * the key the user just set: picking a unit and applying a range right
       * after would drop the unit. The sent selection stands in until props
       * catch up.
       */
      const [pending, setPending] = useState<{
        unit: UnitOption;
        min: string;
        max: string;
      } | null>(null);

      // Props are authoritative the moment they change, whatever they change
      // to: the update may also have come from a filter tag or "Clear All".
      const appliedSignature = `${appliedUnitKey}|${appliedRange.min}|${appliedRange.max}`;
      const appliedSignatureRef = useRef(appliedSignature);
      useEffect(() => {
        if (appliedSignatureRef.current !== appliedSignature) {
          appliedSignatureRef.current = appliedSignature;
          setPending(null);
        }
      }, [appliedSignature]);

      const unitFromProps = useMemo(
        () =>
          unitOptions.find(option => option.key === appliedUnitKey) ??
          unitOptions[0],
        [appliedUnitKey, unitOptions],
      );

      const unit = pending?.unit ?? unitFromProps;
      const range = useMemo(
        () => (pending ? { min: pending.min, max: pending.max } : appliedRange),
        [appliedRange, pending],
      );

      // Bounds track the selected unit, so the inputs describe the records the
      // range will actually be applied to.
      const { data: bounds, isLoading: isLoadingBounds } =
        useCollectionSizeBounds(
          {
            q: queryParams.q,
            extra_filter: queryParams.extra_filter,
            use_ai_search: queryParams.use_ai_search,
            advancedSearch: queryParams.advancedSearch,
            unitTerms: unit?.terms,
          },
          { enabled },
        );

      const applySelection = useCallback(
        (selection: { unit: UnitOption; min: string; max: string }) => {
          setPending(selection);
          onApply(buildFilterPatch(selection));
        },
        [onApply],
      );

      const handleUnitChange = useCallback(
        (nextUnit: UnitOption) => {
          applySelection({ unit: nextUnit, ...range });
        },
        [applySelection, range],
      );

      const handleRangeApply = useCallback(
        ({ min, max }: { min: string; max: string }) => {
          if (!unit) return;
          applySelection({ unit, min, max });
        },
        [applySelection, unit],
      );

      // Section-level reset: clears the unit alongside the range. Individual
      // tags still clear one key at a time.
      const handleReset = useCallback(() => {
        applySelection({ unit: unitOptions[0], min: '', max: '' });
      }, [applySelection, unitOptions]);

      if (isLoading) {
        return (
          <Flex flexDirection='column' px={4} py={2} gap={2}>
            <Skeleton height={8} />
            <Skeleton height={8} />
          </Flex>
        );
      }

      // Only the "All Units" option is present, so no record in the current
      // result set carries a collection size.
      if (unitOptions.length <= 1) {
        return (
          <Text fontStyle='italic' color='gray.800' mt={1} textAlign='center'>
            No results with collection size information.
          </Text>
        );
      }

      return (
        <Flex flexDirection='column' px={4} py={2} gap={3}>
          <UnitSelect
            colorScheme={colorScheme}
            options={unitOptions}
            selectedKey={unit?.key ?? ''}
            onChange={handleUnitChange}
          />

          <RangeInputs
            colorScheme={colorScheme}
            value={range}
            bounds={bounds ?? undefined}
            isLoadingBounds={isLoadingBounds}
            onApply={handleRangeApply}
            onReset={handleReset}
          />
        </Flex>
      );
    },
  );
