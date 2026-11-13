import userEvent from '@testing-library/user-event';
import React from 'react';
import { fireEvent, render, screen } from 'src/__tests__/utils/render';

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
  it('toggles _exists_ when no date is selected', async () => {
    const onDateSelect = jest.fn();
    render(
      <DateControls
        colorPalette='secondary'
        selectedDates={[]}
        resourcesWithNoDate={
          [{ term: '-_exists_', label: 'No', count: 10 }] as any
        }
        onDateSelect={onDateSelect}
        onResetFilter={jest.fn()}
      />,
    );

    await userEvent.click(screen.getByRole('checkbox'));
    expect(onDateSelect).toHaveBeenCalledWith(['_exists_']);
  });

  it('removes _exists_ when toggled off', async () => {
    const onDateSelect = jest.fn();
    render(
      <DateControls
        colorPalette='secondary'
        selectedDates={['_exists_']}
        resourcesWithNoDate={
          [{ term: '-_exists_', label: 'No', count: 1 }] as any
        }
        onDateSelect={onDateSelect}
        onResetFilter={jest.fn()}
      />,
    );

    await userEvent.click(screen.getByRole('checkbox'));
    expect(onDateSelect).toHaveBeenCalledWith([]);
  });

  it('adds -_exists_ when a date range is selected', async () => {
    const onDateSelect = jest.fn();
    // Rendered fresh rather than rerendered: the checkbox is controlled by
    // zag, and toggling a rerendered instance does not re-fire the machine.
    render(
      <DateControls
        colorPalette='secondary'
        selectedDates={['2020-01-01', '2020-12-31']}
        resourcesWithNoDate={
          [{ term: '-_exists_', label: 'No', count: 1 }] as any
        }
        onDateSelect={onDateSelect}
        onResetFilter={jest.fn()}
      />,
    );

    await userEvent.click(screen.getByRole('checkbox'));
    expect(onDateSelect).toHaveBeenLastCalledWith([
      '2020-01-01',
      '2020-12-31',
      '-_exists_',
    ]);
  });

  it('disables no-date checkbox when no no-date resources exist', () => {
    render(
      <DateControls
        colorPalette='secondary'
        selectedDates={[]}
        resourcesWithNoDate={[] as any}
        onDateSelect={jest.fn()}
        onResetFilter={jest.fn()}
      />,
    );
    expect(screen.getByRole('checkbox')).toBeDisabled();
  });
});
