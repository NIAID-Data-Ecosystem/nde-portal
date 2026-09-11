import userEvent from '@testing-library/user-event';
import React from 'react';
import { act, render, screen, waitFor } from 'src/__tests__/utils/render';

import { PageCombobox } from '.';

/*
The combobox is driven by a zag state machine: `send` defers every transition
through `queueMicrotask`, and the machine only marks itself started on a
microtask after mount, so a click dispatched in the same tick as `render` is
dropped. Hence the awaited tick in `setup`.

zag also writes the input's text imperatively on a microtask, so keystrokes
dispatched back-to-back — which is what user-event does, unlike a person —
leave the field a character behind. `typePage` flushes between characters.
Typing at human speed in a real browser drops nothing; verified.
*/
const setup = async (
  overrides: Partial<React.ComponentProps<typeof PageCombobox>> = {},
) => {
  const onPageChange = jest.fn();
  const utils = render(
    <PageCombobox
      onPageChange={onPageChange}
      page={5}
      totalPages={1000}
      {...overrides}
    />,
  );
  await act(async () => {});
  return { onPageChange, ...utils };
};

const input = () => screen.getByLabelText('Select page');

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

describe('PageCombobox', () => {
  it('shows the current page', async () => {
    await setup();
    expect(input()).toHaveValue('5');
  });

  it('suggests the current page, its neighbours and both ends by default', async () => {
    const user = userEvent.setup();
    await setup();

    await user.click(input());

    const options = await screen.findAllByRole('option');
    expect(options.map(option => option.textContent)).toEqual([
      'Page 1',
      'Page 4',
      'Page 5current',
      'Page 6',
      'Page 1000',
    ]);
  });

  it('collapses the default suggestions that coincide near the ends', async () => {
    const user = userEvent.setup();
    await setup({ page: 1, totalPages: 3 });

    await user.click(input());

    const options = await screen.findAllByRole('option');
    expect(options.map(option => option.textContent)).toEqual([
      'Page 1current',
      'Page 2',
      'Page 3',
    ]);
  });

  it('offers the given suggestions instead when supplied', async () => {
    const user = userEvent.setup();
    await setup({ suggestedPages: [1, 50, 100] });

    await user.click(input());

    const options = await screen.findAllByRole('option');
    expect(options.map(option => option.textContent)).toEqual([
      'Page 1',
      'Page 50',
      'Page 100',
      // Appended so the input has a selected item to revert to.
      'Page 5current',
    ]);
  });

  it('reports a page picked from the list', async () => {
    const user = userEvent.setup();
    const { onPageChange } = await setup();

    await user.click(input());
    await user.click(await screen.findByRole('option', { name: /^Page 6/ }));

    await waitFor(() => expect(onPageChange).toHaveBeenCalledWith(6));
  });

  it('reports a page typed in full', async () => {
    const user = userEvent.setup();
    const { onPageChange } = await setup();

    await typePage(user, '437');
    await user.keyboard('{Enter}');

    await waitFor(() => expect(onPageChange).toHaveBeenCalledWith(437));
  });

  it('reverts a page past the last one instead of reporting it', async () => {
    const user = userEvent.setup();
    const { onPageChange } = await setup();

    await typePage(user, '9999');
    await user.keyboard('{Enter}');

    // Nothing matches, so zag restores the selected page's string.
    await waitFor(() => expect(input()).toHaveValue('5'));
    expect(onPageChange).not.toHaveBeenCalled();
  });

  it('reverts non-numeric input instead of reporting it', async () => {
    const user = userEvent.setup();
    const { onPageChange } = await setup();

    await typePage(user, 'abc');
    await user.keyboard('{Enter}');

    await waitFor(() => expect(input()).toHaveValue('5'));
    expect(onPageChange).not.toHaveBeenCalled();
  });

  it('takes the accessible name it is given', async () => {
    await setup({ ariaLabel: 'Select results page' });
    expect(screen.getByLabelText('Select results page')).toBeInTheDocument();
  });
});
