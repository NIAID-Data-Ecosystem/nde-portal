import type { MutableRefObject } from 'react';
import type {
  CollisionDetection,
  DropAnimation,
  KeyboardCoordinateGetter,
  MeasuringConfiguration,
  MeasuringStrategy,
  Modifiers,
  PointerActivationConstraint,
  UniqueIdentifier,
} from '@dnd-kit/core';
import type {
  AnimateLayoutChanges,
  arrayMove,
  NewIndexGetter,
  SortingStrategy,
} from '@dnd-kit/sortable';
import { BoxProps } from 'nde-design-system';

export type UnionTypes = 'AND' | 'OR' | 'NOT';

export interface DragItem {
  // unique id for a tag.
  id: UniqueIdentifier;

  // data obj
  value: { term: string; field?: string; union?: UnionTypes };
  index: number;

  // the list of DragItem children that are within group. Defaults to empty array.
  children: DragItem[];
}

export type DragItems = DragItem[];

export interface FlattenedItem extends DragItem {
  // Position in list.
  index: number;
  // if nested, id of parent group
  parentId: DragItem['id'] | null;
  depth: number;
}

export type SensorContext = MutableRefObject<{
  items: FlattenedItem[];
  offset: number;
}>;

export interface WrapperStylesProps {
  // index: number;
  // isDragging: boolean;
  // id: UniqueIdentifier;
  data: DragItem;
  isMergeable: boolean;
  items: FlattenedItem[];
}

export interface ItemStylesProps {
  id: UniqueIdentifier;
  index: number;
  data: DragItem;
  isSorting: boolean;
  isDragOverlay: boolean;
  overIndex: number;
  isDragging: boolean;
  isMergeable: boolean;
  shouldCombine?: boolean;
  style?: BoxProps;
}

export interface SortableWithCombineProps {
  items: DragItem[];
  setItems: React.Dispatch<React.SetStateAction<DragItem[]>>;
  adjustScale?: boolean;
  getItemStyle?: (args: ItemStylesProps) => BoxProps | {};
  wrapperStyle?: (args: WrapperStylesProps) => BoxProps;
  handle?: boolean;
  measuring?: MeasuringConfiguration;
  removable?: boolean;
}

export interface Params {
  activationConstraint?: PointerActivationConstraint;
  adjustScale?: boolean;
  collisionDetection?: CollisionDetection;
  coordinateGetter: KeyboardCoordinateGetter;
  dropAnimation?: DropAnimation | null;
  measuring: {
    droppable: {
      strategy: MeasuringStrategy;
    };
  };
  reorderItems?: typeof arrayMove;
  strategy?: SortingStrategy;
  useDragOverlay?: boolean;
}
