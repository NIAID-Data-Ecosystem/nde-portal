import React from 'react';
import { render, screen, waitFor, within } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useRouter } from 'next/router';
import { useLocalStorage } from 'usehooks-ts';
import { OntologyBrowser } from './ontology-browser';
import {
  fetchLineageFromBioThingsAPI,
  fetchPortalCounts,
} from '../utils/api-helpers';
import userEvent from '@testing-library/user-event';
import { DEFAULT_ONTOLOGY_BROWSER_SETTINGS } from './settings';
import { ChakraProvider } from '@chakra-ui/react';
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
      <ChakraProvider>{children}</ChakraProvider>
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
      expect(screen.getByText('root')).toBeInTheDocument();
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
      expect(screen.getByText('root')).toBeInTheDocument();
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
      expect(screen.getByText('root')).toBeInTheDocument();
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
