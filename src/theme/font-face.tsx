import React from 'react';

const FontFace = () => (
  // eslint-disable-next-line react/no-unknown-property
  <style jsx global>
    {`
      @import url('https://fonts.googleapis.com/css2?family=Public+Sans:wght@100;200;300;400;500;600;700;800;900');
      @import url('https://fonts.googleapis.com/css2?family=Martel:wght@100;200;300;400;500;600;700;800;900');
    `}
  </style>
);

export default FontFace;
