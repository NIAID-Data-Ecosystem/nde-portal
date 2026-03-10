import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import {
  FiltersChartToggle,
  FiltersDisclaimer,
} from '../../components/filters-chart-toggle';

describe('refactored-filters/components/filters-chart-toggle', () => {
  it('renders disclaimer copy', () => {
    render(<FiltersDisclaimer />);
    expect(
      screen.getByText(/show or hide the display of its chart/i),
    ).toBeInTheDocument();
  });

  it('sets aria label based on active state and handles click', () => {
    const onClick = jest.fn();
    const { rerender } = render(
      <FiltersChartToggle isActive={false} name='Topic' onClick={onClick} />,
    );

    const addBtn = screen.getByRole('button', {
      name: /add topic visualisation chart/i,
    });
    fireEvent.click(addBtn);
    expect(onClick).toHaveBeenCalled();

    rerender(<FiltersChartToggle isActive name='Topic' onClick={onClick} />);
    expect(
      screen.getByRole('button', { name: /remove topic visualisation chart/i }),
    ).toBeInTheDocument();
  });
});
