/**
 * Warn before the user leaves a page with unsaved changes.
 *
 * The Pages Router has no official way to block a navigation, so each way out
 * is covered separately:
 *   - Reload, closing the tab, typing a URL, external links and full-page
 *     redirects: `beforeunload`, which shows the browser's own "Leave site?"
 *     dialog (browsers ignore custom text there).
 *   - In-app navigation (links, `router.push`/`replace`): a `routeChangeStart`
 *     listener asks with `window.confirm` and throws to cancel. Throwing is the
 *     only way to stop a Pages Router navigation once it has started.
 *   - Back/Forward: `beforePopState`. By then the browser has already moved to
 *     the other history entry, so a cancelled pop puts this page's entry back.
 *
 * Navigations that only change the query or hash keep the page (and its
 * unsaved state) mounted, so they don't prompt.
 *
 * Returns `confirmLeave` for exits the router can't see, e.g. logging out
 * (which unmounts protected pages before any navigation starts).
 */

import { useCallback, useEffect, useRef } from 'react';
import Router from 'next/router';

export const UNSAVED_CHANGES_MESSAGE =
  'You have unsaved changes. Leave this page without saving them?';

// Thrown from `routeChangeStart` to cancel a navigation. Deliberately not an
// Error: Next's dev overlay only reports Error rejections, and the
// `unhandledrejection` listener below keeps it out of the console.
export const ROUTE_CHANGE_CANCELLED =
  'Route change cancelled: unsaved changes.';

const pathOf = (url: string) => new URL(url, window.location.origin).pathname;

export function useUnsavedChangesWarning(
  when: boolean,
  message: string = UNSAVED_CHANGES_MESSAGE,
) {
  // Once the user agrees to leave, stop asking, so one exit never prompts
  // twice (e.g. a route change that ends in a full page load).
  const hasConfirmedLeaveRef = useRef(false);
  useEffect(() => {
    if (when) hasConfirmedLeaveRef.current = false;
  }, [when]);

  /** True if it's fine to leave: nothing unsaved, or the user confirmed. */
  const confirmLeave = useCallback(() => {
    if (!when || hasConfirmedLeaveRef.current) return true;
    hasConfirmedLeaveRef.current = window.confirm(message);
    return hasConfirmedLeaveRef.current;
  }, [when, message]);

  useEffect(() => {
    if (!when) return;

    // Captured now: during a Back/Forward both of these already describe the
    // destination by the time we're asked.
    const pagePath = pathOf(Router.asPath);
    const pageAsPath = Router.asPath;
    const pageHistoryState = window.history.state;

    const isLeaving = (url: string) => pathOf(url) !== pagePath;

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (hasConfirmedLeaveRef.current) return;
      event.preventDefault();
      // Older Chrome/Edge only show the dialog when returnValue is set.
      event.returnValue = '';
    };

    const handleRouteChangeStart = (
      url: string,
      { shallow }: { shallow: boolean },
    ) => {
      if (!isLeaving(url) || confirmLeave()) return;
      // Let anything tracking the navigation (e.g. a progress bar) know it's
      // over before cancelling it.
      Router.events.emit('routeChangeError', ROUTE_CHANGE_CANCELLED, url, {
        shallow,
      });
      throw ROUTE_CHANGE_CANCELLED;
    };

    // A route change that completes while this page is still mounted didn't
    // leave it (e.g. the user confirmed Back, then pressed Forward before the
    // other page loaded), so ask again next time. Not on routeChangeError:
    // Next emits that just before falling back to a full page load, which
    // would then prompt a second time.
    const handleRouteChangeComplete = () => {
      hasConfirmedLeaveRef.current = false;
    };

    // `router.push()` rejects with the cancellation, and a link click doesn't
    // await it.
    const handleRejection = (event: PromiseRejectionEvent) => {
      if (event.reason === ROUTE_CHANGE_CANCELLED) event.preventDefault();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('unhandledrejection', handleRejection);
    Router.events.on('routeChangeStart', handleRouteChangeStart);
    Router.events.on('routeChangeComplete', handleRouteChangeComplete);
    Router.beforePopState(({ as }) => {
      if (!isLeaving(as) || confirmLeave()) return true;
      // The address bar already shows the other entry; restore this page's.
      window.history.pushState(pageHistoryState, '', pageAsPath);
      return false;
    });

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('unhandledrejection', handleRejection);
      Router.events.off('routeChangeStart', handleRouteChangeStart);
      Router.events.off('routeChangeComplete', handleRouteChangeComplete);
      Router.beforePopState(() => true);
    };
  }, [when, confirmLeave]);

  return confirmLeave;
}
