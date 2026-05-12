import React from 'react';
import { render, screen } from '@testing-library/react';
import { HistogramSection } from '../../../../components/date-filter/components/histogram-section';

jest.mock('next/dynamic', () => () => (props: any) => (
  <div data-testid='histogram'>{JSON.stringify(props.updatedData || [])}</div>
));

jest.mock('next/router', () => ({
  useRouter: () => ({ pathname: '/search' }),
}));

jest.mock('src/utils/feature-flags', () => ({
  SHOW_VISUAL_SUMMARY: false,
}));

describe('histogram-section', () => {
  it('shows loading overlay while loading', () => {
    render(
      <HistogramSection
        data={[]}
        hasData
        isLoading
        isUpdating={false}
        onDateSelect={jest.fn()}
      />,
    );
    expect(screen.getByTestId('histogram')).toBeInTheDocument();
    expect(document.querySelector('.chakra-spinner')).toBeInTheDocument();
  });
});
