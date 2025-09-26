import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Box,
  Flex,
  HStack,
  Spinner,
  StackDivider,
} from '@chakra-ui/react';
import { useQuery, useQueries } from '@tanstack/react-query';
import { useRouter } from 'next/router';
import {
  fetchLineageFromBioThingsAPI,
  fetchPortalCounts,
} from '../utils/api-helpers';
import { useLocalStorage } from 'usehooks-ts';
import {
  OntologyLineageItemWithCounts,
  OntologyLineageRequestParams,
} from '../types';
import { OntologyBrowserHeader } from './ontology-browser-header';
import {
  DEFAULT_ONTOLOGY_BROWSER_SETTINGS,
  OntologyBrowserSettings,
} from './settings';
import { Tree } from './tree';
import { OntologyTreeBreadcrumbs } from './tree/components/breadcrumbs';
import { transformSettingsToLocalStorageConfig } from './settings/helpers';
import { mergePreviousLineageWithChildrenData } from '../utils/ontology-helpers';
import {
  OntologyTreeHeaderItem,
  OntologyTreeHeaders,
} from './tree/components/tree-headers';
import { getTooltipLabelByCountType } from './ontology-browser-count-tag';

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
  // Retrieve view settings from local storage
  const [viewSettings] = useLocalStorage('ontology-browser-view', () =>
    transformSettingsToLocalStorageConfig(DEFAULT_ONTOLOGY_BROWSER_SETTINGS),
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
  const ontology = router.query.ontology || 'ncbitaxon';

  // Memoize query parameters to avoid recalculating on each render
  const queryParams = useMemo(() => {
    return {
      q: (router.query.q || '__all__') as string,
      id: Array.isArray(id) ? id[0] : id,
      ontology: ontology as OntologyLineageRequestParams['ontology'],
    };
  }, [id, router.query.q, ontology]);

  // --- 1. Fetch lineage structure (no counts yet) ---
  const {
    data: ontologyLineageData,
    error: biothingsError,
    isLoading: biothingsIsLoading,
  } = useQuery({
    queryKey: ['ontology-browser-structure', queryParams],
    queryFn: () =>
      fetchLineageFromBioThingsAPI({
        id: queryParams.id,
        ontology: queryParams.ontology,
      }),
    enabled: router.isReady && !!queryParams.id,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  // --- 2. Split visible vs hidden nodes ---
  const MAX_VISIBLE_NODES = 5;

  const visibleLineage = useMemo(() => {
    if (!ontologyLineageData) return [];
    const lineage = ontologyLineageData.lineage;
    const condensedStartIndex =
      viewSettings?.isCondensed && lineage.length > MAX_VISIBLE_NODES
        ? lineage.length - 3
        : 0;
    return lineage.slice(condensedStartIndex);
  }, [ontologyLineageData, viewSettings?.isCondensed]);

  const hiddenLineage = useMemo(() => {
    if (!ontologyLineageData) return [];
    const lineage = ontologyLineageData.lineage;
    return lineage.slice(0, lineage.length - visibleLineage.length);
  }, [ontologyLineageData, visibleLineage]);

  // --- 3. Query counts (visible first, hidden after) ---
  const visibleQuery = useQuery({
    queryKey: ['ontology-browser-visible', queryParams, visibleLineage],
    queryFn: () => fetchPortalCounts(visibleLineage, { q: queryParams.q }),
    enabled: visibleLineage.length > 0,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  const hiddenQuery = useQuery({
    queryKey: ['ontology-browser-hidden', queryParams, hiddenLineage],
    queryFn: () => fetchPortalCounts(hiddenLineage, { q: queryParams.q }),
    enabled: !!visibleQuery.data && hiddenLineage.length > 0,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
  const isLoading = biothingsIsLoading || visibleQuery.isLoading;
  const error = biothingsError || visibleQuery.error;

  // --- 4. Merge results into lineage ---
  useEffect(() => {
    if (ontologyLineageData) {
      // Set base lineage (structure only)
      setLineage(ontologyLineageData.lineage);
    }
  }, [ontologyLineageData]);

  useEffect(() => {
    if (visibleQuery.data) {
      setLineage(prev => {
        if (!prev) return null;
        return [...(hiddenQuery.data ?? hiddenLineage), ...visibleQuery.data];
      });
    }
  }, [visibleQuery.data, hiddenQuery.data, hiddenLineage]);

  // --- 5. Handle condensed/expanded view ---
  useEffect(() => {
    const lineage = ontologyLineageData?.lineage || [];
    if (!isLoading && lineage) {
      const condensedStartIndex =
        viewSettings?.isCondensed && lineage.length > MAX_VISIBLE_NODES
          ? lineage.length - 3
          : 0;
      setShowFromIndex(condensedStartIndex);
    }
  }, [isLoading, ontologyLineageData, viewSettings?.isCondensed]);

  const updateLineageWithChildren = useCallback(
    (children: OntologyLineageItemWithCounts[]) => {
      setLineage(prev => mergePreviousLineageWithChildrenData(prev, children));
    },
    [],
  );

  // Selected node is the last in the lineage
  const selectedOntologyNode = useMemo(() => {
    return lineage?.at(-1) || null;
  }, [lineage]);

  if (error) {
    return (
      <Alert status='error' role='alert'>
        <AlertIcon />
        <Box>
          <AlertTitle>{error.message}</AlertTitle>
          <AlertDescription>
            There was a network issue communicating with the server. Please try
            again in a few moments.{' '}
          </AlertDescription>
        </Box>
      </Alert>
    );
  }

  return (
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
          flexWrap='wrap'
        >
          <OntologyBrowserHeader selectedNode={selectedOntologyNode} />
          <OntologyBrowserSettings
            label='Configure View'
            buttonProps={{ size: 'sm' }}
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
              <>
                {showFromIndex > 0 && (
                  <OntologyTreeBreadcrumbs
                    lineageNodes={lineage.slice(0, showFromIndex)}
                    showFromIndex={showFromIndex}
                    updateShowFromIndex={setShowFromIndex}
                  />
                )}

                <OntologyTreeHeaders>
                  <OntologyTreeHeaderItem label='Term name' />
                  <HStack
                    justifyContent='flex-end'
                    flex={1}
                    divider={<StackDivider borderColor='gray.100' />}
                    spacing={3}
                  >
                    <OntologyTreeHeaderItem
                      label='Exact Matches'
                      tooltipLabel={getTooltipLabelByCountType('termCount')}
                    />
                    <OntologyTreeHeaderItem
                      label='Matches including sub-terms'
                      tooltipLabel={getTooltipLabelByCountType(
                        'termAndChildrenCount',
                      )}
                    />
                  </HStack>
                </OntologyTreeHeaders>

                <Tree
                  params={queryParams}
                  showFromIndex={showFromIndex}
                  lineage={lineage}
                  updateLineage={updateLineageWithChildren}
                  isIncludedInSearch={id => {
                    return searchList.some(item => item.taxonId === id);
                  }}
                  addToSearch={({ ontologyName, taxonId, label, counts }) => {
                    setSearchList(prev => {
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
              </>
            )
          )}
        </Box>
      </Box>
    </Flex>
  );
};
