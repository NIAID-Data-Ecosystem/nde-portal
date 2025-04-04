import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ChakraProvider } from '@chakra-ui/react';
import { DataTypes, getSearchResultsRoute } from './data-types';
import { fetchSearchResults } from 'src/utils/api';
import { FetchSearchResultsResponse } from 'src/utils/api/types';

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

  it('shows loading skeleton while fetching data', async () => {
    mockedFetchSearchResults.mockResolvedValueOnce(undefined);

    renderWithProviders(<DataTypes {...defaultProps} />);
    expect(screen.getByText(/data types/i)).toBeInTheDocument();
    // Add more assertions for skeletons if needed
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

    const result = getSearchResultsRoute({ querystring, facet, term });

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
    expect(await screen.findByText(/dataset/i)).toBeInTheDocument();
    expect(await screen.findByText(/computational tool/i)).toBeInTheDocument();
  });
});
