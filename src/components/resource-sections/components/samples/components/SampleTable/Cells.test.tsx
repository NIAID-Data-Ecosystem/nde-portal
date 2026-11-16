import { ChakraProvider } from '@chakra-ui/react';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { system } from 'src/theme';

import { Cell } from './Cells';

/*
The sample tables' adapter over the shared term renderer. How each kind of term
renders is tested with the renderer itself
(src/components/table/data-table/__tests__/cells.test.tsx); this covers what the
adapter adds: every value of a list, and nothing for nothing.
*/

const column = { property: 'any' } as any;

const renderCell = (data: Parameters<typeof Cell.renderCellData>[0]['data']) =>
  render(
    <ChakraProvider value={system}>
      {Cell.renderCellData({ column, data })}
    </ChakraProvider>,
  );

describe('Cell.renderCellData', () => {
  it('renders nothing for an empty list, null or undefined', () => {
    for (const data of [[], null, undefined]) {
      const { container, unmount } = renderCell(data);
      expect(container).toBeEmptyDOMElement();
      unmount();
    }
  });

  it('renders a single value as is', () => {
    renderCell('xyz');
    expect(screen.getByText('Xyz')).toBeInTheDocument();
  });

  it('renders every value of a list, with no "Show More"', () => {
    renderCell([
      'abc',
      { value: 1, unitText: 'kg' },
      { name: 'TermName', url: 'https://example.com' },
      'd',
      'e',
      'f',
      'g',
    ]);
    expect(screen.getByText('Abc')).toBeInTheDocument();
    expect(screen.getByText('1 kgs')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /TermName/ })).toHaveAttribute(
      'href',
      'https://example.com',
    );
    expect(screen.getByText('G')).toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('shows a boolean false as "No" (it showed nothing before)', () => {
    renderCell(false);
    expect(screen.getByText('No')).toBeInTheDocument();
  });
});
