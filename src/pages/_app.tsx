import type {AppProps} from 'next/app';
import {QueryClient, QueryClientProvider} from 'react-query';
import {ThemeProvider} from 'nde-design-system';
import FontFace from 'src/theme/font-face';
import Head from 'next/head';

// Creates an instance of react-query for the app.
const queryClient = new QueryClient();

function App({Component, pageProps}: AppProps) {
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
