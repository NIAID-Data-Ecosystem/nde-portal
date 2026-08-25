import '@testing-library/jest-dom';

import { ChakraProvider } from '@chakra-ui/react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { system } from 'src/theme';

import { CreditText } from './credit-text';

jest.mock('src/components/source-logo/helpers', () => ({
  getAccessResourceURL: jest.fn(() => 'https://example.com/access'),
}));

const renderWithChakra = (ui: React.ReactElement) =>
  render(<ChakraProvider value={system}>{ui}</ChakraProvider>);

// The "Show more" toggle only appears when the clamped container overflows.
// jsdom reports 0 for both measurements, so stub them for the overflow cases.
const mockOverflow = (isOverflowing: boolean) => {
  jest
    .spyOn(HTMLElement.prototype, 'scrollHeight', 'get')
    .mockReturnValue(isOverflowing ? 300 : 60);
  jest.spyOn(HTMLElement.prototype, 'clientHeight', 'get').mockReturnValue(60);
};

describe('CreditText', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders the optional heading label', () => {
    renderWithChakra(
      <CreditText
        label='Citation'
        tooltipLabel='How to cite'
        data={{ creditText: 'Cite this dataset.' } as any}
      />,
    );

    expect(
      screen.getByRole('heading', { name: 'Citation' }),
    ).toBeInTheDocument();
  });

  it('renders the credit text', () => {
    renderWithChakra(
      <CreditText data={{ creditText: 'Cite this dataset.' } as any} />,
    );

    expect(screen.getByText('Cite this dataset.')).toBeInTheDocument();
  });

  it('renders markdown links in the credit text as external links', () => {
    renderWithChakra(
      <CreditText
        data={
          {
            creditText:
              'See the [citation policy](https://example.com/policy) for details.',
          } as any
        }
      />,
    );

    const link = screen.getByRole('link', { name: /citation policy/ });
    expect(link).toHaveAttribute('href', 'https://example.com/policy');
    expect(link).toHaveAttribute('target', '_blank');
  });

  it('renders raw html anchors in the credit text as external links', () => {
    // rehype-raw is enabled so sources that send HTML rather than markdown
    // still get themed links.
    renderWithChakra(
      <CreditText
        data={
          {
            creditText:
              'See the <a href="https://example.com/policy">citation policy</a>.',
          } as any
        }
      />,
    );

    expect(
      screen.getByRole('link', { name: /citation policy/ }),
    ).toHaveAttribute('href', 'https://example.com/policy');
  });

  it('falls back to a link to the resource when there is no credit text', () => {
    renderWithChakra(
      <CreditText
        data={
          {
            '@type': 'Dataset',
            includedInDataCatalog: { name: 'Source' },
            url: 'https://example.com/record',
          } as any
        }
      />,
    );

    expect(
      screen.getByText(/for complete citation guidance/),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: /access the resource/ }),
    ).toHaveAttribute('href', 'https://example.com/access');
  });

  it('does not render the toggle when the credit text fits within the clamp', () => {
    mockOverflow(false);
    renderWithChakra(
      <CreditText data={{ creditText: 'Cite this dataset.' } as any} />,
    );

    expect(
      screen.queryByRole('button', { name: /Show more/ }),
    ).not.toBeInTheDocument();
  });

  it('does not render the toggle for the fallback message even when it overflows', () => {
    mockOverflow(true);
    renderWithChakra(
      <CreditText data={{ '@type': 'Dataset', url: 'https://x.com' } as any} />,
    );

    expect(
      screen.queryByRole('button', { name: /Show more/ }),
    ).not.toBeInTheDocument();
  });

  it('toggles between "Show more" and "Show less" when the credit text overflows', async () => {
    mockOverflow(true);
    const user = userEvent.setup();
    renderWithChakra(
      <CreditText data={{ creditText: 'A very long credit text.' } as any} />,
    );

    const toggle = screen.getByRole('button', { name: /Show more/ });
    await user.click(toggle);

    expect(
      screen.getByRole('button', { name: /Show less/ }),
    ).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /Show less/ }));

    expect(
      screen.getByRole('button', { name: /Show more/ }),
    ).toBeInTheDocument();
  });
});
