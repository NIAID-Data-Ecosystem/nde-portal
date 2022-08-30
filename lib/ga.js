export const gtmVirtualPageView = pageInfo => {
  console.log('p', pageInfo);
  window.dataLayer.push({ event: 'VirtualPageView', ...pageInfo });
  if (pageInfo.search_term) {
    dataLayer.push({ event: 'search', search_term: pageInfo.search_term });
    window.gtag('event', 'search', { search_term: pageInfo.search_term });
  }
};

export const pageview = url => {
  console.log('hi', process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS);
  window.gtag('config', process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS, {
    page_path: url,
  });
};

// log specific events happening.
export const event = ({ action, params }) => {
  dataLayer.push({ event: 'search', search_term: params.search_term });
  // window.gtag('event', action, params);
};
