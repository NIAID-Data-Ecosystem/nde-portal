import { useMDXComponents } from 'mdx-components';
import { MDXComponents } from 'mdx/types';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import { SectionDescription } from './section';

export const fillTemplatePlaceholders = (
  template: string,
  vars: Record<string, string>,
) => {
  return template.replace(/{{(\w+)}}/g, (_, key) => vars[key] ?? '');
};

export const MarkdownContent = ({
  template,
  replacements,
  mdxComponents,
}: {
  template: string;
  replacements: Record<string, string>;
  mdxComponents?: MDXComponents;
}) => {
  const MDXComponents = useMDXComponents({
    p: props => {
      return <SectionDescription {...props} />;
    },
    ...mdxComponents,
  });

  return (
    <ReactMarkdown
      rehypePlugins={[rehypeRaw, remarkGfm]}
      components={MDXComponents}
    >
      {fillTemplatePlaceholders(template, replacements)}
    </ReactMarkdown>
  );
};
