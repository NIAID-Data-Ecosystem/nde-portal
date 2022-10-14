import React, { useEffect } from 'react';
import {
  RangeSlider,
  RangeSliderFilledTrack,
  RangeSliderThumb,
  RangeSliderTrack,
} from '@chakra-ui/react';
import { Box, Heading } from 'nde-design-system';
import { FilterTerm } from '../../../types';

interface FiltersRangeSliderProps {
  rangeValues: number[];
  data: FilterTerm[];
  selectedDates: string[];
  updateRangeValues: React.Dispatch<React.SetStateAction<number[]>>;
  onChangeEnd: (args: number[]) => void;
}

export const Slider: React.FC<FiltersRangeSliderProps> = React.memo(
  ({ selectedDates, rangeValues, data, updateRangeValues, onChangeEnd }) => {
    // Show as disabled there is no range to the data (i.e. more than one step in range) or if non year data is selected.
    const isDisabled = selectedDates.includes('-_exists_') || data.length <= 1;

    useEffect(() => {
      // This logic is added to control the state when filter tags are updated / page is refreshed.
      updateRangeValues(prev => {
        let arr = prev ? [...prev] : [];
        // If there's no date selected made, default to span the entire date range.
        if (
          !selectedDates.length ||
          selectedDates.filter(d => d !== '-_exists_').length === 0
        ) {
          arr[0] = 0;
          arr[1] = data.length - 1;
        } else {
          // Otherwise, find the index value of the selection and update the state.
          const [start, end] = [
            data.findIndex(
              datum => datum.term === selectedDates[0]?.split('-')[0],
            ),
            data.findIndex(
              datum => datum.term === selectedDates[1]?.split('-')[0],
            ),
          ];
          if (start > -1 && arr[0] !== start) {
            arr[0] = start;
          }
          if (end > -1 && arr[1] !== end) {
            arr[1] = end;
          }
        }
        return arr;
      });
    }, [selectedDates, data, updateRangeValues]);

    return (
      <>
        <RangeSlider
          id='date-slider'
          w='100%'
          isDisabled={isDisabled}
          // eslint-disable-next-line jsx-a11y/aria-proptypes
          aria-label={['date-min', 'date-max']}
          value={rangeValues}
          focusThumbOnChange={false}
          min={0}
          max={data.length - 1}
          onChange={updateRangeValues}
          onChangeEnd={onChangeEnd}
        >
          <RangeSliderTrack bg='primary.200' h={0.4}>
            <RangeSliderFilledTrack bg='primary.500'></RangeSliderFilledTrack>
          </RangeSliderTrack>

          {/* Display a tooltip on hover with values for each slider thumb. */}
          <RangeSliderThumb index={0} borderColor='primary.200'>
            <Box position='absolute' top={4}>
              <Heading as='h5' fontSize='0.85rem' mt={2}>
                {rangeValues?.[0] !== undefined
                  ? data[rangeValues[0]]?.term
                  : ''}
              </Heading>
            </Box>
          </RangeSliderThumb>
          <RangeSliderThumb index={1} borderColor='primary.200'>
            <Box position='absolute' top={4}>
              <Heading as='h5' fontSize='0.85rem' mt={2}>
                {rangeValues?.[1] !== undefined
                  ? data[rangeValues[1]]?.term
                  : ''}
              </Heading>
            </Box>
          </RangeSliderThumb>
        </RangeSlider>
      </>
    );
  },
);
