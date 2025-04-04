import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ChartWrapper } from './chart-wrapper';
import { SectionTitle } from '../layouts/section';
import { ErrorMessage } from 'src/components/error';

jest.mock('../layouts/section', () => ({
  SectionTitle: jest.fn(({ children }) => <h4>{children}</h4>),
}));

jest.mock('src/components/error', () => ({
  ErrorMessage: jest.fn(({ message }) => <div>{message}</div>),
}));

describe('ChartWrapper', () => {
  it('renders the title and description when provided', () => {
    render(
      <ChartWrapper
        title='Test Title'
        description='Test Description'
        isLoading={false}
        error={null}
      />,
    );

    expect(SectionTitle).toHaveBeenCalledWith(
      expect.objectContaining({ children: 'Test Title' }),
      {},
    );
    expect(screen.getByText('Test Description')).toBeInTheDocument();
  });

  it('renders a skeleton loader when isLoading is true', () => {
    render(<ChartWrapper isLoading={true} error={null} />);

    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('renders an error message when error is provided', () => {
    const error = new Error('Test Error');
    render(<ChartWrapper isLoading={false} error={error} />);

    expect(ErrorMessage).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Test Error' }),
      {},
    );
    expect(screen.getByText('Test Error')).toBeInTheDocument();
  });

  it('renders children when isLoading is false and no error exists', () => {
    render(
      <ChartWrapper isLoading={false} error={null}>
        <div>Child Content</div>
      </ChartWrapper>,
    );

    expect(screen.getByText('Child Content')).toBeInTheDocument();
  });
});
