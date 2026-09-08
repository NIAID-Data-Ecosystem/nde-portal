import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { FilterTermType } from '../../../types';
import { CollectionSizeFilter } from '../../../components/collection-size-filter';

// The bounds hook fires its own probes; the component is tested against fixed
// bounds instead.
jest.mock(
  '../../../components/collection-size-filter/hooks/useCollectionSizeBounds',
  () => ({
    useCollectionSizeBounds: jest.fn(() => ({
      data: { min: 0, max: 1000 },
      isLoading: false,
    })),
  }),
);

const { useCollectionSizeBounds } = jest.requireMock(
  '../../../components/collection-size-filter/hooks/useCollectionSizeBounds',
);

const UNIT_FIELD = 'collectionSize.unitText';
const RANGE_FIELD = 'collectionSize.minValue';

const TERMS: FilterTermType[] = [
  { term: '_exists_', label: 'Any', count: 900 },
  { term: 'Genomes', label: 'Genomes', count: 500 },
  { term: 'Assays', label: 'Assays', count: 30 },
  { term: 'assays', label: 'Assays', count: 12 },
];

const setup = (
  props?: Partial<React.ComponentProps<typeof CollectionSizeFilter>>,
) => {
  const onApply = jest.fn();
  render(
    <CollectionSizeFilter
      colorScheme='secondary'
      terms={TERMS}
      selectedUnits={[]}
      selectedRange={[]}
      isLoading={false}
      queryParams={{ q: '__all__', extra_filter: '' }}
      enabled={true}
      onApply={onApply}
      {...props}
    />,
  );
  return { onApply };
};

