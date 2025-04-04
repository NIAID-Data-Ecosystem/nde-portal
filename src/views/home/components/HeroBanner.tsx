import {
  Box,
  Flex,
  FlexProps,
  Heading,
  Image,
  StackProps,
  Text,
  VStack,
} from '@chakra-ui/react';

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
    <HeroBannerContainer>
      {/* Nodes background image */}
      <Box
        width='100%'
        height='100%'
        overflow='hidden'
        position='absolute'
        left={0}
      >
        <Image
          alt='A complex network of interconnected lines and nodes, resembling a molecular or neural network structure. The image features various shades of blue and white, with nodes of different sizes connected by thin lines, creating a web-like pattern.'
          src='/assets/homepage/ecosystem-hero-nodes.png'
          position='absolute'
          objectFit='cover'
          width={{ base: '100%', lg: 'unset' }}
          maxWidth={{ base: '100%', '2xl': '1600px' }}
          height={{ base: '100%', lg: 'unset' }}
          left={{ base: 'unset', lg: '50%', '2xl': '40%' }}
          right={{ base: 'unset', '2xl': '0px' }}
          bottom={{ base: '-50%', lg: 'unset' }}
          opacity={{ base: 0.2, lg: 0.35 }}
        />
      </Box>
      <VStack
        px={{ base: 4 }}
        py={{ base: 4, sm: 10 }}
        spacing={4}
        alignItems='flex-start'
        flex={1}
        maxW={{ base: 'unset', lg: '75%', '2xl': '1300px' }}
        position='relative'
      >
        {/* Hexagons image */}
        <Image
          alt='An abstract graphic featuring three hexagons. The top-right hexagon shows a person typing on a keyboard with a microscope in the background, symbolizing a blend of technology and science.'
          src='/assets/homepage/ecosystem-hero-hexagons-02.png'
          position='absolute'
          top={{ base: 4, sm: 2, md: 16 }}
          right={{ base: 4, sm: 0, md: 6, lg: 0 }}
          height={{ base: 0, sm: '200px', md: '70%', lg: '85%', xl: '100%' }}
          transform={{
            base: 'unset',
            md: 'translate(0%, -15%)',
            lg: 'translate(50%, -10%)',
            xl: 'translate(200px, -10%)',
            '2xl': 'translate(0px, -5%)',
          }}
          zIndex={0}
        />

        {/* Headings */}
        <HeroBannerText title={title} subtitle={subtitle} body={body} />

        {children}
      </VStack>
    </HeroBannerContainer>
  );
};

interface HeroBannerContainerProps extends FlexProps {}
export const HeroBannerContainer = ({
  children,
  ...rest
}: HeroBannerContainerProps) => {
  return (
    <Flex
      id='hero-banner'
      position='relative'
      bgGradient='linear(to-r,#ddf4fd 50%, #c1e0eb)' // small gradient to lighten up scene
      minHeight={{
        base: '320px',
        sm: '360px',
        md: '350px',
      }}
      width='100%'
      justifyContent={{ base: 'flex-start', '2xl': 'center' }}
      px={{ base: 2, sm: 6, lg: 10, xl: '5vw' }}
      zIndex='dropdown'
      {...rest}
    >
      {children}
    </Flex>
  );
};

interface HeroBannerTextProps extends StackProps {
  title?: HeroBannerProps['title'];
  subtitle?: HeroBannerProps['subtitle'];
  body?: HeroBannerProps['body'];
}

export const HeroBannerText = ({
  title,
  subtitle,
  body,
  children,
  ...rest
}: HeroBannerTextProps) => {
  return (
    <VStack
      maxWidth='350px'
      spacing={4}
      alignItems='flex-start'
      zIndex={2}
      mt={10}
      mb={4}
      color='text.heading'
      {...rest}
    >
      {title && (
        <Heading
          className='hero-title'
          as='h1'
          fontSize='4xl'
          fontWeight='bold'
          color='inherit'
        >
          {title}
        </Heading>
      )}
      {subtitle && (
        <Heading
          as='h2'
          className='hero-subtitle'
          fontSize='md'
          fontWeight='semibold'
          color='inherit'
        >
          {subtitle}
        </Heading>
      )}
      {body && (
        <Text
          className='hero-body'
          lineHeight='tall'
          fontSize='lg'
          fontWeight='medium'
          color='inherit'
        >
          {body}
        </Text>
      )}

      {children}
    </VStack>
  );
};
