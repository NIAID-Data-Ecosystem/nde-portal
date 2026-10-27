import type { MDXComponents as MDXComponentsTypes } from 'mdx/types';
import React, { useMemo } from 'react';

import { MDXComponents } from '../components';
import { getLinkedMediaProps, getUploadedVideoType } from '../components/media';

/**
 * useMDXComponents hook
 * @description A hook that returns the MDX components with optional overrides.
 *
 * @param {MDXComponentsTypes} overrides - Optional overrides for the MDX components.
 * @returns {MDXComponentsTypes} The MDX components with the applied overrides.
 */
export function useMDXComponents(
  overrides?: MDXComponentsTypes,
): MDXComponentsTypes {
  const components = {
    ...MDXComponents,
    ...(overrides || {}),
  };
  const { a: Anchor, img: Img } = components as Record<
    'a' | 'img',
    React.ElementType
  >;

  /*
  Strapi's media library inserts uploaded videos as links
  (`[Video showing filters](/uploads/filters.webm)`), not images. Render those
  through the resolved `img`, so an `img` override applies to every video
  however it was inserted. Memoised so a re-render doesn't remount (and stop)
  a playing video.
  */
  const a = useMemo(
    () =>
      function MDXAnchor(props: any) {
        return getUploadedVideoType(props.href) ? (
          <Img {...getLinkedMediaProps(props)} />
        ) : (
          <Anchor {...props} />
        );
      },
    [Anchor, Img],
  );

  return { ...components, a };
}
