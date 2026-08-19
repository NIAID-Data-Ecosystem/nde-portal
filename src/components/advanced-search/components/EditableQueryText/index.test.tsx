import React from 'react';
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { system } from 'src/theme';
import { QueryStringError } from 'src/components/error/types';
import { TreeItem } from '../SortableWithCombine';
import { EditableQueryText } from '.';

const queryObj = [
  {
    id: '1',
    parentId: null,
    depth: 0,
    index: 0,
    children: [],
    value: {
      field: '',
      term: 'malaria',
      union: undefined,
      querystring: 'malaria',
    },
  },
] as unknown as TreeItem[];

const Harness = () => {
  const [obj, setObj] = React.useState<TreeItem[]>(queryObj);
  const [errors, setErrors] = React.useState<QueryStringError[]>([]);
  return (
    <QueryClientProvider
      client={
        new QueryClient({ defaultOptions: { queries: { retry: false } } })
      }
    >
      <ChakraProvider value={system}>
        <EditableQueryText
          queryObj={obj}
          updateQueryObj={setObj}
          errors={errors}
          setErrors={setErrors}
        />
      </ChakraProvider>
    </QueryClientProvider>
  );
};

const enterEditMode = async () => {
  fireEvent.click(await screen.findByRole('button', { name: 'Edit' }));
  return screen.findByLabelText('Edit query input');
};

describe('EditableQueryText', () => {
  it('renders the query string from the query object, and toggles edit mode', async () => {
    render(<Harness />);
    expect(await screen.findByLabelText('Edit query string')).toHaveTextContent(
      'malaria',
    );

    const textarea = await enterEditMode();
    expect(textarea).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Accept Edit.' }),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Edit' })).toBeInTheDocument(),
    );
  });

  it('round-trips typing through `value` / `onValueChange`', async () => {
    render(<Harness />);
    const textarea = await enterEditMode();

    await act(async () => {
      fireEvent.change(textarea, { target: { value: 'malaria OR dengue' } });
    });

    // The preview renders from React state, so matching here proves the edit
    // went through the controlled value rather than only landing in the DOM.
    expect(screen.getByLabelText('Edit query string')).toHaveTextContent(
      'malaria OR dengue',
    );
  });

  it('commits a valid query string and returns to preview mode', async () => {
    render(<Harness />);
    const textarea = await enterEditMode();

    await act(async () => {
      fireEvent.change(textarea, { target: { value: 'dengue' } });
    });
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Accept Edit.' }));
    });

    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Edit' })).toBeInTheDocument(),
    );
  });

  it('keeps the user in edit mode when the query string is invalid', async () => {
    render(<Harness />);
    const textarea = await enterEditMode();

    await act(async () => {
      fireEvent.change(textarea, { target: { value: '(dengue' } });
    });
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Accept Edit.' }));
    });

    expect(
      screen.queryByRole('button', { name: 'Edit' }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Accept Edit.' }),
    ).toBeInTheDocument();
    expect((textarea as HTMLTextAreaElement).value).toBe('(dengue');
  });
});
