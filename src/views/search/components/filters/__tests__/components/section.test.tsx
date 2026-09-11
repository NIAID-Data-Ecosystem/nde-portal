import { Accordion } from '@chakra-ui/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { fireEvent, render, screen } from 'src/__tests__/utils/render';

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

  it('renders and expands panel content', async () => {
    render(
      <Accordion.Root multiple>
        <FiltersSection id='topic' name='Topic' description='topic description'>
          <div>section-content</div>
        </FiltersSection>
      </Accordion.Root>,
    );

    // zag's accordion trigger responds to a real pointer sequence; a bare
    // fireEvent.click leaves the item closed. Content then mounts through the
    // presence machine, so the assertion has to be async too.
    await userEvent.click(screen.getByRole('button', { name: /topic/i }));
    expect(await screen.findByText('section-content')).toBeInTheDocument();
  });

  it('shows chart toggle in visual-summary mode and invokes callback', () => {
    const onToggleViz = jest.fn();
    render(
      <Accordion.Root multiple>
        <FiltersSection
          id='topic'
          name='Topic'
          description='topic description'
          filterId='topic'
          isVizActive={false}
          onToggleViz={onToggleViz}
        >
          <div>section-content</div>
        </FiltersSection>
      </Accordion.Root>,
    );

    fireEvent.click(
      screen.getByRole('button', { name: /add topic visualisation chart/i }),
    );
    expect(onToggleViz).toHaveBeenCalledWith('topic');
  });
});
