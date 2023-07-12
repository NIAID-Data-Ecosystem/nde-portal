import NextDocument, {
  DocumentContext,
  Head,
  Html,
  Main,
  NextScript,
} from 'next/document';
import Script from 'next/script';
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
        </Head>
        <body>
          <Script id='google-analytics' strategy='afterInteractive'>
            {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS}', {
              page_path: window.location.pathname,
            });`}
          </Script>
          <Script
            strategy='afterInteractive'
            src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS}`}
          />
          <Main />
          <NextScript />
        </body>
      </Box>
    );
  }
}

export default Document;
