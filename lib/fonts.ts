import { Public_Sans } from 'next/font/google';

// Import the weights and subsets, add any other config here as well
const public_sans_font = Public_Sans({
  subsets: ['latin'],
  display: 'swap',
  fallback: ['arial', 'system-ui'],
});

export const fonts = {
  public_sans_font,
};
