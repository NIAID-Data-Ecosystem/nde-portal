import React from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import { render, screen } from 'src/__tests__/utils/render';
import { useMDXComponents } from 'src/components/mdx/hooks/useMDXComponents';

import { getCalloutTheme, getPortalPath } from '.';

const Markdown = ({ children }: { children: string }) => {
  const components = useMDXComponents();
  return (
    <ReactMarkdown rehypePlugins={[rehypeRaw]} components={components}>
      {children}
    </ReactMarkdown>
  );
};

describe('MDX a', () => {
  it('renders a raw-HTML anchor without an href as a jump target', () => {
    const { container } = render(
      <Markdown>{'<a id="filters">Filters</a>\n\n[Portal](/search)'}</Markdown>,
    );
    const target = container.querySelector('a#filters');
    expect(target).toHaveTextContent('Filters');
    expect(target).not.toHaveAttribute('href');
    // Only the real link is exposed as one.
    expect(screen.getAllByRole('link')).toHaveLength(1);
    expect(screen.getByRole('link', { name: 'Portal' })).toHaveAttribute(
      'href',
      '/search',
    );
  });

  it('keeps same-page links in the current tab', () => {
    render(<Markdown>{'[see below](#filters)'}</Markdown>);
    const link = screen.getByRole('link', { name: 'see below' });
    expect(link).toHaveAttribute('href', '#filters');
    expect(link).not.toHaveAttribute('target');
    expect(link.querySelector('svg')).not.toBeInTheDocument();
  });

  it('still opens other sites in a new tab', () => {
    render(<Markdown>{'[Schema.org](https://schema.org/Dataset)'}</Markdown>);
    expect(screen.getByRole('link', { name: /Schema\.org/ })).toHaveAttribute(
      'target',
      '_blank',
    );
  });

  it('keeps pasted production URLs on the current site, in the same tab', () => {
    render(
      <Markdown>
        {'[Search](https://data.niaid.nih.gov/search?q=THP-1+Cells)'}
      </Markdown>,
    );
    const link = screen.getByRole('link', { name: 'Search' });
    expect(link).toHaveAttribute('href', '/search?q=THP-1+Cells');
    expect(link).not.toHaveAttribute('target');
    expect(link.querySelector('svg')).not.toBeInTheDocument();
  });

  it('leaves files Strapi serves as absolute, external links', () => {
    const href = 'https://data.niaid.nih.gov/strapi/uploads/guide.pdf';
    render(<Markdown>{`[Guide](${href})`}</Markdown>);
    const link = screen.getByRole('link', { name: /Guide/ });
    expect(link).toHaveAttribute('href', href);
    expect(link).toHaveAttribute('target', '_blank');
  });
});

describe('getPortalPath', () => {
  const originalUrl = process.env.NEXT_PUBLIC_BASE_URL;
  afterEach(() => {
    process.env.NEXT_PUBLIC_BASE_URL = originalUrl;
  });

  it.each([
    ['https://data.niaid.nih.gov', '/'],
    ['https://data.niaid.nih.gov/', '/'],
    ['https://data.niaid.nih.gov/knowledge-center/x', '/knowledge-center/x'],
    ['https://data.niaid.nih.gov?q=a', '?q=a'],
  ])('reduces %p to %p', (href, path) => {
    expect(getPortalPath(href)).toBe(path);
  });

  it('also reduces URLs on the site being built', () => {
    process.env.NEXT_PUBLIC_BASE_URL = 'https://data-staging.niaid.nih.gov';
    expect(getPortalPath('https://data-staging.niaid.nih.gov/search')).toBe(
      '/search',
    );
  });

  it.each([
    'https://data.niaid.nih.gov/strapi/uploads/a.pdf',
    'https://data.niaid.nih.gov.example.org/search',
    'https://schema.org/Dataset',
    '/search',
  ])('leaves %p alone', href => {
    expect(getPortalPath(href)).toBeUndefined();
  });
});

describe('MDX br', () => {
  it('renders a real line break', () => {
    const { container } = render(<Markdown>{'one<br/>two  \nthree'}</Markdown>);
    expect(container.querySelectorAll('br')).toHaveLength(2);
  });
});

describe('getCalloutTheme', () => {
  it.each([
    ['⚠️ The visualizations are in beta', 'warning'],
    ['🚧 Under construction', 'warning'],
    ['🚨 Breaking change', 'error'],
    ['📘 NIAID Data Ecosystem schemas', 'info'],
    ['What is metadata?', 'info'],
    [undefined, 'info'],
  ])('colours %p as %p', (text, color) => {
    expect(getCalloutTheme(text).color).toBe(color);
  });
});

describe('MDX headings', () => {
  it('keeps the anchor "#" out of the heading name', () => {
    render(<Markdown>{'## Getting started'}</Markdown>);
    expect(
      screen.getByRole('heading', { level: 2, name: /^Getting started\s*$/ }),
    ).toBeInTheDocument();
  });
});

describe('MDX details', () => {
  it('puts the toggle button inside a heading', () => {
    render(
      <Markdown>
        {
          '<details>\n<summary>About the Sources</summary>\n\nBody text\n\n</details>'
        }
      </Markdown>,
    );
    const heading = screen.getByRole('heading', {
      level: 2,
      name: 'About the Sources',
    });
    const button = screen.getByRole('button', { name: 'About the Sources' });
    expect(heading).toContainElement(button);
    expect(button).toHaveAttribute('aria-expanded', 'false');
  });
});
