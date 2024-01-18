/*
NIAID styleguide colors
http://policy-prod-varnish-1734617591.us-east-1.elb.amazonaws.com/policies/color
*/

import { theme as ChakraTheme } from '@chakra-ui/react';
export type ColorsProps = typeof colors;

export const colors = {
  ...ChakraTheme.colors,
  primary: {
    50: '#F5FBFB',
    100: '#DFF1F1',
    200: '#C7E7E7',
    300: '#7ebebe',
    400: '#109797',
    500: '#0B8484',
    600: '#086060',
    700: '#004646',
    800: '#003636',
    900: '#001919',
  },
  secondary: {
    50: '#F9F9FE',
    100: '#ECE8FF',
    200: '#c5bff1',
    300: '#7766E7',
    400: '#503ADE',
    500: '#321EB5',
    600: '#241683',
    700: '#1D116F',
    800: '#100A45',
    900: '#06031D',
  },
  tertiary: {
    50: '#F6FAFD', //alternate: #f8fafa
    100: '#EAF4FB',
    200: '#BDDEF4',
    300: '#96C8E9',
    400: '#479CD4',
    500: '#3082BC',
    600: '#236593',
    700: '#20558A',
    800: '#0B2536',
    900: '#000F1A',
  },
  gray: {
    50: '#FDFDFD',
    100: '#EDEDEE',
    200: '#D5D5D5',
    300: '#C2C4C6',
    400: '#B1B3B5',
    500: '#9DA0A3',
    600: '#858A8D',
    700: '#6D6D6D',
    800: '#5A5959',
    900: '#414141',
  },
  niaid: {
    placeholder: '#9AA6B5',
    color: '#20558A',
  },
  page: { bg: '#FDFDFD', alt: '#F5F6FA' },
  text: {
    body: '#404B56',
    heading: '#2F2F2F',
  },
  navigation: { bg: '#262626', hover: '#1B1B1B' },
  accent: { bg: '#E05E8F' },
  link: {
    color: '#246CD3',
    visited: '#6F57B5',
  },
  status: {
    success: '#17805F',
    success_lt: '#F2F5F4',
    alert: '#F8FF55',
    warning: '#FFC10A',
    warning_lt: '#FFF9F2',
    error: '#D23342',
    error_lt: '#FBF2F3',
    info: '#4865E3',
    info_lt: '#F3F4FC',
  },
};
