import { ChakraProvider } from '@chakra-ui/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fonts } from 'lib/fonts';
import type { AppProps } from 'next/app';
import Head from 'next/head';
import Script from 'next/script';
import { AuthProvider } from 'src/hooks/useAuth';
import { UserDataProvider } from 'src/hooks/useUserData';
import { WelcomeRedirect } from 'src/hooks/useUserData/useWelcomeRedirect';
import { system } from 'src/theme';

// Creates an instance of react-query for the app.
const queryClient = new QueryClient();

const GTM_ID = process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS;

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
        <ChakraProvider value={system}>
          <AuthProvider>
            <UserDataProvider>
              <Component {...pageProps} />
              <WelcomeRedirect />
            </UserDataProvider>
          </AuthProvider>
        </ChakraProvider>
      </QueryClientProvider>
      {/* <GoogleTagManager> injects an inline script, which the CSP blocks. */}
      {GTM_ID ? (
        <Script
          id='gtm-init'
          src={`/gtm-init.js?id=${encodeURIComponent(GTM_ID)}`}
          strategy='afterInteractive'
        />
      ) : null}
    </>
  );
}

export default App;
