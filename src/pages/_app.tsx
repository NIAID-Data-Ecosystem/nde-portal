import type { AppProps } from 'next/app';
import Head from 'next/head';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { theme } from 'src/theme';
import { GoogleTagManager } from '@next/third-parties/google';
import { fonts } from 'lib/fonts';
import { ChakraProvider } from '@chakra-ui/react';

// Creates an instance of react-query for the app.
const queryClient = new QueryClient();

function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <meta
          name='viewport'
          content='width=device-width, initial-scale=1.0'
        ></meta>
        {/* Leave for google search console */}
        <meta
          name='google-site-verification'
          content={process.env.NEXT_PUBLIC_GOOGLE_CONSOLE}
        />
      </Head>
      <style jsx global>
        {`
          :root {
            --font-public-sans: ${fonts.public_sans_font.style.fontFamily};
          }
        `}
      </style>

      <QueryClientProvider client={queryClient}>
        <ChakraProvider theme={theme}>
          {/* @ts-ignore */}
          <Component {...pageProps} />
        </ChakraProvider>
      </QueryClientProvider>
      <GoogleTagManager
        gtmId={process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS || ''}
      />
    </>
  );
}

export default App;
