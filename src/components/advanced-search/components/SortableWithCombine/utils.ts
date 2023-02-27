import { uniqueId } from 'lodash';
import type { UniqueIdentifier } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import MetadataFieldsConfig from 'configs/resource-fields.json';
import type { FlattenedItem, TreeItem, TreeItems } from './types';

export function findItem(items: TreeItems, itemId: UniqueIdentifier) {
  return items.find(({ id }) => id === itemId);
}

const getNextItem = (
  items: FlattenedItem[],
  { index, depth, parentId }: FlattenedItem,
) => {
  const itemList = items.filter(
    item =>
      (item.parentId === parentId || (!item.parentId && !parentId)) &&
      item.depth === depth,
  );

  const nextEl = itemList.find(item => item.index === index + 1);
  return nextEl;
};

const getPrevItem = (
  items: FlattenedItem[],
  { index, depth, parentId }: FlattenedItem,
) => {
  if (index === 0) {
    return undefined;
  }
  const itemList = items.filter(
    item => item.parentId === parentId && item.depth === depth,
  );
  const prevEl = itemList.find(item => item.index === index - 1);
  return prevEl;
};

// Update the union between items.
const getUnionValue = (items: FlattenedItem[], item: FlattenedItem) => {
  let union = item.value.union;
  const nextEl = getNextItem(items, item);
  const prevEl = getPrevItem(items, item);
  /*
  if the item is the first in a list, copy the union value of the next element.
  */
  if (item.index === 0 || (item.index !== 0 && !union)) {
    // if there is no next element, check for prev element.
    if (nextEl && nextEl.value.union) {
      union = nextEl.value.union;
    } else if (prevEl && prevEl.value.union) {
      union = prevEl.value.union;
      // if its the only item, we remove the union.
    } else if (items.length === 1) {
      union = undefined;
    }
  }

  return union;
};

/**
 * [Data Structure Helpers]:
 * [flatten]: Transform a tree object into a flat
 * array.
 * [buildTree]: Transform a flat array of sorted
 * items to a nested structure.
 */

export function flatten(
  items: TreeItems,
  parent?: FlattenedItem,
  depth: number = 0,
): FlattenedItem[] {
  const parentId = parent?.id || null;
  return items.reduce<FlattenedItem[]>((acc, item, index) => {
    let union = item.value.union;
    // if the item is the first in a list and has no assigned union, copy the union value of the next element.
    if (index === 0) {
      union = items[index + 1]?.value.union;
    }

    const updatedItem = {
      ...item,
      parentId,
      depth,
      index,
      value: {
        ...item.value,
        union,
      },
    };

    return [
      ...acc,
      updatedItem,
      ...flatten(item.children, { ...item, ...updatedItem }, depth + 1),
    ];
  }, []);
}

export function flattenTree(items: TreeItems): FlattenedItem[] {
  return flatten(items);
}
export function buildTree(flattenedItems: FlattenedItem[]): TreeItems {
  const root = { id: 'root', children: [] };
  const nodes: Record<string, Partial<TreeItem>> = { [root.id]: root };
  const items = flattenedItems.map(item => ({
    ...item,
    children: [],
    value: {
      ...item.value,
      querystring: item.value.querystring || item.value.term,
      union: getUnionValue(flattenedItems, item),
    },
  }));

  for (const item of items) {
    const { id, children } = item;
    const parentId = item.parentId ?? root.id;
    const parent = nodes[parentId] ?? findItem(items, parentId);

    nodes[id] = { id, children };
    if (parent && parent.children) {
      parent.children.push(item);
    }
  }

  return collapseTree(root.children);
}

export function setProperty<T extends keyof TreeItem>(
  items: TreeItems,
  id: UniqueIdentifier,
  property: T,
  setter: (value: TreeItem[T]) => TreeItem[T],
) {
  for (const item of items) {
    if (item.id === id) {
      item[property] = setter(item[property]);
      continue;
    }

    if (item.children.length) {
      item.children = setProperty(item.children, id, property, setter);
    }
  }

  return [...items];
}

/**
 * [collapseTree]: Un-nests items from unnecessary container
 *  (i.e. containers that just have one element.)
 */
