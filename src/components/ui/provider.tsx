import { ChakraProvider } from '@chakra-ui/react';
import { theme } from 'src/theme';

export function Provider(props: any) {
  return <ChakraProvider value={theme} {...props} />;
}
