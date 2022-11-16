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

type UnionTypes = 'AND' | 'OR' | 'NOT';

export interface DragItem {
  // unique id for a tag.
  id: UniqueIdentifier;

  // data obj
  value: { term: string; field?: string; union?: UnionTypes };

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
  index: number;
  isDragging: boolean;
  id: UniqueIdentifier;
  data: DragItem;
  isMergeable: boolean;
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
}

export interface SortableWithCombineProps {
  items: DragItem[];
  setItems: React.Dispatch<React.SetStateAction<DragItem[]>>;
  getItemStyles?(args: ItemStylesProps): React.CSSProperties;
  wrapperStyle({
    index,
    isDragging,
    id,
    data,
  }: WrapperStylesProps): React.CSSProperties;
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

export interface SortableProps {
  activationConstraint?: PointerActivationConstraint;
  animateLayoutChanges?: AnimateLayoutChanges;
  adjustScale?: boolean;
  collisionDetection?: CollisionDetection;
  coordinateGetter?: KeyboardCoordinateGetter;
  Container?: any; // To-do: Fix me
  dropAnimation?: DropAnimation | null;
  getNewIndex?: NewIndexGetter;
  handle?: boolean;
  itemCount?: number;
  items?: UniqueIdentifier[];
  measuring?: MeasuringConfiguration;
  modifiers?: Modifiers;
  renderItem?: any;
  removable?: boolean;
  reorderItems?: typeof arrayMove;
  strategy?: SortingStrategy;
  style?: React.CSSProperties;
  useDragOverlay?: boolean;
  getItemStyles?(args: {
    id: UniqueIdentifier;
    index: number;
    isSorting: boolean;
    isDragOverlay: boolean;
    overIndex: number;
    isDragging: boolean;
  }): React.CSSProperties;
  wrapperStyle?(args: {
    index: number;
    isDragging: boolean;
    id: UniqueIdentifier;
  }): React.CSSProperties;
  isDisabled?(id: UniqueIdentifier): boolean;
}
