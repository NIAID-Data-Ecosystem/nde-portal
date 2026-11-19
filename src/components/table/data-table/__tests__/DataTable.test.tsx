import userEvent from '@testing-library/user-event';
import React, { useState } from 'react';
import {
  act,
  render,
  screen,
  waitFor,
  within,
} from 'src/__tests__/utils/render';

import { DataTable } from '../components/DataTable';
import { useDataTable } from '../hooks/useDataTable';
import type { ColumnDef, SortState } from '../types';

type File = { id: string; name: string; size?: number; modified?: string };

const COLUMNS: ColumnDef<File>[] = [
  { id: 'name', header: 'Name', sort: true },
  { id: 'size', header: 'Size', type: 'number', sort: true },
  {
    id: 'modified',
    header: 'Modified',
    type: 'date',
    sort: true,
    description: 'When the file last changed.',
  },
];
const FILES: File[] = [
  { id: 'a', name: 'beta.csv', size: 1200, modified: '2024-02-01' },
  { id: 'b', name: 'alpha.csv', size: 50, modified: '2023-05-01' },
  { id: 'c', name: 'gamma.csv' },
];
const getRowId = (file: File) => file.id;

const setup = async (ui: React.ReactElement) => {
  const user = userEvent.setup();
  const result = render(ui);
  await act(async () => {});
  return { user, ...result };
};

const table = () => screen.getByRole('table', { name: 'Files' });

/*
DataTable renders a new set of rows in a background pass. These rows' cells
suspend until `release()`, which holds that pass back, so a test can see what
shows while the old rows are still up.
*/
type SlowFile = File & { slow?: boolean };
const suspendingRows = () => {
  let released = false;
  let release!: () => void;
  const pending = new Promise<void>(resolve => {
    release = () => {
      released = true;
      resolve();
    };
  });
  const SlowName = ({ name }: { name: string }) => {
    if (!released) throw pending;
    return <>{name}</>;
  };
  const columns: ColumnDef<SlowFile>[] = [
    {
      id: 'name',
      header: 'Name',
      cell: ({ row }) =>
        row.slow ? <SlowName name={row.name} /> : <>{row.name}</>,
    },
  ];
  const ui = (data: SlowFile[], loading: boolean) => (
    <React.Suspense fallback='suspended'>
      <DataTable
        label='Files'
        data={data}
        columns={columns}
        getRowId={getRowId}
        status={{ loading }}
      />
    </React.Suspense>
  );
  const NEXT_PAGE: SlowFile[] = [
    { id: 'd', name: 'delta.csv', slow: true },
    { id: 'e', name: 'epsilon.csv', slow: true },
  ];
  return { ui, release: () => release(), NEXT_PAGE };
};
const columnTexts = (index: number) =>
  within(table())
    .getAllByRole('row')
    .slice(1)
    .map(row => within(row).getAllByRole('cell')[index].textContent);

