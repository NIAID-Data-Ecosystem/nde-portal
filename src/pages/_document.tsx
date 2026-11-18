import NextDocument, {
  DocumentContext,
  Head,
  Html,
  Main,
  NextScript,
} from 'next/document';
import React from 'react';
import {
  AUTH_PENDING_LOADER_ID,
  WELCOME_PENDING_SCRIPT,
  WELCOME_PENDING_STYLES,
} from 'src/utils/auth/welcome-pending';

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
          {/* Hide the page a user returns to after login until the welcome
              redirect is decided. Must run before first paint, so it can't
              wait for React. */}
          <style dangerouslySetInnerHTML={{ __html: WELCOME_PENDING_STYLES }} />
          <script
            dangerouslySetInnerHTML={{ __html: WELCOME_PENDING_SCRIPT }}
          />
        </Head>
        <body>
          <div id={AUTH_PENDING_LOADER_ID} role='status' aria-live='polite'>
            <div className='auth-pending-spinner' aria-hidden='true' />
            <p className='auth-pending-text'>Loading...</p>
          </div>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default Document;
