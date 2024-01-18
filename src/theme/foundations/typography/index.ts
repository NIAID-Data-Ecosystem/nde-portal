import { Typography } from './typography.types';

/*
NIAID styleguide typography
http://policy-prod-varnish-1734617591.us-east-1.elb.amazonaws.com/policies/typography

USWDS Typesetting guidelines:
https://designsystem.digital.gov/design-tokens/typesetting/overview/
*/

// export const fonts = {
//   /*
//   Martel and Merriweather are also approved themes for heading elements:
//   heading:'Martel, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"',
//   https://designsystem.niaid.nih.gov/design/
//   */

//   heading: `"Public Sans", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"`,
//   body: `"Public Sans", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"`,
// };

export const fontSizes = {
  xs: '0.875rem',
  sm: '0.937rem',
};

export const lineHeights = {
  base: 2,
  short: 1.5,
};

const typography: Typography = {
  fontSizes,
  lineHeights,
};

export default typography;
