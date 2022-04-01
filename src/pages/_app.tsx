import type {AppProps} from 'next/app';
import {QueryClient, QueryClientProvider} from 'react-query';
import {extendTheme, theme as NDEtheme, ThemeProvider} from 'nde-design-system';
import FontFace from 'src/theme/font-face';

// Creates an instance of react-query for the app.
const queryClient = new QueryClient();

function App({Component, pageProps}: AppProps) {
  return (
    <>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider theme={NDEtheme}>
          <FontFace />
          <Component {...pageProps} />
        </ThemeProvider>
      </QueryClientProvider>
    </>
  );
}

export default App;
