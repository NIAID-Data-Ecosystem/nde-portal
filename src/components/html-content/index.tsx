import { Box, BoxProps, HighlightProps, useHighlight } from '@chakra-ui/react';
import React from 'react';
import ReactMarkdown from 'react-markdown';
import { ReactMarkdownOptions } from 'react-markdown/lib/react-markdown';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';

/**
 * Displays + formats HTML block content.
 */

interface DisplayHTMLContentProps extends BoxProps {
  content: string;
  reactMarkdownProps?: Partial<ReactMarkdownOptions>;
  highlightProps?: Omit<HighlightProps, 'children'>;
}

export const DisplayHTMLString: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  if (!children || typeof children !== 'string') {
    return <></>;
  }

  const formatContent = (contentString: DisplayHTMLContentProps['content']) => {
    // replace no break space with breaking space.
    let formattedContent = contentString.replace(/\u00a0/g, ' ');
    return formattedContent;
  };
  return (
    <ReactMarkdown rehypePlugins={[rehypeRaw, remarkGfm]} linkTarget='_blank'>
      {formatContent(children)}
    </ReactMarkdown>
  );
};

const formatContent = (contentString: DisplayHTMLContentProps['content']) => {
  // replace no break space with breaking space.
  return contentString
    .replace(/\u00a0|&emsp;/g, ' ')
    .replace(/]]>/g, '\n') // Convert ]]> to newline
    .split('\n')
    .map(line => line.trim())
    .join('\n');
};

export const DisplayHTMLContent: React.FC<DisplayHTMLContentProps> = ({
  content,
  reactMarkdownProps,
  highlightProps,
  css,
  ...props
}) => {
  // Highlight search query in content.
  const chunks = useHighlight({
    text: formatContent(content),
    query: highlightProps?.query || [],
  }).map(chunk => {
    if (chunk.match) {
      return `<mark>${chunk.text}</mark>`;
    }
    return chunk.text;
  });
  if (!content || typeof content !== 'string') {
    return <></>;
  }

  return (
    <Box
      w='100%'
      fontSize='lg'
      flex={1}
      style={{ whiteSpace: 'pre-line' }}
      lineHeight='inherit'
      css={{
        // Display nested links with nde link format.
        '& *': {
          whiteSpace: 'pre-line',
          wordBreak: 'break-word',
          lineHeight: 'inherit',
        },
        '& a': {
          color: 'link.default',
          textDecoration: 'underline',
          _hover: { textDecoration: 'none' },
        },
        '& mark': {
          px: 0.5,
          bg: 'orange.100',
          color: 'inherit',
          ...highlightProps?.styles,
        },

        lineHeight: 'inherit',
        ...css,
      }}
      {...props}
    >
      <ReactMarkdown
        rehypePlugins={[rehypeRaw, remarkGfm]}
        {...reactMarkdownProps}
      >
        {chunks.join('')}
      </ReactMarkdown>
    </Box>
  );
};
