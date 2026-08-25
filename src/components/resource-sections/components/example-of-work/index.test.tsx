import '@testing-library/jest-dom';

import { ChakraProvider } from '@chakra-ui/react';
import { render, screen, within } from '@testing-library/react';
import React from 'react';
import { system } from 'src/theme';

import { ExampleOfWorkDisplay } from '.';

const renderWithChakra = (ui: React.ReactElement) =>
  render(<ChakraProvider value={system}>{ui}</ChakraProvider>);

describe('ExampleOfWorkDisplay', () => {
  it('renders none of the blocks when no displayable fields are provided', () => {
    renderWithChakra(<ExampleOfWorkDisplay />);

    expect(screen.queryByText('Schema version')).not.toBeInTheDocument();
    expect(screen.queryByText('Encoding format')).not.toBeInTheDocument();
    expect(screen.queryByText('Schema properties')).not.toBeInTheDocument();
  });

  describe('schema version', () => {
    it('renders the schema version as an external link', () => {
      renderWithChakra(
        <ExampleOfWorkDisplay schemaVersion='https://example.com/schema/v1' />,
      );

      expect(screen.getByText('Schema version')).toBeInTheDocument();
      expect(
        screen.getByRole('link', { name: /https:\/\/example.com\/schema\/v1/ }),
      ).toHaveAttribute('href', 'https://example.com/schema/v1');
    });
  });

  describe('encoding format', () => {
    it('normalizes a single encodingFormat object', () => {
      renderWithChakra(
        <ExampleOfWorkDisplay
          encodingFormat={{ '@type': 'DefinedTerm', name: 'JSON' }}
        />,
      );

      expect(screen.getByText('Encoding format')).toBeInTheDocument();
      expect(screen.getByText('JSON')).toBeInTheDocument();
    });

    it('renders every entry of an encodingFormat array', () => {
      renderWithChakra(
        <ExampleOfWorkDisplay
          encodingFormat={[
            { '@type': 'DefinedTerm', name: 'JSON' },
            { '@type': 'DefinedTerm', name: 'CSV' },
          ]}
        />,
      );

      expect(screen.getByText('JSON')).toBeInTheDocument();
      expect(screen.getByText('CSV')).toBeInTheDocument();
    });

    it('links a format that has a url and renders plain text otherwise', () => {
      renderWithChakra(
        <ExampleOfWorkDisplay
          encodingFormat={[
            {
              '@type': 'DefinedTerm',
              name: 'JSON',
              url: 'https://example.com/json',
            },
            { '@type': 'DefinedTerm', name: 'CSV' },
          ]}
        />,
      );

      expect(screen.getByRole('link', { name: /JSON/ })).toHaveAttribute(
        'href',
        'https://example.com/json',
      );
      expect(
        screen.queryByRole('link', { name: /CSV/ }),
      ).not.toBeInTheDocument();
      expect(screen.getByText('CSV')).toBeInTheDocument();
    });

    it('does not render the encoding format block when the array is empty', () => {
      renderWithChakra(<ExampleOfWorkDisplay encodingFormat={[]} />);

      expect(screen.queryByText('Encoding format')).not.toBeInTheDocument();
    });
  });

  describe('schema properties', () => {
    it('normalizes a single additionalProperty object into a row', () => {
      renderWithChakra(
        <ExampleOfWorkDisplay
          additionalProperty={{ name: 'Accession', value: 'PRJ123' }}
        />,
      );

      expect(screen.getByText('Schema properties')).toBeInTheDocument();
      expect(screen.getByText('Accession')).toBeInTheDocument();
      expect(screen.getByText('PRJ123')).toBeInTheDocument();
    });

    it('renders a row per additionalProperty', () => {
      renderWithChakra(
        <ExampleOfWorkDisplay
          additionalProperty={[
            { name: 'Accession', value: 'PRJ123' },
            { name: 'Platform', value: 'Illumina' },
          ]}
        />,
      );

      expect(screen.getAllByRole('row')).toHaveLength(2);
      expect(screen.getByText('Illumina')).toBeInTheDocument();
    });

    it('falls back to propertyID when name is missing', () => {
      renderWithChakra(
        <ExampleOfWorkDisplay
          additionalProperty={{ propertyID: 'accession', value: 'PRJ123' }}
        />,
      );

      expect(screen.getByText('accession')).toBeInTheDocument();
    });

    it('falls back to "Unknown property" when neither name nor propertyID is present', () => {
      renderWithChakra(
        <ExampleOfWorkDisplay additionalProperty={{ value: 'PRJ123' }} />,
      );

      expect(screen.getByText('Unknown property')).toBeInTheDocument();
    });

    it('falls back to "Unknown value" when the property has no value', () => {
      renderWithChakra(
        <ExampleOfWorkDisplay additionalProperty={{ name: 'Accession' }} />,
      );

      expect(screen.getByText('Unknown value')).toBeInTheDocument();
    });

    it.each([
      ['https://example.com/record', 'https://example.com/record'],
      ['www.example.com/record', 'www.example.com/record'],
    ])('renders a url-like value (%s) as a link', (value, expectedHref) => {
      renderWithChakra(
        <ExampleOfWorkDisplay additionalProperty={{ name: 'Source', value }} />,
      );

      expect(
        screen.getByRole('link', { name: new RegExp(value) }),
      ).toHaveAttribute('href', expectedHref);
    });

    it('renders a non-url value as plain text', () => {
      renderWithChakra(
        <ExampleOfWorkDisplay
          additionalProperty={{ name: 'Source', value: 'PRJ123' }}
        />,
      );

      expect(screen.getByText('PRJ123')).toBeInTheDocument();
      expect(screen.queryByRole('link')).not.toBeInTheDocument();
    });

    it('makes the overflowing properties table keyboard scrollable', () => {
      // The table routinely overflows its 400px max height and often has no
      // focusable content, so the scroll container itself must be focusable
      // (axe `scrollable-region-focusable`).
      const { container } = renderWithChakra(
        <ExampleOfWorkDisplay
          additionalProperty={{ name: 'Accession', value: 'PRJ123' }}
        />,
      );

      const table = screen.getByRole('table');
      const scrollContainer = container.querySelector('[tabindex="0"]');

      expect(scrollContainer).toBeInTheDocument();
      expect(within(scrollContainer as HTMLElement).getByRole('table')).toBe(
        table,
      );
    });

    it('does not render the schema properties block when the array is empty', () => {
      renderWithChakra(<ExampleOfWorkDisplay additionalProperty={[]} />);

      expect(screen.queryByText('Schema properties')).not.toBeInTheDocument();
    });
  });
});
