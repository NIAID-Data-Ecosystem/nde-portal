import { Box, Flex, Image } from '@chakra-ui/react';
import {
  HeroBannerContainer,
  HeroBannerText,
} from 'src/views/home/components/hero-banner';

interface HeroBannerProps {
  title?: string;
  subtitle?: string;
  body?: string;
  children?: React.ReactNode;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  title,
  subtitle,
  body,
  children,
}) => {
  return (
    <HeroBannerContainer
      justifyContent={{ base: 'flex-start', md: 'center' }}
      minHeight='unset'
    >
      <Box width='100%' height='100%' overflow='hidden' position='absolute'>
        <Image
          alt='A complex network of interconnected lines and nodes, resembling a molecular or neural network structure. The image features various shades of blue and white, with nodes of different sizes connected by thin lines, creating a web-like pattern.'
          src='/assets/homepage/ecosystem-hero-nodes.png'
          position='absolute'
          objectFit='cover'
          width={{ base: '100%', lg: '100%', xl: '100%' }}
          height={{ base: '100%', lg: 'unset', xl: '100%' }}
          maxWidth={{ base: '100%', '2xl': 'unset' }}
          bottom={{ base: '-50%', lg: 'unset' }}
          opacity={{ base: 0.2, lg: 0.35 }}
        />
      </Box>

      <Flex
        id='hero-gradient'
        zIndex={3}
        bgGradient={{
          base: 'linear(to-r, #ddf4fde6 0%, #ddf4fde6 75%, #ffc0cb00 100%)',
          md: 'linear(to-r, #ffc0cb00 0%, #ddf4fde6 20%, #ddf4fde6 75%, #ffc0cb00 100%)',
        }}
        borderRadius='semi'
        w='100%'
        alignItems='center'
        justifyContent={{ base: 'flex-start', lg: 'center' }}
      >
        <HeroBannerText
          title={title}
          subtitle={subtitle}
          body={body}
          maxWidth={{ md: '500px', xl: '680px' }}
          textAlign={{ base: 'left', lg: 'center' }}
          alignItems={{ base: 'flex-start', lg: 'center' }}
          justifyContent={{ base: 'flex-start', lg: 'center' }}
          spacing={4}
          px={{ base: 4 }}
          py={{ base: 4, sm: 10 }}
        />
      </Flex>

      {children}
    </HeroBannerContainer>
  );
};
