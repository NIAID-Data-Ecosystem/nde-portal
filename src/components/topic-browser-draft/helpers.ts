import { EBIOntologyResponse } from './hooks';

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
  isExpanded?: boolean;
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

export const transformAncestorsArraysToTree = (
  termData: EBIOntologyResponse[],
): TreeNode => {
  const ancestors = termData.map(item => [...item.ancestors, item]);
  const root: TreeNode = {
    id: 'root',
    name: 'root',
    definition: '',
    url: '',
    children: [],
  };

  ancestors.forEach(ancestorList => {
    let currentNode = root;
    ancestorList.forEach(item => {
      const newNode: TreeNode = {
        ...item,
        children: [],
      };
      currentNode = findOrCreateNode(currentNode, newNode);
    });
  });

  return root;
};

// export const transformPathArraysToTree = (
//   pathArray: OntologyPathsResponse[],
// ): TreeNode => {
//   const flattened = pathArray.map(item => item.paths2Root).flat();
//   console.log('FLAT', flattened);
//   const root: TreeNode = {
//     id: 'root',
//     name: 'root',
//     definition: '',
//     url: '',
//     children: [],
//   };

//   flattened.forEach(flatArray => {
//     let currentNode = root;
//     flatArray.forEach(item => {
//       const id = item['@id'].split('/').pop();
//       const item_data = pathArray.find(path => path.id === id);
//       const newNode: TreeNode = {
//         ...item_data,
//         name: item.prefLabel,
//         definition: item.definition[0],
//         url: item['@id'],
//         children: [],
//       };
//       currentNode = findOrCreateNode(currentNode, newNode);
//     });
//   });

//   return root;
// };
