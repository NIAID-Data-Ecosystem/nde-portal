import React, { useState } from 'react';
import { FaAngleDown } from 'react-icons/fa6';
import {
  Box,
  chakra,
  Collapse,
  Flex,
  Heading,
  Image,
  Text,
  UnorderedList,
  OrderedList,
  ListItem,
  ImageProps,
  Icon,
  HStack,
} from '@chakra-ui/react';
import { Link } from 'src/components/link';
import { HeadingWithLink } from 'src/components/heading-with-link/components/HeadingWithLink';

const Details = (props: any) => {
  const { children } = props;
  const summaryIndex = children.findIndex(
    (node: any) => node.type === 'summary',
  );
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Box border='1px solid' borderColor='gray.100' my={0.5}>
      <Flex
        as='button'
        w='100%'
        borderLeft='4px solid'
        p={4}
        alignItems='center'
        cursor='pointer'
        bg={isOpen ? 'secondary.50' : 'white'}
        borderLeftColor={isOpen ? 'secondary.600' : 'secondary.500'}
        boxShadow={isOpen ? 'sm' : 'none'}
        _hover={{
          boxShadow: 'sm',
          bg: 'secondary.50',
        }}
        onClick={() => setIsOpen(!isOpen)}
        {...props}
      >
        <Heading as='h2' fontSize='xl' flex={1} textAlign='left'>
          {children[summaryIndex]}
        </Heading>
        <Icon
          as={FaAngleDown}
          boxSize={4}
          color={isOpen ? 'secondary.600' : 'secondary.500'}
          transition='transform 250ms ease'
          transform={!isOpen ? `rotate(-90deg)` : `rotate(0deg)`}
          {...props}
        />
      </Flex>

      <Collapse in={isOpen} animateOpacity>
        <Box
          px={6}
          py={4}
          pb={6}
          bg='whiteAlpha.800'
          sx={{
            h3: {
              fontSize: 'lg',
              mt: 6,
              mb: 4,
            },
          }}
        >
          {/* display content after summary */}
          {children.slice(summaryIndex + 1)}
        </Box>
      </Collapse>
    </Box>
  );
};

export const MDXComponents = {
  a: (props: any) => {
    let { href } = props;

    // Check if the link is a relative link or starts with portal domain
    const isPortalLink =
      href.startsWith('/') || href.startsWith(process.env.NEXT_PUBLIC_BASE_URL);

    const isExternal = props?.target === '_blank' || !isPortalLink;

    return (
      <Link
        href={href}
        isExternal={isExternal}
        sx={{
          // Workaround for Emotion warning with ":first-child" pseudo class is potentially unsafe when doing server-side rendering.
          '*:not(:not(:last-child) ~ *)': {
            borderBottom: '0.0625rem solid',
            _hover: { borderBottomColor: 'transparent' },
          },
        }}
        {...props}
      >
        {props.children}
      </Link>
    );
  },
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
  br: (props: any) => (
    <Box className='break' as='span' margin='10px 0 10px 0'>
      {props.children}
    </Box>
  ),
  code: (props: any) => (
    <Text
      as='code'
      bg='primary.50'
      border='0.1rem solid'
      borderColor='primary.100'
      borderRadius='base'
      color='primary.600'
      fontSize='xs'
      fontWeight='medium'
      px={1.5}
      py={0.5}
    >
      {props.children}
    </Text>
  ),
  details: (props: any) => {
    return <Details {...props} />;
  },
  Flex: (props: any) => <Flex {...props} />,
  h1: (props: any) => <Heading as='h1' size='xl' mt={8} {...props} />,
  h2: (props: any) => {
    return (
      <HeadingWithLink
        id={props.slug}
        slug={props.slug}
        as='h2'
        fontSize='2xl'
        mt={6}
        mb={3}
        {...props}
      />
    );
  },
  h3: (props: any) => (
    <HeadingWithLink
      id={props.slug}
      slug={props.slug}
      as='h3'
      fontSize='lg'
      mt={2}
      mb={1}
      color='text.body'
      {...props}
    />
  ),
  h4: (props: any) => <Heading as='h4' fontSize='md' mt={2} {...props} />,
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
  hr: (props: any) => <chakra.hr my={4} borderColor='gray.100' {...props} />,

  img: (props: ImageProps) => {
    if (!props.src) {
      return null;
    }

    // If the src starts with a slash, prepend the Strapi API URL
    const src = props.src.startsWith('/')
      ? `${process.env.NEXT_PUBLIC_STRAPI_API_URL}${props.src}`
      : props.src;

    // If the src is a video file, render a video element
    // Note: The video will autoplay, loop, and be muted by default.
    if (
      props?.src &&
      props?.src.includes('/uploads') &&
      (props.src.includes('.webm') || props.src.includes('.mp4'))
    ) {
      return (
        <video autoPlay loop muted playsInline>
          {props.src.includes('.webm') && (
            <source src={src} type='video/webm'></source>
          )}
          {props.src.includes('.mp4') && (
            <source src={src} type='video/mp4'></source>
          )}
        </video>
      );
    }
    // If the src is an image file, render an Image component
    return <Image {...props} alt={props.alt || 'image'} src={src} />;
  },

  li: (props: any) => {
    return (
      <ListItem listStyleType='inherit' pb='4px' fontSize='md'>
        {props.children}
      </ListItem>
    );
  },
  Link: (props: any) => {
    return <Link {...props} />;
  },
  ol: (props: any) => (
    <OrderedList ml={12} my={2} {...props}>
      {props.children}
    </OrderedList>
  ),
  p: (props: any) => <Text mt={2} fontSize='md' lineHeight='tall' {...props} />,
  section: (props: any) => {
    const classNames = props.className.split(' ');
    if (
      classNames?.includes('rightImage') ||
      classNames?.includes('right-image')
    ) {
      return (
        <HStack
          alignItems='flex-start'
          flexDirection={{ base: 'column', xl: 'row' }}
          sx={{
            img: { maxWidth: { base: '100%', md: '400px' } },
          }}
          spacing={6}
          {...props}
        >
          {props.children.map((child: any, idx: number) => (
            <React.Fragment key={idx}>{child}</React.Fragment>
          ))}
        </HStack>
      );
    } else if (
      classNames?.includes('leftImage') ||
      classNames?.includes('left-image')
    ) {
      return (
        <HStack
          alignItems='flex-start'
          flexDirection={{ base: 'column', xl: 'row-reverse' }}
          sx={{
            img: { maxWidth: { base: '100%', md: '400px' } },
          }}
          spacing={6}
          {...props}
        >
          {props.children.map((child: any, idx: number) => (
            <React.Fragment key={idx}>{child}</React.Fragment>
          ))}
        </HStack>
      );
    }
    return <Box {...props} />;
  },
  strong: (props: any) => <Box as='strong' fontWeight='semibold' {...props} />,
  ul: (props: any) => (
    <UnorderedList my={4} ml={12}>
      {props.children}
    </UnorderedList>
  ),
};
