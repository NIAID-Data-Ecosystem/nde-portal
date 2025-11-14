import React from 'react';
import {
  RangeSlider,
  RangeSliderFilledTrack,
  RangeSliderThumb,
  RangeSliderTrack,
  Text,
  Box,
} from '@chakra-ui/react';
import { useDateRangeContext } from '../hooks/useDateRangeContext';

interface FiltersRangeSliderProps {
  onChangeEnd: (args: string[]) => void;
}

export const Slider: React.FC<FiltersRangeSliderProps> = React.memo(
  ({ onChangeEnd }) => {
    const {
      colorScheme,
      allData,
      dates,
      dateRange,
      setDateRange,
      setIsDragging,
    } = useDateRangeContext();

    // Slider operates on allData (complete dataset)
    const isDisabled = allData && allData.length <= 1;
    const thumbsSameValue =
      allData && allData[dateRange[0]]?.label === allData[dateRange[1]]?.label;

    if (!allData || dateRange?.length !== 2) {
      return <></>;
    }

    return (
      <Box w='100%' mt={0}>
        <RangeSlider
          id='date-slider'
          w='100%'
          isDisabled={isDisabled}
          // eslint-disable-next-line jsx-a11y/aria-proptypes
          aria-label={['date-min', 'date-max']}
          value={dateRange}
          focusThumbOnChange={false}
          min={0}
          max={allData.length - 1}
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
            <RangeSliderFilledTrack bg={`${colorScheme}.500`} />
          </RangeSliderTrack>

          {/* Display a tooltip on hover with values for each slider thumb. */}
          <RangeSliderThumb
            id='thumb-slider-1'
            index={0}
            borderColor={`${colorScheme}.200`}
            boxSize={5}
            left='-0.625rem' // center by displacing by half the size of the thumb.
          >
            <Text
              position='absolute'
              top={4}
              right={thumbsSameValue ? 'unset' : 0}
              bg='white'
              border='0.5px solid'
              borderColor='gray.200'
              fontSize='0.85rem'
              fontWeight='semibold'
              lineHeight='shorter'
              mt={2}
              px={1}
              py={0.5}
              width='unset'
            >
              {dateRange?.[0] !== undefined ? allData[dateRange[0]]?.label : ''}
            </Text>
          </RangeSliderThumb>
          <RangeSliderThumb
            id='thumb-slider-2'
            index={1}
            borderColor={`${colorScheme}.200`}
            boxSize={5}
            left='-0.625rem' // center by displacing by half the size of the thumb.
          >
            <Text
              position='absolute'
              top={4}
              left={thumbsSameValue ? 'unset' : 0}
              bg='white'
              border='0.5px solid'
              borderColor='gray.200'
              fontSize='0.85rem'
              fontWeight='semibold'
              lineHeight='shorter'
              mt={2}
              opacity={thumbsSameValue ? 0 : 1}
              px={1}
              py={0.5}
              width='unset'
            >
              {dateRange?.[1] !== undefined ? allData[dateRange[1]]?.label : ''}
            </Text>
          </RangeSliderThumb>
        </RangeSlider>
      </Box>
    );
  },
);
