import type {AppProps} from 'next/app';
import {ChakraProvider} from '@chakra-ui/react';
import {theme} from 'src/theme';
import FontFace from 'src/components/font-face';

function App({Component, pageProps}: AppProps) {
  return (
    <>
      <ChakraProvider theme={theme}>
        <Component {...pageProps} />
      </ChakraProvider>
      <FontFace />
    </>
  );
}

export default App;
