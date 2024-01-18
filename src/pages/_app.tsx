import { useEffect } from 'react';
import type { AppProps } from 'next/app';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { QueryClient, QueryClientProvider } from 'react-query';
import { theme } from 'src/theme';
import * as ga from 'lib/ga';
import { ChakraProvider } from '@chakra-ui/react';

// Creates an instance of react-query for the app.
const queryClient = new QueryClient();

function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  useEffect(() => {
    const handleRouteChange = (url: string) => {
      ga.pageview(url);
    };
    handleRouteChange(router.pathname);
  }, [router]);

  useEffect(() => {
    if (router.query && router.query.q) {
      ga.event({
        action: 'search',
        params: { search_term: router.query.q },
      });
    }
  }, [router, pageProps]);

  return (
    <>
      <Head>
        <meta
          name='viewport'
          content='width=device-width, initial-scale=1.0'
        ></meta>
      </Head>

      <QueryClientProvider client={queryClient}>
        <ChakraProvider theme={theme}>
          {/* @ts-ignore */}
          <Component {...pageProps} />
        </ChakraProvider>
      </QueryClientProvider>
    </>
  );
}

export default App;
