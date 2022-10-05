import React, { useEffect, useMemo, useState } from 'react';
import { ListItem, Icon, Text, Tooltip, Flex, Box } from 'nde-design-system';
import { FilterTerm } from '../types';
import {
  RangeSlider,
  RangeSliderFilledTrack,
  RangeSliderThumb,
  RangeSliderTrack,
} from '@chakra-ui/react';
import { FaCalendarAlt } from 'react-icons/fa';

/*
[COMPONENT INFO]:
Filter Range Slider handles items that require a range rather than a checkbox text/boolean type.
Ex: Dates, numeric values.
*/

interface FiltersRangeSliderProps {
  // list of filter terms to display.
  data: FilterTerm[];
  // handle fn for updating values
  handleUpdate: (args: string[]) => void;
  // default selected values.
  selectedValues: string[];
}

const barGraph = () => {};

export const FiltersRangeSlider: React.FC<FiltersRangeSliderProps> = React.memo(
  ({ data, handleUpdate, selectedValues }) => {
    const [showTooltip, setShowTooltip] = React.useState(false);
    const [sliderValue, setSliderValue] = useState<number[]>([
      0,
      data.length - 1,
    ]);

    // Sort terms in ascending order.
    const sorted_terms = useMemo(
      () =>
        data
          .filter(d => d.count !== 0) // filter out dates with no resources
          .sort((a, b) => {
            return a.term < b.term ? -1 : a.term > b.term ? 1 : 0;
          })
          .map(d => d.term),
      [data],
    );

    useEffect(() => {
      // This logic is added to control the state when filter tags are updated / page is refreshed.
      setSliderValue(prev => {
        const arr = prev;
        // If there's no selection made, default to span the entire range.
        if (!selectedValues.length) {
          arr[0] = 0;
          arr[1] = sorted_terms.length - 1;
        } else {
          // Otherwise, find the index value of the selection and update the state.
          const [start, end] = [
            sorted_terms.findIndex(term => term === selectedValues[0]),
            sorted_terms.findIndex(term => term === selectedValues[1]),
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
    }, [selectedValues, sorted_terms]);

    if (!data.length || !sliderValue) {
      return <ListItem p={2}>No available filters.</ListItem>;
    }
    return (
      <Flex w='100%' flexDirection='column'>
        <Flex w='100%' px={2}>
          <RangeSlider
            id='date-slider'
            w='100%'
            // eslint-disable-next-line jsx-a11y/aria-proptypes
            aria-label={['date-min', 'date-max']}
            value={sliderValue}
            focusThumbOnChange={false}
            // defaultValue={sliderValue.length > 0 ? sliderValue : undefined}
            min={0}
            max={sorted_terms.length - 1}
            minStepsBetweenThumbs={1}
            onChange={values => {
              setSliderValue(values);
            }}
            onChangeEnd={values => {
              setSliderValue(values);
              handleUpdate([sorted_terms[values[0]], sorted_terms[values[1]]]);
            }}
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
          >
            <RangeSliderTrack bg='primary.200'>
              <RangeSliderFilledTrack bg='primary.500'></RangeSliderFilledTrack>
            </RangeSliderTrack>

            {/* Display a tooltip on hover with values for each slider thumb. */}
            <Tooltip
              hasArrow
              bg='teal.500'
              color='white'
              placement='top'
              isOpen={showTooltip}
              label={`${sorted_terms[sliderValue[0]]}`}
            >
              <RangeSliderThumb boxSize={6} index={0}>
                <Icon as={FaCalendarAlt} color='primary.500' />
              </RangeSliderThumb>
            </Tooltip>
            <Tooltip
              hasArrow
              bg='teal.500'
              color='white'
              placement='top'
              isOpen={showTooltip}
              label={`${sorted_terms[sliderValue[1]]}`}
            >
              <RangeSliderThumb boxSize={6} index={1}>
                <Icon as={FaCalendarAlt} color='primary.500' />
              </RangeSliderThumb>
            </Tooltip>
          </RangeSlider>
        </Flex>
        <Flex mt={1} w='100%' justifyContent='space-between'>
          <Text fontSize='xs'>{sorted_terms[0]}</Text>
          <Text fontSize='xs'>{sorted_terms[sorted_terms.length - 1]}</Text>
        </Flex>
      </Flex>
    );
  },
);
