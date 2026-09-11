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
 * The trigger only appears when the text is taller than the collapsed peek.
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

    it('disables the trigger so it is not clickable or focusable', () => {
      expect(screen.getByRole('button')).toBeDisabled();
    });

    it('stays collapsed when the trigger is clicked', async () => {
      const trigger = screen.getByRole('button');
      await userEvent.click(trigger);

      expect(trigger).toHaveAttribute('aria-expanded', 'false');
      expect(screen.queryByText('Show Less')).not.toBeInTheDocument();
    });
  });

  describe('when the text exceeds the collapsed height', () => {
    beforeEach(() => {
      mockTextHeight(300);
      renderWithChakra(<CollapsibleText>A long description.</CollapsibleText>);
    });

    it('offers an enabled trigger', () => {
      const trigger = screen.getByRole('button');

      expect(trigger).toBeEnabled();
      expect(screen.getByText('Show More')).toBeInTheDocument();
    });

    it('expands and collapses on click', async () => {
      const trigger = screen.getByRole('button');

      await userEvent.click(trigger);
      expect(trigger).toHaveAttribute('data-state', 'open');
      expect(trigger).toHaveAttribute('aria-expanded', 'true');
      expect(screen.getByText('Show Less')).toBeInTheDocument();

      await userEvent.click(trigger);
      // `aria-expanded` is asserted only on the way open: it tracks the exit
      // animation, which never completes without a layout engine, so it stays
      // true while the state machine is already back to closed.
      expect(trigger).toHaveAttribute('data-state', 'closed');
      expect(screen.getByText('Show More')).toBeInTheDocument();
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

    expect(screen.getByRole('button')).toBeDisabled();
    expect(screen.queryByText('Show More')).not.toBeInTheDocument();
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

    expect(screen.getByRole('button')).toBeDisabled();
    expect(screen.queryByText('Show More')).not.toBeInTheDocument();
  });

  it('re-measures when the text is resized', () => {
    const resizeObserver = captureResizeObserver();
    const offsetHeight = mockTextHeight(40);

    renderWithChakra(<CollapsibleText>A description.</CollapsibleText>);
    expect(screen.queryByText('Show More')).not.toBeInTheDocument();

    // A narrower container reflows the same text into more lines.
    offsetHeight.mockReturnValue(300);
    resizeObserver.triggerResize();

    expect(screen.getByText('Show More')).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeEnabled();

    resizeObserver.restore();
  });
});
