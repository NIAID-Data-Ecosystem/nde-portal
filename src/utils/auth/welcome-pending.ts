import { ENABLE_AUTH, SHOW_WELCOME_PAGE } from 'src/utils/feature-flags';

/**
 * "Login pending" marker used to hide the page a user returns to after OAuth
 * until we know whether to send them to the welcome page. Without it, the
 * return page paints (and is visible) while /user_info and /user/data load,
 * then flashes away when the welcome redirect fires.
 *
 * - `sessionStorage[AUTH_LOGIN_PENDING_KEY]` survives the OAuth round-trip.
 * - `<html data-auth-pending>` hides `#__next` and shows the static loader
 *   rendered in `_document` (set pre-hydration by the inline script there).
 *
 * Lives outside `src/hooks` so both `useAuth` and `useWelcomeRedirect` can
 * import it without a cycle.
 */
export const AUTH_LOGIN_PENDING_KEY = 'auth_login_pending';
export const AUTH_PENDING_ATTR = 'data-auth-pending';
export const AUTH_PENDING_LOADER_ID = 'auth-pending-loader';

const isClient = () => typeof window !== 'undefined';

export const isWelcomePending = (): boolean => {
  if (!isClient()) return false;
  try {
    return sessionStorage.getItem(AUTH_LOGIN_PENDING_KEY) === 'true';
  } catch {
    return false;
  }
};

/** Hide the page (show the loader). Only applies when the welcome page is on. */
export const showWelcomePending = () => {
  if (!isClient()) return;
  document.documentElement.setAttribute(AUTH_PENDING_ATTR, '');
};

/** Mark a login as started. No-op unless the welcome page is enabled. */
export const setWelcomePending = () => {
  if (!isClient() || !SHOW_WELCOME_PAGE || !ENABLE_AUTH) return;
  try {
    sessionStorage.setItem(AUTH_LOGIN_PENDING_KEY, 'true');
  } catch {
    // sessionStorage unavailable (e.g., privacy mode): skip the loader.
    return;
  }
  showWelcomePending();
};

/** Resolve the pending state and reveal the page. Always safe to call. */
export const clearWelcomePending = () => {
  if (!isClient()) return;
  try {
    sessionStorage.removeItem(AUTH_LOGIN_PENDING_KEY);
  } catch {
    // Ignore
  }
  document.documentElement.removeAttribute(AUTH_PENDING_ATTR);
};

/**
 * Inline script run in `<head>` before first paint. Hides the
 * statically exported page when a login is pending, with a safety timeout so a
 * JS failure can never leave the user stuck on the loader.
 */
export const WELCOME_PENDING_SCRIPT = `(function(){try{if(sessionStorage.getItem('${AUTH_LOGIN_PENDING_KEY}')!=='true')return;var d=document.documentElement;d.setAttribute('${AUTH_PENDING_ATTR}','');setTimeout(function(){try{sessionStorage.removeItem('${AUTH_LOGIN_PENDING_KEY}')}catch(e){}d.removeAttribute('${AUTH_PENDING_ATTR}')},10000)}catch(e){}})();`;

/** Styles for the pending state and the static loader in `_document`. */
export const WELCOME_PENDING_STYLES = `
#${AUTH_PENDING_LOADER_ID}{display:none}
html[${AUTH_PENDING_ATTR}] #__next{visibility:hidden}
html[${AUTH_PENDING_ATTR}] #${AUTH_PENDING_LOADER_ID}{display:flex;position:fixed;inset:0;z-index:2147483647;flex-direction:column;align-items:center;justify-content:center;background:#fff}
#${AUTH_PENDING_LOADER_ID} .auth-pending-spinner{width:2rem;height:2rem;border:4px solid transparent;border-top-color:#3182ce;border-left-color:#3182ce;border-radius:50%;animation:auth-pending-spin .65s linear infinite}
#${AUTH_PENDING_LOADER_ID} .auth-pending-text{margin-top:1rem;color:#5A5959}
@keyframes auth-pending-spin{to{transform:rotate(360deg)}}
@media (prefers-reduced-motion:reduce){#${AUTH_PENDING_LOADER_ID} .auth-pending-spinner{animation-duration:1.5s}}
`;
