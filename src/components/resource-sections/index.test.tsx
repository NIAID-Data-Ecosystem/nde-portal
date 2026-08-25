import '@testing-library/jest-dom';

import { ChakraProvider } from '@chakra-ui/react';
import { render, screen, within } from '@testing-library/react';
import React from 'react';
import { system } from 'src/theme';

import Sections from '.';
import { Route } from './helpers';

// Everything below is either exercised by its own test or irrelevant to the
// section-routing logic under test here. AboutResource, DescriptionSection,
// ExampleOfWorkDisplay and the based-on components are left real so the data
// handed to them is asserted through what they render.
jest.mock('./components', () => ({
  ResourceHeader: () => null,
  ResourceBanner: () => null,
  ResourceAuthors: () => null,
  ResourceOverview: () => <div data-testid='resource-overview' />,
  ResourceProvenance: () => null,
  ResourceCitations: () => null,
  Section: ({
    id,
    name,
    children,
  }: {
    id: string;
    name: string;
    children: React.ReactNode;
  }) => (
    <section data-testid={`section-${id}`}>
      <h2>{name}</h2>
      {children}
    </section>
  ),
}));

jest.mock('./components/summary', () => ({ Summary: () => null }));
jest.mock('./components/sidebar/components/external', () => ({
  ExternalAccess: () => null,
  UsageInfo: () => null,
}));
jest.mock(
  './components/sidebar/components/external/components/credit-text',
  () => ({ CreditText: () => null }),
);
jest.mock('./components/samples', () => ({ SamplesDisplay: () => null }));
jest.mock('./components/files-table', () => ({
  __esModule: true,
  default: () => null,
}));
jest.mock('./components/cited-by-table', () => ({ CitedByTable: () => null }));
jest.mock('./components/funding', () => ({ Funding: () => null }));
jest.mock('./components/related-resources', () => ({
  RelatedResources: () => null,
}));
jest.mock('../json-viewer', () => ({ JsonViewer: () => null }));
jest.mock('../download-metadata', () => ({ DownloadMetadata: () => null }));
jest.mock('src/components/metadata-completeness-badge/Circular', () => ({
  CompletenessBadgeCircle: () => null,
}));

const makeSection = (overrides: Partial<Route>): Route =>
  ({
    title: 'Section',
    hash: 'overview',
    properties: [],
    ui: { isCollapsible: true, showInNavigation: true, showEmptyState: true },
    ...overrides,
  } as Route);

const renderSections = (
  data: Record<string, unknown>,
  sections: Route[] = [],
) =>
  render(
    <ChakraProvider value={system}>
      <Sections loading={false} data={data as any} sections={sections} />
    </ChakraProvider>,
  );

