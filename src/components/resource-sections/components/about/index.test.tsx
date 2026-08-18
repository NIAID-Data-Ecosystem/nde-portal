import React from 'react';
import { render, screen } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import '@testing-library/jest-dom';
import { AboutResource } from '.';

const renderWithChakra = (ui: React.ReactElement) =>
  render(<ChakraProvider>{ui}</ChakraProvider>);

describe('AboutResource', () => {
  it('renders nothing when none of the relevant fields are provided', () => {
    renderWithChakra(<AboutResource isLoading={false} />);

    expect(screen.queryByText('Research Domain')).not.toBeInTheDocument();
    expect(screen.queryByText('Content Types')).not.toBeInTheDocument();
    expect(
      screen.queryByText('Collection Size Details'),
    ).not.toBeInTheDocument();
  });

  describe('Research Domain', () => {
    it('renders genre as a tag linking to search', () => {
      renderWithChakra(<AboutResource genre='IID' isLoading={false} />);

      expect(screen.getByText('Research Domain')).toBeInTheDocument();
      // next/link is stubbed in jest.setup.js so only the pathname survives.
      expect(screen.getByRole('link', { name: /IID/ })).toHaveAttribute(
        'href',
        '/search',
      );
    });

    it('does not render the Research Domain block when genre is absent', () => {
      renderWithChakra(
        <AboutResource
          about={[{ displayName: 'Genomic', name: 'genomic' } as any]}
          isLoading={false}
        />,
      );

      expect(screen.queryByText('Research Domain')).not.toBeInTheDocument();
    });
  });

  describe('Content Types', () => {
    it('renders each entry of an about array', () => {
      renderWithChakra(
        <AboutResource
          about={
            [
              { displayName: 'Genomic', name: 'genomic' },
              { displayName: 'Clinical', name: 'clinical' },
            ] as any
          }
          isLoading={false}
        />,
      );

      expect(screen.getByText('Content Types')).toBeInTheDocument();
      expect(screen.getByText('Genomic')).toBeInTheDocument();
      expect(screen.getByText('Clinical')).toBeInTheDocument();
    });

    it('normalizes a single about object into a list of one', () => {
      // The API can return `about` as a single object rather than an array.
      renderWithChakra(
        <AboutResource
          about={{ displayName: 'Genomic', name: 'genomic' } as any}
          isLoading={false}
        />,
      );

      expect(screen.getByText('Genomic')).toBeInTheDocument();
    });

    it('merges exampleOfWork.about into the same Content Types block', () => {
      renderWithChakra(
        <AboutResource
          about={[{ displayName: 'Genomic', name: 'genomic' } as any]}
          exampleOfWork={
            { about: { displayName: 'Proteomic', name: 'proteomic' } } as any
          }
          isLoading={false}
        />,
      );

      // A single block holds both `about` and `exampleOfWork.about`.
      expect(screen.getAllByText('Content Types')).toHaveLength(1);
      expect(screen.getByText('Genomic')).toBeInTheDocument();
      expect(screen.getByText('Proteomic')).toBeInTheDocument();
    });

    it('renders the Content Types block from exampleOfWork.about alone', () => {
      renderWithChakra(
        <AboutResource
          exampleOfWork={
            { about: [{ displayName: 'Proteomic', name: 'proteomic' }] } as any
          }
          isLoading={false}
        />,
      );

      expect(screen.getByText('Content Types')).toBeInTheDocument();
      expect(screen.getByText('Proteomic')).toBeInTheDocument();
    });

    it('deduplicates entries that resolve to the same name and url', () => {
      renderWithChakra(
        <AboutResource
          about={[{ displayName: 'Genomic', name: 'genomic' } as any]}
          exampleOfWork={
            { about: { displayName: 'Genomic', name: 'genomic' } } as any
          }
          isLoading={false}
        />,
      );

      expect(screen.getAllByText('Genomic')).toHaveLength(1);
    });

    it('deduplicates entries whose underlying names differ but display the same', () => {
      // Deduplication runs on the resolved { name, url }, so two terms that
      // render identically collapse into a single tag rather than producing
      // two visually identical tags with a duplicate React key.
      renderWithChakra(
        <AboutResource
          about={
            [
              { displayName: 'Genomic', name: 'genomic-a' },
              { displayName: 'Genomic', name: 'genomic-b' },
            ] as any
          }
          isLoading={false}
        />,
      );

      expect(screen.getAllByText('Genomic')).toHaveLength(1);
    });

    it('keeps entries that share a name but link to different urls', () => {
      renderWithChakra(
        <AboutResource
          about={
            [
              { displayName: 'Genomic', url: 'https://example.com/a' },
              { displayName: 'Genomic', url: 'https://example.com/b' },
            ] as any
          }
          isLoading={false}
        />,
      );

      expect(screen.getAllByText('Genomic')).toHaveLength(2);
    });

    it('unwraps a nested about object', () => {
      // Some records nest the term one level deeper: about[].about.
      renderWithChakra(
        <AboutResource
          about={
            [
              {
                about: {
                  displayName: 'Nested Term',
                  name: 'nested',
                  url: 'https://example.com/nested',
                },
              },
            ] as any
          }
          isLoading={false}
        />,
      );

      expect(screen.getByRole('link', { name: /Nested Term/ })).toHaveAttribute(
        'href',
        'https://example.com/nested',
      );
    });

    it('keeps every distinct nested about object', () => {
      // The wrappers carry no displayName/name of their own, so deduplicating
      // before unwrapping used to collapse them all into the first entry.
      renderWithChakra(
        <AboutResource
          about={
            [
              { about: { displayName: 'Alpha' } },
              { about: { displayName: 'Beta' } },
            ] as any
          }
          isLoading={false}
        />,
      );

      expect(screen.getByText('Alpha')).toBeInTheDocument();
      expect(screen.getByText('Beta')).toBeInTheDocument();
    });

    it('keeps multiple unnamed entries apart', () => {
      // Both fall back to 'N/A', so the tag key cannot be the name alone.
      renderWithChakra(
        <AboutResource
          about={
            [
              { url: 'https://example.com/a' },
              { url: 'https://example.com/b' },
            ] as any
          }
          isLoading={false}
        />,
      );

      expect(screen.getAllByText('N/A')).toHaveLength(2);
    });

    it('falls back to name when displayName is missing', () => {
      renderWithChakra(
        <AboutResource
          about={[{ name: 'genomic' } as any]}
          isLoading={false}
        />,
      );

      expect(screen.getByText('genomic')).toBeInTheDocument();
    });

    it('falls back to "N/A" when neither displayName nor name is present', () => {
      renderWithChakra(
        <AboutResource
          about={[{ url: 'https://example.com/unknown' } as any]}
          isLoading={false}
        />,
      );

      expect(screen.getByText('N/A')).toBeInTheDocument();
    });

    it('links a content type when it has a url and renders plain text otherwise', () => {
      renderWithChakra(
        <AboutResource
          about={
            [
              {
                displayName: 'Linked',
                name: 'linked',
                url: 'https://example.com/linked',
              },
              { displayName: 'Unlinked', name: 'unlinked' },
            ] as any
          }
          isLoading={false}
        />,
      );

      expect(screen.getByRole('link', { name: /Linked/ })).toHaveAttribute(
        'href',
        'https://example.com/linked',
      );
      expect(screen.getByText('Unlinked')).toBeInTheDocument();
      expect(
        screen.queryByRole('link', { name: /Unlinked/ }),
      ).not.toBeInTheDocument();
    });
  });

  describe('Collection Size Details', () => {
    it('renders the collection size table when collectionSize is provided', () => {
      renderWithChakra(
        <AboutResource
          collectionSize={
            [{ value: 1200, unitText: 'datasets' }, { minValue: 5 }] as any
          }
          isLoading={false}
        />,
      );

      expect(screen.getByText('Collection Size Details')).toBeInTheDocument();
      expect(screen.getByText('1,200')).toBeInTheDocument();
      expect(screen.getByText('datasets')).toBeInTheDocument();
    });

    it('does not render the collection size block when collectionSize is absent', () => {
      renderWithChakra(<AboutResource genre='IID' isLoading={false} />);

      expect(
        screen.queryByText('Collection Size Details'),
      ).not.toBeInTheDocument();
    });
  });
});
