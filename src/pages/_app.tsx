import { useEffect } from 'react';
import type { AppProps } from 'next/app';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Script from 'next/script';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ThemeProvider } from 'nde-design-system';
import FontFace from 'src/theme/font-face';
import { gtmVirtualPageView } from 'lib/ga';

// Creates an instance of react-query for the app.
const queryClient = new QueryClient();

function App({ Component, pageProps }: AppProps) {
  const router = useRouter();

  useEffect(() => {
    const mainDataLayer = {
      pageTypeName: pageProps.page || null,
      url: router.pathname,
      query: router.query,
    };

    gtmVirtualPageView(mainDataLayer);
  }, [pageProps, router]);

  return (
    <>
      <Head>
        <meta
          name='viewport'
          content='width=device-width, initial-scale=1.0'
        ></meta>
      </Head>

      {/* <!-- Google Tag Manager --> */}
      <Script
        id='google-tag-manager'
        strategy='afterInteractive'
        dangerouslySetInnerHTML={{
          __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
              new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
              j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
              'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
              })(window,document,'script','dataLayer','GTM-K8WGDTD')`,
        }}
      ></Script>
      {/* <!-- End Google Tag Manager --> */}

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
