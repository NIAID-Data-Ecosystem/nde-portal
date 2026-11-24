import {
  Box,
  BoxProps,
  Card,
  Flex,
  FlexProps,
  Image,
  ImageProps,
} from '@chakra-ui/react';
import NextLink, { LinkProps as NextLinkProps } from 'next/link';
import React, { ReactNode, useId } from 'react';
import { Link } from 'src/components/link';

export interface ImageCardProps extends Omit<Card.RootProps, 'title'> {
  /** Card heading. It also names the card (`<article aria-labelledby>`). */
  title: string;
  /**
   * Heading level for the title. Pick the level that fits the page outline.
   * The default is `h3`, the same as `Card.Title`.
   */
  titleAs?: 'h2' | 'h3' | 'h4';
  /** Makes the title a link to a route within the portal. */
  titleHref?: NextLinkProps['href'];
  /**
   * Summary under the title. It renders inside a `<p>`, so pass inline content
   * only (text, links). Put block content in `children`.
   */
  description?: ReactNode;
  /** Content rendered in the body after the description. */
  children?: ReactNode;
  /** Actions, aligned to the end. The footer is not rendered when empty. */
  footer?: ReactNode;
  /** `src` and `alt` are required. Use `align` to set the object position. */
  imageProps: ImageProps & { src: string; alt: string };
  /**
   * Sizing for the image column. By default the image and text each take
   * half the card, and stack once the card is narrower than about 700px.
   */
  imageContainerProps?: BoxProps;
  /**
   * Sizing for the text column. Its default `minW` is what stacks the card.
   * When `imageContainerProps` sets the split instead, drop the minimum from
   * the side-by-side breakpoint up (`{ base: '100%', md: 0 }`). Keep `100%`
   * where the card stacks, or the text column shares the image's line.
   */
  contentContainerProps?: FlexProps;
  /** Styles and attributes for the body containing the title and description. */
  bodyProps?: Card.BodyProps;
}

/**
 * A card with an image beside its text, or above it on narrow screens.
 */
export const ImageCard = ({
  title,
  titleAs = 'h3',
  titleHref,
  description,
  children,
  footer,
  imageProps: { alt, ...imageProps },
  imageContainerProps,
  contentContainerProps,
  bodyProps,
  size = 'md',
  ...props
}: ImageCardProps) => {
  const titleId = useId();

  return (
    <Card.Root
      as='article'
      aria-labelledby={titleId}
      size={size}
      flexDirection='row'
      flexWrap='wrap'
      {...props}
    >
      <Box
        flex={1}
        minW={{ base: '100%', sm: '350px' }}
        minH={{ base: '200px', md: 'unset' }}
        {...imageContainerProps}
      >
        <Image alt={alt} width='100%' height='100%' {...imageProps} />
      </Box>
      <Flex
        flex={1}
        direction='column'
        minW={{ base: '100%', sm: '350px' }}
        {...contentContainerProps}
      >
        <Card.Body gap='calc(var(--card-padding)/2)' {...bodyProps}>
          <Card.Title as={titleAs} id={titleId} fontSize='xl'>
            {titleHref ? (
              <Link asChild>
                <NextLink href={titleHref}>{title}</NextLink>
              </Link>
            ) : (
              title
            )}
          </Card.Title>
          {description && (
            <Card.Description fontSize='md' lineHeight='moderate'>
              {description}
            </Card.Description>
          )}
          {children}
        </Card.Body>

        {footer && (
          <Card.Footer justifyContent='flex-end'>{footer}</Card.Footer>
        )}
      </Flex>
    </Card.Root>
  );
};
