import type {AppProps} from 'next/app';
import {ChakraProvider} from '@chakra-ui/react';
import FontFace from 'src/components/font-face';
import {QueryClient, QueryClientProvider} from 'react-query';
import {ThemeProvider} from 'nde-design-system';

// Creates an instance of react-query for the app.
const queryClient = new QueryClient();

function App({Component, pageProps}: AppProps) {
  return (
    <>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <Component {...pageProps} />
        </ThemeProvider>
      </QueryClientProvider>
      <FontFace />
    </>
  );
}

export default App;
