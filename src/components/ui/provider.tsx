import { ChakraProvider } from '@chakra-ui/react';
import { system } from 'src/theme';

export function Provider(props: any) {
  return <ChakraProvider value={system} {...props} />;
}
