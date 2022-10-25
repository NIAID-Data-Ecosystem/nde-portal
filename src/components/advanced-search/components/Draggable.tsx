import { Box } from 'nde-design-system';
import { UniqueIdentifier } from '@dnd-kit/core';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { DraggableItem } from './DraggableItem';

export interface DraggableProps {
  id: UniqueIdentifier;
  property?: string;
  value: string; // change to type of items.value in parent state.
  handle?: boolean;
  disabled?: boolean; //If you'd like to temporarily disable a sortable item, set the disabled argument to true.
  useDragOverlay: boolean;
  // [TO DO]: add below.
  // removeItem
  // updateItem
}

export const Draggable: React.FC<DraggableProps> = ({
  id,
  property,
  value,
  disabled,
  useDragOverlay,
  children,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
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
    <Box
      id='drag-wrapper'
      ref={setNodeRef}
      style={style}
      // move this to handle if necessary
      {...attributes}
      {...listeners}
    >
      <DraggableItem
        id={id}
        property={property}
        value={value}
        isDragging={isDragging}
        isOverlay={!useDragOverlay}
        // handle={handle}
        // renderItem={renderItem}
      />
    </Box>
  );
};
