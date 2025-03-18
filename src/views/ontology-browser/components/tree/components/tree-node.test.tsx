import React, { useState } from 'react';
import {
  act,
  render,
  screen,
  fireEvent,
  waitFor,
  within,
  cleanup,
} from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ChakraProvider, UnorderedList } from '@chakra-ui/react';
import {
  fetchChildrenFromBioThingsAPI,
  fetchPortalCounts,
} from '../../../utils/api-helpers';
import { OntologyLineageItemWithCounts } from 'src/views/ontology-browser/types';
import { mergePreviousLineageWithChildrenData } from 'src/views/ontology-browser/utils/ontology-helpers';
import {
  mockBiothingsChildrenApiResponse,
  mockBiothingsChildrenPaginatedApiResponse,
} from '../__mocks__/mockBiothingsChildrenApiResponse';
import { mockPortalCountsResponse } from '../__mocks__/mockPortalCountsResponse';
import { mockBiothingsLineageFromBioThingsAPIResponse } from '../__mocks__/mockBiothingsLineageFromBioThingsAPIResponse';
import { Tree, TreeProps } from '..';
import { useLocalStorage } from 'usehooks-ts';
import { transformSettingsToLocalStorageConfig } from '../../settings/helpers';
import { TreeNode } from './tree-node';

let viewSettingsMock = transformSettingsToLocalStorageConfig({
  isCondensed: { label: 'Show condensed view?', value: true },
  hideEmptyCounts: { label: 'Hide Empty counts?', value: true },
});

const mockSetViewConfig = jest.fn();

jest.mock('usehooks-ts', () => ({
  useLocalStorage: jest.fn(key => [
    viewSettingsMock,
    (newValue: any) => {
      viewSettingsMock = newValue; // Persist the new value
      mockSetViewConfig(newValue); // Call the mock function too
    },
  ]),
}));

