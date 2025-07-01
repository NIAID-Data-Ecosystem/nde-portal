import type { MDXComponents as MDXComponentsTypes } from 'mdx/types';

import { MDXComponents } from '../components';

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
  return {
    ...MDXComponents,
    ...(overrides || {}),
  };
}
