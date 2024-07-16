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
  blockquote: (props: any) => {
    const getThemeByTitle = (node: any) => {
      const text = node?.children[0]?.value;
      if (!text) {
        return {
          bg: 'status.info_lt',
          color: 'status.info',
        };
      }

      // Find emojis in text.
      const emojis = text.match(/\p{Emoji_Presentation}/gu);
      if (!emojis) {
        return {
          bg: 'status.info_lt',
          color: 'status.info',
        };
      } else if (emojis[0] === '🚧') {
        return {
          bg: 'status.warning_lt',
          color: 'status.warning',
        };
      } else if (emojis[0] === '🚨') {
        return {
          bg: 'status.error_lt',
          color: 'status.error',
        };
      } else {
        return {
          bg: 'status.info_lt',
          color: 'status.info',
        };
      }
    };

    const titleEl = props?.node?.children.find(
      (child: any) => child.type === 'element',
    );
    const theme = getThemeByTitle(titleEl);
    const childrenEl = props.children.filter(
      (el: any) => typeof el === 'object',
    );
    return (
      <Box
        borderLeft='0.2em solid'
        borderLeftColor={theme.color}
        px={6}
        py={2}
        m={{ base: 0, md: 2 }}
        bg={theme.bg}
        sx={{
          p: {
            my: 4,
          },
          'p:first-of-type':
            childrenEl.length > 1
              ? {
                  color: theme.color,
                  fontWeight: 'bold',
                  fontSize: 'lg',
                }
              : {},
        }}
        {...props}
      />
    );
  },
  img: (props: ImageProps) => {
    if (props.className === 'unstyled') {
      return (
        <Image
          {...props}
          alt={props.alt || 'image'}
          src={`${process.env.NEXT_PUBLIC_STRAPI_API_URL}${props.src}`}
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
          src={`${process.env.NEXT_PUBLIC_STRAPI_API_URL}${props.src}`}
        />
      </Box>
    );
  },
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
        <Text as='p' mt={2} size='sm' lineHeight='tall' color='text.body'>
          {props.children}
        </Text>
      );
    }
    return (
      <Text mt={2} size='sm' lineHeight='tall' color='text.body' {...props} />
    );
  },
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
};
