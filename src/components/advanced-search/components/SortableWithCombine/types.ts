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
import { SearchOption } from '../Search/components/AdvancedSearchFormContext';

export type UnionTypes = 'AND' | 'OR' | 'NOT';

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

export interface TreeItem {
  id: UniqueIdentifier;
  children: TreeItem[];
  depth: number;
  index: number;
  value: {
    term: string;
    querystring?: string;
    field?: string;
    union?: UnionTypes;
    searchType?: SearchOption;
  };
  parentId: UniqueIdentifier | null;
  parentList?: {
    id: TreeItem['id'] | null;
    value: Partial<TreeItem['value']>;
    isLastChild: boolean;
  }[];
  collapsed?: boolean;
}

export type TreeItems = TreeItem[];

export interface FlattenedItem extends TreeItem {}

export type SensorContext = MutableRefObject<{
  items: FlattenedItem[];
  offset: number;
}>;
