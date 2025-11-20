import { Slider as RangeSlider } from '@chakra-ui/react';
import {
  DraggingIndicatorProps,
  ThumbProps,
} from 'node_modules/@chakra-ui/react/dist/types/components/slider/namespace';
import React from 'react';

import { useDateRangeContext } from '../hooks/useDateRangeContext';

interface FiltersRangeSliderProps {
  onChangeEnd: (args: string[]) => void;
}

interface SliderThumbProps {
  index: number;
  value: string;
  thumbProps?: ThumbProps;
  draggingIndicatorProps?: DraggingIndicatorProps;
}

const SliderThumb = ({
  index,
  value,
  thumbProps,
  draggingIndicatorProps,
}: SliderThumbProps) => {
  return (
    <RangeSlider.Thumb
      index={index}
      borderColor='colorPalette.400'
      cursor='pointer'
      {...thumbProps}
    >
      <RangeSlider.DraggingIndicator
        layerStyle='fill.solid'
        top='6'
        rounded='sm'
        px='1.5'
        {...draggingIndicatorProps}
      >
        {value}
      </RangeSlider.DraggingIndicator>
    </RangeSlider.Thumb>
  );
};

export const Slider: React.FC<FiltersRangeSliderProps> = React.memo(
  ({ onChangeEnd }) => {
    const {
      colorPalette,
      data,
      dates,
      dateRange,
      setDateRange,
      setIsDragging,
    } = useDateRangeContext();

    // Show as disabled there is no range to the data (i.e. more than one step in range) or if non year data is selected.
    const isDisabled = data && data.length <= 1;

    if (!data || dateRange?.length !== 2) {
      return <></>;
    }

    return (
      <RangeSlider.Root
        id='date-slider'
        w='100%'
        colorPalette={colorPalette}
        size='md'
        disabled={isDisabled}
        value={dateRange}
        // eslint-disable-next-line jsx-a11y/aria-proptypes
        aria-label={['date-min', 'date-max']}
        thumbAlignment='center'
        min={0}
        max={data.length - 1}
        onValueChange={e => {
          const values = e.value;
          // only update if dates have changed
          if (values[0] !== dateRange[0] || values[1] !== dateRange[1]) {
            setDateRange(values);
            setIsDragging(true);
          }
        }}
        onValueChangeEnd={e => {
          const values = e.value;
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
        <RangeSlider.Control>
          <RangeSlider.Track bg='colorPalette.200' h={1}>
            <RangeSlider.Range bg='colorPalette.400' />
          </RangeSlider.Track>

          {/* Starting slider thumb */}
          <SliderThumb
            index={0}
            value={
              dateRange?.[0] !== undefined ? data[dateRange[0]]?.label : ''
            }
          />

          {/* Ending slider thumb */}
          <SliderThumb
            index={1}
            value={
              dateRange?.[1] !== undefined ? data[dateRange[1]]?.label : ''
            }
          />
        </RangeSlider.Control>
      </RangeSlider.Root>
    );
  },
);
