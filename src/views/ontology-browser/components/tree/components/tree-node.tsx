import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Box,
  Flex,
  Icon,
  IconButton,
  ListItem,
  Text,
  UnorderedList,
} from '@chakra-ui/react';
import { useQuery } from '@tanstack/react-query';
import {
  FaAngleRight,
  FaMagnifyingGlass,
  FaMinus,
  FaPlus,
} from 'react-icons/fa6';
import {
  fetchChildrenFromBioThingsAPI,
  fetchPortalCounts,
} from '../../../utils/api-helpers';
import { Link } from 'src/components/link';
import { useLocalStorage } from 'usehooks-ts';
import {
  OntologyLineageItemWithCounts,
  OntologyPagination,
} from '../../../types';
import { getChildren, sortChildrenList } from '../../../utils/ontology-helpers';
import {
  getTooltipLabelByCountType,
  OntologyBrowserCountTag,
} from '../../ontology-browser-count-tag';
import { Pagination } from '../components/pagination';
import { Warning } from '../components/warning';
import { TreeProps, MARGIN, SIZE } from '..';
import { transformSettingsToLocalStorageConfig } from '../../settings/helpers';
import { DEFAULT_ONTOLOGY_BROWSER_SETTINGS } from '../../settings';
import { ErrorMessage } from '../../error-message';

const hasZeroCounts = (node: OntologyLineageItemWithCounts) =>
  node.counts.termCount === 0 && node.counts.termAndChildrenCount === 0;

/**
 * TreeNode Component
 *
 * Represents a single node in the ontology tree.
 * - Handles toggling open/closed state to show or hide children.
 * - Fetches child nodes when toggled open if they haven't been loaded.
 * - Renders node details, including links, counts, and actions.
 */

