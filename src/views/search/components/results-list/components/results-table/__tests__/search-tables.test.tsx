import userEvent from '@testing-library/user-event';
import mockRouter from 'next-router-mock';
import React from 'react';
import {
  act,
  render,
  screen,
  waitFor,
  within,
} from 'src/__tests__/utils/render';
import { FormattedResource } from 'src/utils/api/types';

import type { SearchTable } from '../create-search-table';
import { SEARCH_TABLES } from '../tables';

/*
The contract every Search table on the shared DataTable keeps, run against each
entry of SEARCH_TABLES: column defaults, server sort mapping, the "No data"
placeholder, the legacy preference migration, and the customizer's options.
A table's own cells are tested in its own file (e.g. datasets.test.tsx).
*/

/**
 * Columns a record with only an `_id` still fills (e.g. an identifier derived
 * from it), by tab id. Every other column shows "No data" for such a record.
 */
const FILLED_FROM_ID: Record<string, string[]> = {
  // Derived from `_id` when the record has no identifier of its own.
  s: ['identifier'],
};

const RECORD = {
  _id: 'r-1',
  id: 'r-1',
  '@type': 'Dataset',
  name: 'A record',
} as unknown as FormattedResource;
const EMPTY_RECORD = {
  _id: 'r-2',
  id: 'r-2',
  '@type': 'Dataset',
} as unknown as FormattedResource;

