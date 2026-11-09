import type { ClientRect, Modifier } from '@dnd-kit/core';

import { restrictToList } from '../PopoverSelectableList';

type ModifierArgs = Parameters<Modifier>[0];

const rect = (top: number, height: number, left = 0, width = 300) =>
  ({
    top,
    bottom: top + height,
    height,
    left,
    right: left + width,
    width,
  } as ClientRect);

// A 320px-tall list starting at y=100, dragging a 28px row that sits at y=200.
const LIST = rect(100, 320);
const ROW = rect(200, 28, 8, 280);

const run = (
  transform: { x: number; y: number },
  overrides: Partial<ModifierArgs> = {},
) =>
  restrictToList({
    transform: { ...transform, scaleX: 1, scaleY: 1 },
    draggingNodeRect: ROW,
    scrollableAncestorRects: [LIST],
    ...overrides,
  } as ModifierArgs);

describe('restrictToList', () => {
  it('leaves a vertical move inside the list unchanged', () => {
    expect(run({ x: 0, y: 50 })).toMatchObject({ x: 0, y: 50 });
  });

  it('drops any horizontal movement', () => {
    expect(run({ x: 250, y: 10 })).toMatchObject({ x: 0, y: 10 });
  });

  it("stops the row at the list's bottom edge", () => {
    // Row bottom is 228; list bottom is 420, so the furthest move is 192.
    expect(run({ x: 0, y: 5000 })).toMatchObject({ x: 0, y: 192 });
  });

  it("stops the row at the list's top edge", () => {
    // Row top is 200; list top is 100, so the furthest move is -100.
    expect(run({ x: 0, y: -5000 })).toMatchObject({ x: 0, y: -100 });
  });

  it('keeps the scale dnd-kit passed in', () => {
    expect(run({ x: 0, y: 0 })).toMatchObject({ scaleX: 1, scaleY: 1 });
  });

  it('only drops horizontal movement when there is nothing to measure', () => {
    expect(
      run({ x: 40, y: 5000 }, { scrollableAncestorRects: [] }),
    ).toMatchObject({ x: 0, y: 5000 });
    expect(run({ x: 40, y: 5000 }, { draggingNodeRect: null })).toMatchObject({
      x: 0,
      y: 5000,
    });
  });
});
