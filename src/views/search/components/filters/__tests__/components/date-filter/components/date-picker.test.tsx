import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { DatePicker } from '../../../../components/date-filter/components/date-picker';

jest.mock(
  '../../../../components/date-filter/hooks/useDateRangeContext',
  () => ({
    useDateRangeContext: () => ({
      allData: [
        { term: '2020-01-01', label: '2020', count: 2 },
        { term: '2023-01-01', label: '2023', count: 3 },
      ],
    }),
  }),
);

describe('date-picker', () => {
  it('initializes from selectedDates and submits chosen range', () => {
    const handleSelectedFilter = jest.fn();
    render(
      <DatePicker
        colorScheme='secondary'
        selectedDates={['2020-01-01', '2022-12-31']}
        handleSelectedFilter={handleSelectedFilter}
        resetFilter={jest.fn()}
      />,
    );

    fireEvent.change(screen.getByLabelText(/start date/i), {
      target: { value: '2021-01-01' },
    });
    fireEvent.change(screen.getByLabelText(/end date/i), {
      target: { value: '2022-12-31' },
    });
    fireEvent.click(screen.getByRole('button', { name: /submit/i }));

    expect(handleSelectedFilter).toHaveBeenCalledWith([
      '2021-01-01',
      '2022-12-31',
    ]);
  });

  it('caps future end year and supports reset button', () => {
    const handleSelectedFilter = jest.fn();
    const resetFilter = jest.fn();
    render(
      <DatePicker
        colorScheme='secondary'
        selectedDates={['2020-01-01', '2099-12-31'] as any}
        handleSelectedFilter={handleSelectedFilter}
        resetFilter={resetFilter}
      />,
    );

    fireEvent.submit(document.querySelector('#date-picker') as HTMLFormElement);
    expect(handleSelectedFilter).toHaveBeenCalledWith([
      '2020-01-01',
      '2023-12-31',
    ]);

    fireEvent.click(screen.getByRole('button', { name: /reset/i }));
    expect(resetFilter).toHaveBeenCalled();
  });
});