describe.each(Object.entries(SEARCH_TABLES) as [string, SearchTable][])(
  'Search table "%s"',
  (tabId, { Table, ColumnCustomizer, columns, config }) => {
    const storageKey = `nde:table:${config.tableId}:v1`;
    const allIds = columns.map(c => c.id);
    const requiredIds = columns
      .filter(c => c.hideable === false)
      .map(c => c.id);
    const defaultIds = [
      ...requiredIds,
      ...columns
        .filter(c => c.hideable !== false && c.defaultVisible !== false)
        .map(c => c.id),
    ];
    const headerOf = (id: string) => columns.find(c => c.id === id)!.header;
    const sortable = config.columns.filter(c => c.apiSortField);

    const showAllColumns = () =>
      window.localStorage.setItem(
        storageKey,
        JSON.stringify({ v: 1, visible: allIds, order: allIds }),
      );

    const setup = async (
      props: Partial<React.ComponentProps<typeof Table>> = {},
      { withCustomizer = false } = {},
    ) => {
      const user = userEvent.setup();
      const onSortChange = jest.fn();
      const view = render(
        <>
          {withCustomizer && <ColumnCustomizer />}
          <Table
            results={[RECORD]}
            loading={false}
            onSortChange={onSortChange}
            {...props}
          />
        </>,
      );
      await act(async () => {});
      return { user, onSortChange, ...view };
    };

    const table = () => screen.getByRole('table', { name: config.label });
    const headers = () => within(table()).getAllByRole('columnheader');
    const headerTitles = () => headers().map(th => th.textContent);
    const header = (id: string) =>
      headers().find(th => th.textContent === headerOf(id))!;
    const sortButton = (id: string) =>
      within(header(id)).getByRole('button', { name: headerOf(id) });

    beforeEach(() => {
      window.localStorage.clear();
      mockRouter.setCurrentUrl(`/search?q=flu&tab=${tabId}`);
    });

    it('shows its default columns, required ones first', async () => {
      await setup();
      expect(headerTitles()).toEqual(defaultIds.map(headerOf));
    });

    it('offers a sort button only where the API can sort', async () => {
      showAllColumns();
      await setup();
      const withButton = headers()
        .filter(th => within(th).queryByRole('button'))
        .map(th => th.textContent);
      expect(withButton).toEqual(
        columns.filter(c => c.sort).map(c => c.header),
      );
      expect(withButton).toEqual(sortable.map(c => c.header));
    });

    it('reports a header click as its API field, newest/largest first for dates and numbers', async () => {
      showAllColumns();
      const { user, onSortChange } = await setup();
      for (const column of sortable) {
        await user.click(sortButton(column.id));
        const descFirst = column.type === 'date' || column.type === 'number';
        expect(onSortChange).toHaveBeenLastCalledWith(
          column.apiSortField,
          !descFirst,
        );
      }
    });

    it('shows the current API sort on its column and flips it on click', async () => {
      showAllColumns();
      for (const column of sortable) {
        const { user, onSortChange, unmount } = await setup({
          currentSort: `-${column.apiSortField}`,
        });
        expect(header(column.id)).toHaveAttribute('aria-sort', 'descending');
        await user.click(sortButton(column.id));
        expect(onSortChange).toHaveBeenLastCalledWith(
          column.apiSortField,
          true,
        );
        unmount();
      }
    });

    it('marks no column as sorted for "Best match"', async () => {
      await setup({ currentSort: '_score' });
      headers().forEach(th => expect(th).not.toHaveAttribute('aria-sort'));
    });

    it('shows "No data" in every column a record has no value for', async () => {
      showAllColumns();
      await setup({ results: [EMPTY_RECORD] });
      const row = within(table()).getAllByRole('row')[1];
      const filled = FILLED_FROM_ID[tabId] ?? [];
      expect(within(row).getAllByText('No data')).toHaveLength(
        allIds.length - filled.length,
      );
    });

    it('shows skeleton rows while the first results load', async () => {
      await setup({ results: [], loading: true });
      expect(table()).toHaveAttribute('aria-busy', 'true');
      expect(screen.queryByText('No results')).not.toBeInTheDocument();
    });

    describe('legacy preferences', () => {
      it('migrates the visible and order keys the old popover wrote', async () => {
        const hideable = allIds.filter(id => !requiredIds.includes(id));
        const visible = hideable.slice(0, 2);
        const order = [...allIds].reverse();
        window.localStorage.setItem(
          config.legacyKeys.visible,
          JSON.stringify(visible),
        );
        window.localStorage.setItem(
          config.legacyKeys.order,
          JSON.stringify(order),
        );
        await setup();
        expect(headerTitles()).toEqual(
          [
            ...requiredIds,
            ...order.filter(
              id => visible.includes(id) && !requiredIds.includes(id),
            ),
          ].map(headerOf),
        );
      });

      it.each([
        ['an empty', '[]'],
        ['an unreadable', 'not json'],
      ])('shows the defaults for %s stored selection', async (_, stored) => {
        window.localStorage.setItem(config.legacyKeys.visible, stored);
        await setup();
        expect(headerTitles()).toEqual(defaultIds.map(headerOf));
      });

      (requiredIds.length > 0 ? it : it.skip)(
        'keeps required columns visible and first',
        async () => {
          const hideable = allIds.filter(id => !requiredIds.includes(id));
          window.localStorage.setItem(
            config.legacyKeys.visible,
            JSON.stringify([hideable[0]]),
          );
          await setup();
          expect(headerTitles()).toEqual(
            [...requiredIds, hideable[0]].map(headerOf),
          );
        },
      );
    });

    describe('customizer', () => {
      const openCustomizer = async (
        user: ReturnType<typeof userEvent.setup>,
      ) => {
        await user.click(
          screen.getByRole('button', { name: /customize columns/i }),
        );
        return screen.findByRole('dialog', { name: 'Customize Columns' });
      };

      it('reorders columns and shares its state with the table', async () => {
        const { user } = await setup({}, { withCustomizer: true });
        const dialog = await openCustomizer(user);
        // A column that's shown, so unchecking it hides it.
        const first = defaultIds.find(id => !requiredIds.includes(id))!;
        expect(
          within(dialog).getByRole('button', {
            name: `Reorder ${headerOf(first)}`,
          }),
        ).toBeInTheDocument();

        await user.click(within(dialog).getByText(headerOf(first)));
        await waitFor(() =>
          expect(headerTitles()).not.toContain(headerOf(first)),
        );
      });

      it('offers "Pin first column", off until turned on', async () => {
        const { user } = await setup({}, { withCustomizer: true });
        const root = () => table().closest('.nde-data-table')!;
        expect(root()).not.toHaveAttribute('data-pinned');

        const dialog = await openCustomizer(user);
        await user.click(within(dialog).getByText('Pin first column'));
        await waitFor(() => expect(root()).toHaveAttribute('data-pinned'));
        expect(JSON.parse(window.localStorage.getItem(storageKey)!)).toEqual(
          expect.objectContaining({ pinned: true }),
        );
      });
    });
  },
);
