import type { AppProps } from 'next/app';
import Head from 'next/head';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GoogleTagManager } from '@next/third-parties/google';
import { fonts } from 'lib/fonts';
import { Provider } from 'src/components/ui/provider';

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
      </Head>
      <style jsx global>
        {`
          :root {
            --font-public-sans: ${fonts.public_sans_font.style.fontFamily};
          }
        `}
      </style>

      <QueryClientProvider client={queryClient}>
        <Provider>
          {/* @ts-ignore */}
          <Component {...pageProps} />
        </Provider>
      </QueryClientProvider>
      <GoogleTagManager
        gtmId={process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS || ''}
      />
    </>
  );
}

export default App;
