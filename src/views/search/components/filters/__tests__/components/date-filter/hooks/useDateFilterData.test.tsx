import React from 'react';
import { renderHook } from '@testing-library/react';
import { useDateFilterData } from '../../../../components/date-filter/hooks/useDateFilterData';

const setOnBrushChangeEnd = jest.fn();

jest.mock(
  '../../../../components/date-filter/hooks/useDateRangeContext',
  () => ({
    useDateRangeContext: () => ({ setOnBrushChangeEnd }),
  }),
);

describe('useDateFilterData', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns selected data, no-date resources, and availability flag', () => {
    const handleSelectedFilter = jest.fn();

    const { result } = renderHook(() =>
      useDateFilterData(
        {
          date: {
            data: [
              { term: '2021-01-01', label: '2021', count: 2 },
              { term: '-_exists_', label: 'No', count: 1 },
            ],
          } as any,
        } as any,
        {
          date: {
            data: [
              { term: '2020-01-01', label: '2020', count: 3 },
              { term: '-_exists_', label: 'No', count: 4 },
            ],
          } as any,
        } as any,
        'date',
        handleSelectedFilter,
      ),
    );

    expect(result.current.selectedData).toHaveLength(2);
    expect(result.current.resourcesWithNoDate).toEqual([
      { term: '-_exists_', label: 'No', count: 4 },
    ]);
    expect(result.current.hasAnyDateData).toBe(true);
    expect(setOnBrushChangeEnd).toHaveBeenCalled();

    const factory = setOnBrushChangeEnd.mock.calls[0][0];
    const callback = factory();
    callback('2019', '2020');
    expect(handleSelectedFilter).toHaveBeenCalledWith([
      '2019-01-01',
      '2020-12-31',
    ]);
  });

  it('handles missing selected data', () => {
    const { result } = renderHook(() =>
      useDateFilterData(undefined, undefined, 'date', jest.fn()),
    );
    expect(result.current.selectedData).toBeUndefined();
    expect(result.current.resourcesWithNoDate).toEqual([]);
    expect(result.current.hasAnyDateData).toBe(false);
  });
});
