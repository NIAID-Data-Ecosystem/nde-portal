import { ChakraProvider } from '@chakra-ui/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/router';
import React from 'react';
import { system } from 'src/theme';
import { useLocalStorage } from 'usehooks-ts';

import {
  fetchLineageFromBioThingsAPI,
  fetchPortalCounts,
} from '../utils/api-helpers';
import { OntologyBrowser } from './ontology-browser';
import { DEFAULT_ONTOLOGY_BROWSER_SETTINGS } from './settings';
import { transformSettingsToLocalStorageConfig } from './settings/helpers';

jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));

jest.mock('usehooks-ts', () => ({
  useLocalStorage: jest.fn(),
}));

jest.mock('../utils/api-helpers', () => ({
  fetchLineageFromBioThingsAPI: jest.fn(),
  fetchPortalCounts: jest.fn(),
}));

describe('OntologyBrowser', () => {
  let queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false, // Disable retry in tests only
      },
    },
  });
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <ChakraProvider value={system}>{children}</ChakraProvider>
    </QueryClientProvider>
  );
  const renderComponent = (props = {}) => {
    return render(
      <OntologyBrowser searchList={[]} setSearchList={jest.fn()} {...props} />,
      { wrapper },
    );
  };
  beforeEach(() => {
    jest.clearAllMocks();
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false, // Disable retry in tests only
        },
      },
    });
    (useRouter as jest.Mock).mockReturnValue({
      query: { id: '1', ontology: 'ncbitaxon', q: '__all__' },
      isReady: true,
    });

    (useLocalStorage as jest.Mock).mockReturnValue([
      DEFAULT_ONTOLOGY_BROWSER_SETTINGS,
    ]);
  });

  it('shows loading spinner, then renders lineage data', async () => {
    (fetchLineageFromBioThingsAPI as jest.Mock).mockResolvedValue({
      lineage: [
        {
          id: '1',
          commonName: '',
          hasChildren: true,
          iri: 'http://purl.obolibrary.org/obo/NCBITaxon_1',
          label: 'root',
          ontologyName: 'ncbitaxon',
          parentTaxonId: null,
          rank: 'no rank',
          state: {
            opened: false,
            selected: true,
          },
          taxonId: '1',
        },
      ],
    });

    (fetchPortalCounts as jest.Mock).mockResolvedValue([
      {
        id: '1',
        commonName: '',
        hasChildren: true,
        iri: 'http://purl.obolibrary.org/obo/NCBITaxon_1',
        label: 'root',
        ontologyName: 'ncbitaxon',
        parentTaxonId: null,
        rank: 'no rank',
        state: {
          opened: false,
          selected: true,
        },
        taxonId: '1',
        counts: {
          termCount: 0,
          termAndChildrenCount: 30,
        },
      },
    ]);
    renderComponent({
      searchList: [],
      setSearchList: jest.fn(),
    });

    expect(screen.getByText('Loading...')).toBeInTheDocument();
    await waitFor(() => {
      expect(fetchLineageFromBioThingsAPI).toHaveBeenCalled();
      expect(fetchPortalCounts).toHaveBeenCalled();
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
      // expect(screen.getByText('root')).toBeInTheDocument();
    });
  });

  it('renders error message on API failure', async () => {
    (fetchLineageFromBioThingsAPI as jest.Mock).mockRejectedValueOnce(
      new Error('API Error'),
    );

    renderComponent({
      searchList: [],
      setSearchList: jest.fn(),
    });

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('API Error');
    });
  });

  it('adds a node from the search list when clicked', async () => {
    const setSearchListMock = jest.fn();
    const mockData = {
      id: '1',
      commonName: '',
      hasChildren: true,
      iri: 'http://purl.obolibrary.org/obo/NCBITaxon_1',
      label: 'root',
      ontologyName: 'ncbitaxon',
      parentTaxonId: null,
      state: {
        opened: false,
        selected: true,
      },
      taxonId: '1',
    };

    // Mock the API response
    (fetchLineageFromBioThingsAPI as jest.Mock).mockResolvedValue({
      lineage: [mockData],
    });

    (fetchPortalCounts as jest.Mock).mockResolvedValue([
      {
        ...mockData,
        counts: {
          termCount: 0,
          termAndChildrenCount: 30,
        },
      },
    ]);

    renderComponent({
      searchList: [],
      setSearchList: setSearchListMock,
    });

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getAllByText('root')[0]).toBeInTheDocument();
    });

    const list = screen.getByRole('list');
    const firstItem = within(list).getAllByRole('listitem')[0];
    expect(firstItem).toBeInTheDocument();
    // Simulate adding the node to the search list.

    const searchButton = within(firstItem).getByRole('button', {
      name: /Search portal for resources related to/i,
    });
    expect(searchButton).toBeInTheDocument();

    await userEvent.click(searchButton);
    expect(setSearchListMock).toHaveBeenCalled();

    expect(setSearchListMock).toHaveBeenCalledWith(expect.any(Function));

    const updater = setSearchListMock.mock.calls[0][0];
    const result = updater([]);

    expect(result).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          counts: {
            termCount: 0,
            termAndChildrenCount: 30,
          },
          label: mockData.label,
          ontologyName: mockData.ontologyName,
          taxonId: mockData.taxonId,
        }),
      ]),
    );
  });
  it('removes a node from the search list when clicked', async () => {
    const setSearchListMock = jest.fn();
    const mockData = {
      id: '1',
      commonName: '',
      hasChildren: true,
      iri: 'http://purl.obolibrary.org/obo/NCBITaxon_1',
      label: 'root',
      ontologyName: 'ncbitaxon',
      parentTaxonId: null,
      state: {
        opened: false,
        selected: true,
      },
      taxonId: '1',
    };

    // Mock the API response
    (fetchLineageFromBioThingsAPI as jest.Mock).mockResolvedValue({
      lineage: [mockData],
    });

    (fetchPortalCounts as jest.Mock).mockResolvedValue([
      {
        ...mockData,
        counts: {
          termCount: 0,
          termAndChildrenCount: 30,
        },
      },
    ]);

    renderComponent({
      searchList: [
        {
          counts: {
            termCount: 0,
            termAndChildrenCount: 30,
          },
          label: mockData.label,
          ontologyName: mockData.ontologyName,
          taxonId: mockData.taxonId,
        },
      ],
      setSearchList: setSearchListMock,
    });

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getAllByText('root')[0]).toBeInTheDocument();
    });

    const list = screen.getByRole('list');
    const firstItem = within(list).getAllByRole('listitem')[0];
    expect(firstItem).toBeInTheDocument();
    // Simulate adding the node to the search list.

    const searchButton = within(firstItem).getByRole('button', {
      name: /Remove root from search list/i,
    });
    expect(searchButton).toBeInTheDocument();

    await userEvent.click(searchButton);
    expect(setSearchListMock).toHaveBeenCalled();

    expect(setSearchListMock).toHaveBeenCalledWith(expect.any(Function));

    const updater = setSearchListMock.mock.calls[0][0];
    const result = updater([
      {
        counts: {
          termCount: 0,
          termAndChildrenCount: 30,
        },
        label: mockData.label,
        ontologyName: mockData.ontologyName,
        taxonId: mockData.taxonId,
      },
    ]);

    expect(result).toEqual([]);
  });

  describe('condensed view', () => {
    /*
    Seven terms, more than the five the browser shows before condensing the
    lineage to its last three.
    */
    const TERMS = [
      ['1', 'root'],
      ['131567', 'cellular organisms'],
      ['2759', 'Eukaryota'],
      ['33154', 'Opisthokonta'],
      ['33208', 'Metazoa'],
      ['6072', 'Eumetazoa'],
      ['33213', 'Bilateria'],
    ];

    const buildLineage = (terms: string[][]) =>
      terms.map(([taxonId, label], index) => ({
        id: taxonId,
        commonName: '',
        hasChildren: true,
        iri: `http://purl.obolibrary.org/obo/NCBITaxon_${taxonId}`,
        label,
        ontologyName: 'ncbitaxon',
        parentTaxonId: index === 0 ? null : terms[index - 1][0],
        state: {
          opened: index < terms.length - 1,
          selected: index === terms.length - 1,
        },
        taxonId,
      }));

    const mockViewSettings = (isCondensed: boolean) =>
      (useLocalStorage as jest.Mock).mockReturnValue([
        transformSettingsToLocalStorageConfig({
          isCondensed: { label: '', value: isCondensed },
          hideEmptyCounts: { label: '', value: false },
        }),
        jest.fn(),
      ]);

    const labels = (nodes: { label: string }[]) => nodes.map(n => n.label);

    beforeEach(() => {
      (fetchLineageFromBioThingsAPI as jest.Mock).mockResolvedValue({
        lineage: buildLineage(TERMS),
      });
      (fetchPortalCounts as jest.Mock).mockImplementation(async nodes =>
        nodes.map((node: object) => ({
          ...node,
          counts: { termCount: 1, termAndChildrenCount: 10 },
        })),
      );
    });

    it('shows the last three terms, with breadcrumbs for the rest', async () => {
      mockViewSettings(true);
      renderComponent();

      await screen.findByRole('link', { name: 'Metazoa' });
      ['Metazoa', 'Eumetazoa', 'Bilateria'].forEach(label =>
        expect(screen.getByRole('link', { name: label })).toBeInTheDocument(),
      );
      ['root', 'cellular organisms', 'Eukaryota', 'Opisthokonta'].forEach(
        label => {
          expect(
            screen.getByRole('button', { name: label }),
          ).toBeInTheDocument();
          expect(
            screen.queryByRole('link', { name: label }),
          ).not.toBeInTheDocument();
        },
      );
    });

    it('fetches counts for the visible terms before the hidden ones', async () => {
      mockViewSettings(true);
      renderComponent();

      await waitFor(() => expect(fetchPortalCounts).toHaveBeenCalledTimes(2));
      const [[visible], [hidden]] = (fetchPortalCounts as jest.Mock).mock.calls;
      expect(labels(visible)).toEqual(['Metazoa', 'Eumetazoa', 'Bilateria']);
      expect(labels(hidden)).toEqual([
        'root',
        'cellular organisms',
        'Eukaryota',
        'Opisthokonta',
      ]);
    });

    it('selects the deepest term once all counts have merged', async () => {
      mockViewSettings(true);
      renderComponent();

      await waitFor(() => expect(fetchPortalCounts).toHaveBeenCalledTimes(2));
      expect(
        screen.getByRole('link', { name: /view ncbi classification/i }),
      ).toHaveAttribute('href', expect.stringMatching(/id=33213$/));
    });

    it('expands the tree from a breadcrumb', async () => {
      const user = userEvent.setup();
      mockViewSettings(true);
      renderComponent();

      await screen.findByRole('link', { name: 'Metazoa' });
      await user.click(screen.getByRole('button', { name: 'Eukaryota' }));

      expect(
        screen.getByRole('link', { name: 'Eukaryota' }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole('link', { name: 'Opisthokonta' }),
      ).toBeInTheDocument();
      expect(
        screen.queryByRole('button', { name: 'Eukaryota' }),
      ).not.toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: 'cellular organisms' }),
      ).toBeInTheDocument();
    });

    it('shows the whole lineage when the condensed view is off', async () => {
      mockViewSettings(false);
      renderComponent();

      expect(
        await screen.findByRole('link', { name: 'root' }),
      ).toBeInTheDocument();
      expect(
        screen.queryByRole('button', { name: 'show parent node' }),
      ).not.toBeInTheDocument();
      expect(fetchPortalCounts).toHaveBeenCalledTimes(1);
      expect(labels((fetchPortalCounts as jest.Mock).mock.calls[0][0])).toEqual(
        labels(buildLineage(TERMS)),
      );
    });

    it('does not condense a lineage of five terms', async () => {
      (fetchLineageFromBioThingsAPI as jest.Mock).mockResolvedValue({
        lineage: buildLineage(TERMS.slice(0, 5)),
      });
      mockViewSettings(true);
      renderComponent();

      expect(
        await screen.findByRole('link', { name: 'root' }),
      ).toBeInTheDocument();
      expect(
        screen.queryByRole('button', { name: 'show parent node' }),
      ).not.toBeInTheDocument();
    });
  });
});

describe('transformSettingsToLocalStorageConfig', () => {
  it('transforms BrowserSettings to a LocalStorageConfig', () => {
    const browserSettings = {
      isCondensed: { label: '', value: true },
      hideEmptyCounts: { label: '', value: false },
    };

    const result = transformSettingsToLocalStorageConfig(browserSettings);

    expect(result).toEqual({
      isCondensed: true,
      hideEmptyCounts: false,
    });
  });
});
