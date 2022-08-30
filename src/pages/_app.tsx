import { useEffect } from 'react';
import type { AppProps } from 'next/app';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Script from 'next/script';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ThemeProvider } from 'nde-design-system';
import FontFace from 'src/theme/font-face';
import * as ga from 'lib/ga';

// Creates an instance of react-query for the app.
const queryClient = new QueryClient();

function App({ Component, pageProps }: AppProps) {
  const router = useRouter();

  useEffect(() => {
    const mainDataLayer = {
      pageTypeName: pageProps.page || null,
      url: router.pathname,
      query: router.query,
      search_term: router.query.q,
    };

    ga.gtmVirtualPageView(mainDataLayer);
  }, [pageProps, router]);

  // useEffect(() => {
  //   console.log(process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS);
  //   const handleRouteChange = url => {
  //     ga.pageview(url);
  //   };
  //   //When the component is mounted, subscribe to router changes
  //   //and log those page views
  //   router.events.on('routeChangeComplete', handleRouteChange);

  //   // If the component is unmounted, unsubscribe
  //   // from the event with the `off` method
  //   return () => {
  //     router.events.off('routeChangeComplete', handleRouteChange);
  //   };
  // }, [router.events]);

  useEffect(() => {
    if (router.query && router.query.q) {
      console.log('QUERY', router.query.q);
      ga.event({
        // action: 'search_results_query',
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
        <ThemeProvider>
          <FontFace />
          {/* @ts-ignore */}
          <Component {...pageProps} />
        </ThemeProvider>
      </QueryClientProvider>
    </>
  );
}

export default App;
