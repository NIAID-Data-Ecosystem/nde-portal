import userEvent from '@testing-library/user-event';
import React, { useState } from 'react';
import { act, render, screen, within } from 'src/__tests__/utils/render';
import {
  mockTableRowHeight,
  mockTableViewportHeight,
} from 'src/__tests__/utils/table-viewport';

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

describe('DataTable virtualization', () => {
  const MANY: File[] = Array.from({ length: 30 }, (_, i) => ({
    id: `f${i}`,
    name: `file-${i}.csv`,
  }));
  // jsdom has no layout: an 800px viewport over 100px rows.
  let spies: jest.SpyInstance[] = [];
  beforeEach(() => {
    spies = [mockTableViewportHeight(800), mockTableRowHeight(100)];
  });
  afterEach(() => spies.forEach(spy => spy.mockRestore()));

  const bodyRows = () => Array.from(table().querySelectorAll('tbody > tr'));
  const dataRows = () =>
    bodyRows().filter(row => !row.hasAttribute('aria-hidden'));

  it('mounts only the rows near the viewport, with the totals for assistive tech', async () => {
    // Mounted with its data, the case where a viewport ref isn't attached yet.
    await setup(
      <DataTable
        label='Files'
        data={MANY}
        columns={COLUMNS}
        getRowId={getRowId}
        virtualize
      />,
    );
    // 8 rows fill the viewport, and 8 more are mounted below it.
    const rows = dataRows();
    expect(rows).toHaveLength(16);
    expect(rows[0]).toHaveAttribute('aria-rowindex', '2');
    expect(table()).toHaveAttribute('aria-rowcount', '31');
    // The other 14 rows are one spacer, hidden from assistive tech.
    const spacer = bodyRows().at(-1)!;
    expect(spacer).toHaveAttribute('aria-hidden', 'true');
    expect(spacer.firstElementChild).toHaveStyle({ height: '1400px' });
  });

  it('keeps zebra stripes in step with each row as the window moves', async () => {
    await setup(
      <DataTable
        label='Files'
        data={MANY}
        columns={COLUMNS}
        getRowId={getRowId}
        virtualize
      />,
    );
    const viewport = table().parentElement!;
    // Windows starting at an odd row (7), then an even one (8).
    for (const [scrollTop, firstIndex] of [
      [1500, 7],
      [1600, 8],
    ]) {
      Object.defineProperty(viewport, 'scrollTop', {
        value: scrollTop,
        configurable: true,
      });
      await act(async () => {
        viewport.dispatchEvent(new Event('scroll'));
        // Past the virtualizer's 150ms "still scrolling" reset.
        await new Promise(resolve => setTimeout(resolve, 200));
      });
      const rows = bodyRows();
      const data = dataRows();
      expect(data[0]).toHaveAttribute('aria-rowindex', String(firstIndex + 2));
      // Stripes are `tr:nth-of-type(even)`: each row's position among the
      // <tr>s must have the parity it has in the full table.
      for (const row of data) {
        const index = Number(row.getAttribute('aria-rowindex')) - 2;
        expect((rows.indexOf(row) + 1) % 2).toBe((index + 1) % 2);
      }
    }
  });

  it('adds nothing without `virtualize`: every row, no spacers or row counts', async () => {
    await setup(
      <DataTable
        label='Files'
        data={MANY}
        columns={COLUMNS}
        getRowId={getRowId}
      />,
    );
    expect(bodyRows()).toHaveLength(30);
    expect(dataRows()).toHaveLength(30);
    expect(table()).not.toHaveAttribute('aria-rowcount');
    expect(bodyRows()[0]).not.toHaveAttribute('aria-rowindex');
    expect(bodyRows()[0]).not.toHaveAttribute('data-index');
    expect(table().parentElement).not.toHaveAttribute('style');
  });
});
