import { RefObject, useEffect } from 'react';

interface ScrollViewportRefs {
  root: RefObject<HTMLDivElement | null>;
  viewport: RefObject<HTMLDivElement | null>;
  /** Optional scrollbar above the table, mirroring the viewport's. */
  topScrollbar: RefObject<HTMLDivElement | null>;
  /** Scrollbar that sticks to the bottom of the window while the viewport's own is off-screen. */
  floatingScrollbar: RefObject<HTMLDivElement | null>;
  /** A 1px marker at the viewport's bottom edge, watched to know when its scrollbar is on-screen. */
  sentinel: RefObject<HTMLDivElement | null>;
}

const setFlag = (el: Element, name: string, on: boolean) => {
  if (on === el.hasAttribute(name)) return;
  if (on) el.setAttribute(name, '');
  else el.removeAttribute(name);
};

/**
 * Wires up the table's scroll viewport without React state, so scrolling and
 * resizing never re-render the table:
 *
 * - a data attribute on `root` for horizontal overflow (drives the pinned
 *   column's shadow and the synced scrollbars in CSS). Nothing tracks the
 *   scroll position: an attribute flipping as a scroll leaves the start
 *   restyled every cell,
 * - CSS variables for the header height and pinned column width (used as
 *   scroll padding, so keyboard focus never lands under them),
 * - keyboard access: the viewport is a focusable, labelled region only while
 *   it actually scrolls,
 * - the top and floating scrollbars kept in sync with the viewport, and the
 *   floating one (fixed to the bottom of the window, lined up with the
 *   viewport) shown only while part of the table is on-screen but the
 *   viewport's own scrollbar is below the fold. That keeps a horizontal
 *   scrollbar reachable wherever the table sits on the page.
 *
 * `deps` should change when anything that affects measurement does but
 * doesn't resize the table (e.g. pinning).
 */
export const useScrollViewport = (
  refs: ScrollViewportRefs,
  deps: unknown[],
) => {
  useEffect(() => {
    const root = refs.root.current;
    const viewport = refs.viewport.current;
    const table = viewport?.querySelector('table');
    if (!root || !viewport || !table) return;
    const bars = [
      refs.topScrollbar.current,
      refs.floatingScrollbar.current,
    ].filter((bar): bar is HTMLDivElement => Boolean(bar));

    const setVar = (name: string, value: string) => {
      if (root.style.getPropertyValue(name) !== value) {
        root.style.setProperty(name, value);
      }
    };

    const measure = () => {
      const verticalScrollbar = viewport.offsetWidth - viewport.clientWidth;
      const overflowX = viewport.scrollWidth > viewport.clientWidth + 1;
      const scrolls =
        overflowX || viewport.scrollHeight > viewport.clientHeight + 1;
      setFlag(root, 'data-overflow-x', overflowX);
      setVar('--nde-table-viewport-w', `${viewport.clientWidth}px`);
      const head = table.tHead;
      setVar('--nde-table-header-h', `${head?.offsetHeight ?? 0}px`);
      const firstHeader = head?.rows[0]?.cells[0];
      setVar(
        '--nde-table-pinned-w',
        root.hasAttribute('data-pinned') && firstHeader
          ? `${firstHeader.offsetWidth}px`
          : '0px',
      );

      if (scrolls) {
        viewport.tabIndex = 0;
        viewport.setAttribute('role', 'region');
      } else {
        viewport.removeAttribute('tabindex');
        viewport.removeAttribute('role');
      }

      // The floating bar is `position: fixed` (sticky would be captured by
      // any ancestor with `overflow: hidden`, e.g. PageContainer's <main>), so
      // it is lined up with the viewport here. Only layout changes move the
      // viewport sideways, and those resize it, which re-runs this.
      const floating = refs.floatingScrollbar.current;
      if (floating) {
        const box = viewport.getBoundingClientRect();
        floating.style.left = `${box.left}px`;
        floating.style.width = `${box.width}px`;
      }

      // Same scroll range as the viewport: as wide as its content, padded by
      // its vertical scrollbar (which the viewport's horizontal track excludes).
      bars.forEach(bar => {
        bar.style.paddingInlineEnd = `${verticalScrollbar}px`;
        const phantom = bar.firstElementChild as HTMLElement | null;
        if (phantom) phantom.style.width = `${viewport.scrollWidth}px`;
        bar.scrollLeft = viewport.scrollLeft;
      });
    };

    // Non-passive, synchronous writes so every scrollbar moves in the same
    // frame (a passive listener can defer the write past paint in Safari,
    // leaving a one-frame ghost thumb).
    let syncing = false;
    const syncFrom = (source: HTMLElement) => () => {
      if (syncing) return;
      syncing = true;
      const x = source.scrollLeft;
      for (const el of [viewport, ...bars]) {
        if (el !== source && el.scrollLeft !== x) el.scrollLeft = x;
      }
      syncing = false;
    };
    const sources = [viewport, ...bars].map(el => {
      const handler = syncFrom(el);
      el.addEventListener('scroll', handler);
      return () => el.removeEventListener('scroll', handler);
    });

    const resizeObserver =
      typeof ResizeObserver === 'undefined'
        ? null
        : new ResizeObserver(measure);
    resizeObserver?.observe(viewport);
    resizeObserver?.observe(table);
    measure();

    // The floating bar shows while some of the table is on-screen but the
    // viewport's own scrollbar (just above the sentinel) is below the fold.
    const sentinel = refs.sentinel.current;
    let tableInView = false;
    let scrollbarBelowFold = false;
    const intersectionObserver =
      sentinel &&
      refs.floatingScrollbar.current &&
      typeof IntersectionObserver !== 'undefined'
        ? new IntersectionObserver(entries => {
            for (const entry of entries) {
              if (entry.target === root) {
                tableInView = entry.isIntersecting;
              } else {
                const windowBottom =
                  entry.rootBounds?.bottom ?? window.innerHeight;
                scrollbarBelowFold =
                  !entry.isIntersecting &&
                  entry.boundingClientRect.top >= windowBottom - 1;
              }
            }
            setFlag(root, 'data-floating', tableInView && scrollbarBelowFold);
          })
        : null;
    if (sentinel && intersectionObserver) {
      intersectionObserver.observe(root);
      intersectionObserver.observe(sentinel);
    }
    const onWindowResize = () => measure();
    window.addEventListener('resize', onWindowResize);

    return () => {
      sources.forEach(remove => remove());
      resizeObserver?.disconnect();
      intersectionObserver?.disconnect();
      window.removeEventListener('resize', onWindowResize);
    };
    // `refs` are stable ref objects; callers list what else should re-measure.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
};
