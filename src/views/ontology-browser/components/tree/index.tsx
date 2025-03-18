import React from 'react';
import { UnorderedList } from '@chakra-ui/react';
import {
  OntologyLineageItemWithCounts,
  OntologyLineageRequestParams,
} from '../../types';
import { TreeNode } from './components/tree-node';

export const MARGIN = 16; // Base margin for indenting tree levels
export const SIZE = 20; // Number of items to fetch per page

/**
 * Tree Component
 *
 * Renders the ontology tree starting from the `showFromIndex`.
 * It includes breadcrumb navigation for the collapsed portion of the lineage
 * and recursively renders `TreeNode` components for each node in the visible portion of the tree.
 */

export interface TreeProps {
  addToSearch: (
    searchItem: Pick<
      OntologyLineageItemWithCounts,
      'counts' | 'label' | 'ontologyName' | 'taxonId'
    >,
  ) => void;
  isIncludedInSearch: (id: OntologyLineageItemWithCounts['taxonId']) => boolean;
  lineage: OntologyLineageItemWithCounts[];
  params: {
    q: string;
    id: string;
    ontology: OntologyLineageRequestParams['ontology'];
  };
  showFromIndex: number;
  updateLineage: (children: OntologyLineageItemWithCounts[]) => void;
}

export const Tree = ({
  addToSearch,
  isIncludedInSearch,
  lineage,
  params,
  showFromIndex,
  updateLineage,
}: TreeProps) => {
  const treeNodes = lineage.slice(showFromIndex); // Visible portion of the lineage
  const rootNodes = [treeNodes[0]]; // Only render the root node initially
  return (
    <>
      {/* Breadcrumbs for collapsed portion of the tree */}
      <UnorderedList ml={0}>
        {rootNodes.map(node => (
          <TreeNode
            key={node.id}
            addToSearch={addToSearch}
            isIncludedInSearch={isIncludedInSearch}
            node={node}
            lineage={treeNodes}
            params={params}
            depth={0}
            updateLineage={updateLineage}
          />
        ))}
      </UnorderedList>
    </>
  );
};
