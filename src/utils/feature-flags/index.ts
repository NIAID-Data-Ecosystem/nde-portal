// [Feature Flags]
// This file contains feature flags to enable/disable certain features or sections of the application
// based on the environment or other conditions.
const isProd = process.env.NEXT_PUBLIC_APP_ENV === 'production';

// Hide samples section in production builds until approved. To enable section in production, set this flag to return `false`.
export const SHOULD_HIDE_SAMPLES = (hash: string) =>
  hash === 'samples' && isProd;

// Show credit text section in non-production environments for testing/review. To enable section in production, set this flag to `true`.
// Note that we currently have two separate sections where credit text appears:
// - In the sidebar under "Resource Access": src/components/resource-sections/components/sidebar/components/external/index.tsx
// - As a standalone section in the overview section: src/components/resource-sections/index.tsx
export const SHOW_CREDIT_TEXT_SECTION = !isProd;
