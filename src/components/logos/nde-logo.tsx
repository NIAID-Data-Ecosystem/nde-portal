import { Image, ImageProps, useBreakpointValue } from '@chakra-ui/react';

export const NDELogo = (props: ImageProps) => {
  // Define the image sources for different breakpoints
  const imageSrc = {
    base: '/assets/logos/niaid-nde-mobile-vertical.svg',
    sm: '/assets/logos/niaid-nde-mobile-preferred.svg',
    md: '/assets/logos/niaid-nde-mobile-vertical.svg',
    lg: '/assets/logos/niaid-nde-desktop.svg',
  };

  const src = useBreakpointValue(imageSrc, { fallback: 'lg' });

  return (
    <Image
      id='navigation-logo'
      height='100%'
      objectFit='contain'
      src={src}
      alt='NIAID Data Ecosystem Logo'
      {...props}
    />
  );
};
