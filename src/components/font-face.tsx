const FontFace = () => (
  <style jsx global>
    {`
      @font-face {
        font-family: 'Public Sans';
        font-style: normal;
        font-weight: 100;
        font-display: block;
        src: url(/fonts/public-sans/public-sans-v7-latin-100.woff2)
            format('woff2'),
          url(/fonts/public-sans/public-sans-v7-latin-100.woff) format('woff'),
          url(/fonts/public-sans/public-sans-v7-latin-100.ttf)
            format('truetype');
      }

      @font-face {
        font-family: 'Public Sans';
        font-style: normal;
        font-weight: 200;
        font-display: block;
        src: url(/fonts/public-sans/public-sans-v7-latin-200.woff2)
            format('woff2'),
          url(/fonts/public-sans/public-sans-v7-latin-200.woff) format('woff'),
          url(/fonts/public-sans/public-sans-v7-latin-200.ttf)
            format('truetype');
      }

      @font-face {
        font-family: 'Public Sans';
        font-style: normal;
        font-weight: 300;
        font-display: block;
        src: url(/fonts/public-sans/public-sans-v7-latin-300.woff2)
            format('woff2'),
          url(/fonts/public-sans/public-sans-v7-latin-300.woff) format('woff'),
          url(/fonts/public-sans/public-sans-v7-latin-300.ttf)
            format('truetype');
      }

      @font-face {
        font-family: 'Public Sans';
        font-style: normal;
        font-weight: 400;
        font-display: block;
        src: url(/fonts/public-sans/public-sans-v7-latin-400.woff2)
            format('woff2'),
          url(/fonts/public-sans/public-sans-v7-latin-400.woff) format('woff'),
          url(/fonts/public-sans/public-sans-v7-latin-400.ttf)
            format('truetype');
      }

      @font-face {
        font-family: 'Public Sans';
        font-style: normal;
        font-weight: 500;
        font-display: block;
        src: url(/fonts/public-sans/public-sans-v7-latin-500.woff2)
            format('woff2'),
          url(/fonts/public-sans/public-sans-v7-latin-500.woff) format('woff'),
          url(/fonts/public-sans/public-sans-v7-latin-500.ttf)
            format('truetype');
      }

      @font-face {
        font-family: 'Public Sans';
        font-style: normal;
        font-weight: 600;
        font-display: block;
        src: url(/fonts/public-sans/public-sans-v7-latin-600.woff2)
            format('woff2'),
          url(/fonts/public-sans/public-sans-v7-latin-600.woff) format('woff'),
          url(/fonts/public-sans/public-sans-v7-latin-600.ttf)
            format('truetype');
      }

      @font-face {
        font-family: 'Public Sans';
        font-style: normal;
        font-weight: 700;
        font-display: block;
        src: url(/fonts/public-sans/public-sans-v7-latin-700.woff2)
            format('woff2'),
          url(/fonts/public-sans/public-sans-v7-latin-700.woff) format('woff'),
          url(/fonts/public-sans/public-sans-v7-latin-700.ttf)
            format('truetype');
      }

      @font-face {
        font-family: 'Public Sans';
        font-style: normal;
        font-weight: 800;
        font-display: block;
        src: url(/fonts/public-sans/public-sans-v7-latin-800.woff2)
            format('woff2'),
          url(/fonts/public-sans/public-sans-v7-latin-800.woff) format('woff'),
          url(/fonts/public-sans/public-sans-v7-latin-800.ttf)
            format('truetype');
      }

      @font-face {
        font-family: 'Public Sans';
        font-style: normal;
        font-weight: 900;
        font-display: block;
        src: url(/fonts/public-sans/public-sans-v7-latin-900.woff2)
            format('woff2'),
          url(/fonts/public-sans/public-sans-v7-latin-900.woff) format('woff'),
          url(/fonts/public-sans/public-sans-v7-latin-900.ttf)
            format('truetype');
      }

      @font-face {
        font-family: 'Martel';
        font-style: normal;
        font-weight: 200;
        font-display: block;
        src: url(/fonts/martel/martel-v5-latin-200.woff2) format('woff2'),
          url(/fonts/martel/martel-v5-latin-200.woff) format('woff'),
          url(/fonts/martel/martel-v5-latin-200.ttf) format('truetype');
      }

      @font-face {
        font-family: 'Martel';
        font-style: normal;
        font-weight: 300;
        font-display: block;
        src: url(/fonts/martel/martel-v5-latin-300.woff2) format('woff2'),
          url(/fonts/martel/martel-v5-latin-300.woff) format('woff'),
          url(/fonts/martel/martel-v5-latin-300.ttf) format('truetype');
      }

      @font-face {
        font-family: 'Martel';
        font-style: normal;
        font-weight: 400;
        font-display: block;
        src: url(/fonts/martel/martel-v5-latin-400.woff2) format('woff2'),
          url(/fonts/martel/martel-v5-latin-400.woff) format('woff'),
          url(/fonts/martel/martel-v5-latin-400.ttf) format('truetype');
      }

      @font-face {
        font-family: 'Martel';
        font-style: normal;
        font-weight: 600;
        font-display: block;
        src: url(/fonts/martel/martel-v5-latin-600.woff2) format('woff2'),
          url(/fonts/martel/martel-v5-latin-600.woff) format('woff'),
          url(/fonts/martel/martel-v5-latin-600.ttf) format('truetype');
      }

      @font-face {
        font-family: 'Martel';
        font-style: normal;
        font-weight: 700;
        font-display: block;
        src: url(/fonts/martel/martel-v5-latin-700.woff2) format('woff2'),
          url(/fonts/martel/martel-v5-latin-700.woff) format('woff'),
          url(/fonts/martel/martel-v5-latin-700.ttf) format('truetype');
      }

      @font-face {
        font-family: 'Martel';
        font-style: normal;
        font-weight: 800;
        font-display: block;
        src: url(/fonts/martel/martel-v5-latin-800.woff2) format('woff2'),
          url(/fonts/martel/martel-v5-latin-800.woff) format('woff'),
          url(/fonts/martel/martel-v5-latin-800.ttf) format('truetype');
      }

      @font-face {
        font-family: 'Martel';
        font-style: normal;
        font-weight: 900;
        font-display: block;
        src: url(/fonts/martel/martel-v5-latin-900.woff2) format('woff2'),
          url(/fonts/martel/martel-v5-latin-900.woff) format('woff'),
          url(/fonts/martel/martel-v5-latin-900.ttf) format('truetype');
      }

      @font-face {
        font-family: 'Merriweather';
        font-style: normal;
        font-weight: 300;
        font-display: block;
        src: url(/fonts/merriweather/merriweather-v28-latin-300.woff2)
            format('woff2'),
          url(/fonts/merriweather/merriweather-v28-latin-300.woff)
            format('woff'),
          url(/fonts/merriweather/merriweather-v28-latin-300.ttf)
            format('truetype');
      }

      @font-face {
        font-family: 'Merriweather';
        font-style: normal;
        font-weight: 400;
        font-display: block;
        src: url(/fonts/merriweather/merriweather-v28-latin-400.woff2)
            format('woff2'),
          url(/fonts/merriweather/merriweather-v28-latin-400.woff)
            format('woff'),
          url(/fonts/merriweather/merriweather-v28-latin-400.ttf)
            format('truetype');
      }

      @font-face {
        font-family: 'Merriweather';
        font-style: normal;
        font-weight: 700;
        font-display: block;
        src: url(/fonts/merriweather/merriweather-v28-latin-700.woff2)
            format('woff2'),
          url(/fonts/merriweather/merriweather-v28-latin-700.woff)
            format('woff'),
          url(/fonts/merriweather/merriweather-v28-latin-700.ttf)
            format('truetype');
      }

      @font-face {
        font-family: 'Merriweather';
        font-style: normal;
        font-weight: 900;
        font-display: block;
        src: url(/fonts/merriweather/merriweather-v28-latin-900.woff2)
            format('woff2'),
          url(/fonts/merriweather/merriweather-v28-latin-900.woff)
            format('woff'),
          url(/fonts/merriweather/merriweather-v28-latin-900.ttf)
            format('truetype');
      }
    `}
  </style>
);

export default FontFace;