describe('Sections', () => {
  describe('DataCollection description block', () => {
    it('renders the description above the sections for a DataCollection', () => {
      renderSections({
        '@type': 'DataCollection',
        description: 'How this collection is put together.',
      });

      expect(screen.getByText('Description')).toBeInTheDocument();
      expect(
        screen.getByText('How this collection is put together.'),
      ).toBeInTheDocument();
    });

    it('does not render the standalone description block for other types', () => {
      renderSections({
        '@type': 'Dataset',
        description: 'A dataset description.',
      });

      expect(screen.queryByText('Description')).not.toBeInTheDocument();
      expect(
        screen.queryByText('A dataset description.'),
      ).not.toBeInTheDocument();
    });

    it('renders an action process card per isBasedOn Action', () => {
      renderSections({
        '@type': 'DataCollection',
        description: 'How this collection is put together.',
        isBasedOn: [
          {
            '@type': 'Action',
            name: 'Curation workflow',
            description: 'Records were curated by hand.',
          },
          {
            '@type': 'Action',
            name: 'Automated sweep',
            description: 'Records were pulled nightly.',
          },
        ],
      });

      expect(screen.getByText('Curation workflow')).toBeInTheDocument();
      expect(screen.getByText('Automated sweep')).toBeInTheDocument();
    });

    it('does not render action process cards for non-Action isBasedOn entries', () => {
      renderSections({
        '@type': 'DataCollection',
        description: 'How this collection is put together.',
        isBasedOn: [{ '@type': 'Dataset', name: 'Source dataset' }],
      });

      expect(screen.queryByText('Source dataset')).not.toBeInTheDocument();
    });
  });

  describe('description section', () => {
    it('renders the description and abstract for non-DataCollection types', () => {
      renderSections(
        {
          '@type': 'Dataset',
          description: 'A description.',
          abstract: 'An abstract.',
        },
        [makeSection({ title: 'Description', hash: 'description' })],
      );

      const section = screen.getByTestId('section-description');
      expect(within(section).getByText('A description.')).toBeInTheDocument();
      expect(within(section).getByText('Abstract:')).toBeInTheDocument();
    });

    it('leaves the description section empty for a DataCollection', () => {
      // The description is rendered once, in the block above the sections.
      renderSections(
        { '@type': 'DataCollection', description: 'A description.' },
        [makeSection({ title: 'Description', hash: 'description' })],
      );

      const section = screen.getByTestId('section-description');
      expect(
        within(section).queryByText('A description.'),
      ).not.toBeInTheDocument();
    });
  });

  describe('isBasedOn section', () => {
    it('lists only non-Action entries in the based-on table', () => {
      renderSections(
        {
          '@type': 'DataCollection',
          isBasedOn: [
            { '@type': 'Action', name: 'Curation workflow', description: 'x' },
            { '@type': 'Dataset', name: 'Source dataset' },
          ],
        },
        [makeSection({ title: 'Based On', hash: 'isBasedOn' })],
      );

      const section = screen.getByTestId('section-isBasedOn');
      expect(within(section).getByText('Source dataset')).toBeInTheDocument();
      expect(
        within(section).queryByText('Curation workflow'),
      ).not.toBeInTheDocument();
    });
  });

  describe('exampleOfWork section', () => {
    it('renders the example of work details', () => {
      renderSections(
        {
          '@type': 'DataCollection',
          exampleOfWork: {
            schemaVersion: 'https://example.com/v1',
            encodingFormat: { name: 'JSON' },
          },
        },
        [makeSection({ title: 'Example of Work', hash: 'exampleOfWork' })],
      );

      const section = screen.getByTestId('section-exampleOfWork');
      expect(within(section).getByText('Schema version')).toBeInTheDocument();
      expect(within(section).getByText('JSON')).toBeInTheDocument();
    });

    it('renders an empty section when there is no exampleOfWork', () => {
      renderSections({ '@type': 'DataCollection' }, [
        makeSection({ title: 'Example of Work', hash: 'exampleOfWork' }),
      ]);

      expect(screen.queryByText('Schema version')).not.toBeInTheDocument();
    });
  });

  describe('samples section naming', () => {
    it.each([
      ['Sample', 'Population Sample'],
      ['SampleCollection', 'Experimental Samples'],
    ])('names the section "%s" as "%s"', (sampleType, expectedName) => {
      renderSections({ '@type': 'Dataset', sample: { '@type': sampleType } }, [
        makeSection({ title: 'Samples', hash: 'samples' }),
      ]);

      expect(
        screen.getByRole('heading', { name: expectedName }),
      ).toBeInTheDocument();
    });

    it('falls back to the configured title for an unrecognized sample type', () => {
      renderSections({ '@type': 'Dataset', sample: { '@type': 'Other' } }, [
        makeSection({ title: 'Samples', hash: 'samples' }),
      ]);

      expect(
        screen.getByRole('heading', { name: 'Samples' }),
      ).toBeInTheDocument();
    });

    it('uses the configured title for every other section', () => {
      renderSections({ '@type': 'Dataset' }, [
        makeSection({ title: 'Overview', hash: 'overview' }),
      ]);

      expect(
        screen.getByRole('heading', { name: 'Overview' }),
      ).toBeInTheDocument();
    });
  });

  describe('overview section', () => {
    it('renders the About block alongside the resource overview', () => {
      renderSections(
        {
          '@type': 'DataCollection',
          genre: 'Epidemiology',
          about: [{ displayName: 'Genomic', name: 'genomic' }],
        },
        [makeSection({ title: 'Overview', hash: 'overview' })],
      );

      const section = screen.getByTestId('section-overview');
      expect(within(section).getByText('Research Domain')).toBeInTheDocument();
      expect(within(section).getByText('Content Types')).toBeInTheDocument();
      expect(
        within(section).getByTestId('resource-overview'),
      ).toBeInTheDocument();
    });
  });
});
