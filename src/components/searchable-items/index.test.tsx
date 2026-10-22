import userEvent from '@testing-library/user-event';
import { render, screen } from 'src/__tests__/utils/render';

import { SearchableItem, SearchableItems } from './index';

jest.mock('next/link', () => {
  const Link = ({ children, href }: any) => (
    <a href={typeof href === 'string' ? href : JSON.stringify(href)}>
      {children}
    </a>
  );
  Link.displayName = 'Link';
  return Link;
});

const item = (overrides: Partial<SearchableItem> = {}): SearchableItem => ({
  name: 'Dataset',
  value: 'Dataset',
  field: 'about.displayName',
  ...overrides,
});

describe('SearchableItems', () => {
  it('renders one tag per item', () => {
    render(
      <SearchableItems
        items={[item(), item({ name: 'Genome', value: 'Genome' })]}
        itemLimit={Infinity}
      />,
    );

    expect(screen.getAllByRole('link')).toHaveLength(2);
  });

  it('renders the heading before the tags', () => {
    render(<SearchableItems items={[item()]} heading='Content Types' />);

    expect(screen.getByText('Content Types')).toBeInTheDocument();
  });

  describe('links', () => {
    const getHref = () =>
      JSON.parse(screen.getByRole('link').getAttribute('href')!);

    it('searches field:"value" by default', () => {
      render(<SearchableItems items={[item()]} />);

      expect(getHref()).toEqual({
        pathname: '/search',
        query: { q: 'about.displayName:"Dataset"' },
      });
    });

    it('uses an explicit query verbatim', () => {
      const query = {
        q: '(about.name:"Dataset" OR @type:"Dataset")',
        tab: 'dc',
      };
      render(<SearchableItems items={[item({ query })]} />);

      expect(getHref()).toEqual({ pathname: '/search', query });
    });
  });

  // Callers build these objects fresh on every render, so deduplicating by
  // object identity silently keeps every duplicate.
  describe('deduplication', () => {
    it('collapses equal items that are separate objects', () => {
      render(<SearchableItems items={[item(), item()]} itemLimit={Infinity} />);

      expect(screen.getAllByRole('link')).toHaveLength(1);
    });

    it('collapses items sharing an explicit query', () => {
      const q = '(about.displayName:"Dataset" OR @type:"Dataset")';
      render(
        <SearchableItems
          items={[item({ query: { q } }), item({ query: { q } })]}
          itemLimit={Infinity}
        />,
      );

      expect(screen.getAllByRole('link')).toHaveLength(1);
    });

    it('ignores the order of query params', () => {
      const q = 'about.displayName:"Dataset"';
      render(
        <SearchableItems
          items={[
            item({ query: { q, tab: 'dc' } }),
            item({ query: { tab: 'dc', q } }),
          ]}
          itemLimit={Infinity}
        />,
      );

      expect(screen.getAllByRole('link')).toHaveLength(1);
    });

    // Same `q`, different tab: the links go to different places.
    it('keeps items whose queries differ in any param', () => {
      const q = 'about.displayName:"Dataset"';
      render(
        <SearchableItems
          items={[item({ query: { q } }), item({ query: { q, tab: 'dc' } })]}
          itemLimit={Infinity}
        />,
      );

      expect(screen.getAllByRole('link')).toHaveLength(2);
    });

    it('does not warn about duplicate keys', () => {
      const error = jest.spyOn(console, 'error').mockImplementation(() => {});

      render(<SearchableItems items={[item(), item()]} itemLimit={Infinity} />);

      expect(error).not.toHaveBeenCalledWith(
        expect.stringContaining('same key'),
        expect.anything(),
        expect.anything(),
      );
      error.mockRestore();
    });

    // The "show all items (N more)" button counts the items actually rendered.
    it('counts deduplicated items in the toggle button', () => {
      render(
        <SearchableItems
          items={[
            item(),
            item(),
            item({ name: 'Genome', value: 'Genome' }),
            item({ name: 'Image', value: 'Image' }),
          ]}
          itemLimit={1}
        />,
      );

      expect(
        screen.getByRole('button', { name: /show all items \(2 more\)/i }),
      ).toBeInTheDocument();
    });
  });

  describe('toggle', () => {
    const items = [
      item({ name: 'Alpha', value: 'Alpha' }),
      item({ name: 'Beta', value: 'Beta' }),
      item({ name: 'Gamma', value: 'Gamma' }),
    ];

    it('is hidden when every item fits within the limit', () => {
      render(<SearchableItems items={items} itemLimit={3} />);

      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });

    it('expands and collapses the list', async () => {
      const user = userEvent.setup();
      render(<SearchableItems items={items} itemLimit={1} />);

      const toggle = screen.getByRole('button', {
        name: 'Show all items (2 more)',
      });
      expect(toggle).toHaveAttribute('aria-expanded', 'false');
      expect(screen.getAllByRole('link')).toHaveLength(1);

      await user.click(toggle);
      expect(toggle).toHaveAttribute('aria-expanded', 'true');
      expect(toggle).toHaveTextContent('Show fewer items');
      expect(screen.getAllByRole('link')).toHaveLength(3);

      await user.click(toggle);
      expect(screen.getAllByRole('link')).toHaveLength(1);
    });

    it('names the items with itemLabel', () => {
      render(
        <SearchableItems items={items} itemLimit={1} itemLabel='keywords' />,
      );

      expect(
        screen.getByRole('button', { name: 'Show all keywords (2 more)' }),
      ).toBeInTheDocument();
    });

    it('defers to isExpanded and reports toggles when controlled', async () => {
      const user = userEvent.setup();
      const onToggle = jest.fn();
      render(
        <SearchableItems
          items={items}
          itemLimit={1}
          isExpanded={false}
          onToggle={onToggle}
        />,
      );

      await user.click(screen.getByRole('button'));

      expect(onToggle).toHaveBeenCalledWith(true);
      // The parent did not update `isExpanded`, so the list stays collapsed.
      expect(screen.getAllByRole('link')).toHaveLength(1);
    });
  });
});
