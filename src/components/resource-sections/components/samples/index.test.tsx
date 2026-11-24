import React from 'react';
import { act, render, screen, within } from 'src/__tests__/utils/render';

import { SamplesDisplay } from '.';

// The collection table fetches its samples; it has its own tests.
jest.mock('./components/SampleCollectionsTable', () => ({
  SampleCollectionItemsTable: ({
    parentIdentifier,
  }: {
    parentIdentifier: string;
  }) => (
    <div data-testid='sample-collection-items-table'>
      {`Collection items for: ${parentIdentifier}`}
    </div>
  ),
}));

const renderDisplay = async (
  props: React.ComponentProps<typeof SamplesDisplay>,
) => {
  const result = render(<SamplesDisplay {...props} />);
  await act(async () => {});
  return result;
};

describe('SamplesDisplay', () => {
  it.each([null, undefined])(
    'renders nothing when sample is %s',
    async value => {
      const { container } = await renderDisplay({ sample: value });
      expect(container).toBeEmptyDOMElement();
    },
  );

  it('renders nothing when sample type is missing', async () => {
    const { container } = await renderDisplay({
      sample: { '@type': null } as any,
    });
    expect(container).toBeEmptyDOMElement();
  });

  it("shows a Sample's properties in a one-row table, a column per property with a value", async () => {
    await renderDisplay({
      sample: {
        '@type': 'Sample',
        cellType: [
          { name: 'natural killer cell', url: 'https://example.com/nk' },
        ],
        sex: 'female',
        species: [],
      } as any,
    });

    const table = screen.getByRole('table', { name: 'Sample properties' });
    expect(
      within(table)
        .getAllByRole('columnheader')
        .map(header => header.textContent),
    ).toEqual(['Cell Type', 'Sex']);
    const rows = within(table).getAllByRole('row').slice(1);
    expect(rows.map(row => row.textContent)).toEqual([
      'Natural killer cellFemale',
    ]);
    expect(
      within(table).getByRole('link', { name: /Natural killer cell/ }),
    ).toHaveAttribute('href', 'https://example.com/nk');
    expect(
      screen.queryByTestId('sample-collection-items-table'),
    ).not.toBeInTheDocument();
  });

  it('renders SampleCollectionItemsTable when @type is SampleCollection', async () => {
    await renderDisplay({
      sample: {
        '@type': 'SampleCollection',
        identifier: 'my-collection-id',
      } as any,
    });

    expect(
      screen.getByTestId('sample-collection-items-table'),
    ).toHaveTextContent('Collection items for: my-collection-id');
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });

  it('falls back to resourceIdentifier when sample has no identifier', async () => {
    await renderDisplay({
      sample: { '@type': 'SampleCollection' } as any,
      resourceIdentifier: 'fallback-id',
    });

    expect(
      screen.getByTestId('sample-collection-items-table'),
    ).toHaveTextContent('Collection items for: fallback-id');
  });
});
