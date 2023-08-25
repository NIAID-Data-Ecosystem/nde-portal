import {
  chakra,
  Box,
  Heading,
  Image,
  ImageProps,
  Text,
  HeadingProps,
} from 'nde-design-system';
import { transformString2Hash } from './helpers';

const HashedHeading = (props: HeadingProps) => {
  let hash = '';

  if (
    props.children &&
    Array.isArray(props.children) &&
    typeof props.children[0] === 'string'
  ) {
    hash = transformString2Hash(props.children[0]);
  }

  if (hash) {
    return (
      <a href={`#${hash}`}>
        <Heading
          id={hash}
          sx={{
            span: {
              opacity: 0,
              color: 'status.info',
              fontWeight: 'extrabold',
              mx: 2,
              cursor: 'pointer',
              transition: 'opacity 0.1s ease-in-out',
            },
            _hover: {
              span: {
                opacity: 1,
                textDecoration: 'underline',
                transition: 'opacity 0.1s ease-in-out',
              },
            },
          }}
          {...props}
        >
          {props.children}
          <Text as='span' fontWeight='bold'>
            #
          </Text>
        </Heading>
      </a>
    );
  }
  return <Heading id={hash} as='h2' fontSize='2xl' mt={6} mb={3} {...props} />;
};

export default {
  blockquote: (props: any) => {
    const getThemeByTitle = (node: any) => {
      const text = node.children[0].value;
      if (!text) {
        return {
          bg: 'status.info_lt',
          color: 'status.info',
        };
      }

      // Find emojis in text.
      const emojis = text.match(/\p{Emoji_Presentation}/gu);

      if (emojis[0] === '🚧') {
        return {
          bg: 'status.warning_lt',
          color: 'status.warning',
        };
      }
      if (emojis[0] === '🚨') {
        return {
          bg: 'status.error_lt',
          color: 'status.error',
        };
      }

      return {
        bg: 'status.info_lt',
        color: 'status.info',
      };
    };

    const titleEl = props.node.children.find(
      (child: any) => child.type === 'element',
    );
    const theme = getThemeByTitle(titleEl);

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
          'p:first-of-type': {
            color: theme.color,
            fontWeight: 'bold',
            fontSize: 'lg',
          },
        }}
        {...props}
      />
    );
  },
  img: (props: ImageProps) => {
    return (
      <Box
        // minH={{ base: '100px', md: '200px', lg: '300px' }}
        minW={{ base: '200px', md: '400px', lg: '600px' }}
        mx={{ base: 0, lg: 2 }}
        my={{ base: 2, md: 4 }}
        border='1px solid'
        borderColor='gray.100'
      >
        <Image
          alt='image'
          objectFit='contain'
          {...props}
          w='100%'
          margin='0 auto'
          src={`${process.env.NEXT_PUBLIC_STRAPI_ASSETS_URL}${props.src}`}
        />
      </Box>
    );
  },
  hr: (props: any) => <chakra.hr my={4} borderColor='gray.100' {...props} />,
  h1: (props: any) => {
    return <Heading as='h1' size='xl' mt={8} mb={4} {...props} />;
  },
  h2: (props: any) => {
    return <HashedHeading as='h2' fontSize='2xl' mt={6} mb={3} {...props} />;
  },
  h3: (props: any) => {
    return (
      <HashedHeading
        as='h3'
        fontSize='lg'
        mt={2}
        mb={1}
        lineHeight='shorter'
        color='text.body'
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
    const containsImgEl = props.children.some(
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
  code: (props: any) => (
    <Text
      as='code'
      fontSize='xs'
      bg='primary.50'
      borderRadius='base'
      border='0.1rem solid'
      borderColor='primary.100'
      color='primary.500'
      px={1.5}
      py={0.5}
      fontWeight='medium'
    >
      {props.children}
    </Text>
  ),
};
