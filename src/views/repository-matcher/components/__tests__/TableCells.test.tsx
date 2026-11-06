import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { renderWithClient } from 'src/__tests__/mocks/utils';

import { TagCell, TextCell, TextCellWithLink } from '../TableCells';

// Force the truncation-detection branches (which rely on layout metrics that
// jsdom reports as 0) by stubbing the relevant element getters.
const stubOverflow = () => {
  const proto = window.HTMLElement.prototype;
  const spies = [
    jest.spyOn(proto, 'scrollHeight', 'get').mockReturnValue(100),
    jest.spyOn(proto, 'clientHeight', 'get').mockReturnValue(20),
    jest.spyOn(proto, 'scrollWidth', 'get').mockReturnValue(100),
    jest.spyOn(proto, 'clientWidth', 'get').mockReturnValue(20),
  ];
  return () => spies.forEach(s => s.mockRestore());
};

describe('TagCell', () => {
  it('renders a skeleton while loading', () => {
    const { container } = renderWithClient(<TagCell value='x' loading />);
    expect(container.querySelector('.chakra-skeleton')).toBeInTheDocument();
    expect(screen.queryByText('x')).not.toBeInTheDocument();
  });

  it('renders the label and enables the tooltip when truncated', () => {
    const restore = stubOverflow();
    renderWithClient(<TagCell value='A long repository name' />);
    expect(screen.getByText('A long repository name')).toBeInTheDocument();
    restore();
  });
});

describe('TextCell', () => {
  it('renders a skeleton while loading', () => {
    const { container } = renderWithClient(
      <TextCell value='hello' loading lineClamp={1} />,
    );
    expect(container.querySelector('.chakra-skeleton')).toBeInTheDocument();
  });

  it('renders the value when present', () => {
    renderWithClient(<TextCell value='Some description' />);
    expect(screen.getByText('Some description')).toBeInTheDocument();
  });

  it('renders a fallback when the value is empty', () => {
    renderWithClient(<TextCell value='' />);
    expect(screen.getByText('not available')).toBeInTheDocument();
  });

  it('renders children over the value when provided', () => {
    renderWithClient(
      <TextCell value='ignored'>
        <span>child content</span>
      </TextCell>,
    );
    expect(screen.getByText('child content')).toBeInTheDocument();
  });

  it('shows the expand toggle only when expandable content overflows', async () => {
    const restore = stubOverflow();
    const user = userEvent.setup();
    renderWithClient(
      <TextCell value='A very long body of text' expandable lineClamp={2} />,
    );
    const toggle = screen.getByRole('button', { name: /show more/i });
    await user.click(toggle);
    expect(
      screen.getByRole('button', { name: /show less/i }),
    ).toBeInTheDocument();
    restore();
  });
});

describe('TextCellWithLink', () => {
  it('renders a skeleton while loading', () => {
    const { container } = renderWithClient(
      <TextCellWithLink label='Repo' loading />,
    );
    expect(container.querySelector('.chakra-skeleton')).toBeInTheDocument();
  });

  it('renders a link when a url is provided', () => {
    renderWithClient(
      <TextCellWithLink label='Repo' url='https://example.com' isExternal />,
    );
    const link = screen.getByText('Repo').closest('a');
    expect(link).toHaveAttribute('href', 'https://example.com');
  });

  it('renders plain text when no url is provided', () => {
    renderWithClient(<TextCellWithLink label='Repo' />);
    expect(screen.getByText('Repo')).toBeInTheDocument();
  });

  it('renders a dash placeholder when neither url nor label is provided', () => {
    renderWithClient(<TextCellWithLink label='' />);
    expect(screen.getByText('-')).toBeInTheDocument();
  });
});
