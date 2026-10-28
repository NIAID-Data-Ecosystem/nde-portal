import {
  Box,
  chakra,
  Collapsible,
  Heading,
  HStack,
  Icon,
  List,
  Text,
} from '@chakra-ui/react';
import NextLink from 'next/link';
import React from 'react';
import { FaAngleDown } from 'react-icons/fa6';
import { HeadingWithLink } from 'src/components/heading-with-link/components/HeadingWithLink';
import { Link } from 'src/components/link';
import { transformString2Hash } from 'src/views/docs/utils/markdown';

import { normalizeResponsiveProps } from '../helpers';
import { MDXMedia } from './media';

const Details = ({ children, node, open, ...props }: any) => {
  const summaryIndex = children.findIndex(
    (child: any) => child.type === 'summary',
  );

  // Render the summary's inner content rather than the <summary> element
  // itself: a host <summary> is focusable, and nesting it inside the toggle
  // <button> below produces a nested-interactive (serious) a11y violation.
  const summaryNode = children[summaryIndex];
  const summaryContent =
    summaryNode && typeof summaryNode === 'object' && summaryNode.props
      ? summaryNode.props.children
      : summaryNode;

  // Open/closed styling keys off the `data-state` the collapsible machine sets
  // on its trigger and indicator, so there is no mirrored `isOpen` state.
  // `<details open>` maps to `defaultOpen`; left in `props`, the attribute
  // would land on the trigger and match `_open` while the content is closed.
  //
  // The heading wraps the button, not the reverse (the WAI-ARIA accordion
  // pattern): a button only allows phrasing content, and its children are
  // presentational, so an `h2` inside it can drop out of the heading outline.
  return (
    <Collapsible.Root
      defaultOpen={!!open}
      border='1px solid'
      borderColor='gray.100'
      my={0.5}
    >
      <Heading as='h2' fontSize='xl'>
        <Collapsible.Trigger
          display='flex'
          w='100%'
          borderLeft='4px solid'
          borderLeftColor='secondary.500'
          p={4}
          alignItems='center'
          cursor='pointer'
          bg='white'
          _hover={{ boxShadow: 'sm', bg: 'secondary.50' }}
          _open={{
            bg: 'secondary.50',
            borderLeftColor: 'secondary.600',
            boxShadow: 'sm',
          }}
          {...props}
        >
          <chakra.span flex={1} textAlign='left'>
            {summaryContent}
          </chakra.span>
          <Collapsible.Indicator
            color='secondary.500'
            transition='transform 250ms ease'
            transform='rotate(-90deg)'
            _open={{ color: 'secondary.600', transform: 'rotate(0deg)' }}
            asChild
          >
            <Icon boxSize={4}>
              <FaAngleDown />
            </Icon>
          </Collapsible.Indicator>
        </Collapsible.Trigger>
      </Heading>
      <Collapsible.Content>
        <Box
          px={6}
          py={4}
          pb={6}
          bg='whiteAlpha.800'
          css={{
            '& h3': {
              fontSize: 'lg',
              mt: 6,
              mb: 4,
            },
          }}
        >
          {/* display content after summary */}
          {children.slice(summaryIndex + 1)}
        </Box>
      </Collapsible.Content>
    </Collapsible.Root>
  );
};

/*
`right-image` / `left-image` (or camelCase) classes on a raw-HTML `div` or
`section` lay its children out side by side, with the media capped at 400px.
Returns the row direction for the class, or `undefined` for a plain block.
*/
const getImageLayoutDirection = (className?: string) => {
  const classNames = className?.split(' ');
  if (
    classNames?.includes('rightImage') ||
    classNames?.includes('right-image')
  ) {
    return 'row';
  }
  if (classNames?.includes('leftImage') || classNames?.includes('left-image')) {
    return 'row-reverse';
  }
};

const ImageLayout = ({
  direction,
  ...props
}: {
  direction: 'row' | 'row-reverse';
  [key: string]: any;
}) => (
  <HStack
    alignItems='flex-start'
    flexDirection={{ base: 'column', xl: direction }}
    css={{
      '& img, & video': { maxWidth: { base: '100%', md: '400px' } },
    }}
    gap={6}
    {...props}
  >
    {props.children.map((child: any, idx: number) => (
      <React.Fragment key={idx}>{child}</React.Fragment>
    ))}
  </HStack>
);

