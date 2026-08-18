import NextDocument, {
  DocumentContext,
  Head,
  Html,
  Main,
  NextScript,
} from 'next/document';
import React from 'react';

export const NAV_HEIGHT = { base: '105px', sm: '77px', md: '89px' };

class Document extends NextDocument {
  static getInitialProps(ctx: DocumentContext) {
    return NextDocument.getInitialProps(ctx);
  }
  render() {
    // `className='light'` pins Chakra's light-mode condition. The app has no
    // colour-mode toggle, and v3 scopes `_dark` to a `.dark` ancestor, so this
    // only makes the existing behaviour explicit.
    return (
      <Html lang='en' className='light'>
        <Head>
          <link rel='icon' href='/favicon.png' />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default Document;
