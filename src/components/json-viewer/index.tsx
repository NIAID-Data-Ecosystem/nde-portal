import { Box, Flex, FlexProps, Heading } from 'nde-design-system';
import theme from './theme';
import { JSONTree } from 'react-json-tree';
import { CopyMetadata } from './components/copy-metadata';

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
        as='h5'
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
      <CopyMetadata
        metadataObject={JSON.stringify(data, null, 2)}
        buttonProps={{
          position: 'absolute',
          top: 2,
          right: 6,
          zIndex: 1,
        }}
      />
      <Flex
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
        sx={{
          '&::-webkit-scrollbar': {
            width: '7px',
            height: '7px',
          },
          '&::-webkit-scrollbar-track': {
            background: 'blackAlpha.100',
            borderRadius: '10px',
          },
          '&::-webkit-scrollbar-thumb': {
            background: 'gray.300',
            borderRadius: '10px',
          },
          _hover: {
            '&::-webkit-scrollbar-thumb': {
              background: 'niaid.placeholder',
            },
          },
        }}
        {...props}
      >
        <JSONTree
          data={data}
          theme={{ extend: theme }}
          shouldExpandNodeInitially={() => true}
        />
      </Flex>
    </Box>
  );
};
