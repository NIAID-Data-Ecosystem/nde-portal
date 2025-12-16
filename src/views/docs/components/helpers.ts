import { remark } from 'remark';

export const transformString2Hash = (str: string) => {
  return str
    .toLowerCase()
    .replace(/[^a-zA-Z\s]/g, '')
    .split(' ')
    .join('-');
};

interface ContentHeading {
  title: string;
  hash: string;
  depth: number;
}

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
        root.children.map((child: any) => {
          if (ignoreDetailsContent && child.type === 'html') {
            if (child.value.startsWith('<details>')) {
              isInsideDetailsTag = true;
            } else if (child.value.startsWith('</details>')) {
              isInsideDetailsTag = false;
            }
          }
          //ignore headings within <details> html tag
          if (ignoreDetailsContent && isInsideDetailsTag) return;

          if (child.type === 'heading' && child.depth <= maxDepth) {
            headings.push({
              title: child.children[0].value || '',
              hash: transformString2Hash(child.children[0].value) || '',
              depth: child.depth,
            });
          }
        });
      };
    })
    .process(content);
  return headings;
};
