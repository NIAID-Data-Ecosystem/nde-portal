/*
NIAID styleguide colors
http://policy-prod-varnish-1734617591.us-east-1.elb.amazonaws.com/policies/color
*/

const tokens = {
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
  },
};
const semanticTokens = {
  primary: {
    contrast: { value: 'white' },
    emphasized: { value: '{colors.primary.300}' },
    fg: { value: '{colors.primary.700}' },
    focusRing: { value: '{colors.primary.500/50}' },
    muted: { value: '{colors.primary.200}' },
    solid: { value: '{colors.primary.500}' },
    subtle: { value: '{colors.primary.100}' },
  },
  secondary: {
    contrast: { value: 'white' },
    emphasized: { value: '{colors.secondary.300}' },
    fg: { value: '{colors.secondary.700}' },
    focusRing: { value: '{colors.secondary.500/50}' },
    muted: { value: '{colors.secondary.200}' },
    solid: { value: '{colors.secondary.500}' },
    subtle: { value: '{colors.secondary.100}' },
  },
  accent: {
    contrast: { value: 'white' },
    emphasized: { value: '{colors.accent.300}' },
    fg: { value: '{colors.accent.700}' },
    focusRing: { value: '{colors.accent.500/50}' },
    muted: { value: '{colors.accent.100}' },
    solid: { value: '{colors.accent.500}' },
    subtle: { value: '{colors.accent.50}' },
  },
  error: {
    light: { value: '#FBF2F3' },
    default: { value: '#D23342' },
    contrast: { value: 'white' },
    emphasized: { value: '{colors.error.light}' },
    fg: { value: '{colors.error.default}' },
    focusRing: { value: '{colors.red.500/50}' },
    muted: { value: '#f6bec4' },
    solid: { value: '{colors.error.default}' },
    subtle: { value: '{colors.error.light}' },
  },
  info: {
    light: { value: '#F3F4FC' },
    default: { value: '#4865E3' },
    contrast: { value: 'white' },
    emphasized: { value: '{colors.info.light}' },
    fg: { value: '{colors.info.default}' },
    focusRing: { value: '#4299E199' },
    muted: { value: '#8FA2F1' },
    solid: { value: '{colors.info.default}' },
    subtle: { value: '{colors.info.light}' },
  },
  success: {
    light: { value: '#F2F5F4' },
    default: { value: '#17805F' },
    contrast: { value: 'white' },
    emphasized: { value: '{colors.success.light}' },
    fg: { value: '{colors.success.default}' },
    focusRing: { value: '{colors.success.default}' },
    muted: { value: '#BBF4E3' },
    solid: { value: '{colors.success.default}' },
    subtle: { value: '{colors.success.light}' },
  },
  warning: {
    light: { value: '#FFF9F2' },
    default: { value: '#FFC10A' },
    contrast: { value: 'white' },
    emphasized: { value: '{colors.warning.light}' },
    fg: { value: '{colors.yellow.800}' },
    focusRing: { value: '{colors.warning.default}' },
    muted: { value: '#FFECAD' },
    solid: { value: '{colors.warning.default}' },
    subtle: { value: '{colors.warning.light}' },
  },
  niaid: {
    contrast: { value: 'white' },
    emphasized: { value: '{colors.niaid.300}' },
    fg: { value: '{colors.niaid.700}' },
    focusRing: { value: '{colors.niaid.500}' },
    muted: { value: '{colors.niaid.200}' },
    solid: { value: '{colors.niaid.500}' },
    subtle: { value: '{colors.niaid.100}' },
  },
  page: {
    default: { value: '#FDFDFD' },
    alt: { value: '#F5F6FA' },
    placeholder: { value: '#9AA6B5' },
  },
  link: {
    default: { value: '#246CD3' },
    visited: { value: '#6F57B5' },
  },
  navigation: { default: { value: '#262626' }, hover: { value: '#1B1B1B' } },
  text: {
    body: { value: '#404B56' },
    heading: { value: '#2F2F2F' },
  },
  bg: {
    DEFAULT: {
      value: '{colors.page.default}',
    },
    subtle: {
      value: '{colors.page.alt}',
    },
    error: {
      value: '{colors.error.light}',
    },
    warning: {
      value: '{colors.warning.light}',
    },
    success: {
      value: '{colors.success.light}',
    },
    info: {
      value: '{colors.info.light}',
    },
  },
  border: {
    DEFAULT: {
      value: '{colors.gray.200}',
    },
    error: {
      value: '{colors.error.default}',
    },
    warning: {
      value: '{colors.warning.default}',
    },
    success: {
      value: '{colors.success.default}',
    },
    info: {
      value: '{colors.info.default}',
    },
  },
  fg: {
    DEFAULT: {
      value: '{colors.text.body}',
    },
    error: {
      value: '{colors.error.default}',
    },
    warning: {
      value: '{colors.warning.default}',
    },
    success: {
      value: '{colors.success.default}',
    },
    info: {
      value: '{colors.info.default}',
    },
  },
};

export default { tokens, semanticTokens };
