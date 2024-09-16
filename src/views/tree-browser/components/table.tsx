import {
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Box,
  Flex,
  HStack,
  Spinner,
  Tag,
  Text,
  Alert,
} from '@chakra-ui/react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/router';
import {
  fetchOntologyChildrenByNodeId,
  fetchOntologyTreeByTaxonId,
  OntologyTreeParams,
  OntologyTreeResponse,
  transformArray2Tree,
} from '../helpers';
import { TagWithUrl } from 'src/components/tag-with-url';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { debounce } from 'lodash';

export const TreeBrowserTable = () => {
  const router = useRouter();
  const id = router.query.id || 'NCBITaxon_1';
  const [tree, setTree] = useState<OntologyTreeResponse['tree'] | null>(null);

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
  const { error, isLoading, data } = useQuery({
    queryKey: ['tree-browser-search', queryParams.id, queryParams.ontology],
    queryFn: () => fetchOntologyTreeByTaxonId(queryParams),
    refetchOnWindowFocus: false,
    enabled: router.isReady && !!queryParams.id,
  });

  const selectedNode = data?.lineage[data.lineage.length - 1];

  useEffect(() => {
    if (data?.tree) {
      setTree(data.tree);
    }
  }, [data]);

  // Memoize the updateTreeData function
  const updateTreeData = useCallback(
    (children: OntologyTreeResponse['children']) => {
      if (!tree) return;

      const flattenedTree = tree.descendants().map(d => d.data);
      const filteredChildren = children.filter(
        child => !flattenedTree.some(node => node.id === child.id),
      );

      const newTree = transformArray2Tree([
        ...flattenedTree,
        ...filteredChildren,
      ]);
      setTree(newTree);
    },
    [tree],
  );
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
          tree && <OntologyItem item={tree} updateTreeData={updateTreeData} />
        )}
      </Box>
    </Box>
  );
};

export const OntologyItem = ({
  item,
  updateTreeData,
}: {
  item: OntologyTreeResponse['tree'];
  updateTreeData: (children: OntologyTreeResponse['children']) => void;
}) => {
  const MARGIN = 16;
  const [showChildren, setShowChildren] = useState(false);

  // Ref to track if children are fetched
  const childrenFetched = useRef(false);

  const { error, isLoading, data } = useQuery({
    queryKey: ['fetch-children', item.data.id],
    queryFn: () => {
      if (!item.id) {
        return null;
      }
      return fetchOntologyChildrenByNodeId(item.id, {
        id: item.data.taxonId,
        ontology: item.data.ontology_name as OntologyTreeParams['ontology'],
      });
    },
    refetchOnWindowFocus: false,
    enabled: showChildren && !childrenFetched.current,
  });

  useEffect(() => {
    if (
      data &&
      data.children &&
      data.children.length > 0 &&
      !childrenFetched.current
    ) {
      updateTreeData(data.children);
      childrenFetched.current = true;
    }
  }, [data, item, updateTreeData]);

  if (!item || !item.data) return null;

  const { label, state } = item.data;
  const { opened, selected } = state;
  const defaultIndex = opened ? 0 : -1;

  return (
    <Accordion
      w='100%'
      allowToggle
      defaultIndex={defaultIndex}
      onChange={() => setShowChildren(!showChildren)}
    >
      <AccordionItem border='none'>
        <h2>
          <AccordionButton
            borderTop={item.depth !== 0 ? '0.25px solid' : 'none'}
            borderColor='gray.200'
            bg={selected ? 'primary.50' : 'transparent'}
            pl={`${(item.depth + 1) * MARGIN}px`}
            cursor={
              item.children || item.data.hasChildren ? 'pointer' : 'default'
            }
            _expanded={{ svg: { transform: 'rotate(0deg)' } }}
            _hover={{
              bg:
                item.children || item.data.hasChildren
                  ? 'blackAlpha.50'
                  : 'transparent',
            }}
          >
            <AccordionIcon
              transform='rotate(-90deg)'
              color={
                item.children || item.data.hasChildren
                  ? 'currentColor'
                  : 'transparent'
              }
            />
            <Text
              color={selected ? 'primary.600' : 'currentColor'}
              flex='1'
              fontWeight={selected ? 'semibold' : 'normal'}
              ml={`${MARGIN}px`}
              textAlign='left'
            >
              {label}
            </Text>
            {isLoading && <Spinner size='sm' color='primary.500' />}
          </AccordionButton>
        </h2>
        {item.children && (
          <AccordionPanel px={0} py={0}>
            {item.children.map(child => (
              <OntologyItem
                key={child.id}
                item={child}
                updateTreeData={updateTreeData}
              />
            ))}
          </AccordionPanel>
        )}
      </AccordionItem>
    </Accordion>
  );
};
