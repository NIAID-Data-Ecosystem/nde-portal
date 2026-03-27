import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { Checkbox } from '../../components/checkbox';

const sendGTMEvent = jest.fn();

jest.mock('@next/third-parties/google', () => ({
  sendGTMEvent: (...args: any[]) => sendGTMEvent(...args),
}));

jest.mock('src/components/tooltip', () => ({
  __esModule: true,
  default: ({ children, label }: any) => (
    <div>
      <span data-testid='tooltip-label'>{String(label)}</span>
      {children}
    </div>
  ),
}));

describe('filters/components/checkbox', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders header row when isHeader is true', () => {
    render(
      <Checkbox
        term='header'
        label='Group A'
        count={0}
        isHeader
        isLoading={false}
        filterName='Source'
      />,
    );

    expect(screen.getByText('Group A')).toBeInTheDocument();
  });

  it('renders split labels and exists label formatting', () => {
    const { rerender } = render(
      <Checkbox
        term='scientific | common'
        label='scientific | common'
        count={3}
        isLoading={false}
        filterName='Species'
      />,
    );
    expect(screen.getByText('Common')).toBeInTheDocument();
    expect(screen.getByText('Scientific')).toBeInTheDocument();

    rerender(
      <Checkbox
        term='_exists_'
        label='Any'
        count={4}
        isLoading={false}
        filterName='Date'
      />,
    );
    expect(screen.getByText('Any date')).toBeInTheDocument();
  });

  it('tracks GTM event for exists terms only', () => {
    const { rerender } = render(
      <Checkbox
        term='_exists_'
        label='Any'
        count={1}
        isLoading={false}
        filterName='Date'
      />,
    );

    fireEvent.click(screen.getByRole('checkbox'));
    expect(sendGTMEvent).toHaveBeenCalledTimes(1);

    rerender(
      <Checkbox
        term='regular'
        label='Regular'
        count={1}
        isLoading={false}
        filterName='Date'
      />,
    );
    fireEvent.click(screen.getByRole('checkbox'));
    expect(sendGTMEvent).toHaveBeenCalledTimes(1);
  });
});
