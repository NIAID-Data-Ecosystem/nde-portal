import {
  chakra,
  Box,
  Heading,
  Image,
  ImageProps,
  Text,
} from '@chakra-ui/react';
import { transformString2Hash } from './helpers';
import { HeadingWithLink } from 'src/components/heading-with-link/components/HeadingWithLink';

export default {
  code: (props: any) => (
    <Text
      as='code'
      fontSize='xs'
      bg='primary.50'
      borderRadius='base'
      border='0.1rem solid'
      borderColor='primary.100'
      color='primary.600'
      px={1.5}
      py={0.5}
      fontWeight='medium'
    >
      {props.children}
    </Text>
  ),
  hr: (props: any) => <chakra.hr my={4} borderColor='gray.100' {...props} />,
  h1: (props: any) => {
    return <Heading as='h1' size='xl' mt={8} mb={4} {...props} />;
  },
  h2: (props: any) => {
    let id = '';

    if (
      props.children &&
      Array.isArray(props.children) &&
      typeof props.children[0] === 'string'
    ) {
      id = `${transformString2Hash(props.children[0])}`;
    }

    return (
      <HeadingWithLink
        as='h2'
        id={id ? id : undefined}
        slug={id ? `#${id}` : undefined}
        fontSize='2xl'
        mt={6}
        mb={3}
        scrollMarginTop='1rem'
        {...props}
      />
    );
  },
  h3: (props: any) => {
    let id = '';

    if (
      props.children &&
      Array.isArray(props.children) &&
      typeof props.children[0] === 'string'
    ) {
      id = `${transformString2Hash(props.children[0])}`;
    }

    return (
      <HeadingWithLink
        as='h3'
        id={id ? id : undefined}
        slug={id ? `#${id}` : undefined}
        fontSize='lg'
        mt={2}
        mb={1}
        lineHeight='shorter'
        color='text.body'
        scrollMarginTop='1rem'
        {...props}
      />
    );
  },
  h4: (props: any) => (
    <Heading
      as='h4'
      fontSize='md'
      mt={2}
      mb={1}
      lineHeight='shorter'
      {...props}
    />
  ),
  h5: (props: any) => (
    <Heading as='h5' size='sm' mt={2} mb={1} lineHeight='shorter' {...props} />
  ),
  h6: (props: any) => (
    <Heading
      as='h6'
      size='xs'
      mt={1}
      mb={0.5}
      lineHeight='shorter'
      {...props}
    />
  ),
  img: (props: ImageProps) => {
    // Handle video files
    if (
      props?.src &&
      props?.src.includes('/uploads') &&
      (props.src.includes('.webm') || props.src.includes('.mp4'))
    ) {
      return (
        <video autoPlay loop muted playsInline>
          {props.src.includes('.webm') && (
            <source
              src={`${process.env.NEXT_PUBLIC_STRAPI_API_URL}${props.src}`}
              type='video/webm'
            ></source>
          )}
          {props.src.includes('.mp4') && (
            <source
              src={`${process.env.NEXT_PUBLIC_STRAPI_API_URL}${props.src}`}
              type='video/mp4'
            ></source>
          )}
        </video>
      );
    }

    // Strapi image path retrieved from the API is a full path but we only need the relative path
    const relative_url =
      props.src && !props.src.startsWith('/')
        ? `/uploads/${props.src.split('/uploads/')[1]}`
        : props.src;

    if (props.className === 'unstyled') {
      return (
        <Image
          {...props}
          alt={props.alt || 'image'}
          src={`${process.env.NEXT_PUBLIC_STRAPI_API_URL}${relative_url}`}
        />
      );
    }
    return (
      <Box
        className='img-border'
        // minH={{ base: '100px', md: '200px', lg: '300px' }}
        minW={{ base: '200px', md: '400px', lg: '600px' }}
        mx={{ base: 0, lg: 2 }}
        my={{ base: 2, md: 4 }}
        border='1px solid'
        borderColor='gray.100'
      >
        <Image
          objectFit='contain'
          w='100%'
          margin='0 auto'
          {...props}
          alt={props.alt || 'image'}
          src={`${process.env.NEXT_PUBLIC_STRAPI_API_URL}${relative_url}`}
        />
      </Box>
    );
  },
  p: (props: any) => {
    /*
      React-markdown wraps every element in a p tag, which causes issues with img tags
      The following wraps components in a span instead of a p tag.
    */
    const containsImgEl =
      Array.isArray(props.children) &&
      props.children.some(
        (child: any) => child?.props?.node?.tagName === 'img',
      );
    if (containsImgEl) {
      return (
        <Text as='span' mt={2} size='sm' lineHeight='tall' color='text.body'>
          {props.children}
        </Text>
      );
    }
    return (
      <Text mt={2} size='sm' lineHeight='tall' color='text.body' {...props} />
    );
  },
};
