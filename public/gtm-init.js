// GTM bootstrap served from our origin, so script-src needs no 'unsafe-inline'.
// The container id comes from this script's ?id= query parameter.
(function (w, d, l) {
  var s = d.currentScript;
  var id = s && new URL(s.src).searchParams.get('id');
  if (!id || !/^GTM-[A-Z0-9]+$/.test(id)) return;
  w[l] = w[l] || [];
  w[l].push({ 'gtm.start': new Date().getTime(), event: 'gtm.js' });
  var j = d.createElement('script');
  j.async = true;
  j.src = 'https://www.googletagmanager.com/gtm.js?id=' + id;
  (d.head || d.documentElement).appendChild(j);
})(window, document, 'dataLayer');
