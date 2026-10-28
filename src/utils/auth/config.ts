/**
 * OAuth configuration for NDE Portal
 * The API handles OAuth flow - we just redirect to provider-specific login endpoints
 */

import { FaGithub, FaGoogle, FaMicrosoft, FaOrcid } from 'react-icons/fa6';
import { KnownProvider } from './types';

/**
 * Single source of truth for known login providers, keyed by the provider id
 * used in `NEXT_PUBLIC_AUTH_PROVIDERS` and in the auth API's `login_error`
 * codes. Adding a provider here gives it a display label, a login button icon
 * and login error messages, plus any extra codes listed in its
 * `errorMessages`. Unlisted providers fall back to a title-cased label, no
 * icon and no error messages.
 */
export const KNOWN_PROVIDERS: Record<string, KnownProvider> = {
  github: { label: 'GitHub', icon: { as: FaGithub, color: '#24292e' } },
  orcid: { label: 'ORCID', icon: { as: FaOrcid, color: '#A6CE39' } },
  google: { label: 'Google', icon: { as: FaGoogle, color: '#4285F4' } },
  microsoft: {
    label: 'Microsoft',
    icon: { as: FaMicrosoft, color: '#00A4EF' },
  },
  okta: { label: 'NIH Login' },
};
