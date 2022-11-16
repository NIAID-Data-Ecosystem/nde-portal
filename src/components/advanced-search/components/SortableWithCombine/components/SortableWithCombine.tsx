import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';
import {
  CollisionDetection,
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
  Collision,
  rectIntersection,
  MeasuringStrategy,
  pointerWithin,
  getFirstCollision,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  SortingStrategy,
  verticalListSortingStrategy,
  horizontalListSortingStrategy,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import {
  buildTree,
  collapseContainers,
  convertObject2QueryString,
  flattenTree,
  getIntersectionRatio,
} from '../utils';
import type {
  DragItem,
  FlattenedItem,
  ItemStylesProps,
  Params,
  SortableProps,
  SortableWithCombineProps,
  WrapperStylesProps,
} from '../types';
import { CSS } from '@dnd-kit/utilities';
import { SortableCombineItem, SortableItemProps } from './SortableCombineItem';
// import { Item } from './Item';
import { uniqueId } from 'lodash';
import { Item } from './Item';

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
  collisionDetection: rectIntersection,
  dropAnimation: dropAnimationConfig,
  measuring,
  reorderItems: arrayMove,
  strategy: () => null,
  useDragOverlay: true,
};

const config: Partial<SortableProps> = {
  adjustScale: true,
  wrapperStyle: ({ isMergeable, data }: WrapperStylesProps) => {
    const styles = {
      background: isMergeable ? 'aliceblue' : 'white',
    };
    if (data.children) {
    }

    return {
      ...styles,
      minWidth: 160,
      flex: 1,
      margin: '0.15rem',
      paddingRight: '1rem',
      border: '1px solid #D5D5D5',
      borderRadius: '0.3125rem',
      boxShadow:
        '0 10px 15px -3px rgba(0, 0, 0, 0.1),0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      overflow: 'hidden',
    };
  },
  getItemStyles: ({ data, isMergeable }: ItemStylesProps) => {
    const styles = {
      // padding: '2rem', margin: '0.25rem'
    };
    return styles;
  },
};

