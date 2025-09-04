import { ChakraProvider, ChakraProviderProps } from '@chakra-ui/react';
import { defaultSystem } from '@chakra-ui/react';

export function Provider({ value, ...props }: ChakraProviderProps) {
  return <ChakraProvider value={value || defaultSystem} {...props} />;
}
