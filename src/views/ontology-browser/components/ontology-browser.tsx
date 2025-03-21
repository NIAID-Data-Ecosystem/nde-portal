import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, Box, Flex, Spinner } from '@chakra-ui/react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/router';
import {
  fetchLineageFromBioThingsAPI,
  fetchLineageFromOLSAPI,
  fetchPortalCounts,
} from '../utils/api-helpers';
import { useLocalStorage } from 'usehooks-ts';
import {
  OntologyLineageItemWithCounts,
  OntologyLineageRequestParams,
} from '../types';
import { OntologyBrowserHeader } from './ontology-browser-header';
import { OntologyViewPopover } from './ontology-view-popover';
import { Tree } from './ontology-browser-tree';

export const OntologyBrowser = ({
  searchList,
  setSearchList,
}: {
  searchList: Pick<
    OntologyLineageItemWithCounts,
    'ontologyName' | 'taxonId' | 'label' | 'counts'
  >[];
  setSearchList: React.Dispatch<
    React.SetStateAction<
      Pick<
        OntologyLineageItemWithCounts,
        'ontologyName' | 'taxonId' | 'label' | 'counts'
      >[]
    >
  >;
}) => {
  // Store the view configuration in local storage.
  // [isCondensed]: Show only the selected node and its immediate parent/children.
  // [includeEmptyCounts]: Include items without datasets in the view.
  const [viewConfig, setViewConfig] = useLocalStorage(
    'ontology-browser-view',
    () => ({
      isCondensed: true,
      includeEmptyCounts: true,
      isMenuOpen: false,
    }),
  );

  // State to manage the ontology tree lineage
  const [lineage, setLineage] = useState<
    OntologyLineageItemWithCounts[] | null
  >(null);

  // Index of the node used for the condensed view
  const [showFromIndex, setShowFromIndex] = useState(0);

  // Extract the query ID from the router, defaulting to the root taxon ID
  const router = useRouter();
  const id = router.query.id || '1';
  const ontology = router.query.onto || 'ncbitaxon';

  // Memoize query parameters to avoid recalculating on each render
  const queryParams = useMemo(() => {
    return {
      q: (router.query.q || '__all__') as string,
      id: Array.isArray(id) ? id[0] : id,
      ontology: ontology as OntologyLineageRequestParams['ontology'],
    };
  }, [id, router.query.q, ontology]);

  // Fetch lineage data using the ontology type and query parameters
  const {
    error,
    isLoading,
    data: ontologyLineageData,
  } = useQuery({
    queryKey: [
      'ontology-browser-tree',
      queryParams.q,
      queryParams.id,
      queryParams.ontology,
    ],
    queryFn: () => {
      if (queryParams.ontology === 'ncbitaxon') {
        return fetchLineageFromBioThingsAPI({
          id: queryParams.id,
          ontology: queryParams.ontology,
        }).then(async data => ({
          lineage: await fetchPortalCounts(data.lineage, { q: queryParams.q }),
        }));
      }
      return fetchLineageFromOLSAPI({
        id: queryParams.id,
        ontology: queryParams.ontology,
      }).then(async data => ({
        lineage: await fetchPortalCounts(data.lineage, { q: queryParams.q }),
      }));
    },
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    enabled: router.isReady && !!queryParams.id,
  });

  // Maximum number of nodes to display in the condensed view
  const MAX_VISIBLE_NODES = 5;

  useEffect(() => {
    if (ontologyLineageData) {
      // Update the lineage state with the fetched data
      setLineage(ontologyLineageData.lineage);

      if (viewConfig.isCondensed) {
        // Determine the starting index for the condensed view
        const condensedStartIndex =
          ontologyLineageData.lineage.length > MAX_VISIBLE_NODES
            ? ontologyLineageData.lineage.length - 3 // Show the last 3 nodes if exceeding the limit
            : 0; // Show all nodes if the total is within the limit
        setShowFromIndex(condensedStartIndex);
      } else {
        // Show all nodes starting from the first index in expanded view
        setShowFromIndex(0);
      }
    }
  }, [ontologyLineageData, viewConfig.isCondensed]);

  // Update lineage with new children
  const updateLineageWithChildren = useCallback(
    (nodeId: string, children: OntologyLineageItemWithCounts[]) => {
      setLineage(prevLineage => {
        if (!prevLineage) return [];

        // If no children, return previous lineage as it is
        if (children.length === 0) return prevLineage;

        // Find the index of the node to insert children after
        // [TO DO]:Remove? not using this to merge any more
        // const index = prevLineage.findIndex(node => node.id === nodeId);

        // if (index === -1) return prevLineage;

        // Filter out children that are already in the prevLineage
        const filteredChildren = children.filter(
          child =>
            !prevLineage.some(prevNode => prevNode.taxonId === child.taxonId),
        );

        // If no children left after filtering, return previous lineage as it is
        if (filteredChildren.length === 0) return prevLineage;

        // Merge filtered children into prevLineage
        const merged = [...prevLineage, ...filteredChildren];
        // merged.splice(index + 1, 0, ...filteredChildren);
        return merged;
      });
    },
    [],
  );

  // Get the currently selected node from the lineage data.
  // The selected node is the last item in the lineage array, which represents the deepest taxonomic level.
  const selectedOntologyNode = useMemo(() => {
    return ontologyLineageData?.lineage?.at(-1) || null;
  }, [ontologyLineageData]);

  if (error) {
    return (
      <Alert status='error' role='alert'>
        Error fetching ontology browser data: {error.message}
      </Alert>
    );
  }
  return (
    <>
      <Flex
        className='onto-table'
        w='100%'
        alignItems='flex-start'
        flexWrap='wrap'
        flex={1}
      >
        <Box flex={2} minWidth={{ base: 'unset', md: '500px' }}>
          <Flex
            w='100%'
            justifyContent='space-between'
            alignItems='flex-end'
            mb={1}
          >
            {selectedOntologyNode && (
              <OntologyBrowserHeader selectedNode={selectedOntologyNode} />
            )}
            <OntologyViewPopover
              label='Configure View'
              buttonProps={{ size: 'sm' }}
              viewConfig={viewConfig}
              setViewConfig={setViewConfig}
            />
          </Flex>
          {/* Tree Browser */}
          <Box
            w='100%'
            bg='white'
            border='1px solid'
            borderRadius='semi'
            borderColor='page.placeholder'
            overflow='hidden'
          >
            {isLoading || !router.isReady ? (
              <Spinner size='md' color='primary.500' m={4} />
            ) : (
              lineage && (
                <Tree
                  params={queryParams}
                  showFromIndex={showFromIndex}
                  lineage={lineage}
                  updateLineage={updateLineageWithChildren}
                  updateShowFromIndex={setShowFromIndex}
                  isIncludedInSearch={id => {
                    return searchList.some(item => item.taxonId === id);
                  }}
                  addToSearch={({ ontologyName, taxonId, label, counts }) => {
                    setSearchList(prev => {
                      //if it already exists in the list, remove it
                      if (prev.some(item => item.taxonId === taxonId)) {
                        return prev.filter(item => item.taxonId !== taxonId);
                      } else {
                        return [
                          ...prev,
                          { ontologyName, taxonId, label, counts },
                        ];
                      }
                    });
                  }}
                />
              )
            )}
          </Box>
        </Box>
      </Flex>
    </>
  );
};
