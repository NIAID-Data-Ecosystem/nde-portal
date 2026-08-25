import { Flex, Spinner } from '@chakra-ui/react';

export const ChartLoadingSpinner = () => (
  <Flex
    position='absolute'
    top={0}
    width='100%'
    height='100%'
    bg='whiteAlpha.600'
    zIndex={1000}
    alignItems='center'
    justifyContent='center'
  >
    <Spinner
      color='accent.600'
      css={{ '--spinner-track-color': 'colors.white' }}
      position='absolute'
      size='md'
      borderWidth='2px'
    />
  </Flex>
);
