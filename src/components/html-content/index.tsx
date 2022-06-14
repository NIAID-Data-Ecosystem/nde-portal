import { Box, BoxProps } from 'nde-design-system';

/**
 * Displays + formats HTML block content.
 *
 */

interface DisplayHTMLContentProps extends BoxProps {
  content: string;
}

export const DisplayHTMLContent: React.FC<DisplayHTMLContentProps> = ({
  content,
  ...props
}) => {
  if (!content) {
    return <></>;
  }

  const formatContent = (contentString: DisplayHTMLContentProps['content']) => {
    // replace no break space with breaking space.
    let formattedContent = contentString.replace(/\u00a0/g, ' ');

    // Links should be external.
    formattedContent = formattedContent.replaceAll(
      '<a ',
      "<a target='_blank' ",
    );
    return formattedContent;
  };
  return (
    <Box
      w='100%'
      fontSize='sm'
      flex={1}
      sx={{
        pre: { display: 'none' },
        // Display nested links with nde link format.
        a: {
          color: 'link.color',
          textDecoration: 'underline',
          _hover: { textDecoration: 'none' },
        },
      }}
      style={{ whiteSpace: 'pre-wrap' }}
      dangerouslySetInnerHTML={{
        __html: formatContent(content) || '',
      }}
      {...props}
    ></Box>
  );
};
