import React from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import { render, screen } from 'src/__tests__/utils/render';
import { useMDXComponents } from 'src/components/mdx/hooks/useMDXComponents';

import {
  getAspectRatio,
  getUploadedVideoType,
  parseAspectRatio,
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

describe('parseAspectRatio', () => {
  it.each([
    ['wide', '16 / 9'],
    ['Square', '1 / 1'],
    [' landscape ', '4 / 3'],
    ['portrait', '3 / 4'],
    ['auto', 'auto'],
    ['4:3', '4 / 3'],
    ['21/9', '21 / 9'],
    ['2.35 : 1', '2.35 / 1'],
  ])('reads %p as %p', (title, expected) => {
    expect(parseAspectRatio(title)).toBe(expected);
  });

  it.each([
    undefined,
    '',
    'Hover text for the screenshot',
    'constructor',
    '0:1',
    '16:9:1',
  ])('treats %p as a tooltip, not a ratio', title => {
    expect(parseAspectRatio(title)).toBeUndefined();
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
});

// jsdom can't parse `aspect-ratio`/`object-fit`, so the rendered frame is
// checked through `getAspectRatio` above; these cover what reaches the DOM.
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

  it('drops a title that names a ratio', () => {
    render(
      <Markdown>
        {'![Screenshot of filters](/uploads/a.png "square")'}
      </Markdown>,
    );
    expect(
      screen.getByRole('img', { name: 'Screenshot of filters' }),
    ).not.toHaveAttribute('title');
  });

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
