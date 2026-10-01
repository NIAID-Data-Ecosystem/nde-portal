import { render, screen } from '@testing-library/react';
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

  // Callers build these objects fresh on every render, so deduplicating by
  // object identity silently keeps every duplicate.
  describe('deduplication', () => {
    it('collapses equal items that are separate objects', () => {
      render(<SearchableItems items={[item(), item()]} itemLimit={Infinity} />);

      expect(screen.getAllByRole('link')).toHaveLength(1);
    });

    it('collapses items sharing an explicit query', () => {
      const query = '(about.displayName:"Dataset" OR @type:"Dataset")';
      render(
        <SearchableItems
          items={[item({ query }), item({ query })]}
          itemLimit={Infinity}
        />,
      );

      expect(screen.getAllByRole('link')).toHaveLength(1);
    });

    it('keeps items whose queries differ', () => {
      render(
        <SearchableItems
          items={[
            item({ query: 'about.displayName:"Dataset"' }),
            item({ query: '(about.displayName:"Dataset" OR @type:"Dataset")' }),
          ]}
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
});
