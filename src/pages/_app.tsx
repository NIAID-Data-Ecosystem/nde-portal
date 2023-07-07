import { useEffect } from 'react';
import type { AppProps } from 'next/app';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { QueryClient, QueryClientProvider } from 'react-query';
import {
  ThemeProvider,
  extendTheme,
  theme as NDETHEME,
} from 'nde-design-system';
import { Public_Sans } from 'next/font/google';
import * as ga from 'lib/ga';
// import dynamic from 'next/dynamic';

// const ThemeProvider = dynamic(() =>
//   import('nde-design-system').then(mod => mod.ThemeProvider),
// );
// Creates an instance of react-query for the app.
const queryClient = new QueryClient();

// Import the weights and subsets, add any other config here as well
const public_sans_font = Public_Sans({
  subsets: ['latin'],
  display: 'swap',
  fallback: ['arial', 'system-ui'],
});

function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const theme = extendTheme({
    ...NDETHEME,
    fonts: {
      body: public_sans_font.style.fontFamily,
      heading: public_sans_font.style.fontFamily,
    },
  });
  // useEffect(() => {
  //   const mainDataLayer = {
  //     pageTypeName: pageProps.page || null,
  //     url: router.pathname,
  //     query: router.query,
  //     search_term: router.query.q,
  //   };

  //   ga.gtmVirtualPageView(mainDataLayer);
  // }, [pageProps, router]);

  useEffect(() => {
    const handleRouteChange = (url: string) => {
      ga.pageview(url);
    };
    //When the component is mounted, subscribe to router changes
    //and log those page views
    router.events.on('routeChangeComplete', handleRouteChange);

    // If the component is unmounted, unsubscribe
    // from the event with the `off` method
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, [router.events]);

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
        <ThemeProvider theme={theme}>
          {/* @ts-ignore */}
          <Component {...pageProps} />
        </ThemeProvider>
      </QueryClientProvider>
    </>
  );
}

export default App;