export const TreeNode = (props: {
  addToSearch: TreeProps['addToSearch'];
  depth: number; //Depth level in the tree for indentation
  isIncludedInSearch: TreeProps['isIncludedInSearch'];
  lineage: TreeProps['lineage'];
  node: OntologyLineageItemWithCounts;
  params: TreeProps['params'];
  updateLineage: (children: OntologyLineageItemWithCounts[]) => void;
}) => {
  const {
    addToSearch,
    depth = 0,
    isIncludedInSearch,
    lineage,
    node,
    params,
    updateLineage,
  } = props;

  // Retrieve view settings from local storage
  const [viewSettings, setViewSettings] = useLocalStorage(
    'ontology-browser-view',
    () =>
      transformSettingsToLocalStorageConfig(DEFAULT_ONTOLOGY_BROWSER_SETTINGS),
  );

  // Toggle the node's open/closed state and fetch children if open.
  const [isToggled, setIsToggled] = useState(node.state.opened);

  // State to manage the children fetched from the API
  const [fetchedChildren, setFetchedChildren] = useState<
    OntologyLineageItemWithCounts[]
  >([]);

  // State to manage the pagination fetched from the API
  const [pagination, setPagination] = useState<Pick<
    OntologyPagination,
    'hasMore' | 'totalElements'
  > | null>(null);

  const [pageFrom, setPageFrom] = useState(0);
  const [pageSize] = useState(SIZE);
  const {
    error,
    isLoading,
    data: childrenData,
    refetch: fetchChildren,
  } = useQuery({
    queryKey: [
      'fetch-descendants',
      node,
      node.taxonId,
      node.id,
      node.ontologyName,
      params.q,
      pageFrom,
      pageSize,
    ],
    queryFn: () => {
      //  Fetch children from the BioThings API for the NCBI Taxonomy
      return fetchChildrenFromBioThingsAPI({
        node,
        q: params.q,
        id: node.taxonId,
        ontology: node.ontologyName,
        size: pageSize,
        from: pageFrom,
      }).then(async data => {
        return {
          ...data,
          children: await fetchPortalCounts(data.children, {
            q: params.q,
          }),
        };
      });
      // return fetchChildrenFromOLSAPI({
      //   node,
      //   q: params.q,
      //   id: node.taxonId,
      //   ontology: node.ontologyName,
      //   size: pageSize,
      //   from: pageFrom,
      // }).then(async data => ({
      //   ...data,
      //   children: await fetchPortalCounts(data.children, {
      //     q: params.q,
      //   }),
      // }));
    },
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    enabled: node.hasChildren && pageFrom > 0,
  });

  // Toggle the node's open/closed state and fetch children if opening.
  const toggleNode = useCallback(() => {
    if (node.hasChildren && !isToggled) {
      fetchChildren();
    }
    setIsToggled(!isToggled);
  }, [fetchChildren, isToggled, node.hasChildren]);

  useEffect(() => {
    if (childrenData) {
      const { children, pagination } = childrenData || {};
      if (isToggled && children && children.length > 0) {
        setFetchedChildren(children);
        setPagination({
          hasMore: pagination.hasMore,
          totalElements: pagination.totalElements,
        });
      } else {
        setFetchedChildren([]);
      }
    }
  }, [childrenData, isToggled, params.id]);

  // Update the lineage when the children are fetched.
  useEffect(() => {
    if (isToggled && fetchedChildren.length > 0) {
      updateLineage(fetchedChildren);
    }
  }, [params.id, isToggled, fetchedChildren, node.id, updateLineage]);

  // Reset the toggle state the params.id changes
  useEffect(() => {
    if (params.id !== node.id.toString()) {
      setIsToggled(node.state.opened);
      setFetchedChildren([]);
    }
  }, [node.id, node.state.opened, params.id]);

  // List of children nodes sorted by term count and filtered by hideEmptyCounts configuration
  const sortedChildrenList = useMemo(() => {
    const filterChildrenItems = (node: OntologyLineageItemWithCounts) => {
      // Filter out items with 0 counts if configured to do so
      if (viewSettings?.hideEmptyCounts) {
        return !hasZeroCounts(node);
      }
      return true;
    };
    // Sort the children list by descending termCount and filter out items with 0 counts if configured to do so
    const sorted = sortChildrenList(
      getChildren(node.taxonId, lineage).filter(filterChildrenItems),
    );
    return sorted;
  }, [lineage, node.taxonId, viewSettings?.hideEmptyCounts]);

  // Show pagination if there are more children to fetch or if the loading state is active
  const showPagination = useMemo(() => {
    return pagination?.hasMore || (isLoading && pageFrom > 0);
  }, [isLoading, pageFrom, pagination?.hasMore]);

  // Show a warning when there are hidden elements due to the hideEmptyCounts configuration and the children list contains some items with 0 counts
  const showHiddenElementsWarning = useMemo(
    () =>
      Boolean(
        isToggled &&
          viewSettings?.hideEmptyCounts &&
          fetchedChildren.some(node => hasZeroCounts(node)),
      ),
    [fetchedChildren, viewSettings?.hideEmptyCounts, isToggled],
  );

  // Determine if a node should be hidden if the view config is set to hide empty counts and the node has no datasets AND children have no datasets
  const shouldHideNode = useMemo(() => {
    return (
      viewSettings?.hideEmptyCounts && hasZeroCounts(node) && !node.hasChildren
    );
  }, [node, viewSettings?.hideEmptyCounts]);

  if (error) {
    return (
      <ErrorMessage title={error.message}>
        Something went wrong, try refreshing the page.
      </ErrorMessage>
    );
  }

  // Hide nodes with no children that have 0 datasets if configured to do so
  if (shouldHideNode) {
    return <></>;
  }
  return (
    <ListItem>
      <Flex
        alignItems='center'
        borderTop={depth !== 0 ? '0.25px solid' : 'none'}
        borderColor='gray.200'
        sx={{ '>*': { px: 4, py: 2 } }}
        pl={`${(depth + 1) * MARGIN}px`}
        _hover={{
          bg: 'blackAlpha.50',
        }}
      >
        <Flex
          as='button'
          alignItems='center'
          onClick={toggleNode}
          cursor={
            sortedChildrenList.length > 0 || node.hasChildren
              ? 'pointer'
              : 'default'
          }
          flex={1}
        >
          {sortedChildrenList.length > 0 || node.hasChildren ? (
            <IconButton
              as='div'
              aria-label={`Show all children of ${node.label}`}
              icon={<FaAngleRight />}
              variant='ghost'
              colorScheme='gray'
              size='sm'
              transform={isToggled ? 'rotate(90deg)' : ''}
              color='currentColor'
            />
          ) : (
            <Box mx={4}></Box>
          )}
          <Box
            alignItems='flex-start'
            flex={1}
            fontWeight='normal'
            lineHeight='short'
            ml={2}
            textAlign='left'
            wordBreak='break-word'
          >
            <Text color='gray.800' fontSize='12px'>
              {node.ontologyName} | {node.taxonId}
            </Text>

            <Link
              href={`/search?q=${
                params.q && params.q !== '__all__' ? `(${params.q}) AND ` : ''
              }(species.identifier:${
                node.taxonId
              } OR infectiousAgent.identifier:${node.taxonId})`}
              fontSize='xs'
            >
              <Icon as={FaMagnifyingGlass} mr={1.5} boxSize={3} />
              <Text
                color={node.state.selected ? 'primary.500' : 'currentColor'}
                fontWeight={node.state.selected ? 'semibold' : 'medium'}
                lineHeight='inherit'
                textAlign='left'
                fontSize='xs'
              >
                {node.label}
              </Text>
            </Link>
          </Box>
        </Flex>
        <Flex alignItems='center'>
          <OntologyBrowserCountTag
            colorScheme={node.counts.termCount === 0 ? 'gray' : 'primary'}
            isLoading={isLoading}
            label={getTooltipLabelByCountType('termCount')}
          >
            {node.counts.termCount?.toLocaleString() || 0}
          </OntologyBrowserCountTag>
          <Text mx={0.5} fontWeight='bold' color='niaid.placeholder'>
            {' / '}
          </Text>
          <OntologyBrowserCountTag
            colorScheme='white'
            isLoading={isLoading}
            label={getTooltipLabelByCountType('termAndChildrenCount')}
          >
            {node.counts.termAndChildrenCount?.toLocaleString() || 0}
          </OntologyBrowserCountTag>

          <IconButton
            ml={2}
            aria-label={
              isIncludedInSearch(node.taxonId)
                ? `Remove ${node.label} from search list`
                : `Search portal for resources related to ${node.label}`
            }
            icon={isIncludedInSearch(node.taxonId) ? <FaMinus /> : <FaPlus />}
            size='xs'
            variant='outline'
            fontSize='xs'
            onClick={e => {
              e.stopPropagation();
              addToSearch({
                counts: node.counts,
                label: node.label,
                ontologyName: node.ontologyName,
                taxonId: node.taxonId,
              });
            }}
          />
        </Flex>
      </Flex>

      {isToggled && sortedChildrenList.length > 0 ? (
        <UnorderedList id='children-list' ml={0}>
          {sortedChildrenList.map(child => (
            <TreeNode
              key={child.id}
              addToSearch={addToSearch}
              isIncludedInSearch={isIncludedInSearch}
              node={child}
              params={params}
              lineage={lineage}
              depth={depth + 1}
              updateLineage={updateLineage}
            />
          ))}
          {/* If there are only children with 0 counts and the conmfiguration hides them, show a note */}
          {showHiddenElementsWarning && (
            <ListItem
              className='hiddenElementsWarning'
              bg='status.warning_lt'
              fontSize='xs'
              px={4}
              py={2}
              pl={`${(depth + 2) * MARGIN}px`}
            >
              <Warning
                node={node}
                onClick={() => {
                  if (viewSettings?.hideEmptyCounts) {
                    setViewSettings({
                      ...viewSettings,
                      hideEmptyCounts: false,
                    });
                  }
                }}
              />
            </ListItem>
          )}

          {/* Handles pagination when children items exceed the SIZE value */}
          {showPagination && (
            <ListItem
              borderTop='0.25px solid'
              borderColor='gray.200'
              px={4}
              py={2}
              pl={`${(depth + 2) * MARGIN}px`}
              bg='niaid.50'
            >
              <Pagination
                hasMore={showPagination}
                isLoading={isLoading}
                node={node}
                numChildrenDisplayed={sortedChildrenList.length}
                totalElements={pagination?.totalElements || 0}
                isDisabled={isLoading || sortedChildrenList.length < pageSize}
                onShowMore={() => {
                  // page + 1?
                  const page = Math.floor(sortedChildrenList.length / pageSize);
                  setPageFrom(page);
                }}
              />
            </ListItem>
          )}
        </UnorderedList>
      ) : (
        <></>
      )}
    </ListItem>
  );
};
