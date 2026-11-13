import { Field, Input } from '@chakra-ui/react';
import userEvent from '@testing-library/user-event';
import React, { useState } from 'react';
import { SchemaDefinition } from 'scripts/generate-schema-definitions/types';
import { act, render, screen, waitFor } from 'src/__tests__/utils/render';
import { QueryValue } from 'src/components/advanced-search/types';

import { FieldSelect } from '.';

/*
FieldSelect is a zag combobox. As in PageCombobox's tests: the machine drops a
click dispatched in the same tick as `render`, hence the awaited tick in
`setup`; and zag writes the input's text on a microtask, so `type` flushes
between keystrokes, which user-event otherwise sends back to back.
*/

const field = (
  dotfield: string,
  name: string,
  count: number,
  type = 'keyword',
) =>
  ({
    dotfield,
    property: dotfield,
    name,
    count,
    type,
  } as SchemaDefinition);

const ALL_FIELDS = field('', 'All Fields', 900, 'text');

// Listed out of order, so the tests prove the record-count sort.
const FIELDS = [
  field('date', 'Date', 600, 'date'),
  field('name', 'Name', 700, 'text'),
  ALL_FIELDS,
  field('description', 'Description', 400, 'text'),
  field('@type', 'Type', 800),
  field('dateCreated', 'Date Created', 500, 'date'),
  // Dropped by `filterFields`: an object, a field with no records, and one
  // missing from configs/advanced-search-fields.json.
  field('spatialCoverage', 'Spatial Coverage', 300, 'object'),
  field('conditionsOfAccess', 'Conditions Of Access', 0),
  field('notAField', 'Not A Field', 200),
];

type FieldSelectProps = React.ComponentProps<typeof FieldSelect>;

// Holds the selection in state, as FieldSelect's callers do, so the input
// reflects a pick the way it does in the app.
const Harness = ({
  onChange,
  selectedField: initialField = '',
  ...props
}: Partial<FieldSelectProps> & { onChange: jest.Mock }) => {
  const [selectedField, setSelectedField] =
    useState<QueryValue['field']>(initialField);
  return (
    <FieldSelect
      fields={FIELDS}
      selectedField={selectedField}
      setSelectedField={value => {
        onChange(value);
        setSelectedField(value);
      }}
      {...props}
    />
  );
};

const setup = async (props: Partial<FieldSelectProps> = {}) => {
  const onChange = jest.fn();
  const user = userEvent.setup();
  render(<Harness onChange={onChange} {...props} />);
  await act(async () => {});
  return { onChange, user };
};

const input = () => screen.getByRole('combobox', { name: 'Select field' });

const type = async (user: ReturnType<typeof userEvent.setup>, text: string) => {
  for (const character of text) {
    await user.keyboard(character);
    await act(async () => {});
  }
};

// Each option also shows a record count and a description, so read the label.
const optionLabels = async () =>
  (await screen.findAllByRole('option')).map(
    option => option.querySelector('[data-part=item-text]')?.textContent,
  );

