import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';
import {
  DragOverlay,
  DndContext,
  DropAnimation,
  defaultDropAnimation,
  KeyboardSensor,
  PointerSensor,
  UniqueIdentifier,
  useSensor,
  useSensors,
  MeasuringStrategy,
  DragEndEvent,
  DragMoveEvent,
  DragStartEvent,
  closestCenter,
  DragOverEvent,
  Modifier,
  Announcements,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  buildTree,
  createNewGroup,
  flattenTree,
  getChildCount,
  getProjection,
  removeChildrenOf,
  removeItem,
  setProperty,
  updateIndices,
} from './utils';
import type { FlattenedItem, SensorContext, TreeItem } from './types';
import { CSS } from '@dnd-kit/utilities';
import { Box, UnorderedList } from '@chakra-ui/react';
import { theme } from 'src/theme';
import { SortableTreeItem } from './components/SortableTreeItem';
import { sortableTreeKeyboardCoordinates } from './keyboardCoordinates';

const dropAnimationConfig: DropAnimation = {
  keyframes({ transform }) {
    return [
      { opacity: 1, transform: CSS.Transform.toString(transform.initial) },
      {
        opacity: 0,
        transform: CSS.Transform.toString({
          ...transform.final,
          x: transform.final.x + 5,
          y: transform.final.y + 5,
        }),
      },
    ];
  },
  easing: 'ease-out',
  sideEffects({ active }) {
    active.node.animate([{ opacity: 0 }, { opacity: 1 }], {
      duration: defaultDropAnimation.duration,
      easing: defaultDropAnimation.easing,
    });
  },
};

const measuring = {
  droppable: {
    strategy: MeasuringStrategy.Always,
  },
};

interface SortableWithCombineProps {
  items: TreeItem[];
  setItems: React.Dispatch<React.SetStateAction<TreeItem[]>>;
  collapsible?: boolean;
  indicator?: boolean;
  indentationWidth?: number;
  removable?: boolean;
  useDragOverlay?: boolean;
}

