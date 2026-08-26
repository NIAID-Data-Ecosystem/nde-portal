import { defineTokens } from '@chakra-ui/react';

/*
NIAID styleguide colors
http://policy-prod-varnish-1734617591.us-east-1.elb.amazonaws.com/policies/color

Authored directly in Chakra's `{ value: ... }` token shape so `defineTokens`
type-checks every entry. There is no parallel raw-hex map: anything that needs a
literal string rather than a CSS `var()` reads it back off the system with
`system.token('colors.primary.500')`.

The stock Chakra palettes (red/blue/pink/blackAlpha/...) are deliberately absent
— `defaultConfig` supplies them, at their v3 values.
*/
export const colors = defineTokens.colors({
  primary: {
    50: { value: '#F5FBFB' },
    100: { value: '#DFF1F1' },
    200: { value: '#C7E7E7' },
    300: { value: '#7ebebe' },
    400: { value: '#109797' },
    500: { value: '#0B8484' },
    600: { value: '#086060' },
    700: { value: '#004646' },
    800: { value: '#003636' },
    900: { value: '#001919' },
  },
  secondary: {
    50: { value: '#F9F9FE' },
    100: { value: '#ECE8FF' },
    200: { value: '#c5bff1' },
    300: { value: '#7766E7' },
    400: { value: '#503ADE' },
    500: { value: '#321EB5' },
    600: { value: '#241683' },
    700: { value: '#1D116F' },
    800: { value: '#100A45' },
    900: { value: '#06031D' },
  },
  niaid: {
    50: { value: '#F6FAFD' },
    100: { value: '#EAF2FA' },
    200: { value: '#94a5c2' },
    300: { value: '#7089af' },
    400: { value: '#4c6e9b' },
    500: { value: '#20558A' },
    600: { value: '#1f446d' },
    700: { value: '#1b3451' },
    800: { value: '#0A1929' },
    900: { value: '#020c19' },
  },
  accent: {
    50: { value: '#F9DFE9' },
    100: { value: '#F3BFD2' },
    200: { value: '#EC9EBC' },
    300: { value: '#E67EA5' },
    400: { value: '#E05E8F' },
    500: { value: '#B34B72' },
    600: { value: '#863856' },
    700: { value: '#5A2639' },
    800: { value: '#2D131D' },
    900: { value: '#16090E' },
  },
  gray: {
    50: { value: '#FDFDFD' },
    100: { value: '#EDEDEE' },
    200: { value: '#D5D5D5' },
    300: { value: '#C2C4C6' },
    400: { value: '#B1B3B5' },
    500: { value: '#9DA0A3' },
    600: { value: '#858A8D' },
    700: { value: '#6D6D6D' },
    800: { value: '#5A5959' },
    900: { value: '#414141' },
    950: { value: '#1A1A1A' },
  },

  // [chakra-todo]: decide whether to keep these or remove them.
  // page: {
  //   bg: { value: '#FDFDFD' },
  //   alt: { value: '#F5F6FA' },
  //   placeholder: { value: '#9AA6B5' },
  // },
  text: {
    body: { value: '#404B56' },
    heading: { value: '#2F2F2F' },
  },
  // navigation: {
  //   bg: { value: '#262626' },
  //   hover: { value: '#1B1B1B' },
  // },
  // status: {
  //   success: { value: '#17805F' },
  //   success_lt: { value: '#F2F5F4' },
  //   alert: { value: '#F8FF55' },
  //   warning: { value: '#FFC10A' },
  //   warning_lt: { value: '#FFF9F2' },
  //   error: { value: '#D23342' },
  //   error_lt: { value: '#FBF2F3' },
  //   info: { value: '#4865E3' },
  //   info_lt: { value: '#F3F4FC' },
  // },
});
