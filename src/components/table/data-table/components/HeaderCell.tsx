import React, { useEffect, useId, useRef, useState } from 'react';
import { InfoIcon } from 'src/components/info-label';
import Tooltip from 'src/components/tooltip';

import type { ResolvedColumn, SortDirection } from '../types';

/**
 * Two stacked carets. The active direction is dark and the other faint; an
 * unsorted column shows both at mid grey (4.8:1, above the 3:1 non-text
 * contrast minimum). Decorative: the state is exposed by `aria-sort`.
 */
const SortIcon = ({ direction }: { direction?: SortDirection }) => (
  <svg
    className='nde-sort-icon'
    data-direction={direction}
    viewBox='0 0 8 13'
    width='8'
    height='13'
    aria-hidden='true'
    focusable='false'
  >
    <path data-arrow='asc' d='M4 0 8 5.5H0z' />
    <path data-arrow='desc' d='M4 13 0 7.5h8z' />
  </svg>
);

/**
 * The column's description, from an info icon beside the title (the same
 * icon `InfoLabel` uses). A tooltip on hover and keyboard focus; on touch,
 * where tooltips never open on their own, a tap toggles it and a tap anywhere
 * else closes it. The description is also the button's accessible
 * description, so screen readers get it without opening anything. The button
 * sits above the sort button's full-cell hit area, so using it never sorts.
 */
const HeaderInfo = ({
  header,
  description,
}: {
  header: string;
  description: string;
}) => {
  const descriptionId = useId();
  const [open, setOpen] = useState(false);
  const byTouch = useRef(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // A tooltip opened by a tap stays until the next tap elsewhere.
  useEffect(() => {
    if (!open || !byTouch.current) return;
    const closeOnOutsideTap = (event: PointerEvent) => {
      if (buttonRef.current?.contains(event.target as Node)) return;
      byTouch.current = false;
      setOpen(false);
    };
    document.addEventListener('pointerdown', closeOnOutsideTap, true);
    return () =>
      document.removeEventListener('pointerdown', closeOnOutsideTap, true);
  }, [open]);

  return (
    <>
      <Tooltip
        content={description}
        open={open}
        // Hover and focus are zag's; it never opens for touch, and its
        // close-on-leave (fired as a finger lifts) mustn't undo a tap.
        onOpenChange={({ open: next }) => {
          if (!byTouch.current) setOpen(next);
        }}
        closeOnClick={false}
        closeOnPointerDown={false}
        positioning={{ placement: 'top', offset: { mainAxis: 4 } }}
      >
        <button
          ref={buttonRef}
          type='button'
          className='nde-header-info'
          aria-label={`About ${header}`}
          aria-describedby={descriptionId}
          onPointerDown={event => {
            byTouch.current = event.pointerType === 'touch';
          }}
          onClick={() => {
            if (byTouch.current) setOpen(isOpen => !isOpen);
          }}
        >
          <InfoIcon />
        </button>
      </Tooltip>
      <span id={descriptionId} hidden>
        {description}
      </span>
    </>
  );
};

/**
 * A title clamped to two lines is still read in full by screen readers (the
 * text is all in the DOM). For pointer users, offer it as a native title the
 * first time the clamp actually hides something.
 */
const offerClampedTitle = (event: React.PointerEvent<HTMLElement>) => {
  const th = event.currentTarget;
  const label = th.querySelector<HTMLElement>('.nde-header-label');
  if (!th.title && label && label.scrollHeight > label.clientHeight + 1) {
    th.title = label.textContent ?? '';
  }
};

interface HeaderCellProps {
  column: ResolvedColumn<any>;
  direction?: SortDirection;
  onSort: (columnId: string) => void;
  disabled?: boolean;
}

/**
 * A column header. Sortable headers hold one button whose hit area (and
 * hover, focus and pressed states) covers the whole cell, padding included;
 * the `<th>` keeps the table semantics and `aria-sort`. A description, when
 * there is one, is a separate info button beside the title, layered above
 * that hit area.
 */
export const HeaderCell = React.memo(function HeaderCell({
  column,
  direction,
  onSort,
  disabled,
}: HeaderCellProps) {
  const label = <span className='nde-header-label'>{column.header}</span>;

  return (
    <th
      scope='col'
      aria-sort={
        direction
          ? direction === 'asc'
            ? 'ascending'
            : 'descending'
          : undefined
      }
      data-align={column.align === 'end' ? 'end' : undefined}
      onPointerEnter={offerClampedTitle}
    >
      <div className='nde-th' style={column.headerStyle}>
        {/* Title and info icon at the start, sort arrows at the end. */}
        <span className='nde-th-title'>
          {column.sortable ? (
            <button
              type='button'
              className='nde-sort-button'
              onClick={() => onSort(column.id)}
              disabled={disabled}
            >
              {label}
            </button>
          ) : (
            label
          )}
          {column.description && (
            <HeaderInfo
              header={column.header}
              description={column.description}
            />
          )}
        </span>
        {/* Decorative, outside the button but inside its hit area. */}
        {column.sortable && <SortIcon direction={direction} />}
      </div>
    </th>
  );
});
