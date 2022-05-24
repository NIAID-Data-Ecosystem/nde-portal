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
          scrollBehavior: 'smooth',
        }}
      >
        <Head>
          <style data-href='https://fonts.googleapis.com/css2?family=Public+Sans:wght@100;200;300;400;500;600;700;800;900'></style>
          <link rel='icon' href={`${assetPrefix}/favicon.png`} />
        </Head>
        <body>
          {/* <!-- Google Tag Manager (noscript) --> */}
          <noscript
            dangerouslySetInnerHTML={{
              __html: `<iframe src="https://www.googletagmanager.com/ns.html?id=GTM-K8WGDTD" height="0" width="0" style="display: none; visibility: hidden;" />`,
            }}
          />
          {/* <!-- End Google Tag Manager (noscript) --> */}
          <Main />
          <NextScript />
        </body>
      </Box>
    );
  }
}

export default Document;
