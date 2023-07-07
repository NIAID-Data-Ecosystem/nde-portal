import React from 'react';

// library of svgs + their string names.
interface GlyphProps {
  // id for aria-labelling
  id: string;
  glyph?: string;
  stroke?: string;
  fill?: string;
  title?: string;
}

const Glyph: React.FC<GlyphProps> = ({ id, glyph, stroke, fill, title }) => {
  switch (glyph) {
    case 'bam':
      return (
        <>
          <title id={id}>{title || 'Icon for BAM type files.'}</title>

          <path d='M170.4,46.8c0-2.4-0.9-4.6-2.6-6.3L131.2,3.9c-1.7-1.7-4-2.6-6.3-2.6h-2.3v47.8h47.8V46.8z' />
          <polygon points='81.6,106.6 93.5,106.6 87.6,88.3 		' />
          <path
            d='M42.7,107.4c-1.1-0.5-2.4-0.7-3.8-0.7h-9.3v12.1h8.8c2.6,0,4.5-0.6,5.8-1.8c1.3-1.2,2-2.6,2-4.3c0-1.2-0.3-2.3-0.9-3.2
			C44.7,108.6,43.8,107.9,42.7,107.4z'
          />
          <path
            d='M41.6,96.9c0.8-0.2,1.5-0.6,2.1-1.1c0.6-0.5,1.1-1.1,1.5-1.8c0.4-0.7,0.5-1.5,0.5-2.4c0-1.9-0.7-3.3-2.1-4.3
			c-1.4-1-3.1-1.5-5.3-1.5h-8.7v11.4h9.3C39.9,97.3,40.8,97.1,41.6,96.9z'
          />
          <path
            d='M188.6,68.9H171V61h-50.7c-4.9,0-9-4-9-9V1.3H95.1h-7.5H75.6H39.8h-3.1c-5,0-9,4-9,9v58.6H5.2c-2.8,0-5,2.3-5,5v59.3
			c0,2.8,2.2,5,5,5h22.5v45.2c0,5,4,9,9,9H162c5,0,9-4,9-9v-45.2h17.6c2.8,0,5-2.3,5-5V73.9C193.6,71.1,191.4,68.9,188.6,68.9z
			 M53.7,124.6c-3.2,2.3-8.4,3.4-15.7,3.4H17.5V76.6h19.6c7,0,12.1,1.2,15.3,3.5c3.3,2.3,4.9,5.7,4.9,10c0,2.4-0.6,4.6-1.9,6.4
			c-1.2,1.9-3.5,3.5-6.7,5c2.2,0.6,3.9,1.4,5.2,2.3s2.3,2,2.9,3.2s1.1,2.3,1.3,3.5s0.3,2.3,0.3,3.4
			C58.5,118.8,56.9,122.3,53.7,124.6z M100.1,128L96.3,117H79L75.1,128H63l18.2-51.3h12.5l18.3,51.3H100.1z M175.6,128h-12.1V89.7
			L152.2,128h-9L132,89.8V128h-12.1V76.6h17.8l10,33.9l10.1-33.9h17.7V128z'
          />
        </>
      );
    case 'empty':
      return (
        <>
          <title id={id}>{title || 'Empty, no data available.'}</title>

          <path
            d='M184.7,175.8H52.1v-2h132.6c3,0,5.4-2.4,5.4-5.4V41.3c0-3-2.4-5.4-5.4-5.4H8.9c-3,0-5.4,2.4-5.4,5.4v127.1
				c0,3,2.4,5.4,5.4,5.4h20.8v2H8.9c-4.1,0-7.4-3.3-7.4-7.4V41.3c0-4.1,3.3-7.4,7.4-7.4h175.8c4.1,0,7.4,3.3,7.4,7.4v127.1
				C192.1,172.5,188.8,175.8,184.7,175.8z'
          />

          <path
            d='M182.1,175.5H53v-7h129.1c1.9,0,3.5-1.6,3.5-3.5V41.8c0-1.9-1.6-3.5-3.5-3.5H11.3c-1.9,0-3.5,1.6-3.5,3.5V165
				c0,1.9,1.6,3.5,3.5,3.5h20.2v7H11.3c-5.8,0-10.5-4.7-10.5-10.5V41.8c0-5.8,4.7-10.5,10.5-10.5h170.8c5.8,0,10.5,4.7,10.5,10.5
				V165C192.6,170.8,187.9,175.5,182.1,175.5z'
          />

          <rect x='4.3' y='56.4' width='183.6' height='7' />

          <path
            d='M96.7,160.5c-23.5,0-42.6-19.1-42.6-42.6c0-23.5,19.1-42.6,42.6-42.6s42.6,19.1,42.6,42.6
				C139.4,141.4,120.2,160.5,96.7,160.5z M96.7,82.2c-19.7,0-35.6,16-35.6,35.6s16,35.6,35.6,35.6c19.7,0,35.6-16,35.6-35.6
				S116.4,82.2,96.7,82.2z'
          />

          <path
            d='M108.5,133.1c-0.9,0-1.8-0.3-2.5-1l-23.5-23.5c-1.4-1.4-1.4-3.6,0-4.9c1.4-1.4,3.6-1.4,4.9,0l23.5,23.5
				c1.4,1.4,1.4,3.6,0,4.9C110.3,132.8,109.4,133.1,108.5,133.1z'
          />

          <path
            d='M85,133.1c-0.9,0-1.8-0.3-2.5-1c-1.4-1.4-1.4-3.6,0-4.9l23.5-23.5c1.4-1.4,3.6-1.4,4.9,0c1.4,1.4,1.4,3.6,0,4.9
				l-23.5,23.5C86.8,132.8,85.9,133.1,85,133.1z'
          />

          <path
            d='M40,185.8c-2.6,0-5.2-1-7.2-3l-2-2c-1.9-1.9-3-4.5-3-7.2s1.1-5.3,3-7.2l30.7-30.7l5,4.9l-30.7,30.7
				c-0.6,0.6-0.9,1.4-0.9,2.3s0.3,1.7,0.9,2.3l2,2c1.2,1.2,3.3,1.2,4.5,0l31-31l4.9,4.9l-31,31C45.2,184.8,42.6,185.8,40,185.8z'
          />

          <circle cx='18.8' cy='47.4' r='3.1' />

          <circle cx='29.8' cy='47.4' r='3.1' />

          <circle cx='40.7' cy='47.4' r='3.1' />
        </>
      );
    case 'fasta':
      return (
        <>
          <title id={id}>{title || 'Icon for FASTA type files.'}</title>
          <path d='M170.4,46.8c0-2.4-0.9-4.6-2.6-6.3L131.2,3.9c-1.7-1.7-4-2.6-6.3-2.6h-2.3v47.8h47.8V46.8z' />
          <polygon points='157.4,107.2 166.5,107.2 162,93.2' />
          <path
            d='M188,68.9h-17.6V61h-50.7c-4.9,0-9-4-9-9V1.3H94.5h-7.5H75H39.2H36c-5,0-9,4-9,9v58.6H4.6c-2.8,0-5,2.3-5,5v59.3
            c0,2.8,2.2,5,5,5h22.5v45.2c0,5,4,9,9,9h125.4c5,0,9-4,9-9v-45.2H188c2.8,0,5-2.3,5-5V73.9C193,71.1,190.7,68.9,188,68.9z
             M34.5,92H16.1v8.4h15.6v7.4H16.1v15.6H6.9v-39h27.6L34.5,92z M62.9,123.5l-2.9-8.3H46.9l-2.9,8.3h-9.2l13.9-39h9.5l13.9,39H62.9z
             M106.7,118.4c-1.4,1.7-3.3,3.1-5.8,4.1c-2.4,1-5.2,1.5-8.4,1.5c-2,0-3.9-0.2-5.8-0.7c-1.9-0.5-3.7-1.2-5.3-2.2s-2.9-2.3-3.9-3.8
            c-1-1.5-1.6-3.3-1.8-5.3h9.4c0.2,1.1,0.7,2,1.4,2.7c0.7,0.7,1.5,1.3,2.6,1.7c1,0.4,2.2,0.6,3.5,0.6c1.3,0,2.4-0.1,3.5-0.4
            s1.9-0.7,2.6-1.4c0.7-0.6,1-1.4,1-2.5c0-0.9-0.3-1.6-0.9-2.1c-0.6-0.5-1.4-1-2.4-1.3c-1-0.3-2.1-0.6-3.2-0.8l-6.4-1.2
            c-3-0.5-5.3-1.7-7.1-3.6c-1.8-1.9-2.7-4.4-2.8-7.5c0-2.5,0.6-4.7,2-6.5c1.4-1.8,3.3-3.2,5.6-4.2c2.4-1,5-1.5,7.9-1.5
            c3.5,0,6.4,0.5,8.8,1.6c2.4,1,4.2,2.5,5.4,4.3c1.2,1.8,1.9,3.9,1.9,6.2h-9.2c-0.1-1.2-0.5-2.1-1.1-2.9s-1.4-1.2-2.3-1.6
            c-1-0.3-2.1-0.5-3.4-0.5c-1,0-1.9,0.1-2.7,0.3c-0.8,0.2-1.4,0.5-1.9,0.9c-0.5,0.4-0.9,0.8-1.1,1.3c-0.2,0.5-0.4,1-0.4,1.5
            c0,1,0.3,1.8,1,2.4c0.7,0.6,1.9,1.1,3.8,1.5l6.3,1.2c2.6,0.5,4.6,1.2,6.1,2.2c1.5,1,2.6,2.1,3.3,3.3c0.7,1.2,1.2,2.4,1.4,3.7
            s0.3,2.3,0.3,3.3C108.8,114.8,108.1,116.7,106.7,118.4z M133.8,123.5h-9.2V92.5h-11.4v-8.1h32v8.1h-11.3V123.5z M171.5,123.5
            l-2.9-8.3h-13.2l-2.9,8.3h-9.2l13.9-39h9.5l13.9,39H171.5z'
          />
          <polygon points='48.9,107.2 57.9,107.2 53.4,93.2' />
        </>
      );
    case 'healthCondition':
      return (
        <>
          <path
            fill={fill}
            d='M76.5,105.9H32.3c-13,0-23.6-10.4-24-23.4L2.6,27.1c0-0.3-0.1-0.7-0.1-1c0-14.1,13.9-24,26.3-24
              c5.5,0,10,4.5,10,10s-4.5,10-10,10c-2.9,0-5.9,2.4-6.3,3.7l5.7,55c0,0.3,0.1,0.7,0.1,1c0,2.1,1.8,4,4,4h44.2c2.1,0,4-1.8,4-4
              c0-0.3,0-0.7,0.1-1l5.7-55.2c-0.2-2-1.9-3.6-3.9-3.6c-5.5,0-10-4.5-10-10s4.5-10,10-10c13.2,0,24,10.7,24,24c0,0.3,0,0.7-0.1,1
              l-5.8,55.4C100.2,95.5,89.5,105.9,76.5,105.9z M96.3,26.1L96.3,26.1L96.3,26.1z'
          />

          <path
            fill={fill}
            d='M107.8,192.5c-35.6,0-64.5-28.5-64.5-63.5V99c0-6.6,5.4-12,12-12s12,5.4,12,12V129
              c0,21.8,18.2,39.5,40.5,39.5s40.5-17.7,40.5-39.5V81.9c0-6.6,5.4-12,12-12s12,5.4,12,12V129C172.3,164,143.3,192.5,107.8,192.5z'
          />

          <path
            fill={fill}
            d='M158.8,89.7c-18.5,0-33.6-15.1-33.6-33.6s15.1-33.6,33.6-33.6s33.6,15.1,33.6,33.6S177.3,89.7,158.8,89.7
              z M158.8,42.6c-7.5,0-13.6,6.1-13.6,13.6c0,7.5,6.1,13.6,13.6,13.6s13.6-6.1,13.6-13.6C172.3,48.7,166.3,42.6,158.8,42.6z'
          />
        </>
      );
    case 'infectiousAgent':
      return (
        <>
          {/* <title id={id}>{title || 'Icon for pathogen.'}</title> */}

          <path
            fill={fill}
            d='M42.7,87.9l-14.2-4.8c0.6-1.9,0.9-2.5,1.6-3.6c0.1-0.2,0.2-0.4,0.4-0.8c9.4-19,26.4-33.4,46.8-39.3
              l4.2,14.4c-16.3,4.7-30,16.2-37.5,31.5c-0.4,0.8-0.7,1.4-1,1.8C42.9,87.3,42.8,87.6,42.7,87.9z'
          />

          <path
            fill={fill}
            d='M39.2,159.3c-10.7-13.3-16.5-30.1-16.5-47.2c0-1.4,0-2.9,0.1-4.3l15,0.8c-0.1,1.2-0.1,2.3-0.1,3.5
              c0,13.9,4.6,27,13.2,37.8L39.2,159.3z'
          />

          <path
            fill={fill}
            d='M98.4,187.8c-15.6,0-30.5-4.7-43.2-13.6l8.6-12.3c10.2,7.1,22.2,10.9,34.7,10.9c13.9,0,27-4.6,37.9-13.3
              l9.4,11.7C132.3,181.9,115.5,187.8,98.4,187.8z'
          />

          <path
            fill={fill}
            d='M163.7,150.3l-12.9-7.6c3.1-5.3,5.4-11.1,6.8-17.1l14.6,3.3C170.5,136.4,167.6,143.6,163.7,150.3z'
          />

          <path
            fill={fill}
            d='M158.2,102c-1.8-10.5-6.3-20.4-13.1-28.6l11.5-9.6c8.5,10.3,14.2,22.6,16.4,35.7L158.2,102z'
          />

          <path
            fill={fill}
            d='M136.6,65c-10.8-8.7-24.3-13.5-38.2-13.5v-15c17.3,0,34.2,6,47.6,16.9L136.6,65z'
          />

          <path
            fill={fill}
            d='M108.2,132.5c1.2,1.9,1.3,4,0.9,6.1c-0.5,2.1-1.7,4-3.4,5.6c-0.4,0.4-0.9,0.7-1.3,1.1
              c-0.5,0.3-1,0.6-1.5,0.9c-1,0.5-2.2,0.9-3.3,1.2c-2.3,0.5-4.8,0.4-7.1-0.4c-2.3-0.7-4.4-2-6.1-3.7c-0.8-0.9-1.5-1.8-2.1-2.8
              c-0.3-0.5-0.5-1-0.7-1.6c-0.2-0.5-0.4-1.1-0.5-1.6c-0.5-2.2-0.4-4.5,0.4-6.5c0.8-2,2.2-3.7,4.2-4.5l0.9,0.3
              c-0.3,1.3-0.4,2.6-0.2,3.8c0.2,1.3,0.6,2.5,1.2,3.6c1.2,2.2,3.3,3.9,5.7,4.6c2.4,0.8,5,0.5,7.3-0.6c1.1-0.5,2.1-1.3,3-2.3
              c0.9-0.9,1.6-2,2-3.3L108.2,132.5z'
          />

          <path
            fill={fill}
            d='M116.9,90.1c0.3-2.2,1.7-3.9,3.4-5.2c1.7-1.2,3.9-1.9,6.2-1.9c0.6,0,1.1,0,1.7,0.1
              c0.6,0.1,1.1,0.2,1.7,0.3c1.1,0.3,2.2,0.7,3.3,1.3c2.1,1.2,3.9,2.9,5.1,5c1.2,2,2,4.4,2.1,6.8c0,1.2-0.1,2.4-0.3,3.5
              c-0.1,0.6-0.3,1.1-0.5,1.7c-0.2,0.5-0.5,1.1-0.7,1.6c-1.1,2-2.7,3.6-4.6,4.6c-1.9,1-4,1.3-6.1,0.6l-0.5-0.8
              c1.1-0.7,2-1.7,2.7-2.7c0.7-1,1.2-2.2,1.5-3.5c0.5-2.4,0.1-5.1-1.2-7.2c-1.3-2.1-3.4-3.7-5.8-4.4c-1.2-0.3-2.5-0.4-3.7-0.3
              c-1.3,0.1-2.5,0.5-3.7,1.1L116.9,90.1z'
          />

          <path
            fill={fill}
            d='M69.3,157.7c-3.9,2.6-6.9,5.8-8.9,9.3c-0.5,0.9-1,1.8-1.4,2.7c-0.4,0.9-0.8,1.9-1,2.7
              c-0.5,1.8-0.9,3.9-1.5,6.2c-0.6,2.3-1.4,5-3.1,7.6c-0.4,0.7-0.9,1.3-1.4,1.9c-0.3,0.3-0.5,0.6-0.8,0.9l-1,0.9
              c-0.7,0.6-1.5,1.1-2.3,1.5c-0.8,0.4-1.7,0.8-2.6,1.1c-1.8,0.5-3.7,0.7-5.4,0.5c-0.9,0-1.7-0.2-2.5-0.4c-0.8-0.2-1.6-0.4-2.3-0.7
              c-3-1.1-5.5-2.8-7.7-4.9c-1.1-1-2.1-2.2-3-3.6c-0.4-0.7-0.8-1.4-1.2-2.1c-0.3-0.7-0.7-1.5-0.9-2.2c-1-3.1-1.3-6.4-0.8-9.5
              c0.5-3.1,1.7-6,3.5-8.3c1.7-2.4,3.9-4.4,6.3-5.9c9.5-5.5,18-4.5,25.1-10.9c-0.7,2.3-1.9,4.4-3.6,6.3c-1.6,1.9-3.6,3.4-5.5,4.8
              c-3.9,2.7-7.8,4.9-10.5,7.4c-2.4,2.4-3.9,5.4-4,8.2c-0.2,2.7,0.9,5.1,3,7.2c1,1.1,2.4,1.9,3.6,2.4c1.2,0.6,2.3,0.6,3,0.6
              c0.4-0.1,0.8-0.1,1.1-0.4c0.1-0.1,0.2-0.1,0.3-0.2c0.1-0.1,0.2-0.2,0.4-0.3c0.2-0.2,0.5-0.4,0.7-0.7c0.5-0.5,0.9-1.2,1.4-1.9
              c0.5-0.8,0.9-1.6,1.4-2.6c0.9-1.9,1.9-4.2,3.3-6.4c0.7-1.2,1.5-2.2,2.3-3.2c0.9-1,1.7-1.9,2.7-2.7
              C59.8,159.8,64.6,157.8,69.3,157.7z'
          />

          <path
            fill={fill}
            d='M77.7,64.6c0.5-6.2,0.7-12.2-0.2-17.9c-0.2-1.4-0.4-2.8-0.9-3.8c-0.2-0.5-0.4-1-0.7-1.5
              c-0.3-0.4-0.5-0.7-0.9-1.2c-0.8-0.8-1.7-1.7-2.9-2.6c-1.1-1-2.4-2-3.7-3.5c-2.6-3-4.4-6.8-4.9-10.9c-0.2-2-0.2-4.2,0.3-6.2
              c0.4-2,1.1-4,2.1-5.8c2-3.7,5.3-6.7,8.9-8.6c3.6-1.9,7.6-2.7,11.4-2.7c3.9,0,7.7,0.8,11.2,2.4c0.9,0.4,1.8,0.8,2.6,1.3
              c0.8,0.5,1.6,1,2.5,1.7c0.4,0.3,0.8,0.7,1.2,1l1.1,1.2c0.4,0.4,0.7,0.8,1.1,1.3c0.3,0.4,0.7,0.9,1,1.4c1.2,1.9,1.9,3.9,2.4,6
              c0.4,2,0.5,4,0.4,6c-0.2,3.8-1.3,7.3-2.8,10.5c-0.4,0.8-0.8,1.6-1.2,2.3l-1.1,1.9c-0.3,0.6-0.6,1.2-0.9,1.8l-0.9,1.9
              c-1.1,2.5-1.9,5.2-2.4,8C99.5,54,99.7,60,101.1,66c-3.8-4.9-6.1-11.3-6.5-17.9c-0.2-3.3,0.1-6.6,0.7-9.9
              c0.2-0.8,0.4-1.6,0.6-2.4c0.2-0.8,0.5-1.6,0.7-2.4l0.8-2.3c0.2-0.6,0.4-1.2,0.6-1.9c0.4-1.2,0.6-2.5,0.8-3.7
              c0.2-1.2,0.2-2.4,0.2-3.5c0-1.1-0.3-2.1-0.5-3.1c-0.3-0.9-0.7-1.7-1.2-2.4c-0.1-0.2-0.3-0.3-0.4-0.5c-0.1-0.2-0.3-0.3-0.4-0.5
              c-0.2-0.1-0.3-0.3-0.5-0.4l-0.6-0.4c-0.3-0.3-0.9-0.5-1.3-0.8c-0.5-0.3-1-0.5-1.5-0.7c-2-0.8-4.3-1.3-6.5-1.3
              c-2.2,0-4.4,0.5-6.2,1.3c-1.8,0.8-3.3,2.1-4.3,3.6c-0.5,0.8-0.9,1.7-1.2,2.7c-0.3,1-0.5,1.9-0.5,2.9c0,2,0.6,4,1.7,5.8
              c0.6,0.9,1.5,2,2.5,3.2c1,1.2,2.2,2.5,3.1,4.2c0.5,0.8,1,1.9,1.3,2.8c0.3,1,0.5,2,0.6,2.9c0.2,1.9,0.1,3.6,0,5.2
              C82.7,53.1,80.6,59.2,77.7,64.6z'
          />

          <path
            fill={fill}
            d='M139.3,110.1c2-0.6,3.9-1.2,5.6-2c1.7-0.8,3.1-1.8,4-2.9c0.8-1,1.4-2.5,2.9-4.5c0.7-1,1.8-2.1,3.1-3
              c1.1-0.8,2.4-1.4,3.7-1.8c2.6-0.9,5.4-1.2,8.3-0.8c1.4,0.2,2.8,0.6,4.2,1.1c1.4,0.6,2.7,1.4,3.9,2.3c2.1,1.6,4,3.7,5.4,6.2
              c1.4,2.5,2.3,5.5,2.4,8.6c0,3.1-0.8,6.2-2.4,8.9c-1.6,2.7-3.9,4.8-6.4,6.2c-1.3,0.7-2.6,1.3-3.9,1.7c-1.3,0.4-2.7,0.6-4.1,0.7
              c-2.8,0.2-5.4-0.3-7.6-0.9c-2.2-0.7-4.1-1.5-5.9-2.3c-1.6-0.8-3.3-1.5-5-2c-3.4-1.2-7-1.7-11.2-1.3c3-3,7.4-4.7,11.8-5
              c2.2-0.2,4.5-0.1,6.6,0.1c2,0.2,3.9,0.5,5.6,0.5c0.8,0,1.6,0,2.3-0.1c0.7-0.1,1.3-0.2,1.9-0.3c1.1-0.3,2.2-0.9,3-1.5
              c1.7-1.3,2.3-2.8,2.3-4.5c0-0.8-0.2-1.7-0.6-2.6c-0.4-1-1.2-2-2-2.8c-0.3-0.3-0.7-0.6-1.1-0.9c-0.4-0.3-0.9-0.5-1.4-0.7
              c-0.5-0.2-1.1-0.3-1.6-0.4c-0.6-0.1-1.2-0.1-1.8-0.1c-0.6,0.1-1.2,0.1-1.8,0.3c-0.4,0.1-0.9,0.2-1.5,0.6
              c-1.2,0.8-2.9,2.6-5.4,3.8c-2.4,1.1-4.8,1.3-7,1.2C143.3,111.5,141.2,110.9,139.3,110.1z'
          />

          <path
            fill={fill}
            d='M134.4,136.9c2.1,1.5,4.1,2.9,6.2,4c2.1,1.1,4.2,1.8,6.2,1.9c1.8,0.1,3.9-0.5,6.9-0.7
              c1.5-0.1,3.2,0,4.9,0.5c1.5,0.4,3,1,4.4,1.8c2.8,1.6,5.2,3.8,7,6.6c0.9,1.4,1.7,2.9,2.2,4.5c0.5,1.6,0.9,3.3,1,5
              c0.2,3.1-0.2,6.3-1.2,9.5c-1,3.1-2.9,6.2-5.5,8.6c-2.6,2.4-5.8,4-9.3,4.7c-3.5,0.7-7,0.4-10.2-0.6c-3.2-1.1-6-2.7-8.3-4.9
              c-2.4-2.2-4.1-4.8-5.3-7.3c-1.2-2.5-2.1-4.9-3-7.2c-0.8-2.2-1.6-4.3-2.7-6.3c-2.1-4.1-5-7.8-9.1-10.9c5.1,0.7,10,3.5,13.8,7.4
              c1.9,1.9,3.6,4.1,5,6.3c1.4,2.1,2.7,4.2,4,5.9c0.6,0.9,1.3,1.6,2,2.3c0.7,0.7,1.3,1.3,2.1,1.8c1.4,1,3.1,1.7,4.6,2.1
              c3.2,0.7,6.1-0.1,8.2-2c1-0.9,1.9-2.2,2.5-3.7c0.6-1.5,0.9-3.3,1-5.1c0-0.8,0-1.5-0.2-2.3c-0.2-0.8-0.4-1.5-0.8-2.3
              c-0.3-0.8-0.8-1.5-1.3-2.2c-0.5-0.7-1.1-1.4-1.8-1.9c-0.7-0.6-1.4-1.1-2.2-1.5c-0.6-0.4-1.3-0.6-2.3-0.8
              c-1.9-0.4-4.9-0.3-7.9-1.4c-2.9-1.1-5.1-3-6.9-5C136.8,141.4,135.5,139.2,134.4,136.9z'
          />

          <path
            fill={fill}
            d='M136.3,64.9c0.6-2.5,1.6-4.9,2.5-7.2c0.4-1.2,0.8-2.3,1.2-3.4c0.2-0.6,0.3-1.1,0.4-1.7
              c0.1-0.5,0.2-1,0.2-1.5c0.2-2.1,0-4.3-0.1-6.9c-0.1-1.3,0-2.7,0.1-4.2c0.2-1.5,0.5-3.1,1-4.6c0.5-1.5,1.2-2.9,2-4.3
              c0.8-1.4,1.9-2.6,3-3.8c2.3-2.4,5.4-4.1,8.7-5.1c1.7-0.5,3.4-0.7,5.2-0.7c1.7,0,3.4,0.2,5.2,0.7c3.5,0.9,6.5,2.8,8.9,5.1
              c2.4,2.4,4.2,5.1,5.4,8.2c0.6,1.5,1,3.2,1.3,4.8c0.1,0.8,0.2,1.7,0.2,2.5c0,0.9,0,1.8-0.1,2.6c-0.4,3.5-1.8,6.7-3.7,9.3
              c-1.8,2.6-3.9,4.6-6.1,6.3c-4.5,3.4-9.2,5.7-14,7.5c-1.2,0.4-2.4,0.9-3.6,1.3l-0.9,0.3l-0.9,0.3l-1.8,0.5
              c-1.1,0.3-2.3,0.7-3.3,1.2c-1,0.5-1.9,1.3-2.2,2.6c-0.3-1.3,0.2-2.7,1.1-3.9c0.8-1.1,1.9-2,3-2.8l1.6-1.1l0.7-0.5l0.7-0.5
              l2.9-2.3c3.9-3,7.6-6.1,10.5-9.4c1.5-1.6,2.7-3.3,3.5-5c0.8-1.7,1.3-3.2,1.3-4.7c0-1.4-0.3-3.1-1-4.6c-0.7-1.5-1.7-2.9-2.8-4.1
              c-1.2-1.1-2.5-1.9-3.8-2.4c-0.6-0.2-1.4-0.4-2.2-0.4c-0.8-0.1-1.5,0-2.2,0.1c-1.5,0.2-2.9,0.9-4.3,1.9c-1.3,1-2.5,2.3-3.5,3.9
              c-0.4,0.8-0.8,1.6-1.1,2.6c-0.3,0.9-0.6,2-0.8,3.2c-0.5,2.3-0.9,5.1-2.1,7.8c-0.3,0.7-0.6,1.3-1,2c-0.4,0.6-0.7,1.2-1.1,1.7
              c-0.8,1.1-1.6,2.1-2.5,3.1C139.8,61.4,138,63,136.3,64.9z'
          />

          <path
            fill={fill}
            d='M56.6,96.7c-2.5-0.4-5-0.6-7.6-1.1c-1.3-0.2-2.6-0.5-3.9-0.9c-0.7-0.2-1.3-0.4-2-0.7
              c-0.7-0.3-1.4-0.6-2-1c-2.6-1.5-4.6-3.4-6.5-4.9c-0.9-0.8-1.8-1.5-2.6-2c-0.8-0.6-1.6-1-2.5-1.3c-1.7-0.7-3.5-1-5.1-1
              c-1.7,0.1-3.2,0.4-4.6,1.2c-0.7,0.4-1.3,0.8-1.8,1.3c-0.6,0.5-1.1,1.1-1.5,1.7c-0.8,1.2-1.3,2.6-1.6,4.2
              c-0.2,1.6-0.1,3.3,0.3,4.9c0.4,1.6,1.1,3.2,2,4.2c0.9,1.1,2.2,2.1,3.9,2.9c1.7,0.8,3.7,1.4,5.8,1.8c4.3,0.8,9.1,0.9,14,1l3.7,0
              l0.9,0l0.9,0l1.9-0.1c1.3,0,2.7,0,4.1,0.4c1.3,0.4,2.7,1.2,3.2,2.4c-1.1-0.7-2.2-0.9-3.4-0.7c-1.1,0.2-2.2,0.6-3.3,1l-1.7,0.7
              l-0.9,0.4l-0.9,0.3c-1.2,0.4-2.4,0.8-3.6,1.2c-4.9,1.5-10.1,2.6-15.7,2.7c-2.8,0-5.7-0.3-8.7-1.2c-3-0.9-6.1-2.6-8.6-5.1
              c-0.6-0.6-1.2-1.3-1.7-2c-0.5-0.7-1-1.4-1.4-2.1c-0.8-1.5-1.5-3-2-4.6c-1-3.2-1.2-6.5-0.8-9.8C3.7,87.2,5,83.8,7.1,81
              c1.1-1.4,2.3-2.6,3.7-3.7c1.4-1.1,2.9-2,4.5-2.6c3.2-1.3,6.7-1.8,10-1.3c1.6,0.2,3.2,0.6,4.7,1.2c1.5,0.6,2.9,1.3,4.3,2.2
              c1.3,0.9,2.5,1.9,3.6,3c1,1.1,1.9,2.2,2.7,3.2c1.5,2.1,2.7,4,4.2,5.5c0.4,0.4,0.7,0.7,1.1,1.1c0.4,0.4,0.9,0.7,1.4,1
              c0.9,0.7,2,1.3,3,2C52.3,93.8,54.6,95.1,56.6,96.7z'
          />
        </>
      );
    case 'license':
      return (
        <>
          <path
            fill={fill}
            d='M93.6,190.5H28.6c-13.1,0-23.8-10-23.8-22.2V24.6c0-12.2,10.7-22.2,23.8-22.2h115
              c13.1,0,23.8,10,23.8,22.2v27.6c0,5.8-4.7,10.5-10.5,10.5s-10.5-4.7-10.5-10.5V24.6c-0.1-0.2-1-1.2-2.8-1.2h-115
              c-1.8,0-2.7,1-2.8,1.3l0,143.7c0.1,0.2,1,1.2,2.8,1.2h64.9c5.8,0,10.5,4.7,10.5,10.5S99.4,190.5,93.6,190.5z'
          />

          <path
            fill={fill}
            d='M172.6,154.9c-1.2,10.2-10.4,16.8-20.2,12.5c-0.6-0.3-6.5-3.6-5.7-4.5c-6.1,6.6-16.1,6.9-21.6,0.7v23.6
                l24-9.8l24,9.8v-32.2C172.9,154.9,172.7,154.9,172.6,154.9z'
          />
          <path
            fill={fill}
            d='M173,192.1c-0.6,0-1.3-0.1-1.9-0.4l-22.1-9l-22.1,9c-1.5,0.6-3.3,0.4-4.7-0.5c-1.4-0.9-2.2-2.5-2.2-4.1
                v-23.6c0-2.1,1.3-3.9,3.2-4.7c1.9-0.7,4.1-0.2,5.5,1.3c1.6,1.8,3.8,2.7,6.3,2.8c0,0,0,0,0.1,0c2.9,0,5.7-1.3,7.9-3.5
                c0,0,0,0,0,0v0c1.9-2,5-2.1,7.1-0.2c0.5,0.5,0.9,1.1,1.2,1.7c0.9,0.7,2.5,1.6,3.2,1.9c2.9,1.3,5.8,1.2,8.2-0.2
                c2.7-1.6,4.6-4.7,5-8.3c0.2-1.4,0.9-2.7,2.1-3.5c1.2-0.8,2.6-1.1,4-0.8l0.4,0.1c2.3,0.5,3.9,2.5,3.9,4.9v32.2
                c0,1.7-0.8,3.2-2.2,4.1C175,191.8,174,192.1,173,192.1z M149,172.4c0.6,0,1.3,0.1,1.9,0.4l17.1,7V171c-0.1,0.1-0.3,0.2-0.4,0.2
                c-5.2,3-11.5,3.2-17.3,0.7c-0.2-0.1-2.1-0.9-4.1-2.3c-3.3,2.2-7.2,3.3-11.1,3.3c0,0-0.1,0-0.1,0c-1.7,0-3.4-0.2-5-0.7v7.4
                l17.1-7C147.7,172.5,148.4,172.4,149,172.4z M150.3,166.2C150.3,166.2,150.3,166.2,150.3,166.2
                C150.3,166.2,150.3,166.2,150.3,166.2z M150.3,166.2C150.3,166.2,150.3,166.2,150.3,166.2C150.3,166.2,150.3,166.2,150.3,166.2z
                 M150.3,166.2L150.3,166.2L150.3,166.2z M172.6,154.9L172.6,154.9L172.6,154.9z'
          />
          <path
            fill={fill}
            d='M181.8,101.2c2.9-5,3.2-9.2,0.9-12.6c-0.4-0.5-0.8-1-1.2-1.4c-0.3-0.6-0.6-1.1-1-1.6
                c-2.5-3.1-6.5-4-11.9-2.9c-0.1,0-0.3,0.1-0.4,0.1c-0.7-5.7-2.9-9.3-6.8-10.7c-3.8-1.3-7.8,0-12,4.1c-3.6-4.5-7.4-6.4-11.3-5.5
                c-0.6,0.1-1.2,0.3-1.8,0.6c-0.6,0-1.2,0.2-1.8,0.3c-3.9,1.2-6.3,4.7-7.2,10.4c-5.6-1.5-9.7-0.8-12.4,2.3c-0.4,0.5-0.8,1-1.1,1.5
                c-0.5,0.4-0.9,0.9-1.3,1.4c-2.4,3.3-2.3,7.5,0.4,12.6c-5.4,2.1-8.3,5.2-8.6,9.2c-0.1,0.6,0,1.3,0.1,1.9
                c-0.1,0.6-0.2,1.2-0.2,1.9c0,4.1,2.6,7.4,7.8,9.9c-3.1,4.9-3.6,9.1-1.4,12.5c0.3,0.5,0.7,1,1.2,1.5c0.3,0.6,0.6,1.1,0.9,1.6
                c2.4,3.3,6.5,4.4,12.2,3.3c0.4,5.8,2.5,9.4,6.3,10.9c0.6,0.2,1.2,0.4,1.8,0.5c0.5,0.3,1.1,0.6,1.7,0.7c3.9,1.2,7.8-0.4,11.8-4.6
                c3.6,4.2,7.4,6,11.2,5.1c0.1,0,0.3-0.1,0.4-0.1c0.6-0.2,1.2-0.4,1.7-0.7c0.6-0.1,1.2-0.2,1.8-0.4c3.8-1.4,6.1-4.9,6.7-10.7
                c5.6,1.3,9.8,0.3,12.3-2.8c0.4-0.5,0.7-1,1-1.6c0.5-0.4,0.9-0.9,1.2-1.4c2.3-3.4,1.9-7.6-0.9-12.6c5.3-2.3,8-5.5,8.2-9.6
                c0-0.6,0-1.3-0.1-1.9c0.1-0.6,0.2-1.2,0.1-1.9C189.9,106.7,187.1,103.5,181.8,101.2z M151.9,134.4c-12,2.6-23.9-5.1-26.4-17.1
                c-2.6-12,5.1-23.9,17.1-26.4c12-2.6,23.9,5.1,26.4,17.1S163.9,131.8,151.9,134.4z'
          />
        </>
      );
    case 'measurementTechnique':
      return (
        <>
          <rect
            x='143.3'
            y='118.4'
            transform='matrix(0.6756 -0.7373 0.7373 0.6756 -41.229 153.1752)'
            fill={fill}
            width='20.2'
            height='10'
          />

          <rect
            x='128.4'
            y='104.8'
            transform='matrix(0.6756 -0.7373 0.7373 0.6756 -35.9918 137.755)'
            fill={fill}
            width='20.2'
            height='10'
          />

          <rect
            x='113.5'
            y='91.1'
            transform='matrix(0.6756 -0.7373 0.7373 0.6756 -30.7573 122.3284)'
            fill={fill}
            width='20.2'
            height='10'
          />

          <rect
            x='98.6'
            y='77.5'
            transform='matrix(0.6755 -0.7373 0.7373 0.6755 -25.521 106.9113)'
            fill={fill}
            width='20.2'
            height='10'
          />

          <rect
            x='83.7'
            y='63.8'
            transform='matrix(0.6755 -0.7374 0.7374 0.6755 -20.2824 91.4972)'
            fill={fill}
            width='20.2'
            height='10'
          />

          <rect
            x='68.8'
            y='50.1'
            transform='matrix(0.6755 -0.7374 0.7374 0.6755 -15.0479 76.0678)'
            fill={fill}
            width='20.2'
            height='10'
          />

          <rect
            x='53.9'
            y='36.5'
            transform='matrix(0.6755 -0.7374 0.7374 0.6755 -9.8137 60.6384)'
            fill={fill}
            width='20.2'
            height='10'
          />

          <g>
            <path
              fill={fill}
              d='M162.3,154.6c-1.9,0-3.7-0.7-5.1-2L34.1,39.8c-3.1-2.8-3.3-7.6-0.5-10.7L56.7,3.8
                c2.8-3.1,7.6-3.3,10.7-0.5l123.2,112.8c1.5,1.4,2.4,3.2,2.4,5.2c0.1,2-0.6,3.9-2,5.4l-23.1,25.3c-1.4,1.5-3.2,2.4-5.2,2.4
                C162.6,154.6,162.4,154.6,162.3,154.6z M166.3,142.8L166.3,142.8L166.3,142.8z M47.4,33.9L162,138.8l15.3-16.7L62.6,17.2
                L47.4,33.9z'
            />
          </g>

          <path
            fill={fill}
            d='M149.7,192.7H8.1c-4.1,0-7.5-3.4-7.5-7.5V56.2c0-3,1.8-5.7,4.5-6.9c2.7-1.2,5.9-0.7,8.1,1.3l141.5,128.9
              c2.3,2.1,3.1,5.4,1.9,8.3C155.5,190.8,152.8,192.7,149.7,192.7z M15.6,177.7h114.6L15.6,73.2V177.7z'
          />

          <path
            fill={fill}
            d='M69.7,159.4H35.1c-1.9,0-3.5-1.6-3.5-3.5v-31.6c0-1.4,0.8-2.6,2.1-3.2c1.3-0.6,2.7-0.3,3.8,0.6l34.6,31.6
              c1.1,1,1.4,2.5,0.9,3.9S71.2,159.4,69.7,159.4z M38.6,152.4h22.1l-22.1-20.1V152.4z'
          />

          <rect
            x='29.8'
            y='89.4'
            transform='matrix(0.6759 -0.737 0.737 0.6759 -58.1642 56.5894)'
            fill={fill}
            width='10.8'
            height='10'
          />

          <rect
            x='46.9'
            y='105.4'
            transform='matrix(0.6758 -0.7371 0.7371 0.6758 -64.3836 74.3435)'
            fill={fill}
            width='10.8'
            height='10'
          />

          <rect
            x='64'
            y='121.3'
            transform='matrix(0.6755 -0.7373 0.7373 0.6755 -70.6154 92.1442)'
            fill={fill}
            width='10.8'
            height='10'
          />

          <rect
            x='81'
            y='137.2'
            transform='matrix(0.6755 -0.7373 0.7373 0.6755 -76.8327 109.9046)'
            fill={fill}
            width='10.8'
            height='10'
          />

          <rect
            x='98.1'
            y='153.2'
            transform='matrix(0.6755 -0.7373 0.7373 0.6755 -83.0517 127.6527)'
            fill={fill}
            width='10.8'
            height='10'
          />
        </>
      );
    case 'species':
      return (
        <>
          <rect x='86.8' y='37.9' width='23' height='141.8' />
          <path stroke='#000000' strokeMiterlimit='10' d='M47.2,192.9' />
          <path d='M131.6,193.4H64.9c-6.4,0-11.5-5.1-11.5-11.5s5.1-11.5,11.5-11.5h66.6c6.4,0,11.5,5.1,11.5,11.5S137.9,193.4,131.6,193.4z' />
          <path
            d='M98.3,48C85,48,74.2,37.2,74.2,23.9S85-0.2,98.3-0.2s24.1,10.8,24.1,24.1S111.5,48,98.3,48z M98.3,11.8
          c-6.7,0-12.1,5.4-12.1,12.1c0,6.7,5.4,12.1,12.1,12.1c6.7,0,12.1-5.4,12.1-12.1C110.3,17.2,104.9,11.8,98.3,11.8z'
          />
          <polygon points='99.1,148.2 87.4,128.3 139.4,97.9 152,84.6 168.7,100.5 153.8,116.1 	' />
          <rect
            x='143.3'
            y='108.8'
            transform='matrix(0.8629 -0.5053 0.5053 0.8629 -40.2074 94.8763)'
            width='23'
            height='25.5'
          />
          <path
            d='M167.8,100.2c-13.3,0-24.1-10.8-24.1-24.1S154.5,52,167.8,52s24.1,10.8,24.1,24.1S181.1,100.2,167.8,100.2z M167.8,64
          c-6.7,0-12.1,5.4-12.1,12.1c0,6.7,5.4,12.1,12.1,12.1s12.1-5.4,12.1-12.1C179.9,69.4,174.5,64,167.8,64z'
          />
          <path
            d='M168.8,174.7c-13.3,0-24.1-10.8-24.1-24.1s10.8-24.1,24.1-24.1s24.1,10.8,24.1,24.1S182.1,174.7,168.8,174.7z M168.8,138.6
          c-6.7,0-12.1,5.4-12.1,12.1c0,6.7,5.4,12.1,12.1,12.1s12.1-5.4,12.1-12.1C180.9,144,175.5,138.6,168.8,138.6z'
          />
          <polygon points='94.6,148.2 39.8,116.1 22.3,97.7 39,81.8 54.3,97.9 106.2,128.3 	' />
          <rect
            x='25'
            y='110.7'
            transform='matrix(0.5054 -0.8629 0.8629 0.5054 -86.4162 93.6757)'
            width='27.1'
            height='23'
          />
          <path
            d='M25.9,100.2c-13.3,0-24.1-10.8-24.1-24.1S12.6,52,25.9,52s24.1,10.8,24.1,24.1S39.1,100.2,25.9,100.2z M25.9,64
          c-6.7,0-12.1,5.4-12.1,12.1c0,6.7,5.4,12.1,12.1,12.1c6.7,0,12.1-5.4,12.1-12.1C37.9,69.4,32.5,64,25.9,64z'
          />
          <path
            d='M24.9,174.7c-13.3,0-24.1-10.8-24.1-24.1s10.8-24.1,24.1-24.1s24.1,10.8,24.1,24.1S38.1,174.7,24.9,174.7z M24.9,138.6
          c-6.7,0-12.1,5.4-12.1,12.1c0,6.7,5.4,12.1,12.1,12.1c6.7,0,12.1-5.4,12.1-12.1C36.9,144,31.5,138.6,24.9,138.6z'
          />
        </>
      );
    default:
      return (
        <g>
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
