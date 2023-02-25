import type { MutableRefObject } from 'react';
import type {
  CollisionDetection,
  DropAnimation,
  KeyboardCoordinateGetter,
  MeasuringStrategy,
  PointerActivationConstraint,
  UniqueIdentifier,
} from '@dnd-kit/core';
import type { arrayMove, SortingStrategy } from '@dnd-kit/sortable';
import { QueryValue } from '../../types';

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

export interface Value extends Partial<QueryValue> {
  term: QueryValue['term'];
}

export interface TreeItem {
  id: UniqueIdentifier;
  value: Value;
  children: TreeItem[];
  collapsed?: boolean;
}

export interface FlattenedItem extends TreeItem {
  parentId: UniqueIdentifier | null;
  index: number;
  depth: number;
}

export type TreeItems = TreeItem[];

export type SensorContext = MutableRefObject<{
  items: FlattenedItem[];
  offset: number;
}>;
