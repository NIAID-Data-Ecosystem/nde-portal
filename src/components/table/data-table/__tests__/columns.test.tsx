import React from 'react';
import { render, screen } from 'src/__tests__/utils/render';

import type { ColumnDef } from '../types';
import { resolveColumn, TYPE_DEFAULTS } from '../utils/columns';

type Row = { id: string; count?: number; name?: string; tags?: string[] };

const renderCell = (node: React.ReactNode) =>
  render(<div data-testid='cell'>{node}</div>);

describe('resolveColumn', () => {
  it('derives alignment, sort direction and size from the column type', () => {
    const count = resolveColumn<Row>({
      id: 'count',
      header: 'Count',
      type: 'number',
      sort: true,
    });
    expect(count).toMatchObject({
      align: 'end',
      descFirst: true,
      sortable: true,
      wrap: 'nowrap',
    });
    expect(count.contentStyle).toEqual({
      minWidth: '80px',
      maxWidth: undefined,
    });

    const name = resolveColumn<Row>({ id: 'name', header: 'Name' });
    expect(name).toMatchObject({
      type: 'text',
      align: 'start',
      descFirst: false,
      sortable: false,
    });
    expect(name.contentStyle.minWidth).toBe(`${TYPE_DEFAULTS.text.size.min}px`);
  });

  it('lets a column override every default', () => {
    const column = resolveColumn<Row>({
      id: 'count',
      header: 'Count',
      type: 'number',
      align: 'start',
      size: { min: 50, max: 90 },
      sort: { descFirst: false },
      hideable: false,
      defaultVisible: false,
    });
    expect(column).toMatchObject({
      align: 'start',
      descFirst: false,
      hideable: false,
      defaultVisible: false,
    });
    expect(column.contentStyle).toEqual({ minWidth: '50px', maxWidth: '90px' });
  });

  it('reads row[id] by default and uses the accessor when given', () => {
    const byId = resolveColumn<Row>({ id: 'name', header: 'Name' });
    expect(byId.getValue({ id: '1', name: 'x' })).toBe('x');
    const derived = resolveColumn<Row>({
      id: 'upper',
      header: 'Upper',
      accessor: row => row.name?.toUpperCase(),
    });
    expect(derived.getValue({ id: '1', name: 'x' })).toBe('X');
  });

  it('sorts on a custom value when given, else on the value as text/number', () => {
    const custom = resolveColumn<Row>({
      id: 'tags',
      header: 'Tags',
      sort: { value: value => (value as string[])?.length ?? 0 },
    });
    expect(custom.getSortValue({ id: '1', tags: ['a', 'b'] })).toBe(2);
    const plain = resolveColumn<Row>({
      id: 'tags',
      header: 'Tags',
      sort: true,
    });
    expect(plain.getSortValue({ id: '1', tags: ['a', 'b'] })).toBe('a, b');
  });

  it('renders the shared placeholder for missing values, but not for zero', () => {
    const count = resolveColumn<Row>({
      id: 'count',
      header: 'Count',
      type: 'number',
    });
    renderCell(count.renderCell({ id: '1' }));
    expect(screen.getByTestId('cell')).toHaveTextContent('No data');
    expect(screen.getByText('—')).toHaveAttribute('aria-hidden', 'true');
  });

  it('formats numbers with thousands separators, zero included', () => {
    const count = resolveColumn<Row>({
      id: 'count',
      header: 'Count',
      type: 'number',
    });
    const { unmount } = renderCell(count.renderCell({ id: '1', count: 12345 }));
    expect(screen.getByTestId('cell')).toHaveTextContent('12,345');
    unmount();
    renderCell(count.renderCell({ id: '1', count: 0 }));
    expect(screen.getByTestId('cell')).toHaveTextContent(/^0$/);
  });

  it('falls back to the placeholder when a custom cell renders nothing', () => {
    const def: ColumnDef<Row> = {
      id: 'name',
      header: 'Name',
      cell: () => null,
    };
    renderCell(resolveColumn(def).renderCell({ id: '1', name: 'x' }));
    expect(screen.getByTestId('cell')).toHaveTextContent('No data');
  });

  it('passes the value, row and resolved column to a custom cell', () => {
    const cell = jest.fn(({ value }) => <b>{String(value)}</b>);
    const column = resolveColumn<Row>({ id: 'name', header: 'Name', cell });
    renderCell(column.renderCell({ id: '1', name: 'x' }));
    expect(cell).toHaveBeenCalledWith({
      value: 'x',
      row: { id: '1', name: 'x' },
      column,
    });
    expect(screen.getByText('x').tagName).toBe('B');
  });

  it('formats dates as YYYY-MM-DD', () => {
    const date = resolveColumn<{ d: string }>({
      id: 'd',
      header: 'Date',
      type: 'date',
    });
    renderCell(date.renderCell({ d: '2024-03-05T10:00:00Z' }));
    expect(screen.getByTestId('cell')).toHaveTextContent('2024-03-05');
  });

  it('renders internal links client-side and external links in a new tab', () => {
    const link = resolveColumn<{ l: unknown }>({
      id: 'l',
      header: 'Link',
      type: 'link',
    });
    const { unmount } = renderCell(
      link.renderCell({ l: { href: '/sources#x', label: 'X' } }),
    );
    expect(screen.getByRole('link', { name: 'X' })).not.toHaveAttribute(
      'target',
    );
    unmount();
    renderCell(link.renderCell({ l: 'https://example.org' }));
    expect(screen.getByRole('link', { name: /example\.org/ })).toHaveAttribute(
      'target',
      '_blank',
    );
  });

  it('collapses long tag lists behind a "Show N More" toggle', () => {
    const tags = resolveColumn<Row>({
      id: 'tags',
      header: 'Tags',
      type: 'tags',
    });
    const values = Array.from({ length: 14 }, (_, i) => `tag ${i}`);
    renderCell(tags.renderCell({ id: '1', tags: values }));
    expect(screen.getAllByText(/^tag \d+$/)).toHaveLength(12);
    expect(
      screen.getByRole('button', { name: /^Show 2 More\s+Tags$/ }),
    ).toHaveAttribute('aria-expanded', 'false');
  });
});
