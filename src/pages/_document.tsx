import NextDocument, {
  DocumentContext,
  Head,
  Html,
  Main,
  NextScript,
} from 'next/document';
import React from 'react';
import { Box } from '@chakra-ui/react';

export const NAV_HEIGHT = { base: '105px', sm: '77px', md: '89px' };

class Document extends NextDocument {
  static getInitialProps(ctx: DocumentContext) {
    return NextDocument.getInitialProps(ctx);
  }
  render() {
    return (
      <Box as={Html} lang='en'>
        <Head>
          <link rel='icon' href='/favicon.png' />
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
