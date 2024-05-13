import React from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import { Box, BoxProps, Highlight, HighlightProps } from '@chakra-ui/react';
import { ReactMarkdownOptions } from 'react-markdown/lib/react-markdown';

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
  let formattedContent = contentString
    .replace(/\u00a0/g, ' ')
    .replace(`&emsp;`, ' ');
  return formattedContent;
};

export const DisplayHTMLContent: React.FC<DisplayHTMLContentProps> = ({
  content,
  reactMarkdownProps,
  highlightProps,
  ...props
}) => {
  if (!content || typeof content !== 'string') {
    return <></>;
  }

  return (
    <Box
      w='100%'
      fontSize='sm'
      flex={1}
      style={{ whiteSpace: 'pre-wrap' }}
      sx={{
        pre: { display: 'none' },
        // Display nested links with nde link format.
        a: {
          color: 'link.color',
          textDecoration: 'underline',
          _hover: { textDecoration: 'none' },
          wordBreak: 'break-word',
        },
        '>*': {
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
        },
      }}
      {...props}
    >
      <ReactMarkdown
        rehypePlugins={[rehypeRaw, remarkGfm]}
        {...reactMarkdownProps}
        components={{
          p: ({ children }) => {
            return highlightProps?.query ? (
              <Highlight
                {...highlightProps}
                styles={{
                  px: '0.5',
                  py: '1',
                  bg: 'orange.100',
                  color: 'inherit',
                  ...highlightProps.styles,
                }}
              >
                {children.join('')}
              </Highlight>
            ) : (
              children
            );
          },
        }}
      >
        {formatContent(content)}
      </ReactMarkdown>
    </Box>
  );
};
