import userEvent from '@testing-library/user-event';
import mockRouter from 'next-router-mock';
import React from 'react';
import { act, render, screen } from 'src/__tests__/utils/render';

import {
  AccessBadgeCell,
  LinkListCell,
  renderTerm,
  ResourceLinkCell,
  TagsCell,
  TermsCell,
  TermValue,
} from '../cells';

// The shared mock keeps only an object href's pathname; keep its query too.
jest.mock('next/link', () => {
  const { forwardRef } = jest.requireActual('react');
  const { format } = jest.requireActual('url');
  return {
    __esModule: true,
    default: forwardRef(
      ({ href, children, prefetch, as, ...rest }: any, ref: any) => (
        <a
          ref={ref}
          href={typeof href === 'string' ? href : format(href)}
          data-as={as}
          {...rest}
        >
          {children}
        </a>
      ),
    ),
  };
});

const renderTerms = (...terms: TermValue[]) =>
  render(<>{terms.map((term, index) => renderTerm(term, index))}</>);

describe('renderTerm', () => {
  it('renders nothing for null, undefined, blank strings and unknown shapes', () => {
    const { container } = renderTerms(
      null,
      undefined,
      '',
      { foo: 'bar' } as unknown as TermValue,
      { '@type': 'QuantitativeValue' },
      { name: '', identifier: '' },
      Number.NaN,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('capitalizes strings and term names', () => {
    renderTerms('hello world', { name: 'influenza A virus' });
    expect(screen.getByText('Hello world')).toBeInTheDocument();
    expect(screen.getByText('Influenza A virus')).toBeInTheDocument();
  });

  it('falls back to the identifier when a term has no name', () => {
    renderTerms({ identifier: 'NCBI:12345' });
    expect(screen.getByText('NCBI:12345')).toBeInTheDocument();
  });

  it('links a term with a url, falling back to the url as its text', () => {
    renderTerms(
      { name: 'Influenza', url: 'https://example.com/flu' },
      { name: '', url: 'https://example.com/other' },
    );
    expect(screen.getByRole('link', { name: /Influenza/ })).toHaveAttribute(
      'href',
      'https://example.com/flu',
    );
    expect(
      screen.getByRole('link', { name: /https:\/\/example\.com\/other/ }),
    ).toHaveAttribute('href', 'https://example.com/other');
  });

  it('reads booleans as Yes / No (a real value, not a missing one)', () => {
    renderTerms(true, false);
    expect(screen.getByText('Yes')).toBeInTheDocument();
    expect(screen.getByText('No')).toBeInTheDocument();
  });

  it('formats quantities with their unit', () => {
    renderTerms(
      { value: 1234 },
      { minValue: 5, maxValue: 10, unitText: 'YEAR' },
      { minValue: 7, unitText: 'CELL_COUNT' },
    );
    expect(screen.getByText('1,234')).toBeInTheDocument();
    expect(screen.getByText('5 - 10 years')).toBeInTheDocument();
    expect(screen.getByText('>= 7 cell counts')).toBeInTheDocument();
  });

  it('treats a QuantitativeValue with only a name as a quantity, not a term', () => {
    // Its name is shown as is: a term name would be capitalized.
    renderTerms({ '@type': 'QuantitativeValue', name: '42 year' });
    expect(screen.getByText('42 year')).toBeInTheDocument();
  });
});

describe('TermsCell', () => {
  it('shows the "No data" placeholder when nothing in it can be shown', () => {
    render(<TermsCell values={[null, '', { name: '' }]} />);
    expect(screen.getByText('No data')).toBeInTheDocument();
  });

  it('shows a single value as is, and a list with "Show N More" past five', async () => {
    const user = userEvent.setup();
    const { rerender } = render(<TermsCell values='mouse' />);
    expect(screen.getByText('Mouse')).toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();

    rerender(
      <TermsCell
        values={['a', 'b', 'c', 'd', 'e', 'f', 'g']}
        toggleContext='Species'
      />,
    );
    expect(screen.queryByText('F')).not.toBeInTheDocument();
    const toggle = screen.getByRole('button', {
      name: 'Show 2 More Species',
    });
    await user.click(toggle);
    expect(screen.getByText('G')).toBeInTheDocument();
  });
});

describe('TagsCell', () => {
  it('shows each value as a tag, or "No data" without any', () => {
    const { rerender } = render(<TagsCell values={['Immunology', '']} />);
    expect(screen.getByText('Immunology').closest('.nde-tag')).not.toBeNull();
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
    rerender(<TagsCell values={[]} />);
    expect(screen.getByText('No data')).toBeInTheDocument();
  });

  it('links each tag to the search getSearchHref returns', () => {
    render(
      <TagsCell
        values={['Immunology', 'Virology']}
        getSearchHref={value => ({ pathname: '/search', query: { q: value } })}
      />,
    );
    const links = screen.getAllByRole('link');
    expect(links.map(link => link.textContent)).toEqual([
      'Immunology',
      'Virology',
    ]);
    expect(links[0]).toHaveAttribute('href', '/search?q=Immunology');
  });

  describe('a clipped search link', () => {
    // jsdom has no layout: make every tag's text read as clipped.
    beforeEach(() => {
      jest
        .spyOn(HTMLElement.prototype, 'scrollWidth', 'get')
        .mockReturnValue(200);
      jest
        .spyOn(HTMLElement.prototype, 'clientWidth', 'get')
        .mockReturnValue(100);
    });
    afterEach(() => jest.restoreAllMocks());

    const renderLinks = () =>
      render(
        <TagsCell
          values={['Genotype and phenotype', 'Virology']}
          getSearchHref={value => ({
            pathname: '/search',
            query: { q: value },
          })}
        />,
      );

    it('shows its full name in a tooltip on hover, without repeating it as its description', async () => {
      const user = userEvent.setup();
      renderLinks();
      await user.hover(
        screen.getByRole('link', { name: 'Genotype and phenotype' }),
      );
      expect(await screen.findByRole('tooltip')).toHaveTextContent(
        'Genotype and phenotype',
      );
      expect(
        screen.getByRole('link', { name: 'Genotype and phenotype' }),
      ).not.toHaveAccessibleDescription();
    });

    it('shows the tooltip on keyboard focus, and keeps the focus', async () => {
      const user = userEvent.setup();
      renderLinks();
      await user.tab();
      expect(await screen.findByRole('tooltip')).toHaveTextContent(
        'Genotype and phenotype',
      );
      expect(
        screen.getByRole('link', { name: 'Genotype and phenotype' }),
      ).toHaveFocus();
      await user.tab();
      expect(screen.getByRole('link', { name: 'Virology' })).toHaveFocus();
    });
  });
});

describe('LinkListCell', () => {
  it('shows the "No data" placeholder when no entry has a label or url', () => {
    render(<LinkListCell entries={[{ label: '', url: null }]} />);
    expect(screen.getByText('No data')).toBeInTheDocument();
  });

  it('links entries with a url externally and shows the rest as text', () => {
    render(
      <LinkListCell
        entries={[
          { label: 'NIAID', url: 'https://ror.org/043z4tv69' },
          { label: 'No Funding', url: null },
        ]}
      />,
    );
    const link = screen.getByRole('link', { name: /NIAID/ });
    expect(link).toHaveAttribute('href', 'https://ror.org/043z4tv69');
    expect(link).toHaveAttribute('target', '_blank');
    expect(screen.getByText('No Funding')).toBeInTheDocument();
    expect(screen.getAllByRole('link')).toHaveLength(1);
  });

  it('renders each entry as its own element, so unlinked entries stay on their own lines', () => {
    render(
      <LinkListCell
        entries={[{ label: 'Electron Micrograph' }, { label: 'Gene Variant' }]}
      />,
    );
    // Adjacent bare text nodes would read as one ("Electron MicrographGene
    // Variant") and render on one line in the list's flex column.
    expect(screen.getByText('Electron Micrograph')).toBeInTheDocument();
    expect(screen.getByText('Gene Variant')).toBeInTheDocument();
  });
});

describe('ResourceLinkCell', () => {
  beforeEach(() => mockRouter.setCurrentUrl('/search?q=flu'));

  it('links to the resource page with the current page as referrer', () => {
    render(<ResourceLinkCell id='ds-1' label='Flu study' />);
    const link = screen.getByRole('link', { name: 'Flu study' });
    const href = new URL(link.getAttribute('href')!, 'http://x');
    expect(href.pathname).toBe('/resources/');
    expect(href.searchParams.get('id')).toBe('ds-1');
    expect(href.searchParams.get('referrerPath')).toBe('/search?q=flu');
    expect(link).toHaveAttribute('data-as', '/resources?id=ds-1');
  });

  it('shows plain text without an id, and "No data" without a label', () => {
    const { rerender } = render(<ResourceLinkCell label='Flu study' />);
    expect(screen.getByText('Flu study')).toBeInTheDocument();
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
    rerender(<ResourceLinkCell id='ds-1' label='' />);
    expect(screen.getByText('No data')).toBeInTheDocument();
  });
});

describe('AccessBadgeCell', () => {
  it('shows the result cards’ badge, or "No data" without a value', async () => {
    const { rerender } = render(<AccessBadgeCell value='Open' />);
    await act(async () => {});
    expect(screen.getByText('Open Access')).toBeInTheDocument();
    rerender(<AccessBadgeCell value={null} />);
    expect(screen.getByText('No data')).toBeInTheDocument();
  });
});
