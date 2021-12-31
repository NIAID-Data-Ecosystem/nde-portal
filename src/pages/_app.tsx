import type {AppProps} from 'next/app';
import {ChakraProvider} from '@chakra-ui/react';
import {theme} from 'src/theme';
import FontFace from 'src/components/font-face';
import {QueryClient, QueryClientProvider} from 'react-query';

// Creates an instance of react-query for the app.
const queryClient = new QueryClient();

function App({Component, pageProps}: AppProps) {
  return (
    <>
      <QueryClientProvider client={queryClient}>
        <ChakraProvider theme={theme}>
          <Component {...pageProps} />
        </ChakraProvider>
      </QueryClientProvider>
      <FontFace />
    </>
  );
}

export default App;
