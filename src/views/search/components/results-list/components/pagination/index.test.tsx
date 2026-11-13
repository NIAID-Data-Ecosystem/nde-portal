import userEvent from '@testing-library/user-event';
import React from 'react';
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from 'src/__tests__/utils/render';

import { MAX_RESULTS, Pagination } from '.';

/*
Two things about this component make the usual queries not work:

1. jsdom never applies media queries, so the `base` breakpoint always wins and
   the page row — `display: { base: 'none', md: 'flex' }` — computes to
   `display: none`. `computeAccessibleName` returns '' for a `display: none`
   node, so name-based role queries cannot reach those buttons even with
   `hidden: true`. Matching on `aria-label` keeps the assertions on the same
   attribute a screen reader reads at `md` and up.

2. Chakra's Pagination is driven by a zag state machine whose `send` defers
   every transition through `queueMicrotask`, and which only marks itself
   started on a microtask after mount. Clicks dispatched before that tick are
   dropped, and a transition never lands synchronously — hence the awaited tick
   in `setup` and the `waitFor` around anything that asserts on a page change.
*/
/*
The combobox contributes its own clear/open triggers, so the pagination buttons
are everything outside it.
*/
const allButtons = () =>
  screen
    .getAllByRole('button', { hidden: true })
    .filter(element => !element.closest('[data-scope="combobox"]'));

const labels = () =>
  allButtons().map(button => button.getAttribute('aria-label'));

const button = (label: string) => {
  const match = allButtons().find(
    element => element.getAttribute('aria-label') === label,
  );
  if (!match) {
    throw new Error(
      `No button labelled "${label}". Found: ${labels().join(', ')}`,
    );
  }
  return match;
};

const setup = async (
  overrides: Partial<React.ComponentProps<typeof Pagination>> = {},
) => {
  const handleSelectedPage = jest.fn();
  const props = {
    ariaLabel: 'Paginate through resources.',
    id: 'pagination-top',
    loading: false,
    selectedPage: 5,
    selectedPerPage: 10,
    total: 50000,
    ...overrides,
    handleSelectedPage,
  };
  const utils = render(<Pagination {...props} />);
  // Let the state machine start before anything is clicked.
  await act(async () => {});

  /*
  The component is controlled: `handleSelectedPage` only reports the request, so
  a page only actually changes once the parent feeds back a new `selectedPage`.
  */
  const setSelectedPage = async (selectedPage: number) => {
    utils.rerender(<Pagination {...props} selectedPage={selectedPage} />);
    await act(async () => {});
  };

  return { handleSelectedPage, setSelectedPage, ...utils };
};

