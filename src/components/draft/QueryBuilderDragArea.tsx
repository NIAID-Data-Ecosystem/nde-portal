import React, { useEffect, useState } from 'react';
import { Flex, theme } from 'nde-design-system';
import { createPortal } from 'react-dom';
import {
  closestCenter,
  defaultDropAnimationSideEffects,
  DndContext,
  DragOverlay,
  DropAnimation,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  UniqueIdentifier,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { Draggable } from './Draggable';
import {
  arrayMove,
  rectSortingStrategy,
  SortableContext,
  sortableKeyboardCoordinates,
} from '@dnd-kit/sortable';
import { DraggableItem, DragItem } from './DraggableItem';

// [TO DO]: Add accessbility properties.
interface QueryBuilderDragAreaProps {
  itemsList: DragItem[];
  updateItems: React.Dispatch<React.SetStateAction<DragItem[]>>;
  useDragOverlay?: boolean;
}

const dropAnimationConfig: DropAnimation = {
  sideEffects: defaultDropAnimationSideEffects({
    styles: {
      active: {
        opacity: '0.5',
      },
    },
  }),
};
const params = {
  activationConstraint: undefined,
  coordinateGetter: sortableKeyboardCoordinates,
  collisionDetection: closestCenter,
  reorderItems: arrayMove,
  strategy: rectSortingStrategy,
  dropAnimation: dropAnimationConfig,
};

export const QueryBuilderDragArea: React.FC<QueryBuilderDragAreaProps> = ({
  itemsList,
  updateItems,
  useDragOverlay = true,
}) => {
  const {
    activationConstraint,
    coordinateGetter,
    collisionDetection,
    reorderItems,
    strategy,
    dropAnimation,
  } = params;

  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint,
    }),
    useSensor(TouchSensor, {
      activationConstraint,
    }),
    useSensor(KeyboardSensor, {
      scrollBehavior: undefined,
      coordinateGetter,
    }),
  );

  const [items, setItems] = useState<DragItem[]>(itemsList || []);
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);
  const getIndex = (id: UniqueIdentifier) => {
    return items.findIndex(item => item.id === id);
  };
  const activeIndex = activeId ? getIndex(activeId) : -1;

  useEffect(() => {
    setItems(itemsList);
  }, [itemsList]);

  const handleUpdate = (item: DragItem) => {
    const idx = getIndex(item.id);
    setItems(items => {
      const newArr = [...items];
      newArr[idx] = item;
      return newArr;
    });
  };

  const handleRemove = (id: UniqueIdentifier) => {
    setItems(items => items.filter(item => item.id !== id));
  };

  // update the main query items state when the items in this drag area are updated.
  useEffect(() => {
    updateItems(items);
  }, [items, updateItems]);

  const hasDragHandle = true;

  return (
    <Flex
      w='100%'
      bg='gray.100'
      p={1}
      flexWrap='wrap'
      position='relative'
      zIndex='modal'
    >
      <DndContext
        sensors={sensors}
        collisionDetection={collisionDetection}
        onDragStart={({ active }) => {
          if (!active) {
            return;
          }
          setActiveId(active.id);
        }}
        onDragEnd={({ over }) => {
          setActiveId(null);
          if (over) {
            const overIndex = getIndex(over.id);

            if (activeIndex !== overIndex) {
              setItems(items => reorderItems(items, activeIndex, overIndex));
            }
          }
        }}
        onDragCancel={() => setActiveId(null)}
      >
        <SortableContext items={items} strategy={strategy}>
          {items.map((item, i) => {
            return (
              <Draggable
                key={item.id}
                id={item.id}
                data={item}
                useDragOverlay={useDragOverlay}
                onUpdate={handleUpdate}
                handle={hasDragHandle}
                onRemove={handleRemove}
              ></Draggable>
            );
          })}
        </SortableContext>

        {/* 
        Reasons for using Drag Overlay.
        On DragOverlay: https://docs.dndkit.com/api-documentation/draggable/drag-overlay#when-should-i-use-a-drag-overlay 
        On Portals: https://docs.dndkit.com/api-documentation/draggable/drag-overlay#portals
        */}
        {useDragOverlay
          ? createPortal(
              <DragOverlay
                // adjustScale={adjustScale}
                dropAnimation={dropAnimation}
                // @ts-ignore : [TO DO]: change ts on theme from zIndices string to object
                zIndex={theme.zIndices.modal + 1}
              >
                {activeId ? (
                  <DraggableItem
                    id={items[activeIndex].id}
                    value={items[activeIndex].value}
                    property={items[activeIndex].field}
                    handle={hasDragHandle}
                    // renderItem={renderItem}
                    isDragging={true}
                    isOverlay={true}
                  />
                ) : null}
              </DragOverlay>,
              document.body,
            )
          : null}
      </DndContext>
    </Flex>
  );
};
