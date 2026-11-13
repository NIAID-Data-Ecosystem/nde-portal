import React from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import { render, screen } from 'src/__tests__/utils/render';
import { useMDXComponents } from 'src/components/mdx/hooks/useMDXComponents';

import {
  getAspectRatio,
  getObjectFit,
  getUploadedVideoType,
  parseMediaTitle,
} from './media';

const STRAPI = 'https://strapi.example.org';

const Markdown = ({
  children,
  overrides,
}: {
  children: string;
  overrides?: Parameters<typeof useMDXComponents>[0];
}) => {
  const components = useMDXComponents(overrides);
  return (
    <ReactMarkdown rehypePlugins={[rehypeRaw]} components={components}>
      {children}
    </ReactMarkdown>
  );
};

const getVideo = (name: string) =>
  document.querySelector(`video[aria-label="${name}"]`) as HTMLVideoElement;

describe('parseMediaTitle', () => {
  it.each([
    ['wide', '16 / 9'],
    ['Square', '1 / 1'],
    [' landscape ', '4 / 3'],
    ['portrait', '3 / 4'],
    ['auto', 'auto'],
    ['4:3', '4 / 3'],
    ['21/9', '21 / 9'],
    ['2.35 : 1', '2.35 / 1'],
  ])('reads %p as the ratio %p', (title, aspectRatio) => {
    expect(parseMediaTitle(title)).toEqual({ aspectRatio });
  });

  it.each(['contain', 'Cover', 'fill', 'none', 'scale-down'])(
    'reads %p as a fit',
    title => {
      expect(parseMediaTitle(title)).toEqual({
        objectFit: title.toLowerCase(),
      });
    },
  );

  it.each([
    ['square cover', { aspectRatio: '1 / 1', objectFit: 'cover' }],
    ['cover 4:3', { aspectRatio: '4 / 3', objectFit: 'cover' }],
    ['2.35 : 1, fill', { aspectRatio: '2.35 / 1', objectFit: 'fill' }],
  ])('reads %p as a ratio and a fit', (title, expected) => {
    expect(parseMediaTitle(title)).toEqual(expected);
  });

  it.each([
    undefined,
    '',
    'Hover text for the screenshot',
    'Cover of the report',
    'constructor',
    '0:1',
    '16:9:1',
    'square 4:3',
    'cover contain',
  ])('treats %p as a tooltip', title => {
    expect(parseMediaTitle(title)).toBeUndefined();
  });
});

describe('getUploadedVideoType', () => {
  it('matches uploaded videos by extension', () => {
    expect(getUploadedVideoType('/uploads/a.webm')).toBe('video/webm');
    expect(getUploadedVideoType(`${STRAPI}/uploads/a.MP4?v=2`)).toBe(
      'video/mp4',
    );
  });

  it('ignores images and videos hosted elsewhere', () => {
    expect(getUploadedVideoType('/uploads/a.png')).toBeUndefined();
    expect(getUploadedVideoType('https://example.org/a.mp4')).toBeUndefined();
  });
});

describe('getAspectRatio', () => {
  it('keeps images in their own shape and frames videos at 16:9', () => {
    expect(getAspectRatio('/uploads/a.png')).toBe('auto');
    expect(getAspectRatio('/uploads/a.webm')).toBe('16 / 9');
  });

  it('lets the title override either default', () => {
    expect(getAspectRatio('/uploads/a.png', 'square')).toBe('1 / 1');
    expect(getAspectRatio('/uploads/a.webm', 'auto')).toBe('auto');
    expect(getAspectRatio('/uploads/a.webm', 'Filters panel')).toBe('16 / 9');
  });

  it('reads the ratio from a title that also names a fit', () => {
    expect(getAspectRatio('/uploads/a.png', 'square cover')).toBe('1 / 1');
    expect(getAspectRatio('/uploads/a.webm', 'cover')).toBe('16 / 9');
  });
});

describe('getObjectFit', () => {
  it('shows the whole file unless the title names a fit', () => {
    expect(getObjectFit()).toBe('contain');
    expect(getObjectFit('square')).toBe('contain');
    expect(getObjectFit('Cover of the report')).toBe('contain');
    expect(getObjectFit('square cover')).toBe('cover');
  });
});

// jsdom can't parse `aspect-ratio`/`object-fit`, so the rendered frame is
// checked through `getAspectRatio` and `getObjectFit` above; these cover what
// reaches the DOM.
describe('MDX media', () => {
  const originalUrl = process.env.NEXT_PUBLIC_STRAPI_API_URL;
  beforeAll(() => {
    process.env.NEXT_PUBLIC_STRAPI_API_URL = STRAPI;
  });
  afterAll(() => {
    process.env.NEXT_PUBLIC_STRAPI_API_URL = originalUrl;
  });

  it('serves relative uploads from Strapi', () => {
    render(<Markdown>{'![Screenshot of filters](/uploads/a.png)'}</Markdown>);
    expect(
      screen.getByRole('img', { name: 'Screenshot of filters' }),
    ).toHaveAttribute('src', `${STRAPI}/uploads/a.png`);
  });

  it.each(['square', 'square cover'])(
    'drops a title that names a ratio or fit (%p)',
    title => {
      render(
        <Markdown>
          {`![Screenshot of filters](/uploads/a.png "${title}")`}
        </Markdown>,
      );
      expect(
        screen.getByRole('img', { name: 'Screenshot of filters' }),
      ).not.toHaveAttribute('title');
    },
  );

  it('keeps a title that is not a ratio as a tooltip', () => {
    render(
      <Markdown>{'![Screenshot](/uploads/a.png "Filters panel")'}</Markdown>,
    );
    expect(screen.getByRole('img')).toHaveAttribute('title', 'Filters panel');
  });

  it('renders a linked video, named from the link text', () => {
    render(
      <Markdown>{'[Video showing **filters**](/uploads/f.webm)'}</Markdown>,
    );
    const video = getVideo('Video showing filters');
    expect(video).toBeInTheDocument();
    expect(video.querySelector('source')).toHaveAttribute('type', 'video/webm');
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });

  it('handles embedded and linked videos alike', () => {
    render(
      <Markdown>
        {`![Embedded](/uploads/e.mp4 "4:3")\n\n[Linked](/uploads/l.mp4 "4:3")`}
      </Markdown>,
    );
    for (const name of ['Embedded', 'Linked']) {
      expect(getVideo(name)).not.toHaveAttribute('title');
      expect(getVideo(name).querySelector('source')).toHaveAttribute(
        'src',
        `${STRAPI}/uploads/${name[0].toLowerCase()}.mp4`,
      );
    }
  });

  it('routes linked videos through an `img` override', () => {
    render(
      <Markdown overrides={{ img: props => <span data-testid={props.alt} /> }}>
        {'[Linked video](/uploads/l.webm)'}
      </Markdown>,
    );
    expect(screen.getByTestId('Linked video')).toBeInTheDocument();
  });

  it('leaves links to videos hosted elsewhere as links', () => {
    render(<Markdown>{'[Clip](https://example.org/clip.mp4)'}</Markdown>);
    expect(screen.getByRole('link', { name: /Clip/ })).toBeInTheDocument();
  });

  it('keeps inline styles on raw-HTML icons', () => {
    render(
      <Markdown>
        {
          '<img class="unstyled" src="/uploads/up.png" alt="up arrow" style="width: 24px;" />'
        }
      </Markdown>,
    );
    expect(screen.getByRole('img', { name: 'up arrow' })).toHaveStyle({
      width: '24px',
    });
  });
});
