import { Img, ImgProps } from '@chakra-ui/react';

export const NDELogo = (props: ImgProps) => {
  return (
    <>
      <Img
        id='nde-desktop'
        display={{ base: 'none', lg: 'block' }}
        width='595px'
        height='40px'
        src='/assets/logos/niaid-nde-desktop.svg'
        alt='NDE Desktop Logo'
        {...props}
      />
      <Img
        id='nde-mobile-preferred'
        display={{ base: 'none', sm: 'block', lg: 'none' }}
        width='328px'
        height='28px'
        src='/assets/logos/niaid-nde-mobile-preferred.svg'
        alt='NDE Mobile Logo'
        {...props}
      />
      <Img
        id='nde-mobile-vertical'
        display={{ base: 'block', sm: 'none' }}
        width='138px'
        height='55px'
        src='/assets/logos/niaid-nde-mobile-vertical.svg'
        alt='NDE Mobile Vertical Logo'
        {...props}
      />
    </>
  );
};
