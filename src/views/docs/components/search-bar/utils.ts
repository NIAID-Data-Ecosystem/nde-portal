import { remark } from 'remark';

export function searchInMDX(
  mdxString: string,
  targetWord: string,
  targetLength = 200,
) {
  let nearestHeading = null;
  let snippet = null;

  // Parse the MDX content into mdast
  const tree = remark().parse(mdxString);

  // Helper function to extract text from a node
  function extractText(node: any) {
    if (node.type === 'text' || node.type === 'inlineCode') {
      return node.value;
    } else if (node.children) {
      return node.children.map(extractText).join('');
    }
    return '';
  }

  // Traverse the mdast tree. Stop when the target word is found.
  for (let i = 0; i < tree.children.length; i++) {
    const node = tree.children[i];

    // Store the nearest preceding heading
    if (node.type === 'heading') {
      let rawHeading = extractText(node);
      nearestHeading = rawHeading
        .toLowerCase() // convert to lowercase
        .replace(/[^a-zA-Z\s]/g, '') // remove non-alpha characters
        .trim() // trim any extra whitespace from start and end
        .replace(/\s+/g, '-'); // replace sequences of whitespace with dash
    }

    // Check if the node contains the target word
    const text = extractText(node);
    const index = text.toLowerCase().indexOf(targetWord.toLowerCase());

    if (index !== -1) {
      let startIndex;
      if (index < targetLength) {
        startIndex = 0;
      } else {
        startIndex = index;
      }

      snippet = text.substr(startIndex, targetLength);
      break;
    }
  }

  return {
    heading: nearestHeading,
    snippet: snippet,
  };
}