describe('Pagination', () => {
  it('labels the nav and keeps the id it was given', async () => {
    await setup();
    expect(
      screen.getByRole('navigation', { name: 'Paginate through resources.' }),
    ).toHaveAttribute('id', 'pagination-top');
  });

  it('caps the page count at the results the API will return', async () => {
    await setup();
    // 50,000 hits, but the API only serves the first MAX_RESULTS of them.
    const lastPage = MAX_RESULTS / 10;
    expect(button(`Page ${lastPage} of ${lastPage}`)).toBeTruthy();
    expect(labels().some(label => label?.endsWith('of 5000'))).toBe(false);
  });

  it('marks the current page for assistive tech', async () => {
    await setup();
    const current = button('Page 5 of 1000');
    expect(current).toHaveAttribute('aria-current', 'page');
    expect(current).toHaveAttribute('data-selected');
  });

  it('renders a window around the current page, bounded by ellipses', async () => {
    await setup();
    expect(labels()).toEqual([
      'First page',
      'Previous page',
      'Page 1 of 1000',
      'Page 4 of 1000',
      'Page 5 of 1000',
      'Page 6 of 1000',
      'Page 1000 of 1000',
      'Next page',
      'Last page',
    ]);
  });

  it.each([
    ['Page 6 of 1000', 6],
    ['Next page', 6],
    ['Previous page', 4],
    ['First page', 1],
    ['Last page', 1000],
  ])('reports page %s as %i', async (label, expected) => {
    const { handleSelectedPage } = await setup();
    fireEvent.click(button(label as string));
    await waitFor(() =>
      expect(handleSelectedPage).toHaveBeenCalledWith(expected),
    );
  });

  it('disables the backward triggers on the first page', async () => {
    await setup({ selectedPage: 1 });
    expect(button('First page')).toBeDisabled();
    expect(button('Previous page')).toBeDisabled();
    expect(button('Next page')).toBeEnabled();
  });

  it('disables the forward triggers on the last allowed page', async () => {
    await setup({ selectedPage: 1000 });
    expect(button('Last page')).toBeDisabled();
    expect(button('Next page')).toBeDisabled();
    expect(button('Previous page')).toBeEnabled();
  });

  describe('small-viewport combobox', () => {
    const input = () => screen.getByRole('combobox', { name: 'Select page' });

    /*
    zag writes the input's text imperatively on a microtask, so keystrokes
    dispatched back-to-back — which is what user-event does, unlike a person —
    leave the field a character behind. Flushing between characters keeps it
    honest. Typing at human speed in a real browser drops nothing; verified.
    */
    const typePage = async (
      user: ReturnType<typeof userEvent.setup>,
      text: string,
    ) => {
      await user.clear(input());
      for (const character of text) {
        await user.type(input(), character);
        await act(async () => {});
      }
    };

    it('shows the current page', async () => {
      await setup();
      expect(input()).toHaveValue('5');
    });

    it('offers the same window the button row shows', async () => {
      const user = userEvent.setup();
      await setup();

      await user.clear(input());

      const options = await screen.findAllByRole('option');
      expect(options.map(option => option.textContent)).toEqual([
        'Page 1',
        'Page 4',
        'Page 5current',
        'Page 6',
        'Page 1000',
      ]);
    });

    it('offers prefix matches for a typed number, capped', async () => {
      const user = userEvent.setup();
      await setup();

      await typePage(user, '43');

      const options = await screen.findAllByRole('option');
      // 43 plus 430-439 is 11 matches; the limit trims that, and the current
      // page is appended so the input has something to revert to.
      expect(options).toHaveLength(10);
      expect(options.map(option => option.textContent)).toContain('Page 43');
      expect(options.at(-1)).toHaveTextContent('Page 5current');

      // Enter has to commit the typed page, so the first match is highlighted
      // rather than the selected (current) page.
      expect(
        options.find(option => option.hasAttribute('data-highlighted')),
      ).toHaveTextContent('Page 43');
    });

    it('navigates to a page typed in full', async () => {
      const user = userEvent.setup();
      const { handleSelectedPage } = await setup();

      await typePage(user, '437');
      await user.keyboard('{Enter}');

      await waitFor(() => expect(handleSelectedPage).toHaveBeenCalledWith(437));
    });

    it('reverts a page past the last page instead of navigating', async () => {
      const user = userEvent.setup();
      const { handleSelectedPage } = await setup();

      await typePage(user, '9999');
      await user.keyboard('{Enter}');

      // Nothing matches, so zag restores the selected page's string.
      await waitFor(() => expect(input()).toHaveValue('5'));
      expect(handleSelectedPage).not.toHaveBeenCalled();
    });

    it('follows a page change made elsewhere', async () => {
      const { setSelectedPage } = await setup();

      // What the arrows and the md+ button row ultimately do.
      await setSelectedPage(6);

      await waitFor(() => expect(input()).toHaveValue('6'));
    });

    it('reverts non-numeric input instead of navigating', async () => {
      const user = userEvent.setup();
      const { handleSelectedPage } = await setup();

      await typePage(user, 'abc');
      await user.keyboard('{Enter}');

      await waitFor(() => expect(input()).toHaveValue('5'));
      expect(handleSelectedPage).not.toHaveBeenCalled();
    });
  });

  it('holds a placeholder page count until the first response settles', async () => {
    await setup({ loading: true, selectedPage: 1, total: 0 });
    expect(button('Page 10 of 10')).toBeTruthy();
  });
});
