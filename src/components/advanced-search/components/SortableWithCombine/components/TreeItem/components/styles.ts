import { getUnionTheme } from 'src/components/advanced-search/utils/query-helpers';
import { WrapperProps } from './TreeItemWrapper';
import { FlattenedItem } from '../../../types';

export interface ItemProps
  extends Omit<
    WrapperProps,
    'children' | 'clone' | 'depth' | 'ghost' | 'getParentItem' | 'parentId'
  > {
  parentItem: FlattenedItem;
}

export const getItemStyles = ({
  id,
  childCount,
  collapsed,
  disableInteraction,
  indentationWidth,
  parentItem,
}: ItemProps) => {
  const isFirstChild = parentItem.children[0].id === id;

  // add bottom padding to the last child
  const isLastChild =
    (!childCount &&
      parentItem.children[parentItem.children.length - 1].id === id) ||
    (collapsed &&
      parentItem.children[parentItem.children.length - 1].id === id);

  const styles: any = {
    pl: { base: `${indentationWidth / 2}px`, sm: `${indentationWidth}px` },
    pr: { base: 0, sm: `${indentationWidth / 2}px` },
    pt: isFirstChild ? 4 : 0,
    position: 'relative',
    bg: '#fff',
    borderLeftColor: parentItem.value.union
      ? `${getUnionTheme(parentItem.value.union).colorScheme}.300`
      : 'transparent',
  };

  if (isLastChild) {
    styles.borderBottom = isLastChild ? '1px solid' : 'none';
    styles.borderBottomColor = isLastChild ? 'gray.200' : 'none';
    styles.pb = disableInteraction ? 0 : 4;
    styles.boxShadow = 'base';
  }

  return styles;
};
