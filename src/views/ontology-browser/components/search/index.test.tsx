import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { useRouter } from 'next/router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ChakraProvider } from '@chakra-ui/react';
import { OntologyBrowserSearch } from './index';
import { searchOntologyAPI } from '../../utils/api-helpers';

jest.mock('../../utils/api-helpers', () => {
  return {
    ...jest.requireActual('../../utils/api-helpers'),
    searchOntologyAPI: jest.fn(),
  };
});

const ontologyMockOptions = [
  {
    name: 'NCBI Taxonomy',
    value: 'ncbitaxon' as 'ncbitaxon',
    relatedPortalSchemaProperties: [
      'infectiousAgent.displayName',
      'infectiousAgent.displayName.raw',
      'infectiousAgent.identifier',
      'infectiousAgent.name',
      'species.displayName',
      'species.displayName.raw',
      'species.identifier',
      'species.name',
    ],
  },
  {
    name: 'EDAM',
    value: 'edam' as 'edam',
    relatedPortalSchemaProperties: [
      'topicCategory.identifier',
      'topicCategory.name',
    ],
  },
];

jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));

jest.mock('usehooks-ts', () => {
  let debouncedValue = '';
  return {
    useDebounceValue: jest.fn(value => {
      return [
        debouncedValue || value,
        jest.fn(newValue => (debouncedValue = newValue)),
      ];
    }),
  };
});

const mockPush = jest.fn();

const createQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

