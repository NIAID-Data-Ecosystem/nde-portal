import { useMDXComponents } from 'src/components/mdx/hooks/useMDXComponents';
import { MDXComponents } from 'mdx/types';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';

/**
 *  Function to fill template placeholders with provided variables
 * @param {string} template - The template string containing placeholders.
 * @param {Record<string, string>} vars - An object containing key-value pairs for
 * @returns {string} - The template string with placeholders replaced by corresponding values.
 */

export const fillTemplatePlaceholders = (
  template: string,
  vars: Record<string, string>,
) => {
  return template.replace(/{{(\w+)}}/g, (_, key) => vars[key] ?? '');
};

export const MarkdownContent = ({
  template,
  replacements,
  mdxComponentsOverrides = {},
}: {
  template: string;
  replacements: Record<string, string>;
  mdxComponentsOverrides?: MDXComponents;
}) => {
  const MDXComponents = useMDXComponents(mdxComponentsOverrides);

  return (
    <ReactMarkdown
      rehypePlugins={[rehypeRaw, remarkGfm]}
      components={MDXComponents}
    >
      {fillTemplatePlaceholders(template, replacements)}
    </ReactMarkdown>
  );
};
