import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { useAuth } from 'src/hooks/useAuth';
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
 */
export function useWelcomeRedirect() {
  const router = useRouter();
  const { isAuthenticated, loading } = useAuth();
  const { onboardingComplete } = useUserData();

  useEffect(() => {
    if (!SHOW_WELCOME_PAGE || !ENABLE_AUTH || loading) return;
    if (typeof window === 'undefined') return;
    // Wait for the /user/data profile (null) and skip onboarded users (true).
    if (!isAuthenticated || onboardingComplete !== false) return;
    if (sessionStorage.getItem(WELCOME_SHOWN_KEY) === 'true') return;

    sessionStorage.setItem(WELCOME_SHOWN_KEY, 'true');
    if (router.pathname !== WELCOME_PATH) {
      sessionStorage.setItem(AUTH_RETURN_TO_KEY, router.asPath);
      router.replace(WELCOME_PATH);
    }
  }, [isAuthenticated, loading, onboardingComplete, router]);
}

// Renderless wrapper so the hook can be mounted inside the providers in `_app`.
export function WelcomeRedirect() {
  useWelcomeRedirect();
  return null;
}
