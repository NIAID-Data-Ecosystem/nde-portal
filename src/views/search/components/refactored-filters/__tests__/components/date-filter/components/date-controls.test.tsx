import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { DateControls } from '../../../../components/date-filter/components/date-controls';

jest.mock('../../../../components/date-filter/components/date-picker', () => ({
  DatePicker: ({ handleSelectedFilter, resetFilter }: any) => (
    <>
      <button
        onClick={() => handleSelectedFilter(['2020-01-01', '2020-12-31'])}
      >
        pick
      </button>
      <button onClick={resetFilter}>reset</button>
    </>
  ),
}));

describe('date-controls', () => {
  it('toggles _exists_ when no date is selected', () => {
    const onDateSelect = jest.fn();
    render(
      <DateControls
        colorScheme='secondary'
        selectedDates={[]}
        resourcesWithNoDate={
          [{ term: '-_exists_', label: 'No', count: 10 }] as any
        }
        onDateSelect={onDateSelect}
        onResetFilter={jest.fn()}
      />,
    );

    fireEvent.click(screen.getByRole('checkbox'));
    expect(onDateSelect).toHaveBeenCalledWith(['_exists_']);
  });

  it('removes _exists_ when toggled off and toggles -_exists_ branch', () => {
    const onDateSelect = jest.fn();
    const { rerender } = render(
      <DateControls
        colorScheme='secondary'
        selectedDates={['_exists_']}
        resourcesWithNoDate={
          [{ term: '-_exists_', label: 'No', count: 1 }] as any
        }
        onDateSelect={onDateSelect}
        onResetFilter={jest.fn()}
      />,
    );

    fireEvent.click(screen.getByRole('checkbox'));
    expect(onDateSelect).toHaveBeenCalledWith([]);

    rerender(
      <DateControls
        colorScheme='secondary'
        selectedDates={['2020-01-01', '2020-12-31']}
        resourcesWithNoDate={
          [{ term: '-_exists_', label: 'No', count: 1 }] as any
        }
        onDateSelect={onDateSelect}
        onResetFilter={jest.fn()}
      />,
    );
    fireEvent.click(screen.getByRole('checkbox'));
    expect(onDateSelect).toHaveBeenLastCalledWith([
      '2020-01-01',
      '2020-12-31',
      '-_exists_',
    ]);
  });

  it('disables no-date checkbox when no no-date resources exist', () => {
    render(
      <DateControls
        colorScheme='secondary'
        selectedDates={[]}
        resourcesWithNoDate={[] as any}
        onDateSelect={jest.fn()}
        onResetFilter={jest.fn()}
      />,
    );
    expect(screen.getByRole('checkbox')).toBeDisabled();
  });
});