jest.mock('../../../utils/api-helpers', () => ({
  ...jest.requireActual('../../../utils/api-helpers'),
  fetchChildrenFromBioThingsAPI: jest.fn(),
  fetchLineageFromBioThingsAPI: jest.fn(),
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
const updateLineage = jest.fn();

describe('TreeNode', () => {
  let queryClient: QueryClient = createQueryClient();

  beforeEach(() => {
    queryClient = createQueryClient();

    viewSettingsMock = transformSettingsToLocalStorageConfig({
      isCondensed: { label: 'Show condensed view?', value: true },
      hideEmptyCounts: { label: 'Hide Empty counts?', value: true },
    });

    jest.clearAllMocks();
    jest.resetModules();

    (fetchChildrenFromBioThingsAPI as jest.Mock).mockResolvedValue(
      mockBiothingsChildrenApiResponse,
    );

    (fetchPortalCounts as jest.Mock).mockImplementation(
      mockPortalCountsResponse,
    );

    queryClient.clear();
  });

  afterEach(() => {
    cleanup();
    queryClient.clear();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <ChakraProvider>{children}</ChakraProvider>
    </QueryClientProvider>
  );

  const renderComponent = (props?: TreeProps) => {
    const queryParams = props?.params || {
      q: '',
      id: '9606',
      ontology: 'ncbitaxon',
    };
    const lineage = mockBiothingsLineageFromBioThingsAPIResponse(queryParams);
    // Select a lineage item that is two ancestors up 9606.
    const showFromIndex =
      lineage.findIndex(item => item.taxonId === queryParams.id) - 2;
    return render(
      <Tree
        addToSearch={addToSearch}
        isIncludedInSearch={isIncludedInSearch}
        lineage={lineage}
        params={queryParams}
        showFromIndex={showFromIndex}
        updateLineage={updateLineage}
        {...props}
      />,
      { wrapper },
    );
  };

  it('renders node details correctly', async () => {
    renderComponent();
    expect(screen.getByText('ncbitaxon | 207598')).toBeInTheDocument();
    expect(screen.getByText(/homininae/i)).toBeInTheDocument();
    const termCount = screen.getByText('0');
    expect(termCount).toBeInTheDocument();
    const termAndChildrenCount = screen.getByText('260,329');
    expect(termAndChildrenCount).toBeInTheDocument();
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
      expect(updateLineage).toHaveBeenCalledTimes(1);
      expect(updateLineage).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({ label: 'gorilla' }),
          expect.objectContaining({ label: 'pan' }),
          expect.objectContaining({ label: 'homo' }),
        ]),
      );
    });
  });

  it('clears fetchedChildren when childrenData is empty or node is not toggled', async () => {
    renderComponent();

    // Simulate toggling the node closed
    const toggleButton = screen.getByRole('button', {
      name: /Show all children of homininae/i,
    });
    fireEvent.click(toggleButton);

    // Verify that fetchedChildren is cleared
    await waitFor(() => {
      expect(updateLineage).not.toHaveBeenCalled();
    });
  });

  it('renders pagination correctly when items with 0 counts are hidden', async () => {
    const TreeWithSimulatedLineageState = () => {
      const queryParams = {
        q: '',
        id: '2759',
        ontology: 'ncbitaxon',
      };
      const [lineage, setLineage] = useState<OntologyLineageItemWithCounts[]>(
        mockBiothingsLineageFromBioThingsAPIResponse(queryParams),
      );
      const updateLineage = (children: OntologyLineageItemWithCounts[]) => {
        setLineage(prevLineage =>
          mergePreviousLineageWithChildrenData(prevLineage, children),
        );
      };
      // Select a lineage item that is two ancestors up 9606.
      const showFromIndex =
        lineage.findIndex(item => item.taxonId === queryParams.id) - 2;
      return (
        <Tree
          addToSearch={addToSearch}
          isIncludedInSearch={isIncludedInSearch}
          lineage={lineage}
          params={queryParams}
          showFromIndex={showFromIndex}
          updateLineage={updateLineage}
        />
      );
    };
    const { rerender } = render(<TreeWithSimulatedLineageState />, {
      wrapper,
    });

    await waitFor(() => {
      expect(viewSettingsMock.hideEmptyCounts).toBe(true);
    });

    // Verify that the node ncbitaxon | 2759 is rendered
    expect(screen.getByText('ncbitaxon | 2759')).toBeInTheDocument();

    // Mock a pagination response
    (fetchChildrenFromBioThingsAPI as jest.Mock).mockResolvedValue(
      mockBiothingsChildrenPaginatedApiResponse,
    );

    let nodeWithNoChildrenAndZeroDatasets: OntologyLineageItemWithCounts[] = [];
    let responseTaxonomyItems: OntologyLineageItemWithCounts[] = [];

    (fetchPortalCounts as jest.Mock).mockImplementation(children => {
      const response = mockPortalCountsResponse(children);
      // Count the number of children with 0 counts
      responseTaxonomyItems = response;
      nodeWithNoChildrenAndZeroDatasets = response.filter(
        child =>
          child.counts.termCount === 0 &&
          child.counts.termAndChildrenCount === 0 &&
          !child.hasChildren,
      );
      // console.log('____RESPONSE____', response);
      return Promise.resolve(response);
    });

    const toggleButton = screen.getByRole('button', {
      name: /Show all children of eukaryota/i,
    });

    expect(toggleButton).toBeInTheDocument();
    expect(screen.getByText('498')).toBeInTheDocument();

    // Click to toggle closed then open, which loads the children
    act(() => {
      toggleButton.click();
    });

    await waitFor(() => {
      // Verify that the node sar is rendered
      expect(screen.getByText(/sar/i)).toBeInTheDocument();
      // Verify that the pagination is rendered with the correct counts
      expect(
        screen.getByText(
          new RegExp(
            `Displaying ${nodeWithNoChildrenAndZeroDatasets.length} of 21 children for`,
            'i',
          ),
        ),
      ).toBeInTheDocument();
      // Verify that the nodes with 0 counts are NOT rendered.
      nodeWithNoChildrenAndZeroDatasets.forEach(node => {
        expect(
          screen.queryByText(new RegExp(node.label, 'i')),
        ).not.toBeInTheDocument();
      });
    });

    // Expect that hidden children warning will appear.
    const warningHiddenCountsElement = document.querySelector(
      '.hiddenElementsWarning',
    );
    expect(warningHiddenCountsElement).toBeInTheDocument();
    expect(warningHiddenCountsElement).toHaveTextContent(
      /eukaryota \(Taxon ID: 2759\)/,
    );
    expect(warningHiddenCountsElement).toHaveTextContent(
      /has hidden children with 0 associated datasets\./,
    );

    // Find and click the "Show hidden terms" button
    const showHiddenTermsButton = (
      warningHiddenCountsElement as Element
    ).querySelector('button');
    expect(showHiddenTermsButton).toBeInTheDocument();

    act(() => {
      fireEvent.click(showHiddenTermsButton as Element);
    });
    await waitFor(() => {
      // console.log('Updated viewSettingsMock:', viewSettingsMock);
      expect(viewSettingsMock.hideEmptyCounts).toBe(false);
    });

    rerender(<TreeWithSimulatedLineageState />);
    // Expect that the hidden children are now visible
    await waitFor(() => {
      expect(
        screen.getByText(
          new RegExp(
            `Displaying ${responseTaxonomyItems.length} of 21 children for`,
            'i',
          ),
        ),
      ).toBeInTheDocument();
    });
  });

  it('renders pagination correctly', async () => {
    // Ensure that the empty counts are shown
    const settings = {
      ['isCondensed']: {
        label: 'Enable condensed view?',
        value: true,
      },
      ['hideEmptyCounts']: {
        label: 'Hide terms with 0 datasets?',
        value: false,
      },
    };
    (useLocalStorage as jest.Mock).mockReturnValue([
      transformSettingsToLocalStorageConfig(settings),
      mockSetViewConfig,
    ]);

    const TreeWithSimulatedLineageState = () => {
      const queryParams = {
        q: '',
        id: '2759',
        ontology: 'ncbitaxon',
      };
      const [lineage, setLineage] = useState<OntologyLineageItemWithCounts[]>(
        mockBiothingsLineageFromBioThingsAPIResponse(queryParams),
      );
      const updateLineage = (children: OntologyLineageItemWithCounts[]) => {
        setLineage(prevLineage =>
          mergePreviousLineageWithChildrenData(prevLineage, children),
        );
      };
      // Select a lineage item that is two ancestors up 9606.
      const showFromIndex =
        lineage.findIndex(item => item.taxonId === queryParams.id) - 2;
      return (
        <Tree
          addToSearch={addToSearch}
          isIncludedInSearch={isIncludedInSearch}
          lineage={lineage}
          params={queryParams}
          showFromIndex={showFromIndex}
          updateLineage={updateLineage}
        />
      );
    };

    render(<TreeWithSimulatedLineageState />, { wrapper });

    // Verify that the node ncbitaxon | 2759 is rendered
    expect(screen.getByText('ncbitaxon | 2759')).toBeInTheDocument();

    // Mock a pagination response
    (fetchChildrenFromBioThingsAPI as jest.Mock).mockResolvedValue(
      mockBiothingsChildrenPaginatedApiResponse,
    );

    let responseTaxonomyItems: OntologyLineageItemWithCounts[] = [];

    (fetchPortalCounts as jest.Mock).mockImplementation(children => {
      const response = mockPortalCountsResponse(children);
      responseTaxonomyItems = response;
      // console.log('____RESPONSE____', response);
      return Promise.resolve(response);
    });

    const toggleButton = screen.getByRole('button', {
      name: /Show all children of eukaryota/i,
    });

    expect(toggleButton).toBeInTheDocument();
    expect(screen.getByText('498')).toBeInTheDocument();

    // Click to toggle closed then open, which loads the children
    act(() => {
      toggleButton.click();
    });

    await waitFor(() => {
      // Verify that the node sar is rendered
      expect(screen.getByText(/sar/i)).toBeInTheDocument();
      // Verify that the pagination is rendered with the correct counts
      expect(
        screen.getByText(
          new RegExp(
            `Displaying ${responseTaxonomyItems.length} of 21 children for`,
            'i',
          ),
        ),
      ).toBeInTheDocument();

      // Verify that all the nodes are rendered (including the nodes with no children and 0 datasets)
      responseTaxonomyItems.forEach(node => {
        expect(
          screen.queryByText(new RegExp(node.label, 'i')),
        ).toBeInTheDocument();
      });
    });
  });

  // it('Shows next page of results when show more is pressed', async () => {
  //   // Ensure that the empty counts are shown
  //   const settings = {
  //     ['isCondensed']: {
  //       label: 'Enable condensed view?',
  //       value: true,
  //     },
  //     ['hideEmptyCounts']: {
  //       label: 'Hide terms with 0 datasets?',
  //       value: false,
  //     },
  //   };
  //   (useLocalStorage as jest.Mock).mockReturnValue([
  //     transformSettingsToLocalStorageConfig(settings),
  //     mockSetViewConfig,
  //   ]);

  //   const TreeWithSimulatedLineageState = () => {
  //     const queryParams = {
  //       q: '',
  //       id: '2759',
  //       ontology: 'ncbitaxon',
  //     };
  //     const [lineage, setLineage] = useState<OntologyLineageItemWithCounts[]>(
  //       mockBiothingsLineageFromBioThingsAPIResponse(queryParams),
  //     );
  //     const updateLineage = (children: OntologyLineageItemWithCounts[]) => {
  //       setLineage(prevLineage => {
  //         return mergePreviousLineageWithChildrenData(prevLineage, children);
  //       });
  //     };
  //     // Select a lineage item that is two ancestors up 9606.
  //     const showFromIndex =
  //       lineage.findIndex(item => item.taxonId === queryParams.id) - 2;
  //     return (
  //       <Tree
  //         addToSearch={addToSearch}
  //         isIncludedInSearch={isIncludedInSearch}
  //         lineage={lineage}
  //         params={queryParams}
  //         showFromIndex={showFromIndex}
  //         updateLineage={updateLineage}
  //       />
  //     );
  //   };

  //   render(<TreeWithSimulatedLineageState />, { wrapper });

  //   // Verify that the node ncbitaxon | 2759 is rendered
  //   expect(screen.getByText('ncbitaxon | 2759')).toBeInTheDocument();

  //   // Mock a pagination response
  //   (fetchChildrenFromBioThingsAPI as jest.Mock).mockResolvedValue(
  //     mockBiothingsChildrenPaginatedApiResponse,
  //   );

  //   (fetchPortalCounts as jest.Mock).mockImplementation(children => {
  //     const response = mockPortalCountsResponse(children);
  //     // console.log('____RESPONSE____', response);
  //     return Promise.resolve(response);
  //   });

  //   const toggleButton = screen.getByRole('button', {
  //     name: /Show all children of eukaryota/i,
  //   });

  //   expect(toggleButton).toBeInTheDocument();
  //   expect(screen.getByText('498')).toBeInTheDocument();

  //   // Click to toggle closed then open, which loads the children
  //   act(() => {
  //     toggleButton.click();
  //   });

  //   await waitFor(() => {
  //     console.log('display for');
  //     // Verify that the pagination is rendered with the correct counts
  //     expect(
  //       screen.getByText(
  //         new RegExp(`Displaying ${20} of 21 children for`, 'i'),
  //       ),
  //     ).toBeInTheDocument();
  //   });
  //   // Check that "Show more" button is rendered
  //   const paginationButton = screen.getByRole('button', {
  //     name: /Show more/i,
  //   });
  //   expect(paginationButton).toBeInTheDocument();

  //   act(() => {
  //     fireEvent.click(paginationButton);
  //   });

  //   await waitFor(() => {
  //     // Check that the fetchChildrenFromBioThingsAPI function was called
  //     expect(fetchChildrenFromBioThingsAPI).toHaveBeenCalled();
  //     // Check that the 'from' parameter is set to 1
  //     expect(fetchChildrenFromBioThingsAPI).toHaveBeenCalledWith(
  //       expect.objectContaining({ from: 1 }), // Ensures 'from' is set to 1
  //     );
  //   });
  // });

  it('renders node details with correct styles and attributes', () => {
    renderComponent();

    const nodeDetails = screen.getByText('ncbitaxon | 207598');
    expect(nodeDetails).toBeInTheDocument();
    expect(nodeDetails).toHaveStyle('color: gray.800');
    expect(nodeDetails).toHaveStyle('font-size: 12px');

    const nodeLabel = screen.getByText(/homininae/i);
    expect(nodeLabel).toBeInTheDocument();
    expect(nodeLabel).toHaveStyle('font-size: xs');
    expect(nodeLabel.closest('a')).toHaveAttribute(
      'href',
      expect.stringContaining('http'),
    );
  });

  it('renders toggle button with correct state and functionality', async () => {
    renderComponent();

    const toggleButton = screen.getByRole('button', {
      name: /Show all children of homininae/i,
    });

    expect(toggleButton).toBeInTheDocument();
    expect(toggleButton).toHaveStyle('cursor: pointer');
    const toggleButtonIcon = document.querySelector(
      '[aria-label="Show all children of homininae"]',
    );
    expect(toggleButtonIcon).toHaveStyle('transform: rotate(90deg)');
    // simulate close.
    fireEvent.click(toggleButton);
    // simulate open which fetches all the children.
    fireEvent.click(toggleButton);
    await waitFor(() => {
      expect(updateLineage).toHaveBeenCalledTimes(1);
      expect(toggleButtonIcon).toHaveStyle('transform: rotate(90deg)');
    });
    // simulate close.
    fireEvent.click(toggleButton);
    expect(updateLineage).toHaveBeenCalledTimes(1);
    expect(toggleButton).not.toHaveStyle('transform: rotate(90deg)');
  });

  it('renders counts with correct values and styles', () => {
    renderComponent();

    const termCount = screen.getByText('0');
    expect(termCount).toBeInTheDocument();

    const termAndChildrenCount = screen.getByText('260,329');
    expect(termAndChildrenCount).toBeInTheDocument();
  });

  it('renders search icon button and handles click correctly', () => {
    renderComponent();

    const toggleButton = screen.getByRole('button', {
      name: /Show all children of homininae/i,
    });

    const parentElement = toggleButton.parentElement;
    expect(parentElement).toBeInTheDocument();
    const searchButton = within(parentElement as HTMLElement).getByRole(
      'button',
      {
        name: /Search portal for resources related to/i,
      },
    );
    expect(searchButton).toBeInTheDocument();

    fireEvent.click(searchButton);
    expect(addToSearch).toHaveBeenCalledWith({
      counts: expect.any(Object),
      label: 'homininae',
      ontologyName: 'ncbitaxon',
      taxonId: '207598',
    });
  });

  it('renders nothing when shouldHideNode is true', () => {
    // Ensure that the empty counts are hidden
    const settings = {
      isCondensed: { label: 'Show condensed view?', value: true },
      hideEmptyCounts: { label: 'Hide Empty counts?', value: true },
    };
    (useLocalStorage as jest.Mock).mockReturnValue([
      transformSettingsToLocalStorageConfig(settings),
      mockSetViewConfig,
    ]);
    const props = {
      addToSearch,
      depth: 0,
      isIncludedInSearch,
      lineage: [],
      node: {
        counts: { termCount: 0, termAndChildrenCount: 0 },
        hasChildren: false,
        state: { opened: false, selected: false },
        taxonId: '12345',
        commonName: '',
        parentTaxonId: '1',
        ontologyName: 'testOntology',
        label: 'Test Node',
        iri: 'http://example.com',
        id: '12345',
      },
      params: { q: '', id: '12345', ontology: 'testOntology' },
      updateLineage,
    };
    (fetchChildrenFromBioThingsAPI as jest.Mock).mockResolvedValue([]);
    const { container } = render(
      <UnorderedList>
        <TreeNode {...props} />
      </UnorderedList>,
      { wrapper },
    );
    const ulElement = container.querySelector('ul');
    expect(ulElement).toBeInTheDocument();

    // Ensure that `<ul>` is empty i.e. (has no children)
    expect(ulElement?.childElementCount).toBe(0);
  });
});
