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
 * Sorts the children list by term count and term+children count in descending order.
 *
 * @param childrenList - The list of children nodes to sort.
 * @returns - The sorted list of children nodes.
 */
export const sortChildrenList = (
  childrenList: OntologyLineageItemWithCounts[],
) => {
  const sorted = childrenList.sort((a, b) => {
    // First, sort by `counts.term` in descending order
    if (a.counts.termCount !== b.counts.termCount) {
      return b.counts.termCount - a.counts.termCount;
    }

    // // Then, sort by `term+children` in descending order
    // if (a.counts.termAndChildrenCount !== b.counts.termAndChildrenCount) {
    //   return b.counts.termAndChildrenCount - a.counts.termAndChildrenCount;
    // }

    return 0;
  });
  return sorted;
};
