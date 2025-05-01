import React from 'react';
import { render, screen } from '@testing-library/react';
import { LegendContainer, LegendItem } from '../legend';

describe('LegendContainer', () => {
  it('renders with default title', () => {
    render(<LegendContainer />);
    expect(screen.getByText('Legend')).toBeInTheDocument();
    expect(screen.getByText('Counts')).toBeInTheDocument();
  });

  it('renders with a custom title', () => {
    render(<LegendContainer title='Custom Title' />);
    expect(screen.getByText('Custom Title')).toBeInTheDocument();
  });

  it('renders children elements', () => {
    render(
      <LegendContainer>
        <div>Child Element</div>
      </LegendContainer>,
    );
    expect(screen.getByText('Child Element')).toBeInTheDocument();
  });
});

describe('LegendItem', () => {
  it('renders with a count', () => {
    render(<LegendItem count={1234}>Label</LegendItem>);
    expect(screen.getByText('1,234')).toBeInTheDocument();
  });

  it('renders without a count', () => {
    render(<LegendItem>Label</LegendItem>);
    expect(screen.queryByText('1,234')).not.toBeInTheDocument();
  });
});
