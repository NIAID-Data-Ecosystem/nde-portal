import { remark } from 'remark';
import type { ContentHeading } from '../types';

// Transform a string into a URL-safe hash
export const transformString2Hash = (str: string): string => {
  return str
    .toLowerCase()
    .replace(/[^a-zA-Z\s]/g, '')
    .split(' ')
    .join('-');
};

// Extract headings from markdown content
export const extractMarkdownHeadings = (
  content: string,
  maxDepth: number,
  ignoreDetailsContent = true,
): ContentHeading[] => {
  const headings: ContentHeading[] = [];

  remark()
    .use(() => {
      let isInsideDetailsTag = false;
      return (root: any) => {
        root.children.forEach((child: any) => {
          if (ignoreDetailsContent && child.type === 'html') {
            if (child.value.startsWith('<details>')) {
              isInsideDetailsTag = true;
            } else if (child.value.startsWith('</details>')) {
              isInsideDetailsTag = false;
            }
          }

          // Ignore headings within <details> html tag
          if (ignoreDetailsContent && isInsideDetailsTag) return;

          if (child.type === 'heading' && child.depth <= maxDepth) {
            const title = child.children[0]?.value || '';
            headings.push({
              title,
              hash: transformString2Hash(title),
              depth: child.depth,
            });
          }
        });
      };
    })
    .process(content);

  return headings;
};

// Search for a target word in MDX content and return the nearest heading and snippet
export const searchInMDX = (
  mdxString: string,
  targetWord: string,
  targetLength = 200,
): { heading: string | null; snippet: string | null } => {
  let nearestHeading: string | null = null;
  let snippet: string | null = null;

  // Parse the MDX content into mdast
  const tree = remark().parse(mdxString);

  // Helper function to extract text from a node
  const extractText = (node: any): string => {
    if (node.type === 'text' || node.type === 'inlineCode') {
      return node.value;
    } else if (node.children) {
      return node.children.map(extractText).join('');
    }
    return '';
  };

  // Traverse the mdast tree. Stop when the target word is found.
  for (let i = 0; i < tree.children.length; i++) {
    const node = tree.children[i];

    // Store the nearest preceding heading
    if (node.type === 'heading') {
      const rawHeading = extractText(node);
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
      const startIndex = index < targetLength ? 0 : index;
      snippet = text.substr(startIndex, targetLength);
      break;
    }
  }

  return {
    heading: nearestHeading,
    snippet,
  };
};
