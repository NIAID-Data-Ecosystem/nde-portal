import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { useRouter } from 'next/router';
import { useQuery } from '@tanstack/react-query';
import { ChakraProvider } from '@chakra-ui/react';
import { OntologyBrowserSearch } from './index';
import { ONTOLOGY_BROWSER_OPTIONS } from '../../utils/api-helpers';

jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));

jest.mock('@tanstack/react-query', () => ({
  useQuery: jest.fn(),
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

const mockRouter = {
  query: {},
  push: mockPush,
};

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

describe('OntologyBrowserSearch', () => {
  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue({
      query: {},
      push: mockPush,
    });

    (useQuery as jest.Mock).mockReturnValue({
      data: [],
      error: null,
      isLoading: false,
    });
  });

  it('renders the search input and button', () => {
    render(
      <ChakraProvider>
        <OntologyBrowserSearch />
      </ChakraProvider>,
    );

    expect(
      screen.getByLabelText('Search taxonomy browser'),
    ).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText('Enter a taxonomy name or identifier'),
    ).toBeInTheDocument();
    expect(screen.getByText('Search')).toBeInTheDocument();
  });

  it('renders the selected ontologies menu with correct amount on ontologies', () => {
    render(
      <ChakraProvider>
        <OntologyBrowserSearch ontologyMenuOptions={ONTOLOGY_BROWSER_OPTIONS} />
      </ChakraProvider>,
    );

    const name = `Selected ontologies ${ONTOLOGY_BROWSER_OPTIONS.length}`;
    const button = screen.getByRole('button', { name });
    expect(button).toBeInTheDocument();
  });

  it('displays error message when there is an error', () => {
    (useQuery as jest.Mock).mockReturnValueOnce({
      data: [],
      error: { message: 'Error fetching data' },
      isLoading: false,
    });

    render(
      <ChakraProvider>
        <OntologyBrowserSearch />
      </ChakraProvider>,
    );

    expect(screen.getByText('Error:')).toBeInTheDocument();
    expect(screen.getByText('Error fetching data')).toBeInTheDocument();
  });

  it('displays no match message when no suggestions match', async () => {
    render(
      <ChakraProvider>
        <OntologyBrowserSearch />
      </ChakraProvider>,
    );

    const input = screen.getByPlaceholderText(
      'Enter a taxonomy name or identifier',
    );
    fireEvent.change(input, { target: { value: 'nonexistent' } });
    fireEvent.submit(input);

    await waitFor(() => {
      expect(screen.getByText('No Match:')).toBeInTheDocument();
      expect(screen.getByText('nonexistent')).toBeInTheDocument();
    });
  });

  it('calls router.push with correct parameters on submit', async () => {
    (useQuery as jest.Mock).mockReturnValueOnce({
      data: [
        {
          _id: '9605',
          definingAPI: 'biothings',
          definingOntology: 'ncbitaxon',
          label: 'homo',
          rank: 'genus',
        },
      ],
      error: null,
      isLoading: false,
    });

    render(
      <ChakraProvider>
        <OntologyBrowserSearch />
      </ChakraProvider>,
    );

    const input = screen.getByPlaceholderText(
      'Enter a taxonomy name or identifier',
    );
    fireEvent.change(input, { target: { value: 'homo' } });
    fireEvent.submit(input);

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith({
        pathname: '/ontology-browser',
        query: { id: '9605', ontology: 'ncbitaxon' },
      });
    });
  });

  it('displays the correct number of selected ontologies on load', () => {
    render(
      <ChakraProvider>
        <OntologyBrowserSearch ontologyMenuOptions={ontologyMockOptions} />
      </ChakraProvider>,
    );

    // Verify the selected ontologies count
    const expectedCount = ontologyMockOptions.length;
    const button = screen.getByRole('button', {
      name: `Selected ontologies ${expectedCount}`,
    });

    expect(button).toBeInTheDocument();
  });

  it('updates selected ontologies when user selects a different one', async () => {
    render(
      <ChakraProvider>
        <OntologyBrowserSearch ontologyMenuOptions={ontologyMockOptions} />
      </ChakraProvider>,
    );

    const initialCount = ontologyMockOptions.length;

    // Open the ontology selection dropdown
    const button = screen.getByRole('button', {
      name: `Selected ontologies ${initialCount}`,
    });
    fireEvent.click(button);

    const ontologyToSelect = ontologyMockOptions[0].name;
    const checkbox = screen.getByLabelText(ontologyToSelect);

    fireEvent.click(checkbox); // Select it

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

    render(
      <ChakraProvider>
        <OntologyBrowserSearch ontologyMenuOptions={ontologyMockOptions} />
      </ChakraProvider>,
    );

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

  it('load when multiple ontologies are selected', () => {
    const selectedOntologies = ontologyMockOptions.map(onto => onto.value);
    (useRouter as jest.Mock).mockReturnValue({
      query: { ontology: selectedOntologies },
      push: mockPush,
    });

    render(
      <ChakraProvider>
        <OntologyBrowserSearch ontologyMenuOptions={ontologyMockOptions} />
      </ChakraProvider>,
    );

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
});
