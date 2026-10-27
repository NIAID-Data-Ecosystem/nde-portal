import React from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import { render, screen } from 'src/__tests__/utils/render';
import { useMDXComponents } from 'src/components/mdx/hooks/useMDXComponents';

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
});
