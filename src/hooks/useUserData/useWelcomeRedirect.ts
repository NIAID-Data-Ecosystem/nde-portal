import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { useAuth } from 'src/hooks/useAuth';
import {
  clearWelcomePending,
  isWelcomePending,
  showWelcomePending,
} from 'src/utils/auth/welcome-pending';
import { ENABLE_AUTH, SHOW_WELCOME_PAGE } from 'src/utils/feature-flags';

import { useUserData } from './index';

export const WELCOME_PATH = '/welcome';

// Set once the welcome page has been shown this session, so a user who leaves
// it without saving isn't sent back on every navigation.
export const WELCOME_SHOWN_KEY = 'welcome_shown';
const AUTH_RETURN_TO_KEY = 'auth_return_to';

/**
 * Send signed-in users who haven't completed onboarding (`onboarding_complete:
 * false` from /user/data) to the welcome page, once per browser session. The
 * current path is stored in `auth_return_to` so the welcome page can return
 * the user to where they were.
 *
 * Right after a login, the page is hidden behind a loader so it doesn't
 * flash before the redirect. This hook lifts the loader once it knows
 * where the user should be.
 */
export function useWelcomeRedirect() {
  const router = useRouter();
  const { isAuthenticated, loading } = useAuth();
  const { onboardingComplete, hasLoadedProfile } = useUserData();

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!SHOW_WELCOME_PAGE || !ENABLE_AUTH) {
      clearWelcomePending();
      return;
    }
    // Keep the page hidden while the decision is pending.
    if (isWelcomePending()) showWelcomePending();
    if (loading) return;

    // Login cancelled or failed.
    if (!isAuthenticated) {
      clearWelcomePending();
      return;
    }
    if (onboardingComplete === null) {
      // /user/data failed: show the page (with its error banner) rather than
      // leaving the user on the loader.
      if (hasLoadedProfile) clearWelcomePending();
      return;
    }
    if (
      onboardingComplete === true ||
      sessionStorage.getItem(WELCOME_SHOWN_KEY) === 'true' ||
      router.pathname === WELCOME_PATH
    ) {
      if (router.pathname === WELCOME_PATH) {
        sessionStorage.setItem(WELCOME_SHOWN_KEY, 'true');
      }
      clearWelcomePending();
      return;
    }

    sessionStorage.setItem(WELCOME_SHOWN_KEY, 'true');
    sessionStorage.setItem(AUTH_RETURN_TO_KEY, router.asPath);
    // Only reveal once /welcome has rendered, so the old page never shows.
    Promise.resolve(router.replace(WELCOME_PATH)).finally(clearWelcomePending);
  }, [hasLoadedProfile, isAuthenticated, loading, onboardingComplete, router]);
}

// Renderless wrapper so the hook can be mounted inside the providers in `_app`.
export function WelcomeRedirect() {
  useWelcomeRedirect();
  return null;
}
