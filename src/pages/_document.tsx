import NextDocument, {
  DocumentContext,
  Head,
  Html,
  Main,
  NextScript,
} from 'next/document';
import React from 'react';
import { assetPrefix } from 'next.config';
import { Box } from 'nde-design-system';
import { NAV_HEIGHT } from 'src/components/page-container';

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
        sx={{
          scrollPaddingTop: Object.values(NAV_HEIGHT),
        }}
      >
        <Head>
          <style data-href='https://fonts.googleapis.com/css2?family=Public+Sans:wght@100;200;300;400;500;600;700;800;900'></style>
          <link rel='icon' href={`${assetPrefix}/favicon.png`} />

          <script
            async
            src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS}`}
          />
          <script
            dangerouslySetInnerHTML={{
              __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS}', {
              page_path: window.location.pathname,
            });
          `,
            }}
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