describe('FieldSelect', () => {
  it('shows the selected field', async () => {
    await setup({ selectedField: 'date' });
    expect(input()).toHaveValue('Date');
  });

  it('shows All Fields when no field is selected', async () => {
    await setup();
    expect(input()).toHaveValue('All Fields');
  });

  it('falls back to an All Fields placeholder when the list has no such option', async () => {
    // Edit mode passes the schema's fields, which have no "All Fields" entry.
    await setup({ fields: FIELDS.filter(entry => entry !== ALL_FIELDS) });
    expect(input()).toHaveValue('');
    expect(input()).toHaveAttribute('placeholder', 'All Fields');
  });

  it('lists the selectable fields, most records first', async () => {
    const { user } = await setup();
    await user.click(input());

    expect(await optionLabels()).toEqual([
      'All Fields',
      'Type',
      'Name',
      'Date',
      'Date Created',
      'Description',
    ]);
  });

  it('marks the selected field in the list', async () => {
    const { user } = await setup({ selectedField: 'date' });
    await user.click(input());

    expect(
      await screen.findByRole('option', { name: /^Date\b(?! Created)/ }),
    ).toHaveAttribute('aria-selected', 'true');
  });

  it('empties the input on open, keeping the selection as the placeholder', async () => {
    const { user } = await setup({ selectedField: 'date' });
    await user.click(input());

    await waitFor(() => expect(input()).toHaveValue(''));
    expect(input()).toHaveAttribute('placeholder', 'Date');
  });

  it('ranks fuzzy matches for what is typed', async () => {
    const { user } = await setup();
    await user.click(input());
    await type(user, 'dat');

    await waitFor(async () =>
      expect(await optionLabels()).toEqual(['Date', 'Date Created']),
    );
  });

  it('says so when nothing matches', async () => {
    const { user } = await setup();
    await user.click(input());
    await type(user, 'zzz');

    expect(await screen.findByText('No options')).toBeVisible();
    expect(screen.queryByRole('option')).not.toBeInTheDocument();
  });

  it('selects the top match on Enter', async () => {
    const { onChange, user } = await setup();
    await user.click(input());
    await type(user, 'dat');
    await user.keyboard('{Enter}');

    await waitFor(() => expect(onChange).toHaveBeenCalledWith('date'));
    await waitFor(() => expect(input()).toHaveValue('Date'));
  });

  it('selects a field picked from the list', async () => {
    const { onChange, user } = await setup();
    await user.click(input());
    await user.click(await screen.findByRole('option', { name: /^Type/ }));

    await waitFor(() => expect(onChange).toHaveBeenCalledWith('@type'));
    await waitFor(() => expect(input()).toHaveValue('Type'));
  });

  it('reports an empty field when All Fields is picked', async () => {
    const { onChange, user } = await setup({ selectedField: 'date' });
    await user.click(input());
    await user.click(
      await screen.findByRole('option', { name: /^All Fields/ }),
    );

    await waitFor(() => expect(onChange).toHaveBeenCalledWith(''));
    await waitFor(() => expect(input()).toHaveValue('All Fields'));
  });

  it('restores the selection when a search is abandoned', async () => {
    const { onChange, user } = await setup({ selectedField: 'date' });
    await user.click(input());
    await type(user, 'na');

    // The first Escape only closes the list; the second reverts the text.
    await user.keyboard('{Escape}');
    await act(async () => {});
    expect(input()).toHaveValue('na');
    await user.keyboard('{Escape}');

    await waitFor(() => expect(input()).toHaveValue('Date'));
    expect(onChange).not.toHaveBeenCalled();
  });

  it('keeps what was typed when the list opens by typing', async () => {
    const { user } = await setup();
    // Keyboard focus selects the text, so the first keystroke replaces it.
    await user.tab();
    await type(user, 'na');

    expect(input()).toHaveValue('na');
    expect((await optionLabels())[0]).toBe('Name');
  });

  it('offers a clear button only once a field other than All Fields is selected', async () => {
    const { onChange, user } = await setup({ selectedField: 'date' });
    await user.click(screen.getByRole('button', { name: 'Clear value' }));

    await waitFor(() => expect(onChange).toHaveBeenCalledWith(''));
    await waitFor(() => expect(input()).toHaveValue('All Fields'));
    expect(
      screen.queryByRole('button', { name: 'Clear value' }),
    ).not.toBeInTheDocument();
  });

  it('keeps its own id and validity inside a Field.Root', async () => {
    // As in the search form, where the Field belongs to the term input.
    render(
      <Field.Root invalid>
        <FieldSelect
          fields={FIELDS}
          selectedField=''
          setSelectedField={jest.fn()}
        />
        <Input aria-label='Search term' />
      </Field.Root>,
    );
    await act(async () => {});

    const term = screen.getByRole('textbox', { name: 'Search term' });
    expect(input().id).not.toBe(term.id);
    expect(input()).not.toHaveAttribute('aria-invalid');
    expect(term).toHaveAttribute('aria-invalid', 'true');
  });

  it('can be disabled', async () => {
    await setup({ disabled: true });
    expect(input()).toBeDisabled();
  });
});
