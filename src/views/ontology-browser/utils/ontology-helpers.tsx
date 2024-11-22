import { OntologyLineageItemWithCounts } from '../types';

/**
 * Retrieves the child nodes of a given parent node from the ontology lineage data.
 *
 * @param parentId - The taxon ID of the parent node whose children need to be retrieved.
 * @param data - The array of ontology lineage items to search within.
 * @returns - An array of child nodes for the specified parent node.
 *
 */
export const getChildren = (
  parentId: OntologyLineageItemWithCounts['taxonId'],
  lineage: OntologyLineageItemWithCounts[],
): OntologyLineageItemWithCounts[] => {
  return lineage.filter(
    item => item.parentTaxonId !== undefined && item.parentTaxonId === parentId,
  );
};

/**
 * Sorts the children list by term count and lineage count in descending order.
 *
 * @param childrenList - The list of children nodes to sort.
 * @returns - The sorted list of children nodes.
 */
export const sortChildrenList = (
  childrenList: OntologyLineageItemWithCounts[],
) => {
  return childrenList.sort((a, b) => {
    // First, sort by `counts.term` in descending order
    if (a.counts.term !== b.counts.term) {
      return b.counts.term - a.counts.term;
    }

    // Then, sort by `lineage` in descending order
    if (a.counts.lineage !== b.counts.lineage) {
      return b.counts.lineage - a.counts.lineage;
    }

    return 0;
  });
};
