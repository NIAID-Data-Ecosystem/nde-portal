import React, { useState } from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ChakraProvider } from '@chakra-ui/react';
import {
  fetchChildrenFromBioThingsAPI,
  fetchPortalCounts,
} from '../../../utils/api-helpers';
import { mockBiothingsChildrenApiResponse } from '../__mocks__/mockBiothingsChildrenApiResponse';
import { mockPortalCountsResponse } from '../__mocks__/mockPortalCountsResponse';
import { Tree } from '..';
import { mergePreviousLineageWithChildrenData } from 'src/views/ontology-browser/utils/ontology-helpers';
import { OntologyLineageItemWithCounts } from 'src/views/ontology-browser/types';

jest.mock('../../../utils/api-helpers', () => ({
  ...jest.requireActual('../../../utils/api-helpers'),
  fetchChildrenFromBioThingsAPI: jest.fn(),
  fetchPortalCounts: jest.fn(),
}));

const createQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

const addToSearch = jest.fn();
const isIncludedInSearch = jest.fn();

describe('Tree', () => {
  let queryClient: QueryClient = createQueryClient();

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <ChakraProvider>{children}</ChakraProvider>
    </QueryClientProvider>
  );

  const mockProps = {
    params: {
      q: '__all__',
      id: '9606',
      ontology: 'ncbitaxon',
    },
    showFromIndex: 29,
    lineage: [
      {
        id: '1',
        commonName: '',
        hasChildren: true,
        iri: 'http://purl.obolibrary.org/obo/NCBITaxon_1',
        label: 'root',
        ontologyName: 'ncbitaxon',
        parentTaxonId: null,
        state: {
          opened: true,
          selected: false,
        },
        taxonId: '1',
        counts: {
          termCount: 0,
          termAndChildrenCount: 605142,
        },
      },
      {
        id: '131567',
        commonName: '',
        hasChildren: true,
        iri: 'http://purl.obolibrary.org/obo/NCBITaxon_131567',
        label: 'cellular organisms',
        ontologyName: 'ncbitaxon',
        parentTaxonId: '1',
        state: {
          opened: true,
          selected: false,
        },
        taxonId: '131567',
        counts: {
          termCount: 33,
          termAndChildrenCount: 580332,
        },
      },
      {
        id: '2759',
        commonName: 'eucaryotes',
        hasChildren: true,
        iri: 'http://purl.obolibrary.org/obo/NCBITaxon_2759',
        label: 'eukaryota',
        ontologyName: 'ncbitaxon',
        parentTaxonId: '131567',
        state: {
          opened: true,
          selected: false,
        },
        taxonId: '2759',
        counts: {
          termCount: 498,
          termAndChildrenCount: 528942,
        },
      },
      {
        id: '33154',
        commonName: '',
        hasChildren: true,
        iri: 'http://purl.obolibrary.org/obo/NCBITaxon_33154',
        label: 'opisthokonta',
        ontologyName: 'ncbitaxon',
        parentTaxonId: '2759',
        state: {
          opened: true,
          selected: false,
        },
        taxonId: '33154',
        counts: {
          termCount: 9,
          termAndChildrenCount: 461848,
        },
      },
      {
        id: '33208',
        commonName: 'metazoans',
        hasChildren: true,
        iri: 'http://purl.obolibrary.org/obo/NCBITaxon_33208',
        label: 'metazoa',
        ontologyName: 'ncbitaxon',
        parentTaxonId: '33154',
        state: {
          opened: true,
          selected: false,
        },
        taxonId: '33208',
        counts: {
          termCount: 177,
          termAndChildrenCount: 438153,
        },
      },
      {
        id: '6072',
        commonName: '',
        hasChildren: true,
        iri: 'http://purl.obolibrary.org/obo/NCBITaxon_6072',
        label: 'eumetazoa',
        ontologyName: 'ncbitaxon',
        parentTaxonId: '33208',
        state: {
          opened: true,
          selected: false,
        },
        taxonId: '6072',
        counts: {
          termCount: 4,
          termAndChildrenCount: 437860,
        },
      },
      {
        id: '33213',
        commonName: '',
        hasChildren: true,
        iri: 'http://purl.obolibrary.org/obo/NCBITaxon_33213',
        label: 'bilateria',
        ontologyName: 'ncbitaxon',
        parentTaxonId: '6072',
        state: {
          opened: true,
          selected: false,
        },
        taxonId: '33213',
        counts: {
          termCount: 25,
          termAndChildrenCount: 436921,
        },
      },
      {
        id: '33511',
        commonName: 'deuterostomes',
        hasChildren: true,
        iri: 'http://purl.obolibrary.org/obo/NCBITaxon_33511',
        label: 'deuterostomia',
        ontologyName: 'ncbitaxon',
        parentTaxonId: '33213',
        state: {
          opened: true,
          selected: false,
        },
        taxonId: '33511',
        counts: {
          termCount: 11,
          termAndChildrenCount: 397815,
        },
      },
      {
        id: '7711',
        commonName: 'chordates',
        hasChildren: true,
        iri: 'http://purl.obolibrary.org/obo/NCBITaxon_7711',
        label: 'chordata',
        ontologyName: 'ncbitaxon',
        parentTaxonId: '33511',
        state: {
          opened: true,
          selected: false,
        },
        taxonId: '7711',
        counts: {
          termCount: 33,
          termAndChildrenCount: 397228,
        },
      },
      {
        id: '89593',
        commonName: '',
        hasChildren: true,
        iri: 'http://purl.obolibrary.org/obo/NCBITaxon_89593',
        label: 'craniata',
        ontologyName: 'ncbitaxon',
        parentTaxonId: '7711',
        state: {
          opened: true,
          selected: false,
        },
        taxonId: '89593',
        counts: {
          termCount: 0,
          termAndChildrenCount: 396795,
        },
      },
      {
        id: '7742',
        commonName: 'vertebrates',
        hasChildren: true,
        iri: 'http://purl.obolibrary.org/obo/NCBITaxon_7742',
        label: 'vertebrata',
        ontologyName: 'ncbitaxon',
        parentTaxonId: '89593',
        state: {
          opened: true,
          selected: false,
        },
        taxonId: '7742',
        counts: {
          termCount: 915,
          termAndChildrenCount: 396795,
        },
      },
      {
        id: '7776',
        commonName: 'jawed vertebrates',
        hasChildren: true,
        iri: 'http://purl.obolibrary.org/obo/NCBITaxon_7776',
        label: 'gnathostomata',
        ontologyName: 'ncbitaxon',
        parentTaxonId: '7742',
        state: {
          opened: true,
          selected: false,
        },
        taxonId: '7776',
        counts: {
          termCount: 28,
          termAndChildrenCount: 396170,
        },
      },
      {
        id: '117570',
        commonName: '',
        hasChildren: true,
        iri: 'http://purl.obolibrary.org/obo/NCBITaxon_117570',
        label: 'teleostomi',
        ontologyName: 'ncbitaxon',
        parentTaxonId: '7776',
        state: {
          opened: true,
          selected: false,
        },
        taxonId: '117570',
        counts: {
          termCount: 1,
          termAndChildrenCount: 395767,
        },
      },
      {
        id: '117571',
        commonName: 'bony vertebrates',
        hasChildren: true,
        iri: 'http://purl.obolibrary.org/obo/NCBITaxon_117571',
        label: 'euteleostomi',
        ontologyName: 'ncbitaxon',
        parentTaxonId: '117570',
        state: {
          opened: true,
          selected: false,
        },
        taxonId: '117571',
        counts: {
          termCount: 3,
          termAndChildrenCount: 395767,
        },
      },
      {
        id: '8287',
        commonName: '',
        hasChildren: true,
        iri: 'http://purl.obolibrary.org/obo/NCBITaxon_8287',
        label: 'sarcopterygii',
        ontologyName: 'ncbitaxon',
        parentTaxonId: '117571',
        state: {
          opened: true,
          selected: false,
        },
        taxonId: '8287',
        counts: {
          termCount: 4,
          termAndChildrenCount: 384982,
        },
      },
      {
        id: '1338369',
        commonName: '',
        hasChildren: true,
        iri: 'http://purl.obolibrary.org/obo/NCBITaxon_1338369',
        label: 'dipnotetrapodomorpha',
        ontologyName: 'ncbitaxon',
        parentTaxonId: '8287',
        state: {
          opened: true,
          selected: false,
        },
        taxonId: '1338369',
        counts: {
          termCount: 0,
          termAndChildrenCount: 384969,
        },
      },
      {
        id: '32523',
        commonName: 'tetrapods',
        hasChildren: true,
        iri: 'http://purl.obolibrary.org/obo/NCBITaxon_32523',
        label: 'tetrapoda',
        ontologyName: 'ncbitaxon',
        parentTaxonId: '1338369',
        state: {
          opened: true,
          selected: false,
        },
        taxonId: '32523',
        counts: {
          termCount: 143,
          termAndChildrenCount: 384940,
        },
      },
      {
        id: '32524',
        commonName: 'amniotes',
        hasChildren: true,
        iri: 'http://purl.obolibrary.org/obo/NCBITaxon_32524',
        label: 'amniota',
        ontologyName: 'ncbitaxon',
        parentTaxonId: '32523',
        state: {
          opened: true,
          selected: false,
        },
        taxonId: '32524',
        counts: {
          termCount: 74,
          termAndChildrenCount: 382802,
        },
      },
      {
        id: '40674',
        commonName: 'mammals',
        hasChildren: true,
        iri: 'http://purl.obolibrary.org/obo/NCBITaxon_40674',
        label: 'mammalia',
        ontologyName: 'ncbitaxon',
        parentTaxonId: '32524',
        state: {
          opened: true,
          selected: false,
        },
        taxonId: '40674',
        counts: {
          termCount: 1746,
          termAndChildrenCount: 369442,
        },
      },
      {
        id: '32525',
        commonName: '',
        hasChildren: true,
        iri: 'http://purl.obolibrary.org/obo/NCBITaxon_32525',
        label: 'theria',
        ontologyName: 'ncbitaxon',
        parentTaxonId: '40674',
        state: {
          opened: true,
          selected: false,
        },
        taxonId: '32525',
        counts: {
          termCount: 3,
          termAndChildrenCount: 368678,
        },
      },
      {
        id: '9347',
        commonName: 'placentals',
        hasChildren: true,
        iri: 'http://purl.obolibrary.org/obo/NCBITaxon_9347',
        label: 'eutheria',
        ontologyName: 'ncbitaxon',
        parentTaxonId: '32525',
        state: {
          opened: true,
          selected: false,
        },
        taxonId: '9347',
        counts: {
          termCount: 143,
          termAndChildrenCount: 368377,
        },
      },
      {
        id: '1437010',
        commonName: '',
        hasChildren: true,
        iri: 'http://purl.obolibrary.org/obo/NCBITaxon_1437010',
        label: 'boreoeutheria',
        ontologyName: 'ncbitaxon',
        parentTaxonId: '9347',
        state: {
          opened: true,
          selected: false,
        },
        taxonId: '1437010',
        counts: {
          termCount: 4,
          termAndChildrenCount: 368106,
        },
      },
      {
        id: '314146',
        commonName: '',
        hasChildren: true,
        iri: 'http://purl.obolibrary.org/obo/NCBITaxon_314146',
        label: 'euarchontoglires',
        ontologyName: 'ncbitaxon',
        parentTaxonId: '1437010',
        state: {
          opened: true,
          selected: false,
        },
        taxonId: '314146',
        counts: {
          termCount: 5,
          termAndChildrenCount: 356367,
        },
      },
      {
        id: '9443',
        commonName: '',
        hasChildren: true,
        iri: 'http://purl.obolibrary.org/obo/NCBITaxon_9443',
        label: 'primates',
        ontologyName: 'ncbitaxon',
        parentTaxonId: '314146',
        state: {
          opened: true,
          selected: false,
        },
        taxonId: '9443',
        counts: {
          termCount: 695,
          termAndChildrenCount: 262207,
        },
      },
      {
        id: '376913',
        commonName: '',
        hasChildren: true,
        iri: 'http://purl.obolibrary.org/obo/NCBITaxon_376913',
        label: 'haplorrhini',
        ontologyName: 'ncbitaxon',
        parentTaxonId: '9443',
        state: {
          opened: true,
          selected: false,
        },
        taxonId: '376913',
        counts: {
          termCount: 0,
          termAndChildrenCount: 261840,
        },
      },
      {
        id: '314293',
        commonName: '',
        hasChildren: true,
        iri: 'http://purl.obolibrary.org/obo/NCBITaxon_314293',
        label: 'simiiformes',
        ontologyName: 'ncbitaxon',
        parentTaxonId: '376913',
        state: {
          opened: true,
          selected: false,
        },
        taxonId: '314293',
        counts: {
          termCount: 1,
          termAndChildrenCount: 261836,
        },
      },
      {
        id: '9526',
        commonName: '',
        hasChildren: true,
        iri: 'http://purl.obolibrary.org/obo/NCBITaxon_9526',
        label: 'catarrhini',
        ontologyName: 'ncbitaxon',
        parentTaxonId: '314293',
        state: {
          opened: true,
          selected: false,
        },
        taxonId: '9526',
        counts: {
          termCount: 4,
          termAndChildrenCount: 261634,
        },
      },
      {
        id: '314295',
        commonName: 'apes',
        hasChildren: true,
        iri: 'http://purl.obolibrary.org/obo/NCBITaxon_314295',
        label: 'hominoidea',
        ontologyName: 'ncbitaxon',
        parentTaxonId: '9526',
        state: {
          opened: true,
          selected: false,
        },
        taxonId: '314295',
        counts: {
          termCount: 45,
          termAndChildrenCount: 260392,
        },
      },
      {
        id: '9604',
        commonName: 'great apes',
        hasChildren: true,
        iri: 'http://purl.obolibrary.org/obo/NCBITaxon_9604',
        label: 'hominidae',
        ontologyName: 'ncbitaxon',
        parentTaxonId: '314295',
        state: {
          opened: true,
          selected: false,
        },
        taxonId: '9604',
        counts: {
          termCount: 49,
          termAndChildrenCount: 260357,
        },
      },
      {
        id: '207598',
        commonName: '',
        hasChildren: true,
        iri: 'http://purl.obolibrary.org/obo/NCBITaxon_207598',
        label: 'homininae',
        ontologyName: 'ncbitaxon',
        parentTaxonId: '9604',
        state: {
          opened: true,
          selected: false,
        },
        taxonId: '207598',
        counts: {
          termCount: 0,
          termAndChildrenCount: 260329,
        },
      },
      {
        id: '9605',
        commonName: 'humans',
        hasChildren: true,
        iri: 'http://purl.obolibrary.org/obo/NCBITaxon_9605',
        label: 'homo',
        ontologyName: 'ncbitaxon',
        parentTaxonId: '207598',
        state: {
          opened: true,
          selected: false,
        },
        taxonId: '9605',
        counts: {
          termCount: 2661,
          termAndChildrenCount: 260199,
        },
      },
      {
        id: '9606',
        commonName: 'human',
        hasChildren: true,
        iri: 'http://purl.obolibrary.org/obo/NCBITaxon_9606',
        label: 'homo sapiens',
        ontologyName: 'ncbitaxon',
        parentTaxonId: '9605',
        state: {
          opened: false,
          selected: true,
        },
        taxonId: '9606',
        counts: {
          termCount: 258679,
          termAndChildrenCount: 258696,
        },
      },
    ],
    addToSearch,
    isIncludedInSearch,
  };
  const TreeComponentWithState = () => {
    const [lineage, setLineage] = useState<OntologyLineageItemWithCounts[]>(
      mockProps.lineage,
    );
    const updateLineage = () => {
      const newChildren: OntologyLineageItemWithCounts[] = [
        {
          id: '9592',
          commonName: '',
          hasChildren: true,
          iri: 'http://purl.obolibrary.org/obo/NCBITaxon_9592',
          label: 'gorilla',
          ontologyName: 'ncbitaxon',
          parentTaxonId: '207598',
          state: {
            opened: false,
            selected: false,
          },
          taxonId: '9592',
          counts: {
            termCount: 0,
            termAndChildrenCount: 96,
          },
        },
        {
          id: '9596',
          commonName: 'chimpanzees',
          hasChildren: true,
          iri: 'http://purl.obolibrary.org/obo/NCBITaxon_9596',
          label: 'pan',
          ontologyName: 'ncbitaxon',
          parentTaxonId: '207598',
          state: {
            opened: false,
            selected: false,
          },
          taxonId: '9596',
          counts: {
            termCount: 148,
            termAndChildrenCount: 438,
          },
        },
        {
          id: '9605',
          commonName: 'humans',
          hasChildren: true,
          iri: 'http://purl.obolibrary.org/obo/NCBITaxon_9605',
          label: 'homo',
          ontologyName: 'ncbitaxon',
          parentTaxonId: '207598',
          state: {
            opened: false,
            selected: true,
          },
          taxonId: '9605',
          counts: {
            termCount: 2661,
            termAndChildrenCount: 260199,
          },
        },
      ];
      setLineage(prevLineage =>
        mergePreviousLineageWithChildrenData(prevLineage, newChildren),
      );
    };

    return (
      <Tree {...mockProps} lineage={lineage} updateLineage={updateLineage} />
    );
  };
  const renderComponent = () => render(<TreeComponentWithState />, { wrapper });

  beforeEach(() => {
    jest.clearAllMocks();

    (fetchChildrenFromBioThingsAPI as jest.Mock).mockResolvedValue(
      mockBiothingsChildrenApiResponse,
    );

    (fetchPortalCounts as jest.Mock).mockImplementation(
      mockPortalCountsResponse,
    );

    queryClient.clear();
    queryClient = createQueryClient();
  });

  it('renders the root node correctly', async () => {
    renderComponent();

    expect(screen.getByText(/homininae/i)).toBeInTheDocument();
  });

  it('toggles node open/closed state on click', async () => {
    renderComponent();

    const toggleButton = screen.getByRole('button', {
      name: /Show all children of homininae/i,
    });

    expect(toggleButton).toBeInTheDocument();
    expect(screen.getByText('2,661')).toBeInTheDocument();

    // Click to toggle closed then open, which loads the children
    fireEvent.click(toggleButton);
    fireEvent.click(toggleButton);

    await waitFor(() => {
      expect(screen.getByText(/homininae/i)).toBeInTheDocument();
      expect(screen.getByText(/pan/i)).toBeInTheDocument();
      expect(screen.getByText(/gorilla/i)).toBeInTheDocument();
    });
  });
});
