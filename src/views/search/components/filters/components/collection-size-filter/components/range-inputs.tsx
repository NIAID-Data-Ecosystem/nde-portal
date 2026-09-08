import React, { useEffect, useState } from 'react';
import { Button, Flex, Input, Text, VisuallyHidden } from '@chakra-ui/react';
import { formatNumber } from 'src/utils/helpers';
import { CollectionSizeBounds, RangeValues, clampRange } from '../utils';

const MIN_INPUT_ID = 'collection-size-min';
const MAX_INPUT_ID = 'collection-size-max';

interface RangeInputsProps {
  colorScheme: string;
  /** Applied endpoints, as shown in the inputs. */
  value: RangeValues;
  bounds?: CollectionSizeBounds;
  isDisabled?: boolean;
  isLoadingBounds?: boolean;
  onApply: (range: RangeValues) => void;
  onReset: () => void;
}

/**
 * Min/max inputs for `collectionSize.minValue`.
 *
 * Both endpoints are optional: an empty side is applied as an unbounded end.
 * The range is only committed on submit, so a partially typed number never
 * triggers a route update.
 */
export const RangeInputs: React.FC<RangeInputsProps> = ({
  colorScheme,
  value,
  bounds,
  isDisabled,
  isLoadingBounds,
  onApply,
  onReset,
}) => {
  const [min, setMin] = useState(value.min);
  const [max, setMax] = useState(value.max);

  // Applied values are authoritative: resync when the URL changes, including
  // when a filter tag is removed elsewhere on the page.
  useEffect(() => {
    setMin(value.min);
    setMax(value.max);
  }, [value.min, value.max]);

  const hasChanges = min !== value.min || max !== value.max;
  const hasValues = min !== '' || max !== '';
  const isApplied = value.min !== '' || value.max !== '';

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const cleaned = clampRange(min, max, bounds);
    setMin(cleaned.min);
    setMax(cleaned.max);
    onApply(cleaned);
  };

  const placeholder = (bound?: number, fallback?: string) =>
    !isLoadingBounds && bound !== undefined ? formatNumber(bound) : fallback;

  return (
    <form onSubmit={handleSubmit}>
      <Flex alignItems='center' flexWrap='wrap' gap={2}>
        <VisuallyHidden>
          <label htmlFor={MIN_INPUT_ID}>Minimum collection size</label>
        </VisuallyHidden>
        <Input
          id={MIN_INPUT_ID}
          size='sm'
          flex={1}
          minW='5rem'
          type='number'
          inputMode='numeric'
          // No min/max/step attributes: native constraint validation blocks
          // submission outright, so an out-of-range or fractional entry would
          // stall behind a validation bubble instead of reaching `clampRange`,
          // which corrects it. Bounds inform the placeholders only.
          step='any'
          colorScheme={colorScheme}
          isDisabled={isDisabled}
          placeholder={placeholder(bounds?.min, 'Min')}
          value={min}
          onChange={event => setMin(event.target.value)}
        />

        <Text fontSize='sm' color='gray.800'>
          to
        </Text>

        <VisuallyHidden>
          <label htmlFor={MAX_INPUT_ID}>Maximum collection size</label>
        </VisuallyHidden>
        <Input
          id={MAX_INPUT_ID}
          size='sm'
          flex={1}
          minW='5rem'
          type='number'
          inputMode='numeric'
          step='any'
          colorScheme={colorScheme}
          isDisabled={isDisabled}
          placeholder={placeholder(bounds?.max, 'Max')}
          value={max}
          onChange={event => setMax(event.target.value)}
        />
      </Flex>

      <Flex justifyContent='flex-start' mt={2} gap={2}>
        <Button
          size='sm'
          type='submit'
          colorScheme={colorScheme}
          isDisabled={isDisabled || !hasChanges}
        >
          Submit
        </Button>
        <Button
          size='sm'
          variant='outline'
          colorScheme={colorScheme}
          isDisabled={isDisabled || (!isApplied && !hasValues)}
          onClick={() => {
            setMin('');
            setMax('');
            onReset();
          }}
        >
          Reset
        </Button>
      </Flex>
    </form>
  );
};
