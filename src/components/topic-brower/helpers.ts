interface PathItem {
  '@id': string;
  prefLabel: string;
  definition: string[];
}

export interface TreeNode {
  id: string;
  name: string;
  definition: string;
  children: TreeNode[];
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
  dataArrays: PathItem[][],
): TreeNode => {
  const root: TreeNode = {
    id: 'root',
    name: 'root',
    definition: '',
    url: '',
    children: [],
  };

  dataArrays.forEach(dataArray => {
    let currentNode = root;
    dataArray.forEach(item => {
      const newNode: TreeNode = {
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
