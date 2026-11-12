import { Text } from '@chakra-ui/react';
import React, { useEffect, useId, useRef, useState } from 'react';
import { InfoIcon } from 'src/components/info-label';
import Tooltip, { TooltipTrigger } from 'src/components/tooltip';

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

interface TitleProps {
  header: string;
  /** Sorts the column; absent for an unsortable one. */
  onSort?: () => void;
  disabled?: boolean;
}

/** The title, inside the full-cell sort button when the column sorts. */
const renderTitle = (
  label: React.ReactElement,
  { onSort, disabled }: Omit<TitleProps, 'header'>,
) =>
  onSort ? (
    <button
      type='button'
      className='nde-sort-button'
      onClick={onSort}
      disabled={disabled}
    >
      {label}
    </button>
  ) : (
    label
  );

const isClamped = (label: HTMLElement | null) =>
  !!label && label.scrollHeight > label.clientHeight + 1;

/**
 * A title with the column's description. Like `InfoLabel`, hovering the title
 * or the info icon beside it shows the description, in one tooltip over both.
 *
 * The icon is the accessible control: the tooltip opens on its hover and
 * keyboard focus, and on touch (where tooltips never open on their own) a tap
 * toggles it and a tap anywhere else closes it. The description is also its
 * accessible description, so screen readers get it without opening anything.
 * The title is only an extra hover target: it isn't focusable itself (the
 * sort button around it is, and keeps its plain name), so nothing is
 * announced twice and a tap on it still just sorts. The icon sits above the
 * sort button's full-cell hit area, so using it never sorts.
 */
const DescribedTitle = ({
  header,
  description,
  onSort,
  disabled,
}: TitleProps & { description: string }) => {
  const descriptionId = useId();
  const [open, setOpen] = useState(false);
  // The full title joins the description when the clamp hides some of it
  // (instead of a native `title`, which would show a second tooltip).
  const [showHeader, setShowHeader] = useState(false);
  const byTouch = useRef(false);
  const titleRef = useRef<HTMLSpanElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);
  const infoRef = useRef<HTMLButtonElement>(null);

  const show = (next: boolean) => {
    if (next) setShowHeader(isClamped(labelRef.current));
    setOpen(next);
  };

  // A tooltip opened by a tap stays until the next tap elsewhere.
  useEffect(() => {
    if (!open || !byTouch.current) return;
    const closeOnOutsideTap = (event: PointerEvent) => {
      if (infoRef.current?.contains(event.target as Node)) return;
      byTouch.current = false;
      setOpen(false);
    };
    document.addEventListener('pointerdown', closeOnOutsideTap, true);
    return () =>
      document.removeEventListener('pointerdown', closeOnOutsideTap, true);
  }, [open]);

  const label = (
    <TooltipTrigger asChild value='title'>
      <span ref={labelRef} className='nde-header-label'>
        {header}
      </span>
    </TooltipTrigger>
  );

  return (
    <Tooltip
      manualTriggers
      content={
        showHeader ? (
          <>
            <Text as='strong' display='block'>
              {header}
            </Text>
            {description}
          </>
        ) : (
          description
        )
      }
      open={open}
      // Hover and focus are zag's; it never opens for touch, and its
      // close-on-leave (fired as a finger lifts) mustn't undo a tap.
      onOpenChange={({ open: next }) => {
        if (!byTouch.current) show(next);
      }}
      closeOnClick={false}
      closeOnPointerDown={false}
      positioning={{
        placement: 'top',
        offset: { mainAxis: 4 },
        // Title and icon together, so the tooltip stays put moving between.
        getAnchorElement: () => titleRef.current,
      }}
    >
      <span ref={titleRef} className='nde-th-title'>
        {renderTitle(label, {
          // Sorting closes a hovered tooltip, as a click on a trigger would.
          onSort: onSort
            ? () => {
                setOpen(false);
                onSort();
              }
            : undefined,
          disabled,
        })}
        <TooltipTrigger asChild value='info'>
          <button
            ref={infoRef}
            type='button'
            className='nde-header-info'
            aria-label={`About ${header}`}
            aria-describedby={descriptionId}
            onPointerDown={event => {
              byTouch.current = event.pointerType === 'touch';
            }}
            onClick={() => {
              if (!byTouch.current) return;
              // A tap that closes it ends touch mode, so a mouse can open it
              // again on a hybrid device.
              if (open) byTouch.current = false;
              show(!open);
            }}
          >
            <InfoIcon />
          </button>
        </TooltipTrigger>
        <span id={descriptionId} hidden>
          {description}
        </span>
      </span>
    </Tooltip>
  );
};

/**
 * A title clamped to two lines is still read in full by screen readers (the
 * text is all in the DOM). For pointer users, offer it as a native title the
 * first time the clamp actually hides something. (A described title shows it
 * in its tooltip instead.)
 */
const offerClampedTitle = (event: React.PointerEvent<HTMLElement>) => {
  const th = event.currentTarget;
  const label = th.querySelector<HTMLElement>('.nde-header-label');
  if (!th.title && isClamped(label)) th.title = label!.textContent ?? '';
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
 * that hit area; hovering the title shows it too.
 */
export const HeaderCell = React.memo(function HeaderCell({
  column,
  direction,
  onSort,
  disabled,
}: HeaderCellProps) {
  const titleProps: TitleProps = {
    header: column.header,
    onSort: column.sortable ? () => onSort(column.id) : undefined,
    disabled,
  };

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
      onPointerEnter={column.description ? undefined : offerClampedTitle}
    >
      <div className='nde-th' style={column.headerStyle}>
        {/* Title and info icon at the start, sort arrows at the end. */}
        {column.description ? (
          <DescribedTitle {...titleProps} description={column.description} />
        ) : (
          <span className='nde-th-title'>
            {renderTitle(
              <span className='nde-header-label'>{column.header}</span>,
              titleProps,
            )}
          </span>
        )}
        {/* Decorative, outside the button but inside its hit area. */}
        {column.sortable && <SortIcon direction={direction} />}
      </div>
    </th>
  );
});
