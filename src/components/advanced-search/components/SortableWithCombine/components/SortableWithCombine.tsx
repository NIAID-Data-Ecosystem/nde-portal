import React, { useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  DragOverlay,
  DndContext,
  DropAnimation,
  defaultDropAnimation,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  UniqueIdentifier,
  useSensor,
  useSensors,
  MeasuringStrategy,
  DragEndEvent,
  DragMoveEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  SortingStrategy,
  verticalListSortingStrategy,
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  addToExistingGroup,
  buildTree,
  createNewGroup,
  flattenTree,
  removeItem,
  shouldCombine,
} from '../utils';
import type {
  DragItem,
  FlattenedItem,
  ItemStylesProps,
  Params,
  SortableWithCombineProps,
  WrapperStylesProps,
} from '../types';
import { CSS } from '@dnd-kit/utilities';
import { SortableCombineItem } from './SortableCombineItem';
import { Item } from './Item';
import { useCollisionDetection } from './CollisionDetectionStrategy';
import { theme } from '@chakra-ui/react';
import { ItemContent } from './ItemContent';
import { Box, Checkbox } from 'nde-design-system';
import { getUnionTheme } from 'src/components/advanced-search/utils';

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

const params: Params = {
  activationConstraint: undefined,
  adjustScale: false,
  coordinateGetter: sortableKeyboardCoordinates,
  dropAnimation: dropAnimationConfig,
  measuring,
  reorderItems: arrayMove,
  strategy: () => null,
  useDragOverlay: true,
};

export const config: Partial<SortableWithCombineProps> = {
  adjustScale: true,
  wrapperStyle: ({ isMergeable, data, items }: WrapperStylesProps) => {
    const currentItem = items && items.find(item => item.id === data.id);
    if (!currentItem) {
      return {};
    }
    const itemList = items.filter(item => item.depth === currentItem.depth);

    const nextElement = itemList[data.index + 1];

    const unionColor = data.value.union
      ? getUnionTheme(data.value.union).background
      : nextElement && nextElement.value.union
      ? getUnionTheme(nextElement.value.union).background
      : 'gray.200';

    return {
      background: isMergeable ? 'status.info' : 'white',
      color: isMergeable ? 'white' : 'text.body',
      minWidth: 160,
      flex: 1,
      margin: '0.15rem',
      paddingRight: '1rem',
      border: '1px solid #D5D5D5',
      borderRadius: '0.3125rem',
      borderLeft: '5px solid',
      boxShadow:
        '0 10px 15px -3px rgba(0, 0, 0, 0.1),0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      borderLeftColor: unionColor,
    };
  },
  getItemStyle: ({ data, isMergeable, style, ...props }: ItemStylesProps) => {
    const direction = style?.flexDirection || 'row';
    const alignItems = direction === 'row' ? 'center' : 'flex-start';
    const itemStyles = {
      ...style,
      flexDirection: direction,

      alignItems: style?.alignItems || alignItems,
    };
    return itemStyles;
  },
};

