import React from 'react';
import {
  RangeSlider,
  RangeSliderFilledTrack,
  RangeSliderThumb,
  RangeSliderTrack,
} from '@chakra-ui/react';
import { Box, Heading } from 'nde-design-system';
import { useDateRangeContext } from '../hooks/useDateRangeContext';

interface FiltersRangeSliderProps {
  onChangeEnd: (args: string[]) => void;
}

export const Slider: React.FC<FiltersRangeSliderProps> = React.memo(
  ({ onChangeEnd }) => {
    const { colorScheme, data, dates, dateRange, setDateRange, setIsDragging } =
      useDateRangeContext();

    // Show as disabled there is no range to the data (i.e. more than one step in range) or if non year data is selected.
    const isDisabled = data && data.length <= 1;
    // Thumbs share the same value.
    const thumbsSameValue =
      data && data[dateRange[0]]?.displayAs === data[dateRange[1]]?.displayAs;

    if (!data || dateRange?.length !== 2) {
      return <></>;
    }

    return (
      <Box w='100%' mt={-1.5} flex={1}>
        <RangeSlider
          id='date-slider'
          w='100%'
          isDisabled={isDisabled}
          // eslint-disable-next-line jsx-a11y/aria-proptypes
          aria-label={['date-min', 'date-max']}
          value={dateRange}
          focusThumbOnChange={false}
          min={0}
          max={data.length - 1}
          onChange={values => {
            // only update if dates have changed
            if (values[0] !== dateRange[0] || values[1] !== dateRange[1]) {
              setDateRange(values);
              setIsDragging(true);
            }
          }}
          onChangeEnd={values => {
            setDateRange(values);
            setIsDragging(false);

            // When slider is done being dragged, update route and results
            if (dates[0] && dates[1]) {
              const start = dates[0];
              const end = `${dates[1].split('-')[0]}-12-31`;
              onChangeEnd([start, end]);
            }
          }}
        >
          <RangeSliderTrack bg={`${colorScheme}.200`} h={0.4}>
            <RangeSliderFilledTrack
              bg={`${colorScheme}.500`}
            ></RangeSliderFilledTrack>
          </RangeSliderTrack>

          {/* Display a tooltip on hover with values for each slider thumb. */}
          <RangeSliderThumb
            id='thumb-slider-1'
            index={0}
            borderColor={`${colorScheme}.200`}
            boxSize={5}
            left='-0.625rem' // center by displacing by half the size of the thumb.
          >
            <Box
              position='absolute'
              width='unset'
              top={4}
              right={thumbsSameValue ? 'unset' : 0}
            >
              <Heading as='h5' fontSize='0.85rem' mt={2}>
                {dateRange?.[0] !== undefined
                  ? data[dateRange[0]]?.displayAs
                  : ''}
              </Heading>
            </Box>
          </RangeSliderThumb>
          <RangeSliderThumb
            id='thumb-slider-2'
            index={1}
            borderColor={`${colorScheme}.200`}
            boxSize={5}
            left='-0.625rem' // center by displacing by half the size of the thumb.
          >
            <Box
              position='absolute'
              top={4}
              left={thumbsSameValue ? 'unset' : 0}
            >
              <Heading
                as='h5'
                fontSize='0.85rem'
                mt={2}
                opacity={thumbsSameValue ? 0 : 1}
              >
                {dateRange?.[1] !== undefined
                  ? data[dateRange[1]]?.displayAs
                  : ''}
              </Heading>
            </Box>
          </RangeSliderThumb>
        </RangeSlider>
      </Box>
    );
  },
);