export const collapseTree = (tree: TreeItem[]) => {
  const collapse = (items: TreeItem[]) => {
    return items.reduce((r, item) => {
      let updatedItem = { ...item };
      updatedItem.children = collapse([...item.children]);

      if (updatedItem.children.length > 0) {
        // Update term string of parent items to display a string with the children terms and unions.
        updatedItem.value.term = transformParentString4Display(updatedItem);
      }

      // remove unnesssary containers (i.e. containers that just have one element)
      if (item.children.length == 1) {
        const child = item.children[0];
        updatedItem = {
          ...updatedItem,
          id: child.id,
          children: child.children,
          value: {
            ...child.value,
            union: child.value.union || updatedItem.value.union,
          },
        };
      }

      r.push(updatedItem);
      return r;
    }, [] as TreeItem[]);
  };
  return collapse(tree);
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
export function removeItem(items: TreeItem[], id: UniqueIdentifier) {
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

export function removeChildrenOf(
  items: FlattenedItem[],
  ids: UniqueIdentifier[],
) {
  const excludeParentIds = [...ids];

  return items.filter(item => {
    if (item.parentId && excludeParentIds.includes(item.parentId)) {
      if (item.children.length) {
        excludeParentIds.push(item.id);
      }
      return false;
    }

    return true;
  });
}

function getDragDepth(offset: number, indentationWidth: number) {
  return Math.round(offset / indentationWidth);
}

export function getProjection(
  items: FlattenedItem[],
  activeId: UniqueIdentifier,
  overId: UniqueIdentifier,
  dragOffset: number,
  indentationWidth: number,
) {
  const overItemIndex = items.findIndex(({ id }) => id === overId);
  const activeItemIndex = items.findIndex(({ id }) => id === activeId);
  const activeItem = items[activeItemIndex];
  const newItems = arrayMove(items, activeItemIndex, overItemIndex);
  const previousItem = newItems[overItemIndex - 1];
  const nextItem = newItems[overItemIndex + 1];
  const dragDepth = getDragDepth(dragOffset, indentationWidth);
  const projectedDepth = activeItem.depth + dragDepth;
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

  return { depth, maxDepth, minDepth, parentId: getParentId() };

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

export function findItemDeep(
  items: TreeItems,
  itemId: UniqueIdentifier,
): TreeItem | undefined {
  for (const item of items) {
    const { id, children } = item;

    if (id === itemId) {
      return item;
    }

    if (children.length) {
      const child = findItemDeep(children, itemId);

      if (child) {
        return child;
      }
    }
  }

  return undefined;
}
function countChildren(items: TreeItem[], count = 0): number {
  return items.reduce((acc, { children }) => {
    if (children.length) {
      return countChildren(children, acc);
    }

    return acc + 1;
  }, count);
}

export function getChildCount(items: TreeItems, id: UniqueIdentifier) {
  const item = findItemDeep(items, id);
  return item ? countChildren(item.children) : 0;
}

export const getItemsByParentId = (
  items: FlattenedItem[],
  parentId?: UniqueIdentifier | null,
) => {
  return items.filter(item => {
    if (!parentId) {
      return !item.parentId;
    }
    return item.parentId === parentId;
  });
};

/********************************************************
 *
 *  Functions for transforming data objects to strings
 *  formatting tag texts.
 *
 *******************************************************/

/**
 * [transformTermString4Display]: [TO DO]
 */
type MetadataField = (typeof MetadataFieldsConfig)[number];

export const transformField4Display = (field: TreeItem['value']['field']) => {
  if (!field) {
    return '';
  } else if (field === '_exists_') {
    return '';
    // return 'Must contain';
  } else if (field === '-_exists_') {
    return '';
    // return 'Must not contain';
  } else {
    const metadataField = MetadataFieldsConfig.find(
      metadata => metadata.property === field,
    ) as MetadataField;

    const field_name = metadataField?.name || '';
    return field_name;
  }
};

/**
 * [transformTermString4Display]: [TO DO]
 *
 */

export const transformTerm4Display = (
  term: TreeItem['value']['term'],
  field: TreeItem['value']['field'],
) => {
  if (field === '_exists_' || field === '-_exists_') {
    const field_name = transformField4Display(term);
    if (field === '_exists_') {
      return `Must contain: ${field_name}`;
    } else {
      return `Must not contain: ${field_name}`;
    }
  } else {
    return term;
  }
};

/**
 * [transformParentString4Display]: [TO DO]
 *
 */
export const transformParentString4Display = (parentItem: TreeItem) => {
  let childStrings = parentItem.children.map((item, i) => {
    // if the item is the first child, we do not prepend the union.
    const union = i === 0 ? '' : item.value.union;
    const field = item.value.field
      ? transformField4Display(item.value.field)
      : '';
    const term = item.value.term
      ? transformTerm4Display(item.value.term, item.value.field)
      : '';

    // if there's a field value, transform the string to display : "field: term".
    const field_term = field ? `${field}: ${term}` : term;

    // Parent string consists of the children linked by their union.
    let str = `${union} ${
      item.children.length ? `( ${field_term} )` : field_term
    }`;
    return str;
  });
  return childStrings.join(' ');
};
