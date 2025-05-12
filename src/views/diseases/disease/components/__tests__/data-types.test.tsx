import { ChakraProvider } from '@chakra-ui/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { fetchSearchResults } from 'src/utils/api';
import { getSearchResultsRoute } from 'src/views/diseases/helpers';
import { useQuery } from '@tanstack/react-query';

import { DataTypes } from '../data-types';

// Mock the module before importing the component that uses it
jest.mock('@tanstack/react-query', () => ({
  ...jest.requireActual('@tanstack/react-query'),
  useQuery: jest.fn(),
}));

jest.mock('src/utils/api', () => ({
  __esModule: true,
  fetchSearchResults: jest.fn(),
}));

const mockedFetchSearchResults = fetchSearchResults as jest.MockedFunction<
  typeof fetchSearchResults
>;

describe('DataTypes Component', () => {
  const defaultProps = {
    topic: 'Influenza',
    query: {
      q: 'influenza',
      facet_size: 10,
      size: 0,
    },
  };

  const renderWithProviders = (ui: React.ReactNode) => {
    const queryClient = new QueryClient();
    return render(
      <QueryClientProvider client={queryClient}>
        <ChakraProvider>{ui}</ChakraProvider>
      </QueryClientProvider>,
    );
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('shows loading skeleton when loading', () => {
    //  Mock useQuery to simulate loading state
    (useQuery as jest.Mock).mockReturnValue({
      data: undefined,
      isLoading: true,
      isPlaceholderData: false,
      error: null,
    });

    renderWithProviders(
      <DataTypes query={{ q: 'flu', facet_size: 10 }} topic='Influenza' />,
    );

    const loadingElement = screen.getByRole('status');

    expect(loadingElement).toBeInTheDocument();
  });

  it('generates correct search results route', () => {
    const querystring = 'influenza';
    const facet = '@type';
    const term = 'Dataset';

    const expectedRoute = {
      pathname: '/search',
      query: {
        q: querystring,
        filters: `(${facet}:("${term}"))`,
      },
    };

    const result = getSearchResultsRoute({
      query: {
        q: querystring,
        extra_filter: '',
        facet_size: 10,
        size: 0,
      },
      facet,
      term,
    });

    expect(result).toEqual(expectedRoute);
  });

  it('selects and transforms data correctly', async () => {
    // @ts-ignore
    const mockResponse: FetchSearchResultsResponse = {
      facets: {
        // @ts-ignore
        '@type': {
          terms: [
            { term: 'Dataset', count: 10 },
            { term: 'ComputationalTool', count: 5 },
          ],
        },
      },
    };

    mockedFetchSearchResults.mockResolvedValueOnce(mockResponse);

    renderWithProviders(<DataTypes {...defaultProps} />);
    // expect(await screen.findByText(/dataset/i)).toBeInTheDocument();
    expect(await screen.findByText(/computational tool/i)).toBeInTheDocument();
  });
});