export function SortableWithCombine({
  items,
  setItems,
  handle = false,
  removable,
  wrapperStyle = config.wrapperStyle,
  getItemStyles = config.getItemStyles,
}: SortableWithCombineProps) {
  const {
    activationConstraint,
    adjustScale,
    collisionDetection,
    measuring,
    reorderItems,
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

  const lastOverId = useRef<UniqueIdentifier | null>(null);

  const recentlyMovedToNewContainer = useRef(false);

  const collisionDetectionStrategy: CollisionDetection = useCallback(
    args => {
      /**
       * Custom collision detection strategy optimized for multiple containers
       *
       * - First, find any droppable containers intersecting with the pointer.
       * - If there are none, find intersecting containers with the active draggable.
       * - If there are no intersecting containers, return the last matched intersection
       *
       */
      const pointerIntersections = pointerWithin(args);
      const intersections =
        pointerIntersections.length > 0
          ? // If there are droppables intersecting with the pointer, return those
            pointerIntersections
          : rectIntersection(args);

      let overId = getFirstCollision(intersections, 'id');
      if (overId != null) {
        let collisions = intersections.map(intersection => {
          // Bounding rectangle of item.
          const overRect = args.droppableRects.get(intersection.id);
          const intersectionRatio =
            overRect && getIntersectionRatio(overRect, args.collisionRect);

          return {
            ...intersection,
            id: intersection.id,
            data: { ...intersection.data, value: intersectionRatio || 0 },
          };
        });

        lastOverId.current = overId;
        return [
          {
            id: overId,
            data: collisions,
          },
        ];
      }

      // When a draggable item moves to a new container, the layout may shift
      // and the `overId` may become `null`. We manually set the cached `lastOverId`
      // to the id of the draggable item that was moved to the new container, otherwise
      // the previous `overId` will be returned which can cause items to incorrectly shift positions
      if (recentlyMovedToNewContainer.current) {
        lastOverId.current = activeId;
      }
      // If no droppable is matched, return the last match
      return lastOverId.current
        ? [{ id: lastOverId.current, data: intersections }]
        : [];
    },
    [activeId],
  );

  useEffect(() => {
    requestAnimationFrame(() => {
      recentlyMovedToNewContainer.current = false;
    });
  }, [items]);

  const shouldCombine = (
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
  const addToExistingGroup = (
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

  const createNewGroup = (
    droppableItem: FlattenedItem,
    activeItem: FlattenedItem,
  ) => {
    const newParentId = `${uniqueId(`${droppableItem.id}-${activeItem.id}-`)}`;
    const clonedDroppable = {
      ...droppableItem,
      id: newParentId,
    };
    return clonedDroppable;
  };

  const [isMergeable, setIsMergeable] = useState(false);
  const [overId, setOverId] = useState<UniqueIdentifier | null>(null);
  const droppableItem = flattenedItems.find(({ id }) => id === overId);
  const isMovingWithinContainer = useRef(false);

  const resetState = () => {
    setIsMergeable(false);
    setOverId(null);
    setActiveId(null);
  };

  return (
    <div style={{ background: 'transparent' }}>
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
        onDragMove={({ active, over, collisions }) => {
          /*
          If the over id is a base element (ie. not a nested element). No adaptations are needed - the shifting of elements happens according to the strategy.
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
              flattenedItems.findIndex(
                ({ id }) => id === droppableItem.parentId,
              );
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

          let isMergeable = shouldCombine(collisions, [0.1, 0.4]);
          setIsMergeable(isMergeable);
        }}
        onDragEnd={({ delta }) => {
          const clonedItems: FlattenedItem[] = [...flattenedItems];
          const activeIndex = clonedItems.findIndex(
            ({ id }) => id === activeId,
          );
          const droppableIndex = clonedItems.findIndex(
            ({ id }) => id === overId,
          );
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
                During a merging of two singular items, we need to set the droppable container with a new ID, and nest both the droppable and active item as children.
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
            // Remove unused containers.
            const collapsedItems = collapseContainers(activeItem, clonedItems);

            // Transform data to tree structure
            const newItems = buildTree(collapsedItems);
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

              // [delta] refers to the mouse position, where a negative value indicated the pointer moving left and pos value = pointer moving right.
              if (delta.x > 0) {
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
                arrayMoveDropIndex,
              );

              // collapse container with only one child
              const collapsedItems =
                activeItem && collapseContainers(activeItem, newItems);

              setItems(buildTree(collapsedItems));
              resetState();

              return;
            }

            // classic sorting mechanism between elements with same parent container
            const newItems = arrayMove(
              clonedItems,
              activeIndex,
              droppableIndex,
            );
            console.log('N', newItems, buildTree(newItems));
            setItems(buildTree(newItems));
            resetState();
          }
        }}
        onDragCancel={() => resetState()}
      >
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            padding: '1rem',
            flexDirection: getSortingStrategy(items).direction,
          }}
        >
          <SortableContext
            items={sortedIds}
            strategy={getSortingStrategy(items).strategy}
          >
            {items.map((value, index) => (
              <SortableCombineItem
                key={value.id}
                id={value.id}
                handle={handle}
                index={index}
                data={value}
                wrapperStyle={wrapperStyle}
                isMergeable={isMergeable}
                style={getItemStyles}
                // onRemove={handleRemove}
                useDragOverlay={useDragOverlay}
              >
                {/* add sortale context here for children */}
                <TagContent
                  id={value.id}
                  data={value}
                  handle={handle}
                  index={index}
                  wrapperStyle={wrapperStyle}
                  strategy={strategy}
                  isMergeable={isMergeable}
                  style={getItemStyles}
                  // onRemove={handleRemove}
                  useDragOverlay={useDragOverlay}
                />
              </SortableCombineItem>
            ))}
          </SortableContext>
        </div>
        {useDragOverlay
          ? createPortal(
              <DragOverlay
                adjustScale={adjustScale}
                dropAnimation={dropAnimation}
              >
                {activeId && activeItem ? (
                  <Item
                    data={activeItem}
                    handle={handle}
                    wrapperStyle={wrapperStyle({
                      index: activeItem.index,
                      isDragging: true,
                      id: activeItem.id,
                      data: activeItem,
                      isMergeable,
                    })}
                    dragOverlay
                  >
                    <TagContent
                      id={activeItem.id}
                      data={activeItem}
                      handle={handle}
                      index={activeItem.index}
                      isMergeable={isMergeable}
                      wrapperStyle={wrapperStyle}
                      strategy={strategy}
                      getIsMergeable={id =>
                        isMergeable && droppableItem?.id === id
                      }
                      style={getItemStyles}
                      // onRemove={handleRemove}
                      useDragOverlay={useDragOverlay}
                    />
                  </Item>
                ) : null}
              </DragOverlay>,
              document.body,
            )
          : null}
      </DndContext>
    </div>
  );
}
const getSortingStrategy = (items: DragItem[]) => {
  const numItems = items.length;
  const itemHasChildren =
    items.filter(
      item =>
        item.children.length > 0 &&
        item.children.map(subItem => {
          return subItem.children.length > 0;
        }),
    ).length > 0;
  if (itemHasChildren || numItems > 3) {
    // vertical
    return { strategy: () => null, direction: 'column' };
  } else {
    // horizontal
    return { strategy: () => null, direction: 'row' };
  }
};

interface TagContentProps extends SortableItemProps {
  data: DragItem;
  strategy?: SortingStrategy;
}

const TagContent: React.FC<TagContentProps> = props => {
  const { data } = props;

  const ChildrenContext = () => {
    if (!data.children || data.children.length === 0) {
      return <></>;
    }
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: getSortingStrategy(data.children).direction,
          flexWrap: 'wrap',
        }}
      >
        <SortableContext
          items={data.children}
          strategy={getSortingStrategy(data.children).strategy}
        >
          {data.children.map((value, index) => (
            <SortableCombineItem
              key={value.id}
              {...props}
              id={value.id}
              index={index}
              data={value}
              isMergeable={props.isMergeable}

              // onRemove={handleRemove}
            >
              <TagContent
                {...props}
                id={value.id}
                data={value}
                handle={props.handle}
                index={index}
              />
            </SortableCombineItem>
          ))}
        </SortableContext>
      </div>
    );
  };

  return (
    <div id='tag-content'>
      {data.children.length === 0 && (
        <div>
          {data.value.field && (
            <p
              style={{
                display: 'flex',
                flexDirection: 'column',
                fontSize: '10px',
              }}
            >
              {data?.value?.field?.toUpperCase() || ''}
              <br />
            </p>
          )}
          <p>{data.value?.term || ''}</p>
        </div>
      )}

      {data.children.length > 0 ? <ChildrenContext /> : <></>}
    </div>
  );
};
