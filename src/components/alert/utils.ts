import type { AlertRootProps } from '@chakra-ui/react';

/** The Strapi notices API returns states uppercased, e.g. `WARNING`. */
export const toAlertStatus = (state: string): AlertRootProps['status'] =>
  state.toLowerCase() as AlertRootProps['status'];
