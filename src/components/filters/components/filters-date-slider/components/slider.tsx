import React, { useEffect, useState } from 'react';
import {
  RangeSlider,
  RangeSliderFilledTrack,
  RangeSliderThumb,
  RangeSliderTrack,
} from '@chakra-ui/react';
import { Box, Heading } from 'nde-design-system';
import { FilterTerm } from '../../../types';

interface FiltersRangeSliderProps {
  data: FilterTerm[];
  selectedDates: string[];
  updateRangeValues: React.Dispatch<React.SetStateAction<number[]>>;
  onChangeEnd: (args: number[]) => void;
}

export const Slider: React.FC<FiltersRangeSliderProps> = React.memo(
  ({ selectedDates, data, updateRangeValues, onChangeEnd }) => {
    const [selectedRange, setSelectedRange] = useState([0, 0]);
    // Show as disabled there is no range to the data (i.e. more than one step in range) or if non year data is selected.
    const isDisabled = data.length <= 1;

    useEffect(() => {
      // This logic is added to control the state when filter tags are updated / page is refreshed.
      setSelectedRange(prev => {
        let arr = prev ? [...prev] : [];
        // If there's no date selected made, default to span the entire date range.
        if (!selectedDates.length || selectedDates.includes('_exists_')) {
          arr[0] = 0;
          arr[1] = data.length - 1;
        } else {
          // Otherwise, find the index value of the selection and update the state.
          const [start, end] = [
            data.findIndex(
              datum =>
                datum.term?.split('-')[0] === selectedDates[0]?.split('-')[0],
            ),
            data.findIndex(
              datum =>
                datum.term?.split('-')[0] === selectedDates[1]?.split('-')[0],
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
    }, [selectedDates, data]);

    useEffect(() => {
      updateRangeValues(selectedRange);
    }, [selectedRange, updateRangeValues]);

    return (
      <>
        <RangeSlider
          id='date-slider'
          w='100%'
          isDisabled={isDisabled}
          // eslint-disable-next-line jsx-a11y/aria-proptypes
          aria-label={['date-min', 'date-max']}
          value={selectedRange}
          focusThumbOnChange={false}
          min={0}
          max={data.length - 1}
          onChange={values => {
            // only update if dates have changed
            if (
              values[0] !== selectedRange[0] ||
              values[1] !== selectedRange[1]
            ) {
              setSelectedRange(values);
            }
          }}
          onChangeEnd={values => {
            setSelectedRange(values);
            onChangeEnd(values);
          }}
        >
          <RangeSliderTrack bg='primary.200' h={0.4}>
            <RangeSliderFilledTrack bg='primary.500'></RangeSliderFilledTrack>
          </RangeSliderTrack>

          {/* Display a tooltip on hover with values for each slider thumb. */}
          <RangeSliderThumb index={0} borderColor='primary.200' boxSize={5}>
            <Box position='absolute' top={4}>
              <Heading as='h5' fontSize='0.85rem' mt={2}>
                {selectedRange?.[0] !== undefined
                  ? data[selectedRange[0]]?.displayAs
                  : ''}
              </Heading>
            </Box>
          </RangeSliderThumb>
          <RangeSliderThumb index={1} borderColor='primary.200' boxSize={5}>
            <Box position='absolute' top={4}>
              <Heading as='h5' fontSize='0.85rem' mt={2}>
                {selectedRange?.[1] !== undefined
                  ? data[selectedRange[1]]?.displayAs
                  : ''}
              </Heading>
            </Box>
          </RangeSliderThumb>
        </RangeSlider>
      </>
    );
  },
);
