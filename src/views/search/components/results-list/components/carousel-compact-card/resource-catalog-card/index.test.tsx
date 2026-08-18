import React from 'react';
import { render, screen } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import '@testing-library/jest-dom';
import { ResourceCatalogCard } from '.';

const renderWithChakra = (ui: React.ReactElement) =>
  render(<ChakraProvider>{ui}</ChakraProvider>);

const makeData = (overrides: Record<string, unknown> = {}) =>
  ({
    id: 'abc123',
    '@type': 'ResourceCatalog',
    name: 'A resource catalog',
    ...overrides,
  } as any);

describe('ResourceCatalogCard', () => {
  describe('content types', () => {
    it('renders a tag per entry of an about array', () => {
      renderWithChakra(
        <ResourceCatalogCard
          data={makeData({
            about: [{ displayName: 'Genomic' }, { displayName: 'Clinical' }],
          })}
        />,
      );

      expect(screen.getByText('Content Types')).toBeInTheDocument();
      expect(screen.getByText('Genomic')).toBeInTheDocument();
      expect(screen.getByText('Clinical')).toBeInTheDocument();
    });

    it('normalizes a single about object into a list of one', () => {
      // The API can return `about` as a single object rather than an array —
      // mapping it directly used to throw.
      renderWithChakra(
        <ResourceCatalogCard
          data={makeData({ about: { displayName: 'Genomic' } })}
        />,
      );

      expect(screen.getByText('Content Types')).toBeInTheDocument();
      expect(screen.getByText('Genomic')).toBeInTheDocument();
    });

    it('omits the content types block when about is absent', () => {
      renderWithChakra(
        <ResourceCatalogCard data={makeData({ about: null })} />,
      );

      expect(screen.queryByText('Content Types')).not.toBeInTheDocument();
    });

    it('omits the content types block when about is an empty array', () => {
      renderWithChakra(<ResourceCatalogCard data={makeData({ about: [] })} />);

      expect(screen.queryByText('Content Types')).not.toBeInTheDocument();
    });
  });
});
