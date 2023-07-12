import NextDocument, {
  DocumentContext,
  Head,
  Html,
  Main,
  NextScript,
} from 'next/document';
import React from 'react';
import { Box } from 'nde-design-system';

export const NAV_HEIGHT = { base: '105px', sm: '77px', md: '89px' };

class Document extends NextDocument {
  static getInitialProps(ctx: DocumentContext) {
    return NextDocument.getInitialProps(ctx);
  }
  render() {
    return (
      <Box
        as={Html}
        lang='en'
        // put padding for scroll to sections that equals the nav height
        // sx={{
        //   scrollPaddingTop: Object.values(NAV_HEIGHT),
        // }}
      >
        <Head>
          <link rel='icon' href='/favicon.png' />
          <script id='google-analytics' rel='preconnect'>
            {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS}', {
              page_path: window.location.pathname,
            });
          `}
          </script>

          {/* Google Tag Manager - Google Analytics */}
          <script
            async
            rel='preconnect'
            src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS}`}
          />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Box>
    );
  }
}

export default Document;
