/*
NIAID styleguide typography
http://policy-prod-varnish-1734617591.us-east-1.elb.amazonaws.com/policies/typography

USWDS Typesetting guidelines:
https://designsystem.digital.gov/design-tokens/typesetting/overview/
*/

export const fontSizes = {
  xs: { value: '0.875rem' },
  sm: { value: '0.937rem' },
};

export const lineHeights = {
  base: { value: 2 },
  short: { value: 1.5 },
};

export const fonts = {
  heading: { value: 'var(--font-public-sans)' },
  body: { value: 'var(--font-public-sans)' },
};

export default {
  fonts,
  fontSizes,
  lineHeights,
};
