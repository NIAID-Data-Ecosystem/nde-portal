import { OntologyPathsResponse } from './hooks';

interface PathItem {
  '@id': string;
  prefLabel: string;
  definition: string[];
}

export interface TreeNode {
  id: string;
  children: TreeNode[];
  count?: number;
  definition: string;
  name: string;
  term?: string;
  url: string;
}

// Helper function to find or create a node
const findOrCreateNode = (root: TreeNode, node: TreeNode): TreeNode => {
  const existingNode = root.children.find(child => child.id === node.id);
  if (existingNode) {
    return existingNode;
  } else {
    root.children.push(node);
    return node;
  }
};
export const transformPathArraysToTree = (
  pathArray: OntologyPathsResponse[],
): TreeNode => {
  const flattened = pathArray.map(item => item.paths2Root).flat();
  const root: TreeNode = {
    id: 'root',
    name: 'root',
    definition: '',
    url: '',
    children: [],
  };

  flattened.forEach(flatArray => {
    let currentNode = root;
    flatArray.forEach(item => {
      const item_data = pathArray.find(path => path.id === item['@id']);
      const newNode: TreeNode = {
        ...item_data,
        id: item['@id'].split('http://edamontology.org/')[1],
        name: item.prefLabel,
        definition: item.definition[0],
        url: item['@id'],

        children: [],
      };
      currentNode = findOrCreateNode(currentNode, newNode);
    });
  });

  return root;
};