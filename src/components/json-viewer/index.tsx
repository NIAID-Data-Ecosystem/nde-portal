import { Box, Flex, Heading } from '@chakra-ui/react';
import { JSONTree } from 'react-json-tree';
import { CopyButton } from 'src/components/copy-button';

import { ScrollContainerProps } from '../scroll-container';
import { ScrollContainer } from '../scroll-container';
import theme from './theme';

/*
 [COMPONENT INFO]: Code block to display and copy JSON content.
*/

interface JsonViewerProps extends ScrollContainerProps {
  data: Object;
}

export const JsonViewer = ({ data, ...props }: JsonViewerProps) => {
  return (
    <Box position='relative' bg={theme.base00} borderRadius='8px'>
      <Flex
        borderTopRadius='8px'
        bg='whiteAlpha.200'
        px={4}
        py={2}
        w='100%'
        alignItems='center'
        justifyContent='space-between'
      >
        <Heading
          as='h3'
          fontSize='sm'
          fontWeight='semibold'
          textTransform='uppercase'
          color='whiteAlpha.700'
        >
          JSON Metadata
        </Heading>
        <CopyButton
          textToCopy={JSON.stringify(data, null, 2)}
          buttonText='Copy'
          copiedText='Metadata copied!'
          buttonProps={{
            size: 'xs',
          }}
        />
      </Flex>
      <ScrollContainer
        display='flex'
        tabIndex={0}
        bg={theme.base00}
        borderBottomRadius='8px'
        flexDirection='column'
        fontSize='sm'
        fontFamily='monospace'
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
