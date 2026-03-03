import React from 'react';
import { render, screen } from '@testing-library/react';
import {
  DateRange,
  defaultContext,
  useDateRangeContext,
} from '../../../../components/date-filter/hooks/useDateRangeContext';

const ReadContext = () => {
  const ctx = useDateRangeContext();
  return (
    <>
      <div data-testid='allData'>{ctx.allData.length}</div>
      <div data-testid='filteredData'>{ctx.filteredData.length}</div>
      <div data-testid='dateStart'>{ctx.dates[0] || ''}</div>
      <div data-testid='dateEnd'>{ctx.dates[1] || ''}</div>
      <div data-testid='scheme'>{ctx.colorScheme}</div>
    </>
  );
};

describe('useDateRangeContext', () => {
  it('exposes default context shape', () => {
    expect(defaultContext.colorScheme).toBe('primary');
    expect(defaultContext.allData).toEqual([]);
    expect(defaultContext.filteredData).toEqual([]);
  });

  it('computes allData, filteredData, and date bounds from selected dates', () => {
    render(
      <DateRange
        data={[
          { term: '2020-01-01', label: '2020', count: 2 },
          { term: '2022-01-01', label: '2022', count: 4 },
          { term: '-_exists_', label: 'No', count: 1 },
          { term: '2099-01-01', label: '2099', count: 10 },
        ]}
        isLoading={false}
        selectedDates={['2020-01-01', '2022-12-31']}
        colorScheme='secondary'
      >
        <ReadContext />
      </DateRange>,
    );

    expect(
      Number(screen.getByTestId('allData').textContent),
    ).toBeGreaterThanOrEqual(3);
    expect(
      Number(screen.getByTestId('filteredData').textContent),
    ).toBeGreaterThanOrEqual(3);
    expect(screen.getByTestId('dateStart').textContent).toContain('2020');
    expect(screen.getByTestId('dateEnd').textContent).toContain('2022');
    expect(screen.getByTestId('scheme').textContent).toBe('secondary');
  });

  it('shows full range when selectedDates is empty or contains _exists_', () => {
    const { rerender } = render(
      <DateRange
        data={[{ term: '2021-01-01', label: '2021', count: 2 }]}
        isLoading={false}
        selectedDates={[]}
        colorScheme='primary'
      >
        <ReadContext />
      </DateRange>,
    );

    expect(screen.getByTestId('dateStart').textContent).toContain('2021');

    rerender(
      <DateRange
        data={[{ term: '2021-01-01', label: '2021', count: 2 }]}
        isLoading={false}
        selectedDates={['_exists_']}
        colorScheme='primary'
      >
        <ReadContext />
      </DateRange>,
    );

    expect(screen.getByTestId('dateEnd').textContent).toContain(
      String(new Date().getFullYear()),
    );
  });
});
