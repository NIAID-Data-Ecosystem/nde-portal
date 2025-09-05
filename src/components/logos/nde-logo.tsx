import { Image, ImageProps } from '@chakra-ui/react';
import NextImage from 'next/image';

export const NDELogo = (props: ImageProps) => {
  return (
    <>
      <Image
        asChild
        id='nde-desktop'
        display={{ base: 'none', lg: 'block' }}
        alt='NDE Desktop Logo'
        {...props}
      >
        <NextImage
          width={595}
          height={40}
          src='/assets/logos/niaid-nde-desktop.svg'
          alt='NDE Desktop Logo'
        />
      </Image>

      <Image
        asChild
        id='nde-mobile-preferred'
        display={{ base: 'none', sm: 'block', lg: 'none' }}
        alt='NDE Mobile Logo'
        {...props}
      >
        <NextImage
          width={328}
          height={28}
          src='/assets/logos/niaid-nde-mobile-preferred.svg'
          alt='NDE Mobile Logo'
        />
      </Image>

      <Image
        asChild
        id='nde-mobile-vertical'
        display={{ base: 'block', sm: 'none' }}
        alt='NDE Mobile Vertical Logo'
        {...props}
      >
        <NextImage
          width={138}
          height={55}
          src='/assets/logos/niaid-nde-mobile-vertical.svg'
          alt='NDE Mobile Vertical Logo'
        />
      </Image>
    </>
  );
};
