import { Box, FlexProps, Heading } from '@chakra-ui/react';
import theme from './theme';
import { JSONTree } from 'react-json-tree';
import { ScrollContainer } from '../scroll-container';
import { CopyButton } from 'src/components/copy-button';

/*
 [COMPONENT INFO]: Code block to display and copy JSON content.
*/

interface JsonViewerProps extends FlexProps {
  data: Object;
}

export const JsonViewer = ({ data, ...props }: JsonViewerProps) => {
  return (
    <Box position='relative' bg={theme.base00} borderRadius='8px'>
      <Heading
        as='h3'
        bg='whiteAlpha.200'
        borderTopRadius='8px'
        fontSize='xs'
        fontWeight='semibold'
        textTransform='uppercase'
        color='whiteAlpha.700'
        w='100%'
        p={4}
      >
        JSON Metadata
      </Heading>
      <CopyButton
        textToCopy={JSON.stringify(data, null, 2)}
        buttonText='Copy'
        copiedText='Metadata copied!'
        buttonProps={{
          size: 'sm',
          position: 'absolute',
          top: 2,
          right: 6,
          zIndex: 1,
        }}
      />
      <ScrollContainer
        display='flex'
        tabIndex={0}
        bg={theme.base00}
        borderBottomRadius='8px'
        flexDirection='column'
        fontSize='sm'
        fontFamily='monospace'
        lineHeight='tall'
        maxHeight={600}
        overflow='auto'
        pb={8}
        pl={5}
        pr={6}
        {...props}
      >
        <JSONTree
          data={data}
          theme={{ extend: theme }}
          shouldExpandNodeInitially={() => true}
        />
      </ScrollContainer>
    </Box>
  );
};