export function SortableWithCombine({
  items: defaultItems,
  setItems: updateItems,
  collapsible = true,
  indicator = true,
  indentationWidth = 40,
  removable = true,
  useDragOverlay = true,
}: SortableWithCombineProps) {
  const [items, setItems] = useState(() => defaultItems);
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);
  const [overId, setOverId] = useState<UniqueIdentifier | null>(null);
  const [offsetLeft, setOffsetLeft] = useState(0);
  const [currentPosition, setCurrentPosition] = useState<{
    parentId: UniqueIdentifier | null;
    overId: UniqueIdentifier;
  } | null>(null);

  // Flattened version of items with index, parentId, and depth values.
  const flattenedItems = useMemo(() => {
    const flattenedTree = flattenTree(items);
    // list of ids that are "collapsed"
    const collapsedItems = flattenedTree.reduce<FlattenedItem['id'][]>(
      (acc, { children, collapsed, id }) =>
        collapsed && children.length ? [...acc, id] : acc,
      [],
    );

    return removeChildrenOf(
      flattenedTree,
      activeId ? [activeId, ...collapsedItems] : collapsedItems,
    );
  }, [activeId, items]);

  // ID [activeId] and data[activeItem] of currently dragged element.
  const activeItem = useMemo(
    () => flattenedItems.find(({ id }) => id === activeId),
    [flattenedItems, activeId],
  );

  // Item that the active item is projected to land in.
  const projected = useMemo(() => {
    return activeId && overId
      ? getProjection(
          flattenedItems,
          activeId,
          overId,
          offsetLeft,
          indentationWidth,
        )
      : null;
  }, [activeId, flattenedItems, indentationWidth, offsetLeft, overId]);

  // Sortable context requires items to be sorted in a consistent order
  const sortedIds = useMemo(
    () => flattenedItems.map(({ id }) => id),
    [flattenedItems],
  );

  // Announcements for accessibility.
  const announcements: Announcements = {
    onDragStart({ active }) {
      return `Picked up ${active.id}.`;
    },
    onDragMove({ active, over }) {
      return getMovementAnnouncement('onDragMove', active.id, over?.id);
    },
    onDragOver({ active, over }) {
      return getMovementAnnouncement('onDragOver', active.id, over?.id);
    },
    onDragEnd({ active, over }) {
      return getMovementAnnouncement('onDragEnd', active.id, over?.id);
    },
    onDragCancel({ active }) {
      return `Moving was cancelled. ${active.id} was dropped in its original position.`;
    },
  };

  /**
   * [Keyboard Interaction]
   */
  const sensorContext: SensorContext = useRef({
    items: flattenedItems,
    offset: offsetLeft,
  });

  const [coordinateGetter] = useState(() =>
    sortableTreeKeyboardCoordinates(sensorContext, indicator, indentationWidth),
  );

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter,
    }),
  );

  useEffect(() => {
    sensorContext.current = {
      items: flattenedItems,
      offset: offsetLeft,
    };
  }, [flattenedItems, offsetLeft]);

  useEffect(() => {
    setItems(defaultItems);
  }, [defaultItems]);

  useEffect(() => {
    // update items across other components
    updateItems(items);
  }, [items, updateItems]);

  /**
   * [HANDLERS]:
   * Fns that handle the state of individual data items.
   */
  const handleUpdate = useCallback(
    (id: FlattenedItem['id'], updatedValue: Partial<TreeItem['value']>) => {
      setItems(items =>
        setProperty(items, id, 'value', value => {
          return { ...value, ...updatedValue };
        }),
      );
    },
    [],
  );

  const handleRemove = useCallback(
    (id: UniqueIdentifier) => {
      const updatedItems = removeItem(items, id);
      const flattened = flattenTree(updatedItems);
      const newItems = buildTree(updateIndices(flattened));
      setItems(newItems);
    },
    [items],
  );

  const handleCollapse = useCallback((id: TreeItem['id']) => {
    setItems(items =>
      setProperty(items, id, 'collapsed', value => {
        return !value;
      }),
    );
  }, []);

  const getParentItem = useCallback(
    (id: FlattenedItem['parentId']) => {
      return flattenedItems.find(item => item.id === id);
    },
    [flattenedItems],
  );

  const [documentBody, setDocumentBody] = useState<HTMLElement | null>(null);

  useEffect(() => {
    // document is undefined in SSR
    setDocumentBody(document?.body || null);
  }, []);

  return (
    <Box
      bg='gray.100'
      p={{ base: 1, sm: 4 }}
      w='100%'
      border='2px solid'
      borderColor='gray.100'
      userSelect={{ base: 'none', sm: 'auto' }}
    >
      <Box minW={{ base: 'unset', sm: '400px' }}>
        <DndContext
          accessibility={{ announcements }}
          measuring={measuring}
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragMove={handleDragMove}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
          onDragCancel={handleDragCancel}
        >
          <UnorderedList ml={0}>
            <SortableContext
              items={sortedIds}
              strategy={verticalListSortingStrategy}
            >
              {flattenedItems.map(item => {
                const { id, index, children, collapsed, depth, parentId } =
                  item;
                return (
                  <SortableTreeItem
                    key={id}
                    id={id}
                    index={index}
                    value={item.value}
                    childCount={children.length}
                    depth={
                      id === activeId && projected ? projected.depth : depth
                    }
                    parentId={parentId}
                    indentationWidth={indentationWidth}
                    indicator={indicator}
                    collapsed={Boolean(collapsed && children.length)}
                    onUpdate={handleUpdate}
                    onCollapse={
                      collapsible && children.length
                        ? handleCollapse
                        : undefined
                    }
                    onRemove={removable ? handleRemove : undefined}
                    getParentItem={getParentItem}
                  />
                );
              })}

              {documentBody && useDragOverlay
                ? createPortal(
                    <DragOverlay
                      dropAnimation={dropAnimationConfig}
                      modifiers={indicator ? [adjustTranslate] : undefined}
                      zIndex={theme.zIndices['popover']}
                    >
                      {activeId && activeItem ? (
                        <SortableTreeItem
                          clone
                          id={activeId}
                          depth={activeItem.depth}
                          index={activeItem.index}
                          value={activeItem.value}
                          childCount={getChildCount(items, activeId)}
                          indentationWidth={indentationWidth}
                          getParentItem={getParentItem}
                          parentId={activeItem.parentId}
                        />
                      ) : null}
                    </DragOverlay>,
                    documentBody,
                  )
                : null}
            </SortableContext>
          </UnorderedList>
        </DndContext>
      </Box>
    </Box>
  );

  /**
   * [Drag Events]:
   *  Functions that handle the different stages of dragging an item
   */

  function handleDragStart({ active: { id: activeId } }: DragStartEvent) {
    setActiveId(activeId);
    setOverId(activeId);

    const activeItem = flattenedItems.find(({ id }) => id === activeId);

    if (activeItem) {
      setCurrentPosition({
        parentId: activeItem.parentId,
        overId: activeId,
      });
    }

    document.body.style.setProperty('cursor', 'grabbing');
  }

  function handleDragMove({ delta }: DragMoveEvent) {
    setOffsetLeft(delta.x);
  }

  function handleDragOver({ over }: DragOverEvent) {
    setOverId(over?.id ?? null);
  }

  function handleDragEnd({ active, over }: DragEndEvent) {
    resetState();

    if (projected && over) {
      const { depth, parentId } = projected;
      const clonedItems: FlattenedItem[] = [...flattenTree(items)];
      const overIndex = clonedItems.findIndex(({ id }) => id === over.id);
      const activeIndex = clonedItems.findIndex(({ id }) => id === active.id);
      const activeTreeItem = clonedItems[activeIndex];
      // item that the active item will be dropped in.
      const parentIndex = clonedItems.findIndex(({ id }) => id === parentId);
      const parentItem = clonedItems[parentIndex];
      let sortedItems = clonedItems;
      if (
        activeTreeItem.parentId !== parentId &&
        parentItem &&
        parentItem.children.length === 0
      ) {
        /*
        [MERGING TWO ITEMS]
        During a merging of two singular items(items without children), we need to set the droppable container
        with a new ID, and nest both the droppable and active item as children.
        */
        const newGroup = createNewGroup(parentItem, activeTreeItem);

        // update the parent to have the same group id
        clonedItems[parentIndex] = {
          ...parentItem,
          id: newGroup.id,
          depth: newGroup.depth,
          value: {
            ...parentItem.value,
            term: '',
          },
        };

        clonedItems[activeIndex] = {
          ...activeTreeItem,
          parentId: newGroup.id,
          depth: newGroup.depth + 1,
        };

        sortedItems = [
          {
            ...parentItem,
            parentId: newGroup.id,
            depth: newGroup.depth + 1,
          },
          ...arrayMove(clonedItems, activeIndex, overIndex),
        ];
      } else {
        clonedItems[activeIndex] = {
          ...activeTreeItem,
          depth,
          parentId,
        };
        sortedItems = arrayMove(clonedItems, activeIndex, overIndex);
      }

      const newItems = buildTree(updateIndices(sortedItems));
      setItems(newItems);
    }
  }

  function handleDragCancel() {
    resetState();
  }

  function resetState() {
    setOverId(null);
    setActiveId(null);
    setOffsetLeft(0);
    setCurrentPosition(null);

    document.body.style.setProperty('cursor', '');
  }

  /**
   * [Accessibility]:
   * Update announcements based on drag and position
   */
  function getMovementAnnouncement(
    eventName: string,
    activeId: UniqueIdentifier,
    overId?: UniqueIdentifier,
  ) {
    if (overId && projected) {
      if (eventName !== 'onDragEnd') {
        if (
          currentPosition &&
          projected.parentId === currentPosition.parentId &&
          overId === currentPosition.overId
        ) {
          return;
        } else {
          setCurrentPosition({
            parentId: projected.parentId,
            overId,
          });
        }
      }

      const clonedItems: FlattenedItem[] = JSON.parse(
        JSON.stringify(flattenTree(items)),
      );
      const overIndex = clonedItems.findIndex(({ id }) => id === overId);
      const activeIndex = clonedItems.findIndex(({ id }) => id === activeId);
      const sortedItems = arrayMove(clonedItems, activeIndex, overIndex);

      const previousItem = sortedItems[overIndex - 1];

      let announcement;
      const movedVerb = eventName === 'onDragEnd' ? 'dropped' : 'moved';
      const nestedVerb = eventName === 'onDragEnd' ? 'dropped' : 'nested';

      if (!previousItem) {
        const nextItem = sortedItems[overIndex + 1];
        announcement = `${activeId} was ${movedVerb} before ${nextItem?.id}.`;
      } else {
        if (projected.depth > previousItem.depth) {
          announcement = `${activeId} was ${nestedVerb} under ${previousItem.id}.`;
        } else {
          let previousSibling: FlattenedItem | undefined = previousItem;
          while (previousSibling && projected.depth < previousSibling.depth) {
            const parentId: UniqueIdentifier | null = previousSibling.parentId;
            previousSibling = sortedItems.find(({ id }) => id === parentId);
          }

          if (previousSibling) {
            announcement = `${activeId} was ${movedVerb} after ${previousSibling.id}.`;
          }
        }
      }
      console.log('announcement', announcement);
      return announcement;
    }

    return;
  }
}

const adjustTranslate: Modifier = ({ transform }) => {
  return {
    ...transform,
    y: transform.y - 25,
  };
};

export * from './types';
export * from './utils';
