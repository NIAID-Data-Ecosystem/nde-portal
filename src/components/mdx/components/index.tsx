import React, { useState } from 'react';
import { FaAngleDown } from 'react-icons/fa6';
import {
  Box,
  chakra,
  Collapsible,
  Flex,
  Heading,
  Image,
  Text,
  ImageProps,
  Icon,
  HStack,
  List,
} from '@chakra-ui/react';
import { Link } from 'src/components/link';
import { HeadingWithLink } from 'src/components/heading-with-link/components/HeadingWithLink';
import { transformString2Hash } from 'src/views/docs/components/helpers';
import { normalizeResponsiveProps } from '../helpers';

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

      <Collapsible.Root open={isOpen}>
        <Box
          px={6}
          py={4}
          pb={6}
          bg='whiteAlpha.800'
          css={{
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
      </Collapsible.Root>
    </Box>
  );
};

export const MDXComponents = {
  a: (props: any) => {
    let { href, ...rest } = props;
    // If the href is a video file, render a video element using theimg component
    if (
      props?.href &&
      props?.href.includes('/uploads') &&
      (props.href.includes('.webm') || props.src.includes('.mp4'))
    ) {
      return MDXComponents.img({ ...props, src: href } as ImageProps); // Use img component to handle video files
    }

    // Check if the link is a relative link or starts with portal domain
    const isPortalLink =
      href.startsWith('/') || href.startsWith(process.env.NEXT_PUBLIC_BASE_URL);

    const isExternal = props?.target === '_blank' || !isPortalLink;
    const parsedProps = normalizeResponsiveProps(rest);

    return (
      <Link
        href={href}
        isExternal={isExternal}
        {...parsedProps}
        css={{
          // Workaround for Emotion warning with ":first-child" pseudo class is potentially unsafe when doing server-side rendering.
          '*:not(:not(:last-child) ~ *)': {
            borderBottom: '0.0625rem solid',
            _hover: { borderBottomColor: 'transparent' },
          },
        }}
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
          bg: 'info.light',
          color: 'info.default',
        };
      }

      // Find emojis in text.
      const emojis = text.match(/\p{Emoji_Presentation}/gu);
      if (!emojis) {
        return {
          bg: 'info.light',
          color: 'info.default',
        };
      } else if (emojis[0] === '🚧') {
        return {
          bg: 'warning.light',
          color: 'warning.default',
        };
      } else if (emojis[0] === '🚨') {
        return {
          bg: 'error.light',
          color: 'error.default',
        };
      } else {
        return {
          bg: 'info.light',
          color: 'info.default',
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
        css={{
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
    <Box className='break' as='span' margin='10px 0 10px 0' {...props}>
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
  div: (props: any) => {
    const classNames = props?.className?.split(' ');
    if (
      classNames?.includes('rightImage') ||
      classNames?.includes('right-image')
    ) {
      return (
        <HStack
          alignItems='flex-start'
          flexDirection={{ base: 'column', xl: 'row' }}
          css={{
            img: { maxWidth: { base: '100%', md: '400px' } },
          }}
          gap={6}
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
          css={{
            img: { maxWidth: { base: '100%', md: '400px' } },
          }}
          gap={6}
          {...props}
        >
          {props.children.map((child: any, idx: number) => (
            <React.Fragment key={idx}>{child}</React.Fragment>
          ))}
        </HStack>
      );
    }
    const parsedProps = normalizeResponsiveProps(props);

    return <Box {...parsedProps} />;
  },
  figcaption: (props: any) => {
    return (
      <Text
        as='figcaption'
        fontSize='xs'
        opacity={0.8}
        lineHeight='short'
        fontStyle='italic'
        mt={1}
        {...props}
      />
    );
  },
  h1: (props: any) => <Heading as='h1' size='xl' mt={8} {...props} />,
  h2: (props: any) => {
    let slug =
      props.children &&
      Array.isArray(props.children) &&
      typeof props.children[0] === 'string'
        ? transformString2Hash(props.children[0])
        : '';
    return (
      <HeadingWithLink
        id={slug}
        slug={slug}
        as='h2'
        fontSize='2xl'
        mt={6}
        mb={3}
        {...props}
      />
    );
  },
  h3: (props: any) => {
    let slug =
      props.children &&
      Array.isArray(props.children) &&
      typeof props.children[0] === 'string'
        ? transformString2Hash(props.children[0])
        : '';
    return (
      <HeadingWithLink
        id={slug}
        slug={slug}
        as='h3'
        fontSize='lg'
        mt={2}
        mb={1}
        color='text.body'
        {...props}
      />
    );
  },
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
  img: (props: any) => {
    if (!props.src) {
      return null;
    }

    // If the src starts with a slash, prepend the Strapi API URL
    const src = props.src.startsWith('/')
      ? `${process.env.NEXT_PUBLIC_STRAPI_API_URL}${props.src}`
      : props.src;

    const borderStyles = {
      border: '1px solid',
      borderColor: 'gray.100',
      my: 2,
    };

    const AssetComponent = (props: any) => {
      // If the src is a video file, render a video element
      // Note: The video will be paused and muted by default.
      if (
        props?.src &&
        props?.src.includes('/uploads') &&
        (props.src.includes('.webm') || props.src.includes('.mp4'))
      ) {
        return (
          <Box
            as='video'
            loop
            muted
            playsInline
            controls
            {...(props?.className?.includes('border') ? borderStyles : {})}
            {...props}
          >
            {props.src.includes('.webm') && (
              <source src={src} type='video/webm'></source>
            )}
            {props.src.includes('.mp4') && (
              <source src={src} type='video/mp4'></source>
            )}
          </Box>
        );
      } else if (props?.className?.includes('border')) {
        // If the src is an image file and has a className that includes 'border',
        // render an Image component with border styles
        return (
          <Image alt={props.alt || 'image'} {...borderStyles} {...props} />
        );
      } else {
        return <Image alt={props.alt || 'image'} {...props} />;
      }
    };

    // If the src is an image file, render an Image component
    return <AssetComponent {...props} alt={props.alt || 'image'} src={src} />;
  },
  li: (props: any) => {
    const { ordered, ...rest } = props;
    return (
      <List.Item
        listStyleType='inherit'
        lineHeight='tall'
        pb={4}
        fontSize='md'
        {...rest}
      >
        {props.children}
      </List.Item>
    );
  },
  ol: (props: any) => {
    const { ordered, ...rest } = props;
    if (!ordered) {
      return (MDXComponents.ul as any)(rest);
    }
    return (
      <List.Root as='ol' ml={12} my={2} {...rest}>
        {props.children}
      </List.Root>
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
        <Text
          as='span'
          mt={2}
          fontSize='sm'
          lineHeight='tall'
          color='text.body'
        >
          {props.children}
        </Text>
      );
    }
    return <Text mt={2} fontSize='md' lineHeight='tall' {...props} />;
  },
  section: (props: any) => {
    const classNames = props?.className?.split(' ');
    if (
      classNames?.includes('rightImage') ||
      classNames?.includes('right-image')
    ) {
      return (
        <HStack
          alignItems='flex-start'
          flexDirection={{ base: 'column', xl: 'row' }}
          css={{
            img: { maxWidth: { base: '100%', md: '400px' } },
          }}
          gap={6}
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
          css={{
            img: { maxWidth: { base: '100%', md: '400px' } },
          }}
          gap={6}
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
  ul: (props: any) => {
    const { ordered, ...rest } = props;
    if (ordered) {
      return (MDXComponents.ol as any)(rest);
    }
    return (
      <List.Root my={4} ml={12} {...rest}>
        {props.children}
      </List.Root>
    );
  },
};
