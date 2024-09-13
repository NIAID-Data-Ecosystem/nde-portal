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
} from '@chakra-ui/react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/router';
import {
  fetchOntologyChildrenByNodeId,
  fetchOntologyTreeByTaxonId,
  OntologyTreeParams,
  OntologyTreeResponse,
} from '../helpers';
import { TagWithUrl } from 'src/components/tag-with-url';
import { useCallback, useEffect, useState } from 'react';

export const TreeBrowserTable = () => {
  const router = useRouter();
  const id = router.query.id || 'NCBITaxon_1';
  const [tree, setTree] = useState<OntologyTreeResponse['tree'] | null>(null);

  // Fetch tree data
  const { error, isLoading, data } = useQuery({
    queryKey: ['tree-browser-search', id],
    queryFn: () => {
      const string_id = Array.isArray(id) ? id[0] : id;
      return fetchOntologyTreeByTaxonId({
        id: string_id,
        ontology:
          string_id.split('_')[0] === 'NCBITaxon' ? 'ncbitaxon' : 'edam',
      });
    },
    refetchOnWindowFocus: false,
    enabled: router.isReady && !!id,
  });

  const selectedNode = data?.lineage[data.lineage.length - 1];

  useEffect(() => {
    if (data && data.tree) {
      setTree(data.tree);
    }
  }, [data]);

  // Update the tree with new children data
  const updateTreeData = useCallback(
    (id: string, children: OntologyTreeResponse['children']) => {
      if (!tree) return;

      // Recursively update the tree with new children for the expanded node
      const updateNode = (node: any): any => {
        if (node.data.id === id) {
          return { ...node, children };
        }

        if (node.children) {
          return {
            ...node,
            children: node.children.map(updateNode),
          };
        }

        return node;
      };

      setTree(updateNode(tree));
    },
    [tree],
  );

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
          tree && (
            <OntologyItem
              item={tree}
              updateTreeData={children => {
                console.log('children', children);
              }}
            />
          )
        )}
      </Box>
    </Box>
  );
};

/* Nested accordion items to display hierarchy */
export const OntologyItem = ({
  item,
  updateTreeData,
}: {
  item: OntologyTreeResponse['tree'];
}) => {
  const MARGIN = 16;
  const [expanded, setExpanded] = useState(false);
  const [children, setChildren] = useState(item.children || []);

  const { error, isLoading, data } = useQuery({
    queryKey: ['fetch-children', item.data.id],
    queryFn: () => {
      const nodeId = item?.id || '';
      return fetchOntologyChildrenByNodeId(nodeId, {
        id: item.data.taxonId,
        ontology: item.data.ontology_name as OntologyTreeParams['ontology'],
      });
    },
    refetchOnWindowFocus: false,
    enabled: expanded,
  });

  useEffect(() => {
    updateTreeData(item.data.id, children);
  }, [data]);

  const handleToggle = () => {
    setExpanded(!expanded);
  };

  if (!item || !item.data) {
    return <></>;
  }
  const { label, state } = item.data;
  const { opened, selected } = state;
  // Set default index to open all the items(parents) that precede the selected item.
  const defaultIndex = opened ? 0 : -1;

  return (
    <Accordion
      w='100%'
      allowToggle
      defaultIndex={defaultIndex}
      onChange={handleToggle}
    >
      <AccordionItem border='none'>
        <h2>
          <AccordionButton
            borderTop={item.depth !== 0 ? '0.25px solid' : 'none'}
            borderColor='gray.200'
            bg={selected ? 'primary.50' : 'transparent'}
            pl={`${(item.depth + 1) * MARGIN}px`}
          >
            <AccordionIcon
              color={item.children ? 'currentColor' : 'transparent'}
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
          </AccordionButton>
        </h2>
        {item.children && (
          <AccordionPanel px={0} py={0}>
            {item.children.map(child => (
              <OntologyItem key={child.id} item={child} />
            ))}
          </AccordionPanel>
        )}
      </AccordionItem>
    </Accordion>
  );
};
