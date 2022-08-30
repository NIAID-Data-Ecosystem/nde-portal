export const gtmVirtualPageView = pageInfo => {
  window.dataLayer.push({ event: 'VirtualPageView', ...pageInfo });
};
// log page views based on url.
export const pageview = url => {
  window.gtag('config', process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS, {
    page_path: url,
  });
};

// log specific events happening.
export const event = ({ action, params }) => {
  // dataLayer.push({ event: action, ...params });
  window.gtag('event', action, params);
};
