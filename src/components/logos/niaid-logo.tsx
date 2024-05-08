import { Img, ImgProps } from '@chakra-ui/react';

export const NIAIDLogo = (props: ImgProps) => {
  return (
    <>
      <Img
        id='niaid-desktop'
        display={{ base: 'none', lg: 'block' }}
        width='177.5px'
        height='40px'
        src='/assets/logos/niaid-desktop.svg'
        alt='NIAID Desktop Logo'
        {...props}
      />
      <Img
        id='niaid-mobile-preferred'
        display={{ base: 'none', sm: 'block', lg: 'none' }}
        width='35.5px'
        height='28px'
        src='/assets/logos/niaid-mobile-preferred.svg'
        alt='NIAID Mobile Logo'
        {...props}
      />
      <Img
        id='niaid-mobile-vertical'
        display={{ base: 'block', sm: 'none' }}
        width='83px'
        height='36px'
        src='/assets/logos/niaid-mobile-vertical.svg'
        alt='NIAID Mobile Vertical Logo'
        {...props}
      />
    </>
  );
};
