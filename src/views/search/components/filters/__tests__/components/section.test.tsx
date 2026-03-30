import React from 'react';
import { Accordion } from '@chakra-ui/react';
import { fireEvent, render, screen } from '@testing-library/react';
import { FiltersSection } from '../../components/section';

jest.mock('src/components/tooltip', () => ({
  __esModule: true,
  default: ({ children }: any) => <>{children}</>,
}));

jest.mock('next/router', () => ({
  useRouter: () => ({ pathname: '/search' }),
}));

describe('filters/components/section', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders and expands panel content', () => {
    render(
      <Accordion allowMultiple>
        <FiltersSection name='Topic' description='topic description'>
          <div>section-content</div>
        </FiltersSection>
      </Accordion>,
    );

    fireEvent.click(screen.getByRole('button', { name: /topic/i }));
    expect(screen.getByText('section-content')).toBeInTheDocument();
  });

  it('shows chart toggle in visual-summary mode and invokes callback', () => {
    const onToggleViz = jest.fn();
    render(
      <Accordion allowMultiple>
        <FiltersSection
          name='Topic'
          description='topic description'
          filterId='topic'
          isVizActive={false}
          onToggleViz={onToggleViz}
        >
          <div>section-content</div>
        </FiltersSection>
      </Accordion>,
    );

    fireEvent.click(
      screen.getByRole('button', { name: /add topic visualisation chart/i }),
    );
    expect(onToggleViz).toHaveBeenCalledWith('topic');
  });
});