export function SortableWithCombine({
  items,
  setItems,
  handle = false,
  removable,
  wrapperStyle = config.wrapperStyle,
  getItemStyle = config.getItemStyle,
}: SortableWithCombineProps) {
  const {
    activationConstraint,
    adjustScale,
    measuring,
    strategy,
    dropAnimation,
    useDragOverlay,
  } = params;

  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint,
    }),
    useSensor(TouchSensor, {
      activationConstraint,
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  // Flattened version of items with index, parentId, and depth values.
  const flattenedItems = useMemo(() => {
    const flattenedTree = flattenTree(items);
    return flattenedTree;
  }, [items]);

  // Id [activeId] and data[activeItem] of currently dragged element.
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);
  const activeItem = flattenedItems.find(({ id }) => id === activeId);

  // Sortable context requires items to be sorted in a consistent order
  const sortedIds = useMemo(
    () => flattenedItems.filter(item => item.depth === 0).map(({ id }) => id),
    [flattenedItems],
  );

  const collisionDetectionStrategy = useCollisionDetection({ items, activeId });

  const [isMergeable, setIsMergeable] = useState(false);
  const [overId, setOverId] = useState<UniqueIdentifier | null>(null);
  const droppableItem = flattenedItems.find(({ id }) => id === overId);
  const isMovingWithinContainer = useRef(false);

  const resetState = () => {
    setIsMergeable(false);
    setOverId(null);
    setActiveId(null);
  };

  const handleUpdate = (item: DragItem) => {
    const clonedItems = [...flattenedItems];
    const updateIndex = clonedItems.findIndex(({ id }) => id === item.id);
    clonedItems[updateIndex] = { ...clonedItems[updateIndex], ...item };
    setItems(buildTree(clonedItems));
  };

  const handleRemove = (id: DragItem['id']) => {
    const removeableItem = flattenedItems.find(item => item.id === id);
    if (!removeableItem) return;
    const flattened = flattenTree(removeItem([...items], id));

    setItems(buildTree(flattened));
  };

  const handleDragMove = ({ active, over, collisions }: DragMoveEvent) => {
    /*
     *If the over id is a base element (ie. not a nested element).
      No adaptations are needed - the shifting of elements happens according
      to the strategy.
     */
    const overId = over?.id;

    // Index and data for actively dragged item.
    if (!overId) {
      // [Note]: if you pull a nested el onto a non nested one this is triggered.
      //  Also triggered when trying to merge two non nested. could deal with on drag end i guess/
      // handle this case in on Drag End?
      return;
    }

    setActiveId(active.id);
    setOverId(overId);

    // prevent merge if the active item is still in it's original area.
    // or if the active item is being dropped in the same container( this is
    // typically a sorting behaviour)

    if (active.id === over.id || activeItem?.parentId === overId) {
      setIsMergeable(false);
      return;
    }

    // Prevent merge and handle action if the item is dropped within its own area or nested areas.
    if (
      activeItem &&
      overId &&
      activeItem.children.findIndex(item => item.id === overId) > -1
    ) {
      isMovingWithinContainer.current = true;
      setIsMergeable(false);
      return;
    }

    /**
     * Prevent merge if tying to combine:
     *  - active item and a droppable area which is its immediate container.
     *  - active item and droppable area are already grouped
     *    and there are no other items in the group with them, therefore further
     *    grouping them would serve no purpose
     */
    if (activeItem && droppableItem) {
      const dropParentIndex =
        droppableItem &&
        flattenedItems.findIndex(({ id }) => id === droppableItem.parentId);
      if (
        activeItem.parentId === droppableItem.id ||
        (droppableItem.children.length === 0 &&
          droppableItem.parentId === activeItem.parentId &&
          dropParentIndex > -1 &&
          flattenedItems[dropParentIndex].children.length <= 2)
      ) {
        setIsMergeable(false);
        return;
      }
    }

    let isMergeable = shouldCombine(active.id, collisions, [0.1, 0.6]);

    setIsMergeable(isMergeable);
  };

  const handleDragEnd = ({ delta }: DragEndEvent) => {
    const clonedItems: FlattenedItem[] = [...flattenedItems];
    const activeIndex = clonedItems.findIndex(({ id }) => id === activeId);
    const droppableIndex = clonedItems.findIndex(({ id }) => id === overId);
    // If the active item is dropped in its own area nothing changes.
    if (activeIndex === droppableIndex) {
      return;
    }

    // Prevent nesting/sorting of a parent element with its child.
    if (isMovingWithinContainer.current) {
      isMovingWithinContainer.current = false;
      return;
    }

    /**
     * [MERGING ITEMS]:
     * Covers the following:
     *  - Basic merging of two items.
     *  - Adding an item to a group of items.
     *  - Condensing nested containers
     */
    if (isMergeable && activeItem && droppableItem) {
      if (droppableItem.children.length > 0) {
        /*
          [ADD TO EXISTING GROUP]
          if the droppable item has children we add the active item to the list of children.
          */
        const item = addToExistingGroup(droppableItem, activeItem);
        clonedItems[activeIndex] = item;
      } else {
        /*
          [CREATE NEW GROUP]
          During a merging of two singular items, we need to set the droppable container
          with a new ID, and nest both the droppable and active item as children.
          */
        const newGroup = createNewGroup(droppableItem, activeItem);
        clonedItems[droppableIndex] = {
          ...droppableItem,
          parentId: newGroup.id,
          depth: newGroup.depth + 1,
          index: 0, //droppable tag defaults to first element in new group
        };

        clonedItems[activeIndex] = {
          ...activeItem,
          parentId: newGroup.id,
          depth: newGroup.depth + 1,
          index: 1,
        };
        clonedItems.splice(droppableIndex, 0, newGroup);
      }
      // Transform data to tree structure
      const newItems = buildTree(clonedItems);
      // Update the state
      setItems(newItems);

      resetState();
      return;
    }
    /**
     * [SORTING ITEMS]:
     *  - Updates the order of items for both containers and individual items
     *  - Handles unnesting of elements when sorting outside the container
     *
     */
    let arrayMoveDropIndex = droppableIndex;
    if (activeItem && droppableItem) {
      if (activeItem.parentId !== droppableItem.parentId) {
        /**
         * This section handles when an item is being dragged (and sorted) outside its parent container.
         * droppableItem here is the parent container.
         * When placing an item to the right(delta.x>0) of the parent container, the item must be placed after the children of the parent.
         * When placing an item to the left of its parent (delta.x<0), it takes the index of the parent (no adjustments needed)
         */
        clonedItems[activeIndex] = {
          ...clonedItems[activeIndex],
          parentId: droppableItem.parentId,
          depth: droppableItem.depth,
        };
        // [delta] refers to the mouse position, where a negative value indicated the pointer moving left/top and pos value = pointer moving right/bottom.
        if (delta.x > 0 || delta.y > 0) {
          const parentItem = clonedItems.find(
            ({ id }) => id === activeItem.parentId,
          );
          const numChildren = parentItem?.children.length;
          if (numChildren !== undefined) {
            // the drop index has to be after all the children of the parent element if the mouse is moving right.
            arrayMoveDropIndex = droppableIndex + numChildren;
          }
        }

        const newItems = arrayMove(
          clonedItems,
          activeIndex,
          arrayMoveDropIndex + 1,
        );

        setItems(buildTree(newItems));
        resetState();

        return;
      }
      // classic sorting mechanism between elements with same parent container
      const newItems = arrayMove(clonedItems, activeIndex, droppableIndex);

      setItems(buildTree(newItems));
      resetState();
    }
  };

  const [enableMovement] = useState(false);
  return (
    <>
      <Box
        bg={
          !isMergeable &&
          activeItem &&
          droppableItem &&
          !droppableItem.parentId &&
          activeItem.parentId !== droppableItem.parentId
            ? 'status.info'
            : 'gray.100'
        }
        p={4}
      >
        <DndContext
          measuring={measuring}
          sensors={sensors}
          collisionDetection={collisionDetectionStrategy}
          onDragStart={({ active }) => {
            if (!active) {
              return;
            }
            setActiveId(active.id);
          }}
          onDragMove={handleDragMove}
          onDragEnd={handleDragEnd}
          onDragCancel={() => resetState()}
        >
          <div
            style={{
              display: 'flex',
              // flexWrap: 'wrap',
              padding: '1rem',
              flexDirection: getSortingStrategy(items, enableMovement)
                .direction,
            }}
          >
            <SortableContext
              items={sortedIds}
              strategy={getSortingStrategy(items, enableMovement).strategy}
            >
              {items.map((value, index) => (
                <SortableCombineItem
                  key={value.id}
                  id={value.id}
                  data={value}
                  handle={handle}
                  index={index}
                  wrapperStyle={args =>
                    wrapperStyle
                      ? wrapperStyle({ ...args, items: flattenedItems })
                      : {}
                  }
                  isMergeable={isMergeable}
                  style={args =>
                    getItemStyle
                      ? getItemStyle({
                          ...args,
                          style: {
                            flexDirection: getSortingStrategy(
                              items,
                              enableMovement,
                            ).direction,
                            ...args.style, // for nested elements to override
                          },
                        })
                      : () => ({})
                  }
                  onUpdate={handleUpdate}
                  onRemove={removable ? handleRemove : undefined}
                  useDragOverlay={useDragOverlay}
                  renderItem={props => (
                    <ItemContent enableMovement={enableMovement} {...props} />
                  )}
                />
              ))}
            </SortableContext>
          </div>
          {useDragOverlay
            ? createPortal(
                <DragOverlay
                  adjustScale={adjustScale}
                  dropAnimation={dropAnimation}
                  zIndex={theme.zIndices['popover']}
                >
                  {activeId && activeItem ? (
                    <Item
                      data={activeItem}
                      handle={handle}
                      wrapperStyle={
                        wrapperStyle
                          ? wrapperStyle({
                              data: activeItem,
                              isMergeable,
                              items: flattenedItems,
                            })
                          : {}
                      }
                      style={{}}
                      index={activeItem.index}
                      dragOverlay
                      isMergeable={false}
                      activeIndex={activeItem.index}
                      overIndex={droppableItem?.index}
                      renderItem={props => (
                        <ItemContent
                          id={activeItem.id}
                          data={activeItem}
                          handle={handle}
                          index={activeItem.index}
                          isMergeable={isMergeable}
                          wrapperStyle={wrapperStyle}
                          style={getItemStyle}
                          useDragOverlay={useDragOverlay}
                          {...props}
                        />
                      )}
                    />
                  ) : null}
                </DragOverlay>,
                document.body,
              )
            : null}
        </DndContext>
      </Box>
    </>
  );
}

export const getSortingStrategy = (
  items: DragItem[],
  enableMovement: boolean,
) => {
  const numItems = items.length;
  const itemHasChildren =
    items.filter(
      item =>
        item.children.length > 0 &&
        item.children.map(subItem => {
          return subItem.children.length > 0;
        }),
    ).length > 0;

  const sortOrder: {
    strategy: SortingStrategy;
    direction: 'row' | 'row-reverse' | 'column' | 'column-reverse';
  } = { strategy: () => null, direction: 'column' };
  const MAX_ROW_ITEMS = 2;
  // we want items in a column if one of the items is a container for other items
  // or if the number of items is larger than [MAX_ROW_ITEMS] .
  if (itemHasChildren || numItems > MAX_ROW_ITEMS) {
    // vertical
    sortOrder.strategy = verticalListSortingStrategy;
    sortOrder.direction = 'column';
  } else {
    // horizontal
    sortOrder.strategy = horizontalListSortingStrategy;

    sortOrder.direction = 'row';
  }
  if (!enableMovement) {
    sortOrder.strategy = () => null;
  }
  return sortOrder;
};
