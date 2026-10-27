import { chakra, Image, SystemStyleObject } from '@chakra-ui/react';
import React from 'react';

/*
Aspect ratios for images and videos uploaded to Strapi.

By default a video sits in a 16:9 frame and an image keeps its own shape. An
editor picks a different ratio by putting it in quotes after the URL (the
markdown title):

  ![Screenshot of filters](/uploads/filters.png "square")
  [Video showing filters](/uploads/filters.webm "4:3")

The title takes one of the keywords below or any `W:H`. A title that is
neither stays an ordinary tooltip. Add a keyword here to offer editors a new
preset, and list it in the editor guide, `docs/strapi/media-aspect-ratios.md`.
*/
export const MEDIA_ASPECT_RATIOS: Record<string, string> = {
  wide: '16 / 9',
  landscape: '4 / 3',
  square: '1 / 1',
  portrait: '3 / 4',
  // The file's own shape.
  auto: 'auto',
};

export const DEFAULT_ASPECT_RATIO = {
  image: MEDIA_ASPECT_RATIOS.auto,
  video: MEDIA_ASPECT_RATIOS.wide,
};

const VIDEO_TYPES: Record<string, string> = {
  webm: 'video/webm',
  mp4: 'video/mp4',
};

/*
Returns the CSS aspect ratio a media title asks for, or `undefined` when the
title is an ordinary tooltip. Keywords are case-insensitive, and `W/H` is
accepted alongside `W:H`.
*/
export const parseAspectRatio = (title?: string) => {
  const value = title?.trim().toLowerCase();
  if (!value) {
    return;
  }
  if (Object.prototype.hasOwnProperty.call(MEDIA_ASPECT_RATIOS, value)) {
    return MEDIA_ASPECT_RATIOS[value];
  }
  const match = value.match(/^(\d*\.?\d+)\s*[:/]\s*(\d*\.?\d+)$/);
  if (match && Number(match[1]) > 0 && Number(match[2]) > 0) {
    return `${match[1]} / ${match[2]}`;
  }
};

// The ratio a media item renders at: the one its title names, otherwise the
// default for its kind.
export const getAspectRatio = (src: string, title?: string) =>
  parseAspectRatio(title) ??
  (getUploadedVideoType(src)
    ? DEFAULT_ASPECT_RATIO.video
    : DEFAULT_ASPECT_RATIO.image);

// Relative upload paths (`/uploads/x.png`) are served by Strapi, not the portal.
export const resolveMediaSrc = (src: string) =>
  src.startsWith('/') ? `${process.env.NEXT_PUBLIC_STRAPI_API_URL}${src}` : src;

// The `<source>` MIME type for a video uploaded to Strapi, or `undefined` for
// anything else (images, and video links to other sites, which stay links).
export const getUploadedVideoType = (src?: string) => {
  if (!src?.includes('/uploads/')) {
    return;
  }
  const extension = src.split(/[?#]/)[0].split('.').pop()?.toLowerCase();
  return extension ? VIDEO_TYPES[extension] : undefined;
};

// The plain text of a link's children, e.g. `[**Video** of search](…)`.
const getTextContent = (children: React.ReactNode): string =>
  React.Children.toArray(children)
    .map(child => {
      if (typeof child === 'string' || typeof child === 'number') {
        return `${child}`;
      }
      if (React.isValidElement<{ children?: React.ReactNode }>(child)) {
        return getTextContent(child.props.children);
      }
      return '';
    })
    .join('');

/*
Strapi's media library inserts uploaded videos as links
(`[Video showing filters](/uploads/filters.webm)`), so the description is the
link text rather than an `alt`. Maps a link's props onto media props, keeping
that text as the video's accessible name.
*/
export const getLinkedMediaProps = ({
  href,
  children,
  node,
  target,
  rel,
  ...props
}: any) => ({
  ...props,
  src: href,
  alt: getTextContent(children).trim(),
});

/*
A framed image takes the file's own width (preflight caps it at the column),
and `aspectRatio` sets its height from that, so a small image is never
stretched.
*/
const frameStyles = (aspectRatio: string): SystemStyleObject => ({
  aspectRatio,
  objectFit: 'contain',
  // Letterbox bands read as part of the frame rather than stray whitespace.
  bg: 'bg.subtle',
});

/*
Framed videos share one width instead, so recordings line up down the page.
Not the full column: most recordings are 576–1038px wide, and stretching one
to ~900px blurs its text. At 768px (`3xl`) the smallest grows by a third at
most, and larger ones scale down.
*/
const videoFrameStyles: SystemStyleObject = {
  w: '100%',
  maxW: '3xl',
};

const borderStyles: SystemStyleObject = {
  border: '1px solid',
  borderColor: 'gray.100',
  my: 2,
};

export const MDXMedia = ({ node, src, alt, title, ...props }: any) => {
  if (!src) {
    return null;
  }

  const resolvedSrc = resolveMediaSrc(src);
  const videoType = getUploadedVideoType(resolvedSrc);
  const aspectRatio = getAspectRatio(resolvedSrc, title);
  const isFramed = aspectRatio !== 'auto';

  // Spread before `props`, so a consumer's own style props still win.
  const styles: SystemStyleObject = {
    ...(isFramed ? frameStyles(aspectRatio) : {}),
    ...(isFramed && videoType ? videoFrameStyles : {}),
    ...(props.className?.split(' ').includes('border') ? borderStyles : {}),
  };
  // A title that set the ratio is consumed; any other title is a tooltip.
  const tooltip = parseAspectRatio(title) ? undefined : title;

  if (videoType) {
    return (
      <chakra.video
        loop
        muted
        playsInline
        controls
        preload='metadata'
        aria-label={alt || undefined}
        title={tooltip}
        {...styles}
        {...props}
      >
        <source src={resolvedSrc} type={videoType} />
        Your browser does not support the video tag.
      </chakra.video>
    );
  }

  return (
    <Image
      alt={alt || ''}
      title={tooltip}
      {...styles}
      {...props}
      src={resolvedSrc}
    />
  );
};
