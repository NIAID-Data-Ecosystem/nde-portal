import type { ClientRect, Collision, UniqueIdentifier } from '@dnd-kit/core';
import type { FlattenedItem, DragItem, DragItems } from './types';
import { uniqueId } from 'lodash';

const DEFAULT_UNION = 'AND';
/**
 * Returns the intersecting rectangle area between two rectangles
 * Retrieved from dnd-kit/packages/core/src/utilities/algorithms/rectIntersection.ts
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

export function findItem(items: DragItem[], itemId: UniqueIdentifier) {
  return items.find(({ id }) => id === itemId);
}

/**
 * [Data Structure Helpers]:
 * [buildTree]: Transform a flat array of sorted
 * items to a nested structure.
 */

export function buildTree(flattenedItems: FlattenedItem[]): DragItems {
  const root: DragItem = {
    id: 'root',
    value: { term: '', field: '' },
    children: [],
    index: 0,
  };
  const nodes: Record<string, DragItem> = { [root.id]: root };
  const updated = updateIndices([...flattenedItems]);
  const items = updated.map((item, i) => {
    let union = item.value.union;
    const prevUnion = i !== 0 && updated[i - 1].value.union;
    const nextUnion = i !== updated.length - 1 && updated[i + 1].value.union;
    // if first item in container, no need for union
    if (item.index === 0) {
      union = undefined;
    } else if (!union) {
      if (prevUnion) {
        union = prevUnion;
      } else if (nextUnion) {
        union = nextUnion;
      } else {
        union = DEFAULT_UNION;
      }
    }
    return {
      ...item,
      children: [],
      value: {
        ...item.value,
        union: union,
      },
    };
  });

  items
    .sort((a, b) => a.index - b.index)
    .forEach(item => {
      const { id, children, value, index } = item;
      const parentId = item.parentId ?? root.id;
      const parent = nodes[parentId] ?? findItem(items, parentId);
      nodes[id] = { index, id, children, value: { ...value } };
      parent.children.push(item);
    });

  return collapseTree([...root.children]);
}

/**
 * [collapseTree]: Un-nests items from unnecessary container
 *  (i.e. containers that just have one element.)
 */
const collapseTree = (tree: DragItem[]) => {
  const collapse = (items: DragItem[]) => {
    return items.reduce((r, item, i) => {
      let updatedItem = { ...item };
      updatedItem.children = collapse([...item.children]);
      // remove unnesssary containers (i.e. containers that just have one element)
      if (item.children.length == 1) {
        const child = item.children[0];
        updatedItem = {
          ...updatedItem,
          id: child.id,
          value: {
            ...child.value,
            union:
              !child.value.union && updatedItem.index !== 0
                ? DEFAULT_UNION
                : child.value.union,
          },
          children: child.children,
        };
      }

      r.push(updatedItem);
      return r;
    }, [] as DragItem[]);
  };
  return collapse(tree);
};

/**
 * [groupItemsByParentId]: Transform items to be grouped by parent Id
 */
export const groupItemsByParentId = (items: FlattenedItem[]) => {
  return items.reduce((r, item) => {
    const parentId = `${item.parentId}` || 'root';
    if (!r[parentId]) {
      r[parentId] = [];
    }
    r[parentId].push(item);
    return r;
  }, {} as { [key: string]: FlattenedItem[] });
};

/**
 * [MERGING HELPERS]:
 *
 * [shouldCombine]: Given a desired collision ratio, compares the collision
 * ratio between an active element and colliding element. Determines whether both
 * elements should merge into one.
 */

export const shouldCombine = (
  activeId: UniqueIdentifier | null,
  collisions: Collision[] | null,
  collisionRange: [number, number] = [0.1, 0.4],
) => {
  // False if no collision is detected.
  if (!collisions || collisions.length === 0) {
    return false;
  }
  const { id: collidingId, data } = collisions[0];
  // False if droppable element is same as dragged element.
  if (collidingId === activeId) {
    return false;
  }
  const collisionData =
    data &&
    data.length > 0 &&
    data?.filter((collision: Collision) => collision.id === collidingId)[0]
      .data;

  if (!collisionData || !collidingId) {
    return false;
  }
  const collisionRatio = collisionData.value;
  const shouldCombine =
    collidingId !== activeId &&
    collisionRatio != null &&
    collisionRatio > collisionRange[0] &&
    collisionRatio < collisionRange[1];
  return shouldCombine;
};

/**
 * [addToExistingGroup]: Return the dragged item with the same
 * parentId as the item being dragged over to put them in the
 * same container.
 */
export const addToExistingGroup = (
  droppableItem: FlattenedItem,
  activeItem: FlattenedItem,
) => {
  return {
    ...activeItem,
    parentId: droppableItem.id,
    depth: activeItem.depth + 1,
    index: droppableItem.children.length,
  };
};

/**
 * [createNewGroup]: When two items are merged, we create a new
 * wrapping container to group them together. [createNewGroup] returns
 * the container data with a unique id that uses the nested items.
 */
export const createNewGroup = (
  droppableItem: FlattenedItem,
  activeItem: FlattenedItem,
) => {
  const clonedDroppable = {
    ...droppableItem,
    id: `${uniqueId(`${droppableItem.id}-${activeItem.id}-`)}`,
  };
  return clonedDroppable;
};

/**
 * [updateIndices]: When items become merged or sorted,
 * the index of the item needs to update to reflect the change.
 */
export const updateIndices = (items: FlattenedItem[]) => {
  const groupedByParentId = groupItemsByParentId(items);

  Object.values(groupedByParentId).map(items => {
    return items.forEach((item, index) => {
      item.index = index;
    });
  });

  return items;
};

// remove item(and descendants) from list.
export function removeItem(items: DragItem[], id: UniqueIdentifier) {
  const newItems = [];

  for (const item of items) {
    if (item.id === id) {
      continue;
    }

    if (item.children.length) {
      item.children = removeItem(item.children, id);
    }

    newItems.push(item);
  }

  return newItems;
}
