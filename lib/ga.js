export const gtmVirtualPageView = (pageInfo) => {
  window.dataLayer.push({ event: "VirtualPageView", ...pageInfo });
};
