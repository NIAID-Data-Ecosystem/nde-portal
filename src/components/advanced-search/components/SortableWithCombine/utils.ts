import type { ClientRect, UniqueIdentifier } from '@dnd-kit/core';
import type { FlattenedItem, DragItem, DragItems } from './types';
import { arrayMove } from '@dnd-kit/sortable';

export function getProjection(
  items: FlattenedItem[],
  activeId: UniqueIdentifier,
  overId: UniqueIdentifier,
) {
  const overItemIndex = items.findIndex(({ id }) => id === overId);
  const activeItemIndex = items.findIndex(({ id }) => id === activeId);
  const activeItem = items[activeItemIndex];
  const newItems = arrayMove(items, activeItemIndex, overItemIndex);
  const previousItem = newItems[overItemIndex - 1];
  const nextItem = newItems[overItemIndex + 1];
  const projectedDepth = activeItem.depth;
  const maxDepth = getMaxDepth({
    previousItem,
  });
  const minDepth = getMinDepth({ nextItem });
  let depth = projectedDepth;

  if (projectedDepth >= maxDepth) {
    depth = maxDepth;
  } else if (projectedDepth < minDepth) {
    depth = minDepth;
  }

  return { depth, parentId: getParentId() };

  function getParentId() {
    if (depth === 0 || !previousItem) {
      return null;
    }

    if (depth === previousItem.depth) {
      return previousItem.parentId;
    }

    if (depth > previousItem.depth) {
      return previousItem.id;
    }

    const newParent = newItems
      .slice(0, overItemIndex)
      .reverse()
      .find(item => item.depth === depth)?.parentId;

    return newParent ?? null;
  }
}

function getMaxDepth({ previousItem }: { previousItem: FlattenedItem }) {
  if (previousItem) {
    return previousItem.depth + 1;
  }

  return 0;
}

function getMinDepth({ nextItem }: { nextItem: FlattenedItem }) {
  if (nextItem) {
    return nextItem.depth;
  }

  return 0;
}

function flatten(
  items: DragItems,
  parentId: UniqueIdentifier | null = null,
  depth = 0,
): FlattenedItem[] {
  return items.reduce<FlattenedItem[]>((acc, item, index) => {
    return [
      ...acc,
      { ...item, parentId, depth, index },
      ...flatten(item.children, item.id, depth + 1),
    ];
  }, []);
}

export function flattenTree(items: DragItems): FlattenedItem[] {
  return flatten(items);
}

// transform items to be grouped by parent Id
export const itemsGroupedByParentId = (items: FlattenedItem[]) => {
  return items.reduce((r, item) => {
    const parentId = `${item.parentId}` || 'root';
    if (!r[parentId]) {
      r[parentId] = [];
    }
    r[parentId].push(item);
    return r;
  }, {} as { [key: string]: FlattenedItem[] });
};

// update item index to reflect it's position.
export const updateIndices = (items: FlattenedItem[]) => {
  const groupedByParentId = itemsGroupedByParentId(items);

  Object.values(groupedByParentId).map(items => {
    return items.forEach((item, index) => {
      item.index = index;
    });
  });

  return items;
};

export function buildTree(flattenedItems: FlattenedItem[]): DragItems {
  const root: DragItem = {
    id: 'root',
    value: { term: '', field: '' },
    children: [],
  };
  const nodes: Record<string, DragItem> = { [root.id]: root };
  const items = updateIndices([...flattenedItems]).map(item => ({
    ...item,
    children: [],
    value: {
      ...item.value,
      union:
        item.index === 0
          ? undefined
          : item.value.union
          ? item.value.union
          : 'AND',
    },
  }));

  items.forEach(item => {
    const { id, children, value } = item;
    const parentId = item.parentId ?? root.id;
    const parent = nodes[parentId] ?? findItem(items, parentId);

    nodes[id] = { id, children, value: { ...value } };
    parent.children.push(item);
  });

  return root.children;
}

export function findItem(items: DragItem[], itemId: UniqueIdentifier) {
  return items.find(({ id }) => id === itemId);
}

/**
 * Returns the intersecting rectangle area between two rectangles
 * Copied from dnd-kit/packages/core/src/utilities/algorithms/rectIntersection.ts
 */
export function getIntersectionRatio(
  entry: ClientRect,
  target: ClientRect,
): number {
  const top = Math.max(target.top, entry.top);
  const left = Math.max(target.left, entry.left);
  const right = Math.min(target.left + target.width, entry.left + entry.width);
  const bottom = Math.min(target.top + target.height, entry.top + entry.height);
  const width = right - left;
  const height = bottom - top;

  if (left < right && top < bottom) {
    const targetArea = target.width * target.height;
    const entryArea = entry.width * entry.height;
    const intersectionArea = width * height;
    const intersectionRatio =
      intersectionArea / (targetArea + entryArea - intersectionArea);

    return Number(intersectionRatio.toFixed(4));
  }

  // Rectangles do not overlap, or overlap has an area of zero (edge/corner overlap)
  return 0;
}

// Remove any unnecessary nesting as in when a container only has one child we can collapse that container.
export const collapseContainers = (
  activeItem: FlattenedItem,
  items: FlattenedItem[],
) => {
  const clonedItems = [...items];
  // This is some convoluted code to unnest containers with only one child.
  const activeParentIndex = clonedItems.findIndex(
    ({ id }) => id === activeItem.parentId,
  );
  const activeParent = clonedItems[activeParentIndex];
  const activeItemSiblings =
    activeParent && activeParent.children.filter(d => d.id !== activeItem.id);

  if (activeItemSiblings && activeItemSiblings.length <= 1) {
    const siblingIndex = clonedItems.findIndex(
      item => item.id === activeItemSiblings[0].id,
    );
    clonedItems[siblingIndex] = {
      ...clonedItems[siblingIndex],
      parentId: activeParent.parentId,
      depth: activeParent.depth,
    };
    clonedItems.splice(activeParentIndex, 1);
  }
  return clonedItems;
};
