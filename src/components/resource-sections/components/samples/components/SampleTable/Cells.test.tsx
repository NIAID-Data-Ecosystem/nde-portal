import React from 'react';
import { render, screen } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import { Cell, renderValue } from './Cells';
import { formatTerm, formatUnitText, formatNumericValue } from '../../helpers';

// Mock formatting helpers
jest.mock('../../helpers', () => ({
  formatTerm: jest.fn((str: string) => `TERM(${str})`),
  formatUnitText: jest.fn((str: string) => `UNIT(${str})`),
  formatNumericValue: jest.fn(() => 'NUM(…)'),
}));

// Mock Link component for easier assertions
jest.mock('src/components/link', () => ({
  Link: ({ href, children, isExternal, ...rest }: any) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

const renderWithChakra = (ui: React.ReactElement) =>
  render(<ChakraProvider>{ui}</ChakraProvider>);

describe('Cells', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('renderValue', () => {
    it('returns null for null/undefined', () => {
      const { rerender } = renderWithChakra(<>{renderValue(null)}</>);

      expect(screen.queryByRole('link')).not.toBeInTheDocument();
      expect(screen.queryByText(/TERM\(/)).not.toBeInTheDocument();

      rerender(<ChakraProvider>{renderValue(undefined)}</ChakraProvider>);

      expect(screen.queryByRole('link')).not.toBeInTheDocument();
      expect(screen.queryByText(/TERM\(/)).not.toBeInTheDocument();
    });

    it('renders a TextCell for a string and formats it', () => {
      renderWithChakra(<>{renderValue('hello')}</>);

      expect(formatTerm).toHaveBeenCalledWith('hello');
      expect(screen.getByText('TERM(hello)')).toBeInTheDocument();
    });

    it('renders QuantitativeValueCell when value-like fields exist', () => {
      renderWithChakra(
        <>
          {renderValue({
            value: 10,
            unitText: 'years',
          } as any)}
        </>,
      );

      expect(formatNumericValue).toHaveBeenCalledWith({
        value: 10,
        minValue: undefined,
        maxValue: undefined,
      });
      expect(formatUnitText).toHaveBeenCalledWith('years');

      expect(screen.getByText('NUM(…) UNIT(years)')).toBeInTheDocument();
    });

    it('renders DefinedTermCell when term-like fields exist (with link when url exists)', () => {
      renderWithChakra(
        <>
          {renderValue({
            name: 'Influenza',
            identifier: 'ID123',
            url: 'https://example.com',
          } as any)}
        </>,
      );

      // label uses formatTerm(name || identifier || '')
      expect(formatTerm).toHaveBeenCalledWith('Influenza');

      const link = screen.getByRole('link', { name: 'TERM(Influenza)' });
      expect(link).toHaveAttribute('href', 'https://example.com');
    });

    it('renders null when object does not match known shapes', () => {
      renderWithChakra(<>{renderValue({ foo: 'bar' } as any)}</>);

      expect(screen.queryByRole('link')).not.toBeInTheDocument();
      expect(screen.queryByText(/TERM\(/)).not.toBeInTheDocument();
    });

    it('passes key to rendered element', () => {
      renderWithChakra(<>{renderValue('x', 'my-key')}</>);
      expect(screen.getByText('TERM(x)')).toBeInTheDocument();
    });

    it('routes to QuantitativeValueCell when @type is "QuantitativeValue" even with no numeric fields', () => {
      // The explicit @type guard must fire before the DefinedTerm check, so an
      // object like { '@type': 'QuantitativeValue', name: 'many' } is rendered
      // by QuantitativeValueCell (which falls back to name), NOT DefinedTermCell.
      (formatNumericValue as jest.Mock).mockReturnValueOnce('');

      renderWithChakra(
        <>
          {renderValue({ '@type': 'QuantitativeValue', name: 'many' } as any)}
        </>,
      );

      // QuantitativeValueCell name-fallback branch renders the name as plain text
      expect(screen.getByText('many')).toBeInTheDocument();
      // formatTerm must NOT have been called (that would indicate DefinedTermCell)
      expect(formatTerm).not.toHaveBeenCalled();
    });

    it('renders QuantitativeValueCell name-fallback when valueStr is empty and name is present', () => {
      // Cover if (!valueStr && name) return <TextCell>{name}</TextCell>
      (formatNumericValue as jest.Mock).mockReturnValueOnce('');

      renderWithChakra(
        <>
          {renderValue({
            '@type': 'QuantitativeValue',
            name: '42 year',
          } as any)}
        </>,
      );

      expect(screen.getByText('42 year')).toBeInTheDocument();
      expect(formatUnitText).not.toHaveBeenCalled();
    });

    it('renders nothing for a QuantitativeValue with neither numeric fields nor name', () => {
      (formatNumericValue as jest.Mock).mockReturnValueOnce('');

      renderWithChakra(
        <>{renderValue({ '@type': 'QuantitativeValue' } as any)}</>,
      );

      expect(screen.queryByText(/./)).not.toBeInTheDocument();
    });

    it('renders null for non-array null data passed to Cell.renderCellData', () => {
      // Cover Cell.renderCellData with null (non-array) delegating to renderValue
      const column = { property: 'x' } as any;

      renderWithChakra(<>{Cell.renderCellData({ column, data: null })}</>);
      expect(screen.queryByRole('link')).not.toBeInTheDocument();
      expect(screen.queryByText(/TERM\(/)).not.toBeInTheDocument();
    });

    it('renders null for non-array undefined data passed to Cell.renderCellData', () => {
      const column = { property: 'x' } as any;

      renderWithChakra(<>{Cell.renderCellData({ column, data: undefined })}</>);
      expect(screen.queryByRole('link')).not.toBeInTheDocument();
      expect(screen.queryByText(/TERM\(/)).not.toBeInTheDocument();
    });
  });

  describe('Cell.DefinedTerm', () => {
    it('renders link when url exists and label exists', () => {
      renderWithChakra(
        <Cell.DefinedTerm
          name='Foo'
          url='https://example.com'
          identifier='ID'
        />,
      );

      expect(formatTerm).toHaveBeenCalledWith('Foo');

      const link = screen.getByRole('link', { name: 'TERM(Foo)' });
      expect(link).toHaveAttribute('href', 'https://example.com');
    });

    it('renders link when url exists but label is empty (falls back to url text)', () => {
      (formatTerm as jest.Mock).mockReturnValueOnce('');

      renderWithChakra(
        <Cell.DefinedTerm name='' url='https://example.com' identifier='' />,
      );

      const link = screen.getByRole('link', { name: 'https://example.com' });
      expect(link).toHaveAttribute('href', 'https://example.com');
    });

    it('renders TextCell when label exists but url does not', () => {
      renderWithChakra(<Cell.DefinedTerm name='Bar' identifier='ID' />);

      expect(screen.getByText('TERM(Bar)')).toBeInTheDocument();
      expect(screen.queryByRole('link')).not.toBeInTheDocument();
    });

    it('returns null when no label and no url', () => {
      (formatTerm as jest.Mock).mockReturnValueOnce('');

      renderWithChakra(<Cell.DefinedTerm name='' identifier='' />);

      expect(screen.queryByRole('link')).not.toBeInTheDocument();
      expect(screen.queryByText(/TERM\(/)).not.toBeInTheDocument();
    });

    it('renders a link whose text is the url when label is empty and url is present', () => {
      // Cover label = '' (falsy) + url truthy => link text falls back to url itself
      (formatTerm as jest.Mock).mockReturnValueOnce('');

      renderWithChakra(
        <Cell.DefinedTerm name='' url='https://fallback.example.com' />,
      );

      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('href', 'https://fallback.example.com');
      expect(link).toHaveTextContent('https://fallback.example.com');
    });

    it('uses identifier as the label source when name is absent', () => {
      // formatTerm is called with `name || identifier || ''`; verify identifier path
      renderWithChakra(<Cell.DefinedTerm identifier='NCBI:12345' />);

      expect(formatTerm).toHaveBeenCalledWith('NCBI:12345');
      expect(screen.getByText('TERM(NCBI:12345)')).toBeInTheDocument();
    });
  });

  describe('Cell.QuantitativeValue', () => {
    it('renders numeric string only when unitText is missing', () => {
      (formatNumericValue as jest.Mock).mockReturnValueOnce('NUM(123)');

      renderWithChakra(
        <Cell.QuantitativeValue
          value={123}
          minValue={undefined}
          maxValue={undefined}
        />,
      );

      expect(screen.getByText('NUM(123)')).toBeInTheDocument();
      expect(formatUnitText).not.toHaveBeenCalled();
    });

    it('renders numeric + formatted unit when unitText exists', () => {
      (formatNumericValue as jest.Mock).mockReturnValueOnce('NUM(5-10)');
      (formatUnitText as jest.Mock).mockReturnValueOnce('years');

      renderWithChakra(
        <Cell.QuantitativeValue minValue={5} maxValue={10} unitText='years' />,
      );

      expect(screen.getByText('NUM(5-10) years')).toBeInTheDocument();
    });

    it('renders name text when formatNumericValue returns empty string and name exists', () => {
      // Covers if (!valueStr && name) return <TextCell>{name}</TextCell>
      (formatNumericValue as jest.Mock).mockReturnValueOnce('');

      renderWithChakra(<Cell.QuantitativeValue name='42 year' />);

      expect(screen.getByText('42 year')).toBeInTheDocument();
      expect(formatUnitText).not.toHaveBeenCalled();
    });

    it('renders only the numeric string and does not call formatUnitText when unitText is absent', () => {
      (formatNumericValue as jest.Mock).mockReturnValueOnce('500');

      renderWithChakra(<Cell.QuantitativeValue value={500} />);

      expect(screen.getByText('500')).toBeInTheDocument();
      expect(formatUnitText).not.toHaveBeenCalled();
    });
  });

  describe('Cell.renderCellData', () => {
    const column = { property: 'any' } as any;

    it('returns null for empty array', () => {
      renderWithChakra(<>{Cell.renderCellData({ column, data: [] })}</>);
      expect(screen.queryByRole('link')).not.toBeInTheDocument();
      expect(screen.queryByText(/TERM\(/)).not.toBeInTheDocument();
    });

    it('renders a Flex column with mapped values for array data', () => {
      renderWithChakra(
        <>
          {Cell.renderCellData({
            column,
            data: [
              'abc',
              { value: 1, unitText: 'kg' } as any,
              { name: 'TermName', url: 'https://example.com' } as any,
            ],
          })}
        </>,
      );

      expect(screen.getByText('TERM(abc)')).toBeInTheDocument();
      expect(screen.getByText('NUM(…) UNIT(kg)')).toBeInTheDocument();
      expect(
        screen.getByRole('link', { name: 'TERM(TermName)' }),
      ).toHaveAttribute('href', 'https://example.com');
    });

    it('renders a single value when data is not an array', () => {
      renderWithChakra(<>{Cell.renderCellData({ column, data: 'xyz' })}</>);

      expect(screen.getByText('TERM(xyz)')).toBeInTheDocument();
    });
  });
});