describe('CollectionSizeFilter', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useCollectionSizeBounds.mockReturnValue({
      data: { min: 0, max: 1000 },
      isLoading: false,
    });
  });

  it('shows the applied unit and range', () => {
    setup({
      selectedUnits: ['Assays', 'assays'],
      selectedRange: ['100', '900'],
    });

    expect(screen.getByRole('combobox')).toHaveValue('Assays');
    expect(screen.getByLabelText(/minimum collection size/i)).toHaveValue(100);
    expect(screen.getByLabelText(/maximum collection size/i)).toHaveValue(900);
  });

  it('reads an open end as a blank input', () => {
    setup({ selectedRange: ['100', '*'] });

    expect(screen.getByLabelText(/minimum collection size/i)).toHaveValue(100);
    expect(screen.getByLabelText(/maximum collection size/i)).toHaveValue(null);
  });

  // Both keys go out in one patch, or the second route push would drop the
  // first.
  it('applies every spelling of a chosen unit in a single update', () => {
    const { onApply } = setup();

    fireEvent.click(screen.getByRole('combobox'));
    fireEvent.click(screen.getByText('Assays'));

    expect(onApply).toHaveBeenCalledTimes(1);
    expect(onApply).toHaveBeenCalledWith({
      [UNIT_FIELD]: ['Assays', 'assays'],
      [RANGE_FIELD]: [],
    });
  });

  it('keeps the applied range when the unit changes', () => {
    const { onApply } = setup({ selectedRange: ['100', '900'] });

    fireEvent.click(screen.getByRole('combobox'));
    fireEvent.click(screen.getByText('Genomes'));

    expect(onApply).toHaveBeenCalledWith({
      [UNIT_FIELD]: ['Genomes'],
      [RANGE_FIELD]: ['100', '900'],
    });
  });

  it('keeps the applied unit when the range is applied', () => {
    const { onApply } = setup({ selectedUnits: ['Genomes'] });

    fireEvent.change(screen.getByLabelText(/minimum collection size/i), {
      target: { value: '150' },
    });
    fireEvent.click(screen.getByRole('button', { name: /apply/i }));

    expect(onApply).toHaveBeenCalledTimes(1);
    expect(onApply).toHaveBeenCalledWith({
      [UNIT_FIELD]: ['Genomes'],
      [RANGE_FIELD]: ['150', '*'],
    });
  });

  // Route updates are shallow and land a render or two later, so props still
  // describe the pre-update state right after a selection. A patch built from
  // them would clear the unit the user just picked, since every patch writes
  // both keys.
  it('keeps a just-picked unit when the range is applied before props catch up', () => {
    const { onApply } = setup();

    fireEvent.click(screen.getByRole('combobox'));
    fireEvent.click(screen.getByText('Assays'));

    fireEvent.change(screen.getByLabelText(/minimum collection size/i), {
      target: { value: '150' },
    });
    fireEvent.click(screen.getByRole('button', { name: /apply/i }));

    expect(onApply).toHaveBeenLastCalledWith({
      [UNIT_FIELD]: ['Assays', 'assays'],
      [RANGE_FIELD]: ['150', '*'],
    });
  });

  // Same window in the other direction.
  it('keeps a just-applied range when a unit is picked before props catch up', () => {
    const { onApply } = setup();

    fireEvent.change(screen.getByLabelText(/minimum collection size/i), {
      target: { value: '150' },
    });
    fireEvent.click(screen.getByRole('button', { name: /apply/i }));

    fireEvent.click(screen.getByRole('combobox'));
    fireEvent.click(screen.getByText('Genomes'));

    expect(onApply).toHaveBeenLastCalledWith({
      [UNIT_FIELD]: ['Genomes'],
      [RANGE_FIELD]: ['150', '*'],
    });
  });

  it('clamps an out-of-bounds endpoint before applying', () => {
    const { onApply } = setup();

    fireEvent.change(screen.getByLabelText(/maximum collection size/i), {
      target: { value: '99999' },
    });
    fireEvent.click(screen.getByRole('button', { name: /apply/i }));

    expect(onApply).toHaveBeenCalledWith({
      [UNIT_FIELD]: [],
      [RANGE_FIELD]: ['*', '1000'],
    });
  });

  it('clears both keys on reset', () => {
    const { onApply } = setup({
      selectedUnits: ['Genomes'],
      selectedRange: ['100', '900'],
    });

    fireEvent.click(screen.getByRole('button', { name: /reset/i }));

    expect(onApply).toHaveBeenCalledWith({
      [UNIT_FIELD]: [],
      [RANGE_FIELD]: [],
    });
  });

  it('filters the unit list as the user types', () => {
    setup();

    const combobox = screen.getByRole('combobox');
    fireEvent.change(combobox, { target: { value: 'gen' } });

    expect(
      screen.getByRole('option', { name: /genomes/i }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('option', { name: /assays/i }),
    ).not.toBeInTheDocument();
  });

  it('selects the highlighted unit from the keyboard', () => {
    const { onApply } = setup();

    const combobox = screen.getByRole('combobox');
    fireEvent.keyDown(combobox, { key: 'ArrowDown' });
    fireEvent.keyDown(combobox, { key: 'ArrowDown' });
    fireEvent.keyDown(combobox, { key: 'Enter' });

    expect(onApply).toHaveBeenCalledWith({
      [UNIT_FIELD]: ['Genomes'],
      [RANGE_FIELD]: [],
    });
  });

  it('uses plain placeholders while the bounds are loading', () => {
    useCollectionSizeBounds.mockReturnValue({
      data: undefined,
      isLoading: true,
    });
    setup();

    expect(screen.getByLabelText(/minimum collection size/i)).toHaveAttribute(
      'placeholder',
      'Min',
    );
  });

  it('reports when no result carries a collection size', () => {
    setup({ terms: [{ term: '_exists_', label: 'Any', count: 0 }] });

    expect(
      screen.getByText(/no results with collection size information/i),
    ).toBeInTheDocument();
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
  });

  it('renders no controls while the facets load', () => {
    setup({ isLoading: true, terms: [] });

    expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /apply/i }),
    ).not.toBeInTheDocument();
  });
});
