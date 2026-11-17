import { chakra, Image, SystemStyleObject } from '@chakra-ui/react';
import React from 'react';

/*
Aspect ratios and fits for images and videos uploaded to Strapi.

By default a video sits in a 16:9 frame and an image keeps its own shape. An
editor picks a different ratio by putting it in quotes after the URL (the
markdown title):

  ![Screenshot of filters](/uploads/filters.png "square")
  [Video showing filters](/uploads/filters.webm "4:3")

The ratio is one of the keywords below or any `W:H`. A framed file is shown
whole (`contain`) unless the title also names a fit, in either order:

  ![Screenshot of filters](/uploads/filters.png "square cover")

A title that is anything else stays an ordinary tooltip. Add a keyword here to
offer editors a new preset, and list it in the strapi github wiki.
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

/*
How a file fills its frame, named by its CSS `object-fit` value. An image
keeps its own shape unless the title names a ratio, so on an image a fit only
has an effect alongside one (`"square cover"`).
*/
export const MEDIA_OBJECT_FITS = [
  'contain',
  'cover',
  'fill',
  'none',
  'scale-down',
];

export const DEFAULT_OBJECT_FIT = 'contain';

const VIDEO_TYPES: Record<string, string> = {
  webm: 'video/webm',
  mp4: 'video/mp4',
};

// The CSS aspect ratio for one word of a title, e.g. `square` or `4:3`.
const parseAspectRatio = (value: string) => {
  if (Object.prototype.hasOwnProperty.call(MEDIA_ASPECT_RATIOS, value)) {
    return MEDIA_ASPECT_RATIOS[value];
  }
  const match = value.match(/^(\d*\.?\d+)[:/](\d*\.?\d+)$/);
  if (match && Number(match[1]) > 0 && Number(match[2]) > 0) {
    return `${match[1]} / ${match[2]}`;
  }
};

/*
Returns the ratio and fit a media title asks for, or `undefined` when the
title is an ordinary tooltip: anything but at most one of each. Keywords are
case-insensitive, and `W/H` is accepted alongside `W:H`.
*/
export const parseMediaTitle = (title?: string) => {
  const words = title
    ?.toLowerCase()
    // Close up `16 : 9`, so a ratio stays one word.
    .replace(/\s*([:/])\s*/g, '$1')
    .split(/[\s,]+/)
    .filter(Boolean);
  if (!words?.length) {
    return;
  }
  const options: { aspectRatio?: string; objectFit?: string } = {};
  for (const word of words) {
    const aspectRatio = parseAspectRatio(word);
    if (aspectRatio && !options.aspectRatio) {
      options.aspectRatio = aspectRatio;
    } else if (MEDIA_OBJECT_FITS.includes(word) && !options.objectFit) {
      options.objectFit = word;
    } else {
      return;
    }
  }
  return options;
};

// The ratio a media item renders at: the one its title names, otherwise the
// default for its kind.
export const getAspectRatio = (src: string, title?: string) =>
  parseMediaTitle(title)?.aspectRatio ??
  (getUploadedVideoType(src)
    ? DEFAULT_ASPECT_RATIO.video
    : DEFAULT_ASPECT_RATIO.image);

// How a framed media item fills its frame: the fit its title names, otherwise
// the whole file.
export const getObjectFit = (title?: string) =>
  parseMediaTitle(title)?.objectFit ?? DEFAULT_OBJECT_FIT;

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
const frameStyles = (
  aspectRatio: string,
  objectFit: string,
): SystemStyleObject => ({
  aspectRatio,
  objectFit,
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
    ...(isFramed ? frameStyles(aspectRatio, getObjectFit(title)) : {}),
    ...(isFramed && videoType ? videoFrameStyles : {}),
    ...(props.className?.split(' ').includes('border') ? borderStyles : {}),
  };
  // A title that set the ratio or fit is consumed; any other is a tooltip.
  const tooltip = parseMediaTitle(title) ? undefined : title;

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
