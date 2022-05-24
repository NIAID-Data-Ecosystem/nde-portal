import React from 'react';

// library of svgs + their string names.
interface GlyphProps {
  glyph?: string;
  stroke?: string;
  fill?: string;
}

const Glyph: React.FC<GlyphProps> = ({ glyph, stroke, fill }) => {
  switch (glyph) {
    case 'add':
      return (
        <g id='add'>
          <path
            fill={fill}
            stroke={stroke}
            d='M27.6,14.6l-10.1,0l0-10.1c0,0,0,0,0-0.1
          c0-0.9-0.8-1.7-1.7-1.7c-0.9,0-1.7,0.8-1.7,1.7l0,10.1l-10.1,0c-0.9,0-1.7,0.7-1.7,1.7c0,0.9,0.7,1.7,1.7,1.7c0,0,0,0,0.1,0l10.1,0
          l0,10.1c0,0,0,0,0,0.1c0,0.9,0.8,1.7,1.7,1.7c0.9,0,1.7-0.8,1.7-1.7l0-10.1l10.1,0c0.9,0,1.7-0.8,1.7-1.7
          C29.3,15.3,28.6,14.6,27.6,14.6z'
          />
        </g>
      );

    default:
      return (
        <g id='wireframe'>
          <path
            fill={fill}
            stroke={stroke}
            strokeWidth='10'
            d='M198,2v196H2V2H198 M200,0H0v200h200V0L200,0z'
          />
          <line
            stroke={stroke}
            strokeWidth='10'
            strokeMiterlimit='10'
            x1='1.95'
            y1='1.54'
            x2='198.05'
            y2='198.46'
          />
          <line
            stroke={stroke}
            strokeWidth='10'
            strokeMiterlimit='10'
            x1='1.85'
            y1='198.15'
            x2='198.15'
            y2='1.85'
          />
        </g>
      );
  }
};

export default Glyph;
