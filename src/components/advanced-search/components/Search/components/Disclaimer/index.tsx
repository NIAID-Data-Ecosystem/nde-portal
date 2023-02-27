import { MetadataIcon } from 'src/components/icon';
import { Box, Button, Flex, SlideFade, Text } from 'nde-design-system';
import { useAdvancedSearchContext } from '../AdvancedSearchFormContext';
import { useLocalStorage } from 'usehooks-ts';

export const Disclaimer = () => {
  const { selectedSearchType } = useAdvancedSearchContext();
  const [isMinimized, setIsMinimized] = useLocalStorage(
    'query-disclaimer-minimize',
    false,
  );

  return (
    <Flex
      opacity={selectedSearchType?.additionalInfo ? 1 : 0}
      w='100%'
      justifyContent='flex-end'
      alignItems='center'
      px={2}
      mt={1}
    >
      <Button
        size='sm'
        variant='ghost'
        onClick={() => setIsMinimized(!isMinimized)}
        _active={{ boxShadow: 'none' }}
        _focus={{ boxShadow: 'none' }}
        px={2}
      >
        <Box mr={isMinimized ? 1 : 0}>
          <MetadataIcon id='info' glyph='info' fill='gray.700' />
        </Box>
        {isMinimized && <Text fontSize='sm'>About this query</Text>}
      </Button>

      <SlideFade
        in={!isMinimized && !!selectedSearchType?.additionalInfo}
        offsetX={20}
        offsetY={0}
      >
        <Flex
          display={isMinimized ? 'none' : 'flex'}
          alignItems='center'
          justifyContent='flex-end'
          py={1}
        >
          <Text fontStyle='italic' fontWeight='light' fontSize='sm'>
            {selectedSearchType.additionalInfo}
          </Text>
          <Button
            variant='ghost'
            onClick={() => setIsMinimized(true)}
            size='sm'
            textDecoration='underline'
            px={2}
            mx={1}
          >
            Got it
          </Button>
        </Flex>
      </SlideFade>
    </Flex>
  );
};
