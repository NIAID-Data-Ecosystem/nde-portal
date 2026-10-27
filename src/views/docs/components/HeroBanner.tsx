import { Box, Flex, Image } from '@chakra-ui/react';
import {
  HeroBannerContainer,
  HeroBannerText,
} from 'src/views/home/components/HeroBanner';

interface HeroBannerProps {
  title?: string;
  subtitle?: string;
  body?: string;
  children?: React.ReactNode;
}

export const HeroBanner = ({
  title,
  subtitle,
  body,
  children,
}: HeroBannerProps) => {
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
          width='100%'
          height={{ base: '100%', lg: 'unset', xl: '100%' }}
          maxWidth={{ base: '100%', '2xl': 'unset' }}
          bottom={{ base: '-50%', lg: 'unset' }}
          opacity={{ base: 0.2, lg: 0.35 }}
        />
      </Box>

      <Flex
        id='hero-gradient'
        zIndex={3}
        // Plain CSS: v3's `bgGradient` only takes a direction (`to-r`) plus
        // `gradientFrom`/`gradientTo`, so v2's `linear(...)` string was
        // emitted verbatim and discarded by the browser.
        bgImage={{
          base: 'linear-gradient(to right, #ddf4fde6 0%, #ddf4fde6 75%, #ffc0cb00 100%)',
          md: 'linear-gradient(to right, #ffc0cb00 0%, #ddf4fde6 20%, #ddf4fde6 75%, #ffc0cb00 100%)',
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
          gap={2}
          px={{ base: 4 }}
          py={{ base: 3 }}
          mt={0}
          mb={0}
        />
      </Flex>

      {children}
    </HeroBannerContainer>
  );
};
