import type { MDXComponents } from 'mdx/types';
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
} from '@chakra-ui/react';
import { Link } from 'src/components/link';
import { useState } from 'react';
import { FaAngleDown } from 'react-icons/fa6';

// This file allows you to provide custom React components
// to be used in MDX files. You can import and use any
// React component you want, including components from
// other libraries.

// This file is required to use MDX in `app` directory.
export function useMDXComponents(overrides?: MDXComponents): MDXComponents {
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

  return {
    a: (props: any) => {
      let { href } = props;

      // Check if the link is a relative link or starts with portal domain
      const isPortalLink =
        href.startsWith('/') ||
        href.startsWith(process.env.NEXT_PUBLIC_BASE_URL);

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
    details: props => {
      return <Details {...props} />;
    },
    Flex: (props: any) => <Flex {...props} />,
    h1: (props: any) => (
      <Heading
        as='h1'
        size='h1'
        mt={8}
        fontSize={['4xl', '5xl']}
        fontWeight='bold'
        {...props}
      />
    ),
    h2: (props: any) => (
      <Heading as='h2' size='h2' mt={8} fontSize='2xl' {...props} />
    ),
    h3: (props: any) => (
      <Heading as='h3' fontSize='lg' mt={6} mb={2} {...props} />
    ),
    h4: (props: any) => (
      <Heading as='h4' fontSize='md' fontWeight='semibold' mt={2} {...props} />
    ),
    hr: (props: any) => <chakra.hr {...props} />,
    // Allows customizing built-in components, e.g. to add styling.
    Image: (props: ImageProps) => (
      <Image
        alt='image'
        width={700}
        height={400}
        objectFit='contain'
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
      return (
        <Image
          {...props}
          alt={props.alt || 'image'}
          src={`${process.env.NEXT_PUBLIC_STRAPI_API_URL}${props.src}`}
        />
      );
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
    p: (props: any) => <Text mt={2} fontSize='md' {...props} />,
    section: (props: any) => {
      const classNames = props.className.split(' ');
      if (classNames?.includes('rightImage')) {
        return (
          <Flex
            display='flex'
            flexDirection={{ base: 'column', xl: 'row' }}
            __css={{
              span: { mt: 0 },
              '.img-border': {
                minW: 'unset',
                minWidth: { base: '200px', xl: '300px' },
                maxWidth: '400px',
                flex: 1,
                m: 4,
                ml: [0, 0, 6],
                mt: [4, 4, 0],
              },
            }}
            {...props}
          ></Flex>
        );
      } else if (classNames?.includes('leftImage')) {
        return (
          <Flex
            display='flex'
            flexDirection={{ base: 'column', xl: 'row-reverse' }}
            __css={{
              span: { mt: 0 },
              '.img-border': {
                minW: 'unset',
                minWidth: { base: '200px', xl: '300px' },
                maxWidth: '400px',
                flex: 1,
                mb: 4,
                mr: [0, 0, 6],
                mt: [4, 4, 0],
              },
            }}
            {...props}
          ></Flex>
        );
      }
      return <Box {...props} />;
    },
    strong: (props: any) => (
      <Box as='strong' fontWeight='semibold' {...props} />
    ),
    ul: (props: any) => (
      <UnorderedList my={4} ml={12}>
        {props.children}
      </UnorderedList>
    ),
    ...(overrides || {}),
  };
}
