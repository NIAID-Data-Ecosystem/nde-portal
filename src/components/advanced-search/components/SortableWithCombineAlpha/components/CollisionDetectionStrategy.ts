import { useCallback, useEffect, useRef } from 'react';
import {
  CollisionDetection,
  UniqueIdentifier,
  rectIntersection,
  pointerWithin,
  getFirstCollision,
} from '@dnd-kit/core';

import { getIntersectionRatio } from '../utils';
import type { DragItem } from '../types';

export const useCollisionDetection = ({
  items,
  activeId,
}: {
  items: DragItem[];
  activeId: UniqueIdentifier | null;
}) => {
  const lastOverId = useRef<UniqueIdentifier | null>(null);

  const recentlyMovedToNewContainer = useRef(false);

  /**
   * Custom collision detection strategy optimized for multiple containers
   *
   * - First, find any droppable containers intersecting with the pointer.
   * - If there are none, find intersecting containers with the active draggable.
   * - If there are no intersecting containers, return the last matched intersection
   *
   */
  const collisionDetectionStrategy: CollisionDetection = useCallback(
    args => {
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

  return collisionDetectionStrategy;
};
