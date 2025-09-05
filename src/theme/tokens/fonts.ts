/*
NIAID styleguide typography
http://policy-prod-varnish-1734617591.us-east-1.elb.amazonaws.com/policies/typography

USWDS Typesetting guidelines:
https://designsystem.digital.gov/design-tokens/typesetting/overview/
*/
const fallback = `-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"`;

export const fontSizes = {
  xs: { value: '0.875rem' },
  sm: { value: '0.937rem' },
};

export const lineHeights = {
  base: { value: 2 },
  short: { value: 1.5 },
};

export const fonts = {
  heading: { value: `var(--font-public-sans), ${fallback}` },
  body: { value: `var(--font-public-sans), ${fallback}` },
};

export default {
  fonts,
  fontSizes,
  lineHeights,
};
