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

// Update lineage with new children
export const mergePreviousLineageWithChildrenData = (
  previousLineage: OntologyLineageItemWithCounts[] | null,
  childrenData: OntologyLineageItemWithCounts[],
) => {
  if (!previousLineage) return [];

  // If no children, return previous lineage as it is
  if (childrenData.length === 0) return previousLineage;

  // Use a Set for faster lookup of existing taxonId values
  const existingTaxonIds = new Set(previousLineage.map(node => node.taxonId));

  // Filter out childrenData that are already in the previousLineage
  const filteredChildren = childrenData.filter(
    child => !existingTaxonIds.has(child.taxonId),
  );

  // If no childrenData left after filtering, return previous lineage as it is
  if (filteredChildren.length === 0) return previousLineage;
  return [...previousLineage, ...filteredChildren];
};
