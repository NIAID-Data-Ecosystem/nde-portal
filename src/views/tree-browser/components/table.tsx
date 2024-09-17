import { Box, HStack, Spinner, Text, Alert } from '@chakra-ui/react';
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
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

export const TreeBrowserTable = () => {
  const router = useRouter();
  const id = router.query.id || 'NCBITaxon_1';
  const [tree, setTree] = useState<OntologyTreeResponse['tree'] | null>(null);
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
      // setTree(allData.tree);
      setLineage(allData.lineage);
    }
  }, [allData]);

  // Update lineage with new children
  const updateLineageWithChildren = useCallback(
    (nodeId: string, children: OntologyTreeItem[]) => {
      setLineage(prevLineage => {
        if (!prevLineage) return [];

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
            <Tree data={lineage} updateLineage={updateLineageWithChildren} />
          )
        )}
      </Box>
    </Box>
  );
};

// TreeNode component
const TreeNode = ({
  node,
  data,
  depth = 0,
  updateLineage,
}: {
  node: OntologyTreeItem;
  data: OntologyTreeItem[];
  updateLineage: (nodeId: string, children: OntologyTreeItem[]) => void;
}) => {
  const [isOpen, setIsOpen] = useState(node.state.opened);

  const children = getChildren(node.id, data);

  const {
    error,
    isLoading,
    data: childrenData,
    refetch,
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
    refetch();
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    if (childrenData) {
      updateLineage(node.id, childrenData.children);
    }
  }, [childrenData, node.id, updateLineage]);
  return (
    <li>
      <div
        onClick={toggleNode}
        style={{
          cursor:
            children.length > 0 || node.hasChildren ? 'pointer' : 'default',
          paddingLeft: `${depth * 20}px`, // Indent based on depth level
        }}
      >
        {children.length > 0 || node.hasChildren ? (isOpen ? '▼' : '►') : '•'}{' '}
        {node.text}
      </div>
      {isOpen && children.length > 0 && (
        <ul>
          {children.map(child => (
            <TreeNode
              key={child.id}
              node={child}
              data={data}
              depth={depth + 1}
              updateLineage={updateLineage}
            />
          ))}
        </ul>
      )}
    </li>
  );
};

// Tree component that renders the entire tree
const Tree = ({
  data,
  updateLineage,
}: {
  data: OntologyTreeItem[];
  updateLineage: (nodeId: string, children: OntologyTreeItem[]) => void;
}) => {
  // Only render the root nodes initially (nodes with no parent)
  const rootNodes = data.filter(item => !item.parent);

  return (
    <ul>
      {rootNodes.map(node => (
        <TreeNode
          key={node.id}
          node={node}
          data={data}
          updateLineage={updateLineage}
        />
      ))}
    </ul>
  );
};