/*
Editors paste full production URLs (`https://data.niaid.nih.gov/search?q=…`).
Reduced to a path, a link stays on whichever site is being viewed, so a
staging preview doesn't jump to production. Files Strapi serves under
`/strapi/` are left absolute: they aren't portal pages.
Returns the path, or `undefined` for any other URL.
*/
export const getPortalPath = (href: string) => {
  const origins = [
    process.env.NEXT_PUBLIC_BASE_URL,
    'https://data.niaid.nih.gov',
  ];
  for (const origin of origins) {
    if (!origin || !href.startsWith(origin)) {
      continue;
    }
    const path = href.slice(origin.length);
    if (path && !/^[/?#]/.test(path)) {
      // A longer host that merely starts with the origin.
      continue;
    }
    return path.startsWith('/strapi/') ? undefined : path || '/';
  }
};

const CALLOUT_THEMES = {
  info: { bg: 'info.subtle', color: 'info' },
  warning: { bg: 'warning.subtle', color: 'warning' },
  error: { bg: 'error.subtle', color: 'error' },
};

/*
A blockquote's colour comes from the first emoji in its opening text: 🚧 or ⚠️
for a warning, 🚨 for an error, anything else (📘, 💡, none) for info.
`Extended_Pictographic` rather than `Emoji_Presentation`, which misses
text-style emoji like ⚠️. The match drops ⚠️'s trailing variation selector,
hence comparing against '⚠'.
*/
export const getCalloutTheme = (text?: string) => {
  const emoji = text?.match(/\p{Extended_Pictographic}/u)?.[0];
  if (emoji === '🚧' || emoji === '⚠') {
    return CALLOUT_THEMES.warning;
  }
  if (emoji === '🚨') {
    return CALLOUT_THEMES.error;
  }
  return CALLOUT_THEMES.info;
};

export const MDXComponents = {
  // Links to uploaded videos never reach this: `useMDXComponents` renders them
  // through `img`, so an `img` override styles every video, however inserted.
  a: (props: any) => {
    const { href: rawHref, ...rest } = props;
    const parsedProps = normalizeResponsiveProps(rest);

    // A raw-HTML `<a>` with no `href` (e.g. `<a id="filters"></a>`) is a jump
    // target, not a link, so there is nothing to classify as internal/external.
    if (!rawHref) {
      return <chakra.a {...parsedProps} />;
    }

    const href = getPortalPath(rawHref) ?? rawHref;
    // A portal page or a same-page `#anchor`.
    const isPortalLink = href.startsWith('/') || href.startsWith('#');
    const isExternal = props?.target === '_blank' || !isPortalLink;

    // Portal pages navigate client-side rather than reloading the app.
    if (!isExternal && href.startsWith('/')) {
      return (
        <Link asChild {...parsedProps}>
          <NextLink href={href}>{props.children}</NextLink>
        </Link>
      );
    }

    return (
      <Link href={href} isExternal={isExternal} {...parsedProps}>
        {props.children}
      </Link>
    );
  },
  blockquote: (props: any) => {
    const titleEl = props?.node?.children.find(
      (child: any) => child.type === 'element',
    );
    const theme = getCalloutTheme(titleEl?.children[0]?.value);
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
          '& p': {
            my: 4,
          },
          // Without the `&` Chakra v3 reads this key as an unknown condition
          // rather than a selector, and the title styling is silently dropped.
          '& p:first-of-type':
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
  // A real `<br>`: the empty inline span this used to render had no height, so
  // every line break and `<br/>` spacer in the content silently vanished.
  br: () => <br />,
  code: (props: any) => (
    <Text
      as='code'
      bg='primary.50'
      border='0.1rem solid'
      borderColor='primary.100'
      borderRadius='sm'
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
    const direction = getImageLayoutDirection(props?.className);
    if (direction) {
      return <ImageLayout direction={direction} {...props} />;
    }
    const parsedProps = normalizeResponsiveProps(props);

    return <Box {...parsedProps} />;
  },
  // Chakra v3's preflight resets `* { font: inherit }`, which strips the
  // browser's italic from `em` (it restores bold for `b, strong`, not this).
  em: (props: any) => <chakra.em fontStyle='italic' {...props} />,
  figcaption: (props: any) => {
    return (
      <Text
        as='figcaption'
        fontSize='xs'
        opacity={0.8}
        lineHeight='moderate'
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
  // Images and uploaded videos, with a shared aspect-ratio and fit
  // convention. See `./media.tsx` for the syntax editors use in Strapi.
  img: (props: any) => <MDXMedia {...props} />,
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
      <List.Root as='ol' listStyleType='decimal' ps={12} my={2} {...rest}>
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
          fontSize='inherit'
          lineHeight='inherit'
          color='inherit'
        >
          {props.children}
        </Text>
      );
    }
    return (
      <Text
        mt={2}
        fontSize='inherit'
        lineHeight='inherit'
        color='inherit'
        {...props}
      />
    );
  },
  section: (props: any) => {
    const direction = getImageLayoutDirection(props?.className);
    if (direction) {
      return <ImageLayout direction={direction} {...props} />;
    }
    return <Box {...props} />;
  },
  // Not `<Box asChild><strong /></Box>`: with `asChild` the slotted element's
  // own (empty) children win, so the bold text never rendered.
  strong: (props: any) => <chakra.strong fontWeight='semibold' {...props} />,
  /*
  Prose lists opt in to markers: the List recipe renders none by default, and
  `li` above inherits `listStyleType` from here. `ps` replaces v2's `ml` because
  the recipe already pads the list start, which would otherwise stack with a
  margin.
  */
  ul: (props: any) => {
    const { ordered, ...rest } = props;
    if (ordered) {
      return (MDXComponents.ol as any)(rest);
    }
    return (
      <List.Root listStyleType='disc' ps={12} my={4} {...rest}>
        {props.children}
      </List.Root>
    );
  },
};