describe('DataTable', () => {
  it('renders a captioned native table from data and columns alone', async () => {
    await setup(
      <DataTable
        label='Files'
        data={FILES}
        columns={COLUMNS}
        getRowId={getRowId}
      />,
    );
    expect(table().tagName).toBe('TABLE');
    expect(within(table()).getAllByRole('columnheader')).toHaveLength(3);
    expect(columnTexts(0)).toEqual(['beta.csv', 'alpha.csv', 'gamma.csv']);
    // Numbers are formatted and right-aligned; missing values say so once.
    const sizeCell = within(table()).getAllByRole('row')[1].children[1];
    expect(sizeCell).toHaveTextContent('1,200');
    expect(sizeCell).toHaveAttribute('data-align', 'end');
    expect(columnTexts(1)[2]).toBe('—No data');
  });

  it('bounds each column on its header and body cells, not on a wrapper inside them', async () => {
    await setup(
      <DataTable
        label='Files'
        data={FILES}
        columns={COLUMNS}
        getRowId={getRowId}
      />,
    );
    // A wrapper's max-width would stop the content short of a cell that the
    // table widened to use spare space; on the cell it only caps what the
    // column asks for (checked in a real browser in e2e/layout).
    const [header, firstRow] = within(table()).getAllByRole('row');
    for (const cell of [header.children[0], firstRow.children[0]]) {
      expect(cell).toHaveStyle({ minWidth: '140px', maxWidth: '320px' });
    }
    expect(firstRow.children[0].firstElementChild).toBeNull();
  });

  it('sorts client-side from one button per header, with aria-sort and an announcement', async () => {
    const { user } = await setup(
      <DataTable
        label='Files'
        data={FILES}
        columns={COLUMNS}
        getRowId={getRowId}
      />,
    );
    const size = screen.getByRole('columnheader', { name: /size/i });
    expect(size).not.toHaveAttribute('aria-sort');

    await user.click(within(size).getByRole('button', { name: 'Size' }));
    // Numbers start descending; the missing size stays last.
    expect(size).toHaveAttribute('aria-sort', 'descending');
    expect(columnTexts(0)).toEqual(['beta.csv', 'alpha.csv', 'gamma.csv']);
    expect(screen.getByText('Sorted by Size, descending')).toBeInTheDocument();

    await user.click(within(size).getByRole('button', { name: 'Size' }));
    expect(size).toHaveAttribute('aria-sort', 'ascending');
    expect(columnTexts(0)).toEqual(['alpha.csv', 'beta.csv', 'gamma.csv']);
  });

  it('offers a header description from its own info button, without sorting', async () => {
    const { user } = await setup(
      <DataTable
        label='Files'
        data={FILES}
        columns={COLUMNS}
        getRowId={getRowId}
      />,
    );
    const header = screen.getByRole('columnheader', { name: /modified/i });
    // The sort button's name is just the title.
    expect(
      within(header).getByRole('button', { name: 'Modified' }),
    ).toBeInTheDocument();
    const info = within(header).getByRole('button', { name: 'About Modified' });
    // Screen readers get the description without opening anything.
    expect(info).toHaveAccessibleDescription('When the file last changed.');

    // A tap toggles it (tooltips don't open for touch on their own).
    await user.pointer({ keys: '[TouchA]', target: info });
    expect(await screen.findByRole('tooltip')).toHaveTextContent(
      'When the file last changed.',
    );
    expect(header).not.toHaveAttribute('aria-sort');
  });

  it('also shows the header description when hovering the title, like InfoLabel', async () => {
    const { user } = await setup(
      <DataTable
        label='Files'
        data={FILES}
        columns={COLUMNS}
        getRowId={getRowId}
      />,
    );
    const header = screen.getByRole('columnheader', { name: /modified/i });
    const sort = within(header).getByRole('button', { name: 'Modified' });

    await user.hover(within(sort).getByText('Modified'));
    expect(await screen.findByRole('tooltip')).toHaveTextContent(
      'When the file last changed.',
    );
    // Only the info button carries the description, so it's read once.
    expect(sort).not.toHaveAccessibleDescription();

    // Sorting from the title closes it.
    await user.click(sort);
    expect(header).toHaveAttribute('aria-sort', 'descending');
    await waitFor(() =>
      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument(),
    );
  });

  it('delegates sorting in server mode and renders the data as given', async () => {
    const onChange = jest.fn();
    const Server = () => {
      const tableState = useDataTable({
        data: FILES,
        columns: COLUMNS,
        getRowId,
        sort: {
          mode: 'server',
          state: { columnId: 'name', direction: 'asc' },
          onChange,
        },
      });
      return <DataTable label='Files' table={tableState} />;
    };
    const { user } = await setup(<Server />);
    expect(
      screen.getByRole('columnheader', { name: /^name/i }),
    ).toHaveAttribute('aria-sort', 'ascending');
    // Not re-sorted locally.
    expect(columnTexts(0)).toEqual(['beta.csv', 'alpha.csv', 'gamma.csv']);
    await user.click(screen.getByRole('button', { name: 'Modified' }));
    expect(onChange).toHaveBeenCalledWith<[SortState]>({
      columnId: 'modified',
      direction: 'desc',
    });
  });

  it('shows skeleton rows while loading with no data, and disables sorting', async () => {
    await setup(
      <DataTable
        label='Files'
        data={[]}
        columns={COLUMNS}
        getRowId={getRowId}
        status={{ loading: true }}
        skeletonRows={3}
      />,
    );
    expect(table()).toHaveAttribute('aria-busy', 'true');
    expect(within(table()).getAllByRole('row')).toHaveLength(4);
    expect(screen.getByRole('button', { name: 'Name' })).toBeDisabled();
    // The skeleton is the loading indicator here; no second one.
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('keeps the rows up with a small loading indicator while loading with data', async () => {
    const { rerender } = await setup(
      <DataTable
        label='Files'
        data={FILES}
        columns={COLUMNS}
        getRowId={getRowId}
        status={{ loading: true }}
      />,
    );
    expect(table()).toHaveAttribute('aria-busy', 'true');
    expect(screen.getByRole('status')).toHaveTextContent('Loading…');
    expect(within(table()).getAllByRole('row')).toHaveLength(4);
    expect(columnTexts(0)).toEqual(['beta.csv', 'alpha.csv', 'gamma.csv']);
    expect(screen.getByRole('button', { name: 'Name' })).toBeEnabled();

    rerender(
      <DataTable
        label='Files'
        data={FILES}
        columns={COLUMNS}
        getRowId={getRowId}
        status={{ loading: false }}
      />,
    );
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    expect(table()).not.toHaveAttribute('aria-busy');

    // Not over an error either.
    rerender(
      <DataTable
        label='Files'
        data={FILES}
        columns={COLUMNS}
        getRowId={getRowId}
        status={{ loading: true, error: true }}
      />,
    );
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('keeps the loading indicator until the new rows are on screen, not just until loading ends', async () => {
    const { ui, release, NEXT_PAGE } = suspendingRows();
    const { rerender } = await setup(ui(FILES, true));
    expect(screen.getByRole('status')).toHaveTextContent('Loading…');

    // Loading ended, but the new rows haven't rendered yet.
    rerender(ui(NEXT_PAGE, false));
    await act(async () => {});
    expect(columnTexts(0)).toEqual(['beta.csv', 'alpha.csv', 'gamma.csv']);
    expect(screen.getByRole('status')).toHaveTextContent('Loading…');

    // The new rows and the indicator's removal land together.
    await act(async () => release());
    expect(columnTexts(0)).toEqual(['delta.csv', 'epsilon.csv']);
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('never shows the loading indicator while rows change without loading', async () => {
    const { ui, release, NEXT_PAGE } = suspendingRows();
    const { rerender } = await setup(ui(FILES, false));

    // E.g. a client-side filter: the old rows stay up, with no indicator.
    rerender(ui(NEXT_PAGE, false));
    await act(async () => {});
    expect(columnTexts(0)).toEqual(['beta.csv', 'alpha.csv', 'gamma.csv']);
    expect(screen.queryByRole('status')).not.toBeInTheDocument();

    await act(async () => release());
    expect(columnTexts(0)).toEqual(['delta.csv', 'epsilon.csv']);
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('spans empty and error messages across every column', async () => {
    const { rerender } = await setup(
      <DataTable
        label='Files'
        data={[]}
        columns={COLUMNS}
        getRowId={getRowId}
      />,
    );
    const emptyCell = within(table()).getByText('No results').closest('td');
    expect(emptyCell).toHaveAttribute('colspan', '3');

    rerender(
      <DataTable
        label='Files'
        data={FILES}
        columns={COLUMNS}
        getRowId={getRowId}
        status={{ error: true }}
      />,
    );
    expect(screen.getByRole('alert')).toHaveTextContent(/could not be loaded/i);
    expect(screen.getByRole('alert').closest('td')).toHaveAttribute(
      'colspan',
      '3',
    );
  });

  it('pages client rows with a pager that reaches every row', async () => {
    const six: File[] = Array.from({ length: 6 }, (_, i) => ({
      id: `f${i + 1}`,
      name: `file-${i + 1}.csv`,
    }));
    const { user, container } = await setup(
      <DataTable
        label='Files'
        data={six}
        columns={COLUMNS}
        getRowId={getRowId}
        pagination
      />,
    );
    // The pager is loaded on demand.
    const next = await screen.findByLabelText(/go to next page/i);
    expect(columnTexts(0)).toEqual([
      'file-1.csv',
      'file-2.csv',
      'file-3.csv',
      'file-4.csv',
      'file-5.csv',
    ]);
    expect(screen.getByText('Page 1 of 2')).toBeInTheDocument();
    expect(screen.getByText('6 items')).toBeInTheDocument();

    // A new page starts at its first row. The button isn't remounted by the
    // page change, so keyboard focus stays on it.
    const viewport = table().parentElement!;
    viewport.scrollTop = 120;
    next.focus();
    await user.keyboard('{Enter}');
    expect(columnTexts(0)).toEqual(['file-6.csv']);
    expect(screen.getByText('Page 2 of 2')).toBeInTheDocument();
    expect(viewport.scrollTop).toBe(0);
    expect(next).toBeDisabled();
    await user.click(screen.getByLabelText(/go to previous page/i));
    expect(screen.getByLabelText(/go to previous page/i)).toHaveFocus();
    expect(columnTexts(0)).toHaveLength(5);

    await user.selectOptions(
      screen.getByLabelText(/select number of rows per page/i),
      '10',
    );
    expect(columnTexts(0)).toHaveLength(6);
    expect(screen.getByText('Page 1 of 1')).toBeInTheDocument();
    // Inside the table's border, after the rows.
    expect(
      container.querySelector('.nde-data-table > .nde-table-pager'),
    ).toBeInTheDocument();
  });

  it('pages a table from useDataTable the same way, with no pager when there is nothing to page', async () => {
    const Paged = ({ data, error }: { data: File[]; error?: boolean }) => {
      const table = useDataTable({
        data,
        columns: COLUMNS,
        getRowId,
        pagination: { pageSizes: [2, 4] },
      });
      return <DataTable table={table} label='Files' status={{ error }} />;
    };
    const { user, rerender } = await setup(<Paged data={FILES} />);
    await user.click(await screen.findByLabelText(/go to next page/i));
    expect(columnTexts(0)).toEqual(['gamma.csv']);

    rerender(<Paged data={FILES} error />);
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.queryByText(/rows per page/i)).not.toBeInTheDocument();

    rerender(<Paged data={[]} />);
    expect(screen.getByText('No results')).toBeInTheDocument();
    expect(screen.queryByText(/rows per page/i)).not.toBeInTheDocument();
  });

  // The lines themselves are CSS keyed on this attribute, which jsdom can't
  // lay out; a browser check covers how they look.
  it('marks the table for column borders only with showColumnBorder, from data or a table instance', async () => {
    const root = (container: HTMLElement) =>
      container.querySelector('.nde-data-table')!;
    const Controlled = ({
      showColumnBorder,
    }: {
      showColumnBorder?: boolean;
    }) => {
      const table = useDataTable({ data: FILES, columns: COLUMNS, getRowId });
      return (
        <DataTable
          table={table}
          label='Files'
          showColumnBorder={showColumnBorder}
        />
      );
    };

    const { container, rerender } = await setup(
      <DataTable
        label='Files'
        data={FILES}
        columns={COLUMNS}
        getRowId={getRowId}
      />,
    );
    expect(root(container)).not.toHaveAttribute('data-column-border');

    rerender(
      <DataTable
        label='Files'
        data={FILES}
        columns={COLUMNS}
        getRowId={getRowId}
        showColumnBorder
      />,
    );
    expect(root(container)).toHaveAttribute('data-column-border');

    rerender(<Controlled />);
    expect(root(container)).not.toHaveAttribute('data-column-border');
    rerender(<Controlled showColumnBorder />);
    expect(root(container)).toHaveAttribute('data-column-border');
  });

  /*
  jsdom resolves no CSS variables, so this reads which palette the root's own
  rules point Chakra's palette variables at. The prop's rule is unlayered, so
  it beats the recipe's default in `@layer recipes`. A browser check covers
  the colours themselves.
  */
  it('takes a colorPalette for its accents, primary by default, from data or a table instance', async () => {
    const rootPalette = (container: HTMLElement) => {
      const root = container.querySelector('.nde-data-table')!;
      const declared = [...document.styleSheets]
        .flatMap(sheet => [...sheet.cssRules].map(rule => rule.cssText))
        .flatMap(text => {
          const match = text.match(
            /\.(css-[\w-]+) \{[^}]*--chakra-colors-color-palette-50: var\(--chakra-colors-([\w-]+)-50\)/,
          );
          return match && root.classList.contains(match[1])
            ? [{ palette: match[2], layered: text.startsWith('@layer') }]
            : [];
        });
      return (declared.find(d => !d.layered) ?? declared[0])?.palette;
    };
    const Controlled = () => {
      const table = useDataTable({ data: FILES, columns: COLUMNS, getRowId });
      return <DataTable table={table} label='Files' colorPalette='purple' />;
    };

    const { container, rerender } = await setup(
      <DataTable
        label='Files'
        data={FILES}
        columns={COLUMNS}
        getRowId={getRowId}
      />,
    );
    expect(rootPalette(container)).toBe('primary');

    rerender(
      <DataTable
        label='Files'
        data={FILES}
        columns={COLUMNS}
        getRowId={getRowId}
        colorPalette='green'
      />,
    );
    expect(rootPalette(container)).toBe('green');

    rerender(<Controlled />);
    expect(rootPalette(container)).toBe('purple');
  });

  it('keeps cell DOM nodes across unrelated parent re-renders', async () => {
    let bump: () => void = () => {};
    const Parent = () => {
      const [count, setCount] = useState(0);
      bump = () => setCount(c => c + 1);
      return (
        <>
          <span>{count}</span>
          <DataTable
            label='Files'
            data={FILES}
            columns={COLUMNS}
            getRowId={getRowId}
          />
        </>
      );
    };
    await setup(<Parent />);
    const before = screen.getByText('alpha.csv');
    act(() => bump());
    expect(screen.getByText('alpha.csv')).toBe(before);
  });

  /*
  Natural height (`maxHeight='none'`) must be only a CSS value, so supporting
  it costs bounded tables nothing: the same DOM, listeners, observers and React
  commits as the bounded default. Any branch on `maxHeight` fails this. (It
  can't catch natural-height-only work that runs in both modes; see the
  README's "Height" section.)
  */
  it("renders and wires up maxHeight='none' exactly like the bounded default", async () => {
    const trace: string[] = [];
    const observer = (kind: string) =>
      class {
        observe(el: Element) {
          trace.push(`${kind}: ${el.tagName}`);
        }
        unobserve() {}
        disconnect() {}
      };
    const originals = {
      ResizeObserver: window.ResizeObserver,
      IntersectionObserver: window.IntersectionObserver,
    };
    Object.assign(window, {
      ResizeObserver: observer('resize'),
      IntersectionObserver: observer('intersection'),
    });
    // jsdom gives `window` its own bound `addEventListener`, so it needs its
    // own spy; elements and `document` use the prototype's.
    const spyOnListeners = (target: EventTarget) => {
      const original = target.addEventListener;
      return jest
        .spyOn(target, 'addEventListener')
        .mockImplementation(function (this: EventTarget, type, ...rest) {
          trace.push(`listen: ${(this as Node).nodeName ?? 'window'} ${type}`);
          return original.call(this, type, ...rest);
        });
    };
    const listenSpies = [
      spyOnListeners(EventTarget.prototype),
      spyOnListeners(window),
    ];

    const renderTable = async (maxHeight?: 'none') => {
      trace.length = 0;
      let commits = 0;
      const { container, unmount } = await setup(
        <React.Profiler id='table' onRender={() => commits++}>
          <DataTable
            label='Files'
            data={FILES}
            columns={COLUMNS}
            getRowId={getRowId}
            maxHeight={maxHeight}
          />
        </React.Profiler>,
      );
      const root = container.querySelector('.nde-data-table')!;
      const result = {
        rootClass: root.className,
        // Generated class names and `useId` ids aside, the markup must match.
        dom: container.innerHTML
          .replace(/ class="[^"]*"/g, '')
          .replace(/:r[0-9a-z]+:/g, 'ID'),
        trace: [...trace],
        commits,
      };
      unmount();
      return result;
    };

    try {
      // Warm-up: anything registered once per page on first use is excluded.
      await renderTable();
      const bounded = await renderTable();
      const natural = await renderTable('none');

      expect(bounded.trace).toEqual(
        expect.arrayContaining(['resize: TABLE', 'listen: window resize']),
      );
      expect(natural.dom).toBe(bounded.dom);
      expect(natural.trace).toEqual(bounded.trace);
      expect(natural.commits).toBe(bounded.commits);
      // The one difference: the root's styles.
      expect(natural.rootClass).not.toBe(bounded.rootClass);
    } finally {
      listenSpies.forEach(spy => spy.mockRestore());
      Object.assign(window, originals);
    }
  });
});
