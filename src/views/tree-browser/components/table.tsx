import {
  Box,
  HStack,
  Spinner,
  Text,
  Alert,
  Flex,
  ListItem,
  UnorderedList,
  IconButton,
} from '@chakra-ui/react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/router';
import {
  fetchOntologyChildrenByNodeId,
  fetchOntologyTreeByTaxonId,
  getChildren,
  OntologyTreeItem,
  OntologyTreeParams,
  OntologyTreeResponse,
} from '../helpers';
import { TagWithUrl } from 'src/components/tag-with-url';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { FaAngleRight } from 'react-icons/fa6';

export const TreeBrowserTable = () => {
  const router = useRouter();
  const id = router.query.id || 'NCBITaxon_1';
  const [lineage, setLineage] = useState<OntologyTreeItem[] | null>(null);

  // Memoize the query params to avoid unnecessary recalculations on each render
  const queryParams = useMemo(() => {
    const string_id = Array.isArray(id) ? id[0] : id;
    return {
      id: string_id,
      ontology: (string_id.split('_')[0] === 'NCBITaxon'
        ? 'ncbitaxon'
        : 'edam') as OntologyTreeParams['ontology'],
    };
  }, [id]);

  // Fetch tree data
  const {
    error,
    isLoading,
    data: allData,
  } = useQuery({
    queryKey: ['tree-browser-search', queryParams.id, queryParams.ontology],
    queryFn: () => fetchOntologyTreeByTaxonId(queryParams),
    refetchOnWindowFocus: false,
    enabled: router.isReady && !!queryParams.id,
  });

  const selectedNode = allData?.lineage[allData.lineage.length - 1];

  useEffect(() => {
    if (allData) {
      setLineage(allData.lineage);
    }
  }, [allData]);

  // Update lineage with new children
  const updateLineageWithChildren = useCallback(
    (nodeId: string, children: OntologyTreeItem[]) => {
      setLineage(prevLineage => {
        if (!prevLineage) return [];

        // If no children, return previous lineage as it is
        if (children.length === 0) return prevLineage;

        // Find the index of the node to insert children after
        const index = prevLineage.findIndex(node => node.id === nodeId);
        if (index === -1) return prevLineage;

        // Filter out children that are already in the prevLineage
        const filteredChildren = children.filter(
          child => !prevLineage.some(prevNode => prevNode.id === child.id),
        );

        // If no children left after filtering, return previous lineage as it is
        if (filteredChildren.length === 0) return prevLineage;

        // Merge filtered children into prevLineage
        const merged = [...prevLineage];
        merged.splice(index + 1, 0, ...filteredChildren);

        return merged;
      });
    },
    [],
  );
  console.log('lineage', lineage);
  if (error) {
    return (
      <Alert status='error'>
        Error fetching tree browser data: {error.message}
      </Alert>
    );
  }
  return (
    <Box w='100%'>
      {selectedNode && (
        <Box my={1}>
          <Text fontWeight='normal' fontSize='sm' lineHeight='none'>
            Selected taxonomy:{' '}
          </Text>
          <HStack>
            <Text as='span' fontWeight='medium'>
              {selectedNode.label}
            </Text>
            <TagWithUrl
              href={selectedNode.iri}
              isExternal
              colorScheme='primary'
            >
              {id}
            </TagWithUrl>
          </HStack>
        </Box>
      )}

      <Box
        w='100%'
        bg='white'
        border='1px solid'
        borderRadius='semi'
        borderColor='niaid.placeholder'
        overflow='hidden'
      >
        {isLoading || !router.isReady ? (
          <Spinner size='md' color='primary.500' m={4} />
        ) : (
          lineage && (
            <Tree
              queryId={queryParams.id}
              data={lineage}
              updateLineage={updateLineageWithChildren}
            />
          )
        )}
      </Box>
    </Box>
  );
};
const MARGIN = 16;
// TreeNode component
const TreeNode = ({
  node,
  data,
  depth = 0,
  queryId,
  updateLineage,
}: {
  node: OntologyTreeItem;
  data: OntologyTreeItem[];
  depth: number;
  queryId: string;
  updateLineage: (nodeId: string, children: OntologyTreeItem[]) => void;
}) => {
  const [isToggled, setIsToggled] = useState(node.state.opened);
  const [fetchedChildren, setFetchedChildren] = useState<OntologyTreeItem[]>(
    [],
  );
  const [childrenList, setChildrenList] = useState<OntologyTreeItem[]>([]);

  const {
    error,
    isLoading,
    data: childrenData,
    refetch: fetchChildren,
  } = useQuery({
    queryKey: ['fetch-children', node.id],
    queryFn: () => {
      if (!node.id) {
        return null;
      }
      return fetchOntologyChildrenByNodeId(node.id, {
        id: node.taxonId,
        ontology: node.ontology_name as OntologyTreeParams['ontology'],
      });
    },
    refetchOnWindowFocus: false,
    enabled: false,
  });

  const toggleNode = () => {
    fetchChildren();
    setIsToggled(!isToggled);
  };

  useEffect(() => {
    if (isToggled && childrenData?.children) {
      setFetchedChildren(childrenData.children);
    } else {
      setFetchedChildren([]);
    }
  }, [queryId, childrenData, isToggled]);

  useEffect(() => {
    setIsToggled(node.state.opened);
    setFetchedChildren([]);
  }, [queryId, node.state.opened]);

  // Set children data in state with node information. Refresh when queryId changes.
  useEffect(() => {
    const children = getChildren(node.id, data);
    setChildrenList(children);
  }, [queryId, data, node.id]);

  // Update lineage with new children data (if there is) when toggled open
  useEffect(() => {
    if (isToggled && fetchedChildren.length > 0) {
      updateLineage(node.id, fetchedChildren);
    }
  }, [queryId, isToggled, fetchedChildren, node.id, updateLineage]);

  return (
    <ListItem>
      <Flex
        alignItems='center'
        borderTop={depth !== 0 ? '0.25px solid' : 'none'}
        borderColor='gray.200'
        bg={node.state.selected ? 'primary.50' : 'transparent'}
        px={4}
        py={2}
        pl={`${(depth + 1) * MARGIN}px`}
        onClick={toggleNode}
        cursor={
          childrenList.length > 0 || node.hasChildren ? 'pointer' : 'default'
        }
        _hover={{
          bg: node.state.selected ? 'primary.50' : 'blackAlpha.100',
        }}
      >
        <IconButton
          aria-label='Search database'
          icon={<FaAngleRight />}
          variant='ghost'
          colorScheme='gray'
          size='sm'
          transform={isToggled ? 'rotate(90deg)' : ''}
          color={
            childrenList.length > 0 || node.hasChildren
              ? 'currentColor'
              : 'transparent'
          }
        />
        <Text
          ml={`${MARGIN}px`}
          color={node.state.selected ? 'primary.500' : 'currentColor'}
          fontWeight={node.state.selected ? 'semibold' : 'normal'}
          textAlign='left'
          flex={1}
        >
          {node.label}
        </Text>
        {isLoading && <Spinner size='sm' color='primary.500' />}
      </Flex>

      {isToggled && childrenList.length > 0 && (
        <UnorderedList ml={0}>
          {childrenList.map(child => (
            <TreeNode
              key={child.id}
              queryId={queryId}
              node={child}
              data={data}
              depth={depth + 1}
              updateLineage={updateLineage}
            />
          ))}
        </UnorderedList>
      )}
    </ListItem>
  );
};

// Tree component that renders the entire tree
const Tree = ({
  data,
  updateLineage,
  queryId,
}: {
  queryId: string;
  data: OntologyTreeItem[];
  updateLineage: (nodeId: string, children: OntologyTreeItem[]) => void;
}) => {
  // Only render the root nodes initially (nodes with no parent)
  const rootNodes = data.filter(item => !item.parent);

  return (
    <UnorderedList ml={0}>
      {rootNodes.map(node => (
        <TreeNode
          key={node.id}
          queryId={queryId}
          node={node}
          data={data}
          depth={0}
          updateLineage={updateLineage}
        />
      ))}
    </UnorderedList>
  );
};
