import React from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import { Box, BoxProps } from '@candicecz/test-design-system';
/**
 * Displays + formats HTML block content.
 */

interface DisplayHTMLContentProps extends BoxProps {
  content: string;
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

export const DisplayHTMLContent: React.FC<DisplayHTMLContentProps> = ({
  content,
  ...props
}) => {
  if (!content || typeof content !== 'string') {
    return <></>;
  }

  const formatContent = (contentString: DisplayHTMLContentProps['content']) => {
    // replace no break space with breaking space.
    let formattedContent = contentString
      .replace(/\u00a0/g, ' ')
      .replace(`&emsp;`, ' ');
    return formattedContent;
  };
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
      <ReactMarkdown rehypePlugins={[rehypeRaw, remarkGfm]} linkTarget='_blank'>
        {formatContent(content)}
      </ReactMarkdown>
    </Box>
  );
};
