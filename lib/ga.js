export const gtmVirtualPageView = pageInfo => {
  window.dataLayer.push({ event: 'VirtualPageView', ...pageInfo });
};
// log page views based on url.
export const pageview = url => {
  if (!window.gtag) return;
  window.gtag('config', process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS, {
    page_path: url,
  });
};

// log specific events happening.
export const event = ({ action, params }) => {
  if (!window.gtag) return;
  window.gtag('event', action, params);
};
