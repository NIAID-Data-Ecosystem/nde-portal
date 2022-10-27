import { Flex } from 'nde-design-system';
import { UniqueIdentifier } from '@dnd-kit/core';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { DraggableItem, DragItem } from './DraggableItem';

export interface DraggableProps {
  id: UniqueIdentifier;
  handle?: boolean;
  disabled?: boolean; //If you'd like to temporarily disable a sortable item, set the disabled argument to true.
  useDragOverlay: boolean;
  data: DragItem;
  onUpdate?: (data: DragItem) => void;
  onRemove?: (id: UniqueIdentifier) => void;
}

export const Draggable: React.FC<DraggableProps> = ({
  id,
  disabled,
  useDragOverlay,
  data,
  handle,
  onUpdate,
  onRemove,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    isDragging,
    transform,
    transition,
  } = useSortable({ id, disabled });

  const style = {
    // Custom transform. Remove scaling that sortable adds.
    transform: CSS.Transform.toString({
      x: transform ? transform.x : 0,
      y: transform ? transform.y : 0,
      scaleX: 1,
      scaleY: 1,
    }),
    transition,
  };
  return (
    <Flex
      id='drag-wrapper'
      ref={setNodeRef}
      style={style}
      // move this to handle if necessary
      {...attributes}
      {...(!handle ? listeners : undefined)}
    >
      <DraggableItem
        id={data.id}
        property={data.field}
        value={data.value}
        isDragging={isDragging}
        isOverlay={!useDragOverlay}
        handle={handle}
        handleProps={
          handle
            ? {
                ref: setActivatorNodeRef,
              }
            : undefined
        }
        onRemove={onRemove ? () => onRemove(id) : undefined}
        onUpdate={
          onUpdate ? update => onUpdate({ ...data, ...update }) : undefined
        }
        listeners={listeners}
        attributes={attributes}
        // renderItem={renderItem}
      />
    </Flex>
  );
};