describe('OntologyBrowserSearch', () => {
  let queryClient: QueryClient = createQueryClient();
  // Wrap the component with the QueryClientProvider and ChakraProvider
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <ChakraProvider>{children}</ChakraProvider>
    </QueryClientProvider>
  );
  const renderComponent = (props = {}) => {
    return render(<OntologyBrowserSearch {...props} />, { wrapper });
  };

  beforeEach(() => {
    // Mock the useRouter hook to simulate the router
    (useRouter as jest.Mock).mockReturnValue({
      query: {},
      push: mockPush,
    });

    // Reset the mock implementation of the searchOntologyAPI
    // to return an empty array by default
    (searchOntologyAPI as jest.Mock).mockResolvedValue([]);

    // Clear the query client and reset
    queryClient.clear();
    jest.clearAllMocks();
    queryClient = createQueryClient();
  });

  it('renders the search input and button', () => {
    renderComponent();

    expect(
      screen.getByLabelText('Search taxonomy browser'),
    ).toBeInTheDocument();

    expect(
      screen.getByPlaceholderText('Enter a taxonomy name or identifier'),
    ).toBeInTheDocument();

    expect(screen.getByText('Search')).toBeInTheDocument();
  });

  it('renders the selected ontologies menu with correct amount of ontologies', () => {
    renderComponent({ ontologyMenuOptions: ontologyMockOptions });

    const name = `Selected ontologies ${ontologyMockOptions.length}`;
    const button = screen.getByRole('button', { name });

    expect(button).toBeInTheDocument();
  });

  it('displays error message when there is an error', async () => {
    (searchOntologyAPI as jest.Mock).mockRejectedValue(
      new Error('Error fetching data'),
    );

    renderComponent();

    // Wait for the error message to appear
    await waitFor(() => {
      expect(screen.getByText('Error fetching data')).toBeInTheDocument();
    });
  });

  it('displays no match message when no suggestions match', async () => {
    renderComponent();

    const input = screen.getByPlaceholderText(
      'Enter a taxonomy name or identifier',
    );
    fireEvent.change(input, { target: { value: 'nonexistent' } });
    fireEvent.submit(input);

    await waitFor(() => {
      expect(screen.getByText('No Results Found')).toBeInTheDocument();
      expect(screen.getByText('nonexistent')).toBeInTheDocument();
    });
  });

  it('calls router.push with correct parameters on submit', async () => {
    (searchOntologyAPI as jest.Mock).mockResolvedValue([
      {
        _id: '9605',
        definingAPI: 'biothings',
        definingOntology: 'ncbitaxon',
        label: 'homo',
        rank: 'genus',
      },
    ]);

    renderComponent();

    const input = screen.getByPlaceholderText(
      'Enter a taxonomy name or identifier',
    );
    fireEvent.change(input, { target: { value: 'homo' } });

    // Wait for ui to update with api changes.
    await screen.findAllByRole('listitem');

    fireEvent.submit(input);

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith({
        pathname: '/ontology-browser',
        query: { id: '9605', ontology: 'ncbitaxon' },
      });
    });
  });

  it('displays the correct number of selected ontologies on load', () => {
    renderComponent({ ontologyMenuOptions: ontologyMockOptions });

    // Verify the selected ontologies count is applied to ontology menu
    const expectedCount = ontologyMockOptions.length;
    const button = screen.getByRole('button', {
      name: `Selected ontologies ${expectedCount}`,
    });

    expect(button).toBeInTheDocument();
  });

  it('updates selected ontologies when user selects a different one', async () => {
    renderComponent({ ontologyMenuOptions: ontologyMockOptions });
    const initialCount = ontologyMockOptions.length;

    // Open the ontology selection dropdown
    const button = screen.getByRole('button', {
      name: `Selected ontologies ${initialCount}`,
    });
    fireEvent.click(button);

    // Unselect one ontology
    const ontologyToSelect = ontologyMockOptions[0].name;
    const checkbox = screen.getByLabelText(ontologyToSelect);
    fireEvent.click(checkbox);

    // Check that the number of selected ontologies updated
    await waitFor(() => {
      expect(
        screen.getByRole('button', {
          name: `Selected ontologies ${initialCount - 1}`,
        }),
      ).toBeInTheDocument();
    });
  });

  it('applies ontologies from router query params on load', () => {
    const selectedOntology = ontologyMockOptions[0];
    const unSelectedOntology = ontologyMockOptions[1];
    (useRouter as jest.Mock).mockReturnValue({
      query: { ontology: [selectedOntology.value] },
      push: mockPush,
    });

    renderComponent({ ontologyMenuOptions: ontologyMockOptions });

    // Expect only the ontology from router query to be selected
    const button = screen.getByRole('button', {
      name: `Selected ontologies 1`,
    });
    expect(button).toBeInTheDocument();

    // Open the ontology selection dropdown
    fireEvent.click(button);

    // check that the correct checkbox is checked
    const selectedCheckbox = screen.getByLabelText(selectedOntology.name);
    expect(selectedCheckbox).toBeInTheDocument();
    expect(selectedCheckbox).toBeChecked();

    // check that the unselect checkbox is unchecked
    const unselectedCheckbox = screen.getByLabelText(unSelectedOntology.name);
    expect(unselectedCheckbox).toBeInTheDocument();
    expect(unselectedCheckbox).not.toBeChecked();
  });

  it('loads when multiple ontologies are selected', () => {
    const selectedOntologies = ontologyMockOptions.map(onto => onto.value);
    (useRouter as jest.Mock).mockReturnValue({
      query: { ontology: selectedOntologies },
      push: mockPush,
    });

    renderComponent({ ontologyMenuOptions: ontologyMockOptions });

    // Expect only the ontology from router query to be selected
    const button = screen.getByRole('button', {
      name: `Selected ontologies ${selectedOntologies.length}`,
    });
    expect(button).toBeInTheDocument();

    // Open the ontology selection dropdown
    fireEvent.click(button);

    // Check that multiple checkboxes are checked
    const checkbox_01 = screen.getByLabelText(ontologyMockOptions[0].name);
    expect(checkbox_01).toBeInTheDocument();
    expect(checkbox_01).toBeChecked();

    const checkbox_02 = screen.getByLabelText(ontologyMockOptions[1].name);
    expect(checkbox_02).toBeInTheDocument();
    expect(checkbox_02).toBeChecked();
  });

  it('clears search term on close', () => {
    renderComponent({ ontologyMenuOptions: ontologyMockOptions });

    const input = screen.getByPlaceholderText(
      'Enter a taxonomy name or identifier',
    );
    fireEvent.change(input, { target: { value: 'test' } });
    fireEvent.blur(input);

    // get input parent element
    const inputParent = input.parentElement;

    // get close button with aria label 'Clear search input'
    const closeButton = inputParent?.querySelector(
      '[aria-label="Clear search input"]',
    );

    fireEvent.click(closeButton as Element);

    expect(input).toHaveValue('');
  });

  it('handles input change correctly', () => {
    renderComponent({ ontologyMenuOptions: ontologyMockOptions });

    const input = screen.getByPlaceholderText(
      'Enter a taxonomy name or identifier',
    );
    fireEvent.change(input, { target: { value: 'test' } });

    expect(input).toHaveValue('test');
  });

  it('handles input submit correctly', async () => {
    (searchOntologyAPI as jest.Mock).mockResolvedValue([
      {
        _id: '9605',
        definingAPI: 'biothings',
        definingOntology: 'ncbitaxon',
        label: 'homo',
        rank: 'genus',
      },
    ]);

    renderComponent({ ontologyMenuOptions: ontologyMockOptions });

    const input = screen.getByPlaceholderText(
      'Enter a taxonomy name or identifier',
    );
    fireEvent.change(input, { target: { value: 'homo' } });
    await screen.findAllByRole('listitem');
    fireEvent.submit(input);

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith({
        pathname: '/ontology-browser',
        query: { id: '9605', ontology: 'ncbitaxon' },
      });
    });
  });

  it('handles search list key down selection', async () => {
    (searchOntologyAPI as jest.Mock).mockResolvedValue([
      {
        _id: '9605',
        definingAPI: 'biothings',
        definingOntology: 'ncbitaxon',
        label: 'homo',
        rank: 'genus',
      },
      {
        _id: '9606',
        definingAPI: 'biothings',
        definingOntology: 'ncbitaxon',
        label: 'homo sapiens',
        rank: 'species',
      },
    ]);

    renderComponent({ ontologyMenuOptions: ontologyMockOptions });

    const input = screen.getByPlaceholderText(
      'Enter a taxonomy name or identifier',
    );
    fireEvent.change(input, { target: { value: 'homo' } });
    await screen.findAllByRole('listitem');
    // Choose the second selection by pressing key down in the search input
    fireEvent.keyDown(input, { key: 'ArrowDown', code: 'ArrowDown' });
    fireEvent.keyDown(input, { key: 'ArrowDown', code: 'ArrowDown' });

    await waitFor(() => {
      // check that the input value displays the arrow down value
      expect(input).toHaveValue('homo sapiens');
    });

    // Simulate the submission of this input
    fireEvent.submit(input);

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith({
        pathname: '/ontology-browser',
        query: { id: '9606', ontology: 'ncbitaxon' },
      });
    });
  });

  it('handles search list mouse click selection', async () => {
    (searchOntologyAPI as jest.Mock).mockResolvedValue([
      {
        _id: '9605',
        definingAPI: 'biothings',
        definingOntology: 'ncbitaxon',
        label: 'homo',
        rank: 'genus',
      },
      {
        _id: '9606',
        definingAPI: 'biothings',
        definingOntology: 'ncbitaxon',
        label: 'homo sapiens',
        rank: 'species',
      },
      {
        _id: '2813598',
        definingAPI: 'biothings',
        definingOntology: 'ncbitaxon',
        label: 'unclassified homo',
        rank: 'no rank',
      },
      {
        _id: '2813599',
        definingAPI: 'biothings',
        definingOntology: 'ncbitaxon',
        label: 'homo sp.',
        rank: 'species',
      },
      {
        _id: '1425170',
        definingAPI: 'biothings',
        definingOntology: 'ncbitaxon',
        label: 'homo heidelbergensis',
        rank: 'species',
      },
    ]);

    renderComponent({ ontologyMenuOptions: ontologyMockOptions });
    const input = screen.getByPlaceholderText(
      'Enter a taxonomy name or identifier',
    );
    fireEvent.change(input, { target: { value: 'homo' } });

    // Wait for dropdown list to appear
    const listItems = await screen.findAllByRole('listitem');

    // Ensure all 5 options appear
    expect(listItems).toHaveLength(5);

    // Simulate click on fourth list item (homo sp.)
    fireEvent.click(listItems[3]);
    fireEvent.submit(input);

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith({
        pathname: '/ontology-browser',
        query: { id: '2813599', ontology: 'ncbitaxon' },
      });
    });
  });

  it('fetches suggestions based on search term', async () => {
    const mockSuggestions = [
      {
        _id: '9605',
        definingAPI: 'biothings',
        definingOntology: 'ncbitaxon',
        label: 'homo',
        rank: 'genus',
      },
    ];

    (searchOntologyAPI as jest.Mock).mockResolvedValue(mockSuggestions);

    renderComponent({ ontologyMenuOptions: ontologyMockOptions });

    const input = screen.getByPlaceholderText(
      'Enter a taxonomy name or identifier',
    );
    fireEvent.change(input, { target: { value: 'homo' } });

    await waitFor(() => {
      expect(searchOntologyAPI).toHaveBeenCalledWith({
        q: 'homo*',
        ontology: ontologyMockOptions.map(onto => onto.value),
        biothingsFields: ['_id', 'rank', 'scientific_name'],
        olsFields: ['iri', 'label', 'ontology_name', 'short_form', 'type'],
      });
    });

    expect(screen.getByText('homo')).toBeInTheDocument();
  });
});
