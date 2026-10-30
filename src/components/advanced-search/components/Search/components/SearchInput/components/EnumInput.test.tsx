import { Button } from '@chakra-ui/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { act, render, screen, waitFor } from 'src/__tests__/utils/render';

import { EnumInput } from './EnumInput';

/*
A zag combobox, like FieldSelect: see its tests for why `setup` awaits a tick
and `type` flushes between keystrokes.
*/

const OPTIONS = [
  { label: 'Closed', value: 'closed' },
  { label: 'Open', value: 'open' },
  { label: 'Restricted', value: 'restricted' },
];

const setup = async (
  props: Partial<React.ComponentProps<typeof EnumInput>> = {},
) => {
  const handleChange = jest.fn();
  const handleSubmit = jest.fn();
  const user = userEvent.setup();
  render(
    <EnumInput
      options={OPTIONS}
      size='md'
      inputValue=''
      errors={[]}
      setErrors={jest.fn()}
      clearInputValue={jest.fn()}
      handleClick={jest.fn()}
      handleChange={handleChange}
      handleSubmit={handleSubmit}
      renderSubmitButton={buttonProps => <Button {...buttonProps}>Add</Button>}
      {...props}
    />,
  );
  await act(async () => {});
  return { handleChange, handleSubmit, user };
};

const input = () => screen.getByRole('combobox', { name: 'Select value' });

const type = async (user: ReturnType<typeof userEvent.setup>, text: string) => {
  for (const character of text) {
    await user.keyboard(character);
    await act(async () => {});
  }
};

describe('EnumInput', () => {
  it('starts on the first option and reports it', async () => {
    const { handleChange } = await setup();

    expect(input()).toHaveValue('Closed');
    expect(handleChange).toHaveBeenLastCalledWith({
      value: 'closed',
      term: 'Closed',
      querystring: 'closed',
    });
  });

  it('starts on the option matching the current value', async () => {
    await setup({ inputValue: 'open' });
    expect(input()).toHaveValue('Open');
  });

  it('reports an option picked from the list', async () => {
    const { handleChange, user } = await setup();
    await user.click(input());
    await user.click(await screen.findByRole('option', { name: 'Restricted' }));

    await waitFor(() =>
      expect(handleChange).toHaveBeenLastCalledWith({
        value: 'restricted',
        term: 'Restricted',
        querystring: 'restricted',
      }),
    );
    expect(input()).toHaveValue('Restricted');
  });

  it('filters the options by what is typed, ignoring case', async () => {
    const { user } = await setup();
    await user.click(input());
    await type(user, 'RES');

    await waitFor(async () =>
      expect(
        (
          await screen.findAllByRole('option')
        ).map(option => option.textContent),
      ).toEqual(['Restricted']),
    );
  });

  it('submits the selected option', async () => {
    const { handleSubmit, user } = await setup();
    await user.click(screen.getByRole('button', { name: 'Add' }));

    expect(handleSubmit).toHaveBeenCalledWith({
      term: 'Closed',
      querystring: 'closed',
    });
  });

  it('submits on Enter while the list is closed', async () => {
    const { handleSubmit, user } = await setup();
    // Focusing by keyboard leaves the list closed, so Enter reaches the form.
    await user.tab();
    expect(input()).toHaveFocus();
    await user.keyboard('{Enter}');

    expect(handleSubmit).toHaveBeenCalledWith({
      term: 'Closed',
      querystring: 'closed',
    });
  });
});
