import { renderHook } from '@testing-library/react';
import mockRouter from 'next-router-mock';
import type { NextRouter } from 'next/router';
import {
  ROUTE_CHANGE_CANCELLED,
  UNSAVED_CHANGES_MESSAGE,
  useUnsavedChangesWarning,
} from './useUnsavedChangesWarning';

// jest.setup.js maps `next/router` to next-router-mock, whose default export
// (the singleton the hook uses) is this same memory router.

// next-router-mock types beforePopState without arguments; use Next's types.
type PopState = Parameters<Parameters<NextRouter['beforePopState']>[0]>[0];
const popTo = (as: string): PopState => ({
  url: as,
  as,
  options: {},
});

const dispatchBeforeUnload = () => {
  const event = new Event('beforeunload', { cancelable: true });
  window.dispatchEvent(event);
  return event;
};

describe('useUnsavedChangesWarning', () => {
  let confirmSpy: jest.SpyInstance<boolean, [message?: string]>;
  let beforePopStateSpy: jest.SpyInstance;
  // The most recent beforePopState callback the hook registered.
  const latestPopStateHandler = () =>
    beforePopStateSpy.mock.calls[
      beforePopStateSpy.mock.calls.length - 1
    ][0] as (state: PopState) => boolean;

  beforeEach(() => {
    mockRouter.setCurrentUrl('/settings');
    confirmSpy = jest.spyOn(window, 'confirm').mockReturnValue(false);
    beforePopStateSpy = jest.spyOn(mockRouter, 'beforePopState');
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('does nothing while there are no unsaved changes', async () => {
    renderHook(() => useUnsavedChangesWarning(false));

    await mockRouter.push('/search');

    expect(mockRouter.asPath).toBe('/search');
    expect(confirmSpy).not.toHaveBeenCalled();
    expect(dispatchBeforeUnload().defaultPrevented).toBe(false);
  });

  it('cancels an in-app navigation when the user chooses to stay', async () => {
    renderHook(() => useUnsavedChangesWarning(true));

    await expect(mockRouter.push('/search')).rejects.toBe(
      ROUTE_CHANGE_CANCELLED,
    );

    expect(confirmSpy).toHaveBeenCalledWith(UNSAVED_CHANGES_MESSAGE);
    expect(mockRouter.asPath).toBe('/settings');
  });

  it('lets the navigation through when the user confirms', async () => {
    confirmSpy.mockReturnValue(true);
    renderHook(() => useUnsavedChangesWarning(true));

    await mockRouter.push('/search');

    expect(mockRouter.asPath).toBe('/search');
    expect(confirmSpy).toHaveBeenCalledTimes(1);
  });

  it("doesn't prompt again when a confirmed route change becomes a full page load", () => {
    confirmSpy.mockReturnValue(true);
    renderHook(() => useUnsavedChangesWarning(true));

    // What Next does when it falls back to a full page load (e.g. a route
    // missing from the build): start, error, then the page unloads. There's no
    // routeChangeComplete.
    mockRouter.events.emit('routeChangeStart', '/search', { shallow: false });
    mockRouter.events.emit('routeChangeError', new Error('hard navigation'));

    expect(dispatchBeforeUnload().defaultPrevented).toBe(false);
    expect(confirmSpy).toHaveBeenCalledTimes(1);
  });

  it("doesn't ask for query or hash changes on the same page", async () => {
    renderHook(() => useUnsavedChangesWarning(true));

    await mockRouter.push('/settings?tab=search');
    await mockRouter.push('/settings#search');

    expect(confirmSpy).not.toHaveBeenCalled();
  });

  it('asks the browser to confirm reloads and closing the tab', () => {
    renderHook(() => useUnsavedChangesWarning(true));
    expect(dispatchBeforeUnload().defaultPrevented).toBe(true);
  });

  it('keeps the page on Back/Forward when the user chooses to stay', () => {
    const pushStateSpy = jest.spyOn(window.history, 'pushState');
    renderHook(() => useUnsavedChangesWarning(true));

    expect(latestPopStateHandler()(popTo('/search'))).toBe(false);
    // The browser already moved to the other entry; put this page's back.
    expect(pushStateSpy).toHaveBeenCalledWith(
      window.history.state,
      '',
      '/settings',
    );

    confirmSpy.mockReturnValue(true);
    expect(latestPopStateHandler()(popTo('/search'))).toBe(true);
    // Same-page entries never ask.
    confirmSpy.mockClear();
    expect(latestPopStateHandler()(popTo('/settings#search'))).toBe(true);
    expect(confirmSpy).not.toHaveBeenCalled();
  });

  it('stops guarding once the changes are saved', async () => {
    const { rerender } = renderHook(
      ({ when }) => useUnsavedChangesWarning(when),
      { initialProps: { when: true } },
    );

    rerender({ when: false });

    expect(latestPopStateHandler()(popTo('/search'))).toBe(true);
    expect(dispatchBeforeUnload().defaultPrevented).toBe(false);
    await mockRouter.push('/search');
    expect(confirmSpy).not.toHaveBeenCalled();
  });

  it('asks again after new changes, even if the user confirmed before', async () => {
    confirmSpy.mockReturnValue(true);
    const { result, rerender } = renderHook(
      ({ when }) => useUnsavedChangesWarning(when),
      { initialProps: { when: true } },
    );
    expect(result.current()).toBe(true);

    rerender({ when: false });
    rerender({ when: true });
    confirmSpy.mockReturnValue(false);

    expect(result.current()).toBe(false);
    expect(confirmSpy).toHaveBeenCalledTimes(2);
  });

  it('asks again if a confirmed leave ends up back on this page', async () => {
    // E.g. the user confirmed Back, then pressed Forward before the other page
    // loaded: a route change completes while this page is still mounted.
    confirmSpy.mockReturnValue(true);
    const { result } = renderHook(() => useUnsavedChangesWarning(true));
    expect(result.current()).toBe(true);

    await mockRouter.push('/settings?tab=search');
    confirmSpy.mockReturnValue(false);

    expect(result.current()).toBe(false);
    expect(confirmSpy).toHaveBeenCalledTimes(2);
  });

  it('confirmLeave only asks when there are unsaved changes', () => {
    const { result, rerender } = renderHook(
      ({ when }) => useUnsavedChangesWarning(when),
      { initialProps: { when: false } },
    );
    expect(result.current()).toBe(true);
    expect(confirmSpy).not.toHaveBeenCalled();

    rerender({ when: true });
    expect(result.current()).toBe(false);
    expect(confirmSpy).toHaveBeenCalledTimes(1);
  });

  it('keeps only its own cancellations out of the console', () => {
    renderHook(() => useUnsavedChangesWarning(true));

    const rejection = (reason: unknown) => {
      const event = new Event('unhandledrejection', { cancelable: true });
      Object.defineProperty(event, 'reason', { value: reason });
      window.dispatchEvent(event);
      return event;
    };

    expect(rejection(ROUTE_CHANGE_CANCELLED).defaultPrevented).toBe(true);
    expect(rejection(new Error('real failure')).defaultPrevented).toBe(false);
  });
});
