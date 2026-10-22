import '@testing-library/jest-dom';

import { ChakraProvider } from '@chakra-ui/react';
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { system } from 'src/theme';

import { CollapsibleText } from '.';

const renderWithChakra = (ui: React.ReactElement) =>
  render(<ChakraProvider value={system}>{ui}</ChakraProvider>);

/*
 * The toggle only appears when the text is taller than the collapsed peek.
 * jsdom reports 0 for every measurement, so stub the height the component
 * measures. 100px is the default peek.
 */
const mockTextHeight = (height: number) =>
  jest
    .spyOn(HTMLElement.prototype, 'offsetHeight', 'get')
    .mockReturnValue(height);

/**
 * Swaps in a ResizeObserver that exposes its callback, so a resize can be
 * replayed without a layout engine. jest.setup.js installs a no-op by default.
 */
const captureResizeObserver = () => {
  const callbacks: ResizeObserverCallback[] = [];
  const original = global.ResizeObserver;

  global.ResizeObserver = jest.fn().mockImplementation(callback => {
    callbacks.push(callback);
    return { observe: jest.fn(), unobserve: jest.fn(), disconnect: jest.fn() };
  }) as unknown as typeof ResizeObserver;

  return {
    triggerResize: () =>
      act(() => {
        callbacks.forEach(callback =>
          callback([], {} as unknown as ResizeObserver),
        );
      }),
    restore: () => {
      global.ResizeObserver = original;
    },
  };
};

describe('CollapsibleText', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders its children', () => {
    mockTextHeight(40);
    renderWithChakra(<CollapsibleText>A short description.</CollapsibleText>);

    expect(screen.getByText('A short description.')).toBeInTheDocument();
  });

  describe('when the text fits within the collapsed height', () => {
    beforeEach(() => {
      mockTextHeight(40);
      renderWithChakra(<CollapsibleText>A short description.</CollapsibleText>);
    });

    it('offers no toggle label', () => {
      expect(screen.queryByText('Show More')).not.toBeInTheDocument();
      expect(screen.queryByText('Show Less')).not.toBeInTheDocument();
    });

    it('renders no toggle button', () => {
      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });
  });

  describe('when the text exceeds the collapsed height', () => {
    beforeEach(() => {
      mockTextHeight(300);
      renderWithChakra(<CollapsibleText>A long description.</CollapsibleText>);
    });

    it('offers a toggle button that controls the text', () => {
      const trigger = screen.getByRole('button', { name: 'Show More' });

      expect(trigger).toHaveAttribute('aria-expanded', 'false');
      expect(
        document.getElementById(trigger.getAttribute('aria-controls')!),
      ).toHaveTextContent('A long description.');
    });

    it('expands and collapses on click', async () => {
      const trigger = screen.getByRole('button');

      await userEvent.click(trigger);
      expect(trigger).toHaveAttribute('aria-expanded', 'true');
      expect(screen.getByText('Show Less')).toBeInTheDocument();

      await userEvent.click(trigger);
      expect(trigger).toHaveAttribute('aria-expanded', 'false');
      expect(screen.getByText('Show More')).toBeInTheDocument();
    });
  });

  it.each([
    ['fits within', 40],
    ['exceeds', 300],
  ])(
    'leaves links clickable when the text %s the collapsed height',
    async (_, height) => {
      mockTextHeight(height);
      const onClick = jest.fn((event: React.MouseEvent) =>
        event.preventDefault(),
      );
      renderWithChakra(
        <CollapsibleText>
          <a href='#details' onClick={onClick}>
            A link
          </a>
        </CollapsibleText>,
      );

      const link = screen.getByRole('link', { name: 'A link' });
      expect(link).not.toHaveAttribute('inert');

      await userEvent.click(link);
      expect(onClick).toHaveBeenCalledTimes(1);
      // Clicking the text no longer toggles it.
      expect(screen.queryByText('Show Less')).not.toBeInTheDocument();
    },
  );

  describe('when a link in the collapsed text receives focus', () => {
    /*
     * jsdom has no layout, so stub the two rects the focus handler compares:
     * the content box (the peek) and the focused link.
     */
    const focusLinkWithBottom = (linkBottom: number) => {
      mockTextHeight(300);
      renderWithChakra(
        <CollapsibleText>
          <a href='#details'>A link</a>
        </CollapsibleText>,
      );

      const trigger = screen.getByRole('button');
      const content = document.getElementById(
        trigger.getAttribute('aria-controls')!,
      )!;
      const link = screen.getByRole('link');
      jest
        .spyOn(content, 'getBoundingClientRect')
        .mockReturnValue({ bottom: 100 } as DOMRect);
      jest
        .spyOn(link, 'getBoundingClientRect')
        .mockReturnValue({ bottom: linkBottom } as DOMRect);

      act(() => link.focus());
      return trigger;
    };

    it('expands when the link is clipped below the peek', () => {
      expect(focusLinkWithBottom(150)).toHaveAttribute('aria-expanded', 'true');
    });

    it('stays collapsed when the link is inside the peek', () => {
      expect(focusLinkWithBottom(50)).toHaveAttribute('aria-expanded', 'false');
    });
  });

  it('measures against a custom collapsed height', () => {
    // Tall enough for the default 100px peek, short enough for a 400px one.
    mockTextHeight(300);
    renderWithChakra(
      <CollapsibleText collapsedHeight={400}>
        A long description.
      </CollapsibleText>,
    );

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('accepts custom trigger labels', async () => {
    mockTextHeight(300);
    renderWithChakra(
      <CollapsibleText expandLabel='Read more' collapseLabel='Read less'>
        A long description.
      </CollapsibleText>,
    );

    expect(screen.getByText('Read more')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button'));
    expect(screen.getByText('Read less')).toBeInTheDocument();
  });

  it('offers no toggle when there is no text to show', () => {
    mockTextHeight(300);
    renderWithChakra(<CollapsibleText>{null}</CollapsibleText>);

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('re-measures when the text is resized', () => {
    const resizeObserver = captureResizeObserver();
    const offsetHeight = mockTextHeight(40);

    renderWithChakra(<CollapsibleText>A description.</CollapsibleText>);
    expect(screen.queryByText('Show More')).not.toBeInTheDocument();

    // A narrower container reflows the same text into more lines.
    offsetHeight.mockReturnValue(300);
    resizeObserver.triggerResize();

    expect(
      screen.getByRole('button', { name: 'Show More' }),
    ).toBeInTheDocument();

    resizeObserver.restore();
  });
});
