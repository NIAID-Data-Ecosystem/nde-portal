import { Box, BoxProps } from 'nde-design-system';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
/**
 * Displays + formats HTML block content.
 */

interface DisplayHTMLContentProps extends BoxProps {
  content: string;
}

export const DisplayHTMLContent: React.FC<DisplayHTMLContentProps> = ({
  content,
  ...props
}) => {
  if (!content || typeof content !== 'string') {
    return <></>;
  }

  const formatContent = (contentString: DisplayHTMLContentProps['content']) => {
    // replace no break space with breaking space.
    let formattedContent = contentString.replace(/\u00a0/g, ' ');
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
