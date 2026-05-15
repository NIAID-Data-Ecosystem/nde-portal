import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  Box,
  Flex,
  Table as ChakraTable,
  VisuallyHidden,
  HTMLChakraProps,
  TableContainerProps,
  Skeleton,
} from '@chakra-ui/react';
import { VariableSizeList, ListChildComponentProps } from 'react-window';
import { TableContainer } from 'src/components/table/components/table-container';
import { TableWrapper } from 'src/components/table/components/wrapper';
import { TablePagination } from 'src/components/table/components/pagination';
import { useTableSort } from 'src/components/table/hooks/useTableSort';
import { Row } from 'src/components/table/components/row';
import { Cell, Th } from 'src/components/table/components/cell';

export interface Column {
  title: string;
  property: string;
  isSortable?: boolean;
  props?: any;
  renderCell?: (props: {
    column: Column;
    data: any;
    isLoading?: boolean;
  }) => React.ReactNode;
}

export interface TableProps<TData extends Record<string, string | number>> {
  ariaLabel: string;
  caption: string;
  columns: Column[];
  data: TData[];
  getCells: (props: {
    column: Column;
    data: TData;
    isLoading?: boolean;
  }) => React.ReactNode;
  colorScheme?: string;
  isLoading?: boolean;
  numRows?: number[];
  hasPagination?: boolean;
  tableBodyProps?: HTMLChakraProps<'tbody'>;
  getTableRowProps?: (row: any, idx: number) => any;
  tableHeadProps?: HTMLChakraProps<'thead'>;
  tableContainerProps?: TableContainerProps;
  /**
   * When provided, the table operates in *controlled sort* mode:
   * - Internal `useTableSort` is bypassed entirely.
   * - The column whose `property` matches `controlledSortProperty` is
   *   highlighted as selected.
   * - Clicking a sort toggle calls `onControlledSort` instead of updating
   *   local state, so the parent drives the sort.
   *
   * Omitting both props keeps the original uncontrolled behavior.
   */
  controlledSortProperty?: string | null;
  controlledSortAsc?: boolean;
  onControlledSort?: (property: string, ascending: boolean) => void;
  /**
   * When true, the thead element sticks to the top of the scrolling container
   * as the user scrolls vertically through rows.
   *
   * Requires tableContainerProps to include a bounded maxHeight and
   * overflowY:'auto'.
   *
   * Defaults to false.
   */
  stickyHeader?: boolean;
  showTopScrollbar?: boolean;
  /**
   * When true, the body is rendered with windowed virtualization so only
   * the rows currently in view (plus a small overscan) are mounted. Row
   * heights are measured at runtime, so variable-height content (wrapped
   * tags, multi-line descriptions, etc.) is supported.
   *
   * Requires tableContainerProps.maxHeight to be a bounded value.
   */
  virtualized?: boolean;
  /**
   * Content rendered inside the table body when there are no rows to
   * display (and the table is not loading). Each consumer supplies its
   * own message since the wording is implementation-specific.
   */
  emptyState?: React.ReactNode;
}

// Constants for table configuration.
// [NUM_ROWS]: num of rows per page
const NUM_ROWS = [5, 10, 50, 100];

const CELL_SX = { '>div': { my: 0 } };
const ESTIMATED_ROW_HEIGHT = 120;

interface MemoRowCellsProps {
  row: any;
  columns: Column[];
  getCells: (props: {
    column: Column;
    data: any;
    isLoading?: boolean;
  }) => React.ReactNode;
  isLoading?: boolean;
  cellAs?: any;
}

// Cells are isolated in their own memo'd component so that re-rendering a
// row's <tr> (e.g. when its zebra-stripe parity changes after a filter) does
// not force every cell's expensive component tree to re-render.
const MemoRowCells = React.memo(
  ({ row, columns, getCells, isLoading, cellAs = 'td' }: MemoRowCellsProps) => (
    <>
      {columns.map(column => (
        <Cell
          key={`table-td-${row.key}-${column.property}`}
          as={cellAs}
          role='cell'
          alignItems='center'
          sx={CELL_SX}
          {...column.props}
        >
          {getCells({ column, data: row, isLoading })}
        </Cell>
      ))}
    </>
  ),
);
MemoRowCells.displayName = 'MemoRowCells';

interface VirtualizedRowItemProps {
  row: any;
  index: number;
  columns: Column[];
  getCells: MemoRowCellsProps['getCells'];
  isLoading?: boolean;
  rowProps?: any;
  onResize: (index: number, height: number) => void;
}

// One virtualized row. Measures its own natural height after layout and
// reports it back so the list can size the slot correctly.
const VirtualizedRowItem = React.memo(
  ({
    row,
    index,
    columns,
    getCells,
    isLoading,
    rowProps,
    onResize,
  }: VirtualizedRowItemProps) => {
    const ref = useRef<HTMLDivElement>(null);
    useLayoutEffect(() => {
      const node = ref.current;
      if (!node) return;
      onResize(index, node.offsetHeight);
      const ro = new ResizeObserver(() => {
        onResize(index, node.offsetHeight);
      });
      ro.observe(node);
      return () => ro.disconnect();
    }, [index, onResize]);

    return (
      <div ref={ref}>
        <Row
          as='div'
          role='row'
          flexDirection='row'
          borderColor='gray.100'
          {...rowProps}
        >
          <MemoRowCells
            row={row}
            columns={columns}
            getCells={getCells}
            isLoading={isLoading}
            cellAs='div'
          />
        </Row>
      </div>
    );
  },
);
VirtualizedRowItem.displayName = 'VirtualizedRowItem';

// Custom outer element for VariableSizeList. The default outer owns scroll
// (overflow: auto, height = viewport). We want scroll to live on the parent
// instead, so the outer is collapsed to the inner's natural size and content
// is allowed to flow into the parent's box.
const NonScrollingOuter = React.forwardRef<HTMLDivElement, any>(
  ({ style, ...rest }, ref) => (
    <div
      ref={ref}
      {...rest}
      style={{ ...style, height: 'auto', overflow: 'visible' }}
    />
  ),
);
NonScrollingOuter.displayName = 'NonScrollingOuter';

interface VirtualizedBodyProps {
  rows: any[];
  columns: Column[];
  getCells: MemoRowCellsProps['getCells'];
  getTableRowProps?: (row: any, idx: number) => any;
  isLoading?: boolean;
  height: number;
  tableBodyProps?: HTMLChakraProps<'tbody'>;
  listRef?: React.MutableRefObject<VariableSizeList | null>;
}

// Virtualized body: only the rows in view (plus overscan) are mounted.
// Row heights are cached by stable row key, so resorting/filtering doesn't
// blow away measurements for rows that survive the change.
const VirtualizedBody: React.FC<VirtualizedBodyProps> = ({
  rows,
  columns,
  getCells,
  getTableRowProps,
  isLoading,
  height,
  tableBodyProps,
  listRef: externalListRef,
}) => {
  const internalListRef = useRef<VariableSizeList | null>(null);
  const setListRef = useCallback(
    (instance: VariableSizeList | null) => {
      internalListRef.current = instance;
      if (externalListRef) externalListRef.current = instance;
    },
    [externalListRef],
  );
  const heightsRef = useRef<Map<string, number>>(new Map());

  const getItemSize = useCallback(
    (index: number) => {
      const key = rows[index]?.key;
      return heightsRef.current.get(key) ?? ESTIMATED_ROW_HEIGHT;
    },
    [rows],
  );

  const handleResize = useCallback(
    (index: number, h: number) => {
      const key = rows[index]?.key;
      if (!key) return;
      if (heightsRef.current.get(key) === h) return;
      heightsRef.current.set(key, h);
      internalListRef.current?.resetAfterIndex(index);
    },
    [rows],
  );

  // When the rows array changes (filter/sort), force the list to recompute
  // positions using the cached sizes for the new ordering.
  useEffect(() => {
    internalListRef.current?.resetAfterIndex(0);
  }, [rows]);

  const itemKey = useCallback(
    (index: number) => rows[index]?.key ?? index,
    [rows],
  );

  return (
    <Box role='rowgroup' {...tableBodyProps}>
      <VariableSizeList
        ref={setListRef}
        height={height}
        width='100%'
        itemCount={rows.length}
        itemSize={getItemSize}
        estimatedItemSize={ESTIMATED_ROW_HEIGHT}
        itemKey={itemKey}
        overscanCount={4}
        outerElementType={NonScrollingOuter}
      >
        {({ index, style }: ListChildComponentProps) => {
          const row = rows[index];
          const rowProps = getTableRowProps?.(row, index);
          return (
            <div style={style}>
              <VirtualizedRowItem
                row={row}
                index={index}
                columns={columns}
                getCells={getCells}
                isLoading={isLoading}
                rowProps={rowProps}
                onResize={handleResize}
              />
            </div>
          );
        }}
      </VariableSizeList>
    </Box>
  );
};

export const Table: React.FC<TableProps<any>> = ({
  ariaLabel,
  caption,
  colorScheme = 'gray',
  columns,
  data,
  getCells,
  hasPagination,
  isLoading,
  numRows = NUM_ROWS,
  tableHeadProps,
  tableBodyProps,
  getTableRowProps,
  tableContainerProps,
  controlledSortProperty,
  controlledSortAsc,
  onControlledSort,
  stickyHeader = false,
  showTopScrollbar = false,
  virtualized = false,
  emptyState,
}) => {
  const isControlled =
    controlledSortProperty !== undefined && onControlledSort !== undefined;

  // Scroll-sync refs
  const topScrollbarRef = useRef<HTMLDivElement>(null);
  const bottomNodeRef = useRef<HTMLDivElement | null>(null);
  const isSyncingRef = useRef(false);
  const [bottomNode, setBottomNode] = useState<HTMLDivElement | null>(null);

  // Callback ref (called by React whenever the bottom container node changes)
  const bottomCallbackRef = useCallback((node: HTMLDivElement | null) => {
    bottomNodeRef.current = node;
    setBottomNode(node);
  }, []);

  const [tableScrollWidth, setTableScrollWidth] = useState(0);
  const [containerClientWidth, setContainerClientWidth] = useState(0);
  const [verticalScrollbarWidth, setVerticalScrollbarWidth] = useState(0);

  // True only when the table content is wider than the visible container,
  // i.e. when horizontal scrollbars are actually needed.
  const hasOverflow = tableScrollWidth > containerClientWidth;

  // Measurement effect
  // Depends on `bottomNode` so it re-runs whenever the DOM node is replaced
  // (pagination, remount) as well as when columns or data change.
  useEffect(() => {
    if (!showTopScrollbar || !bottomNode) return;

    const measure = () => {
      setTableScrollWidth(bottomNode.scrollWidth);
      // clientWidth excludes the vertical scrollbar gutter, giving us the
      // true visible width to compare against scrollWidth.
      setContainerClientWidth(bottomNode.clientWidth);
      setVerticalScrollbarWidth(
        bottomNode.offsetWidth - bottomNode.clientWidth,
      );
    };

    // Measure immediately, then once more after the first paint so the table
    // has rendered its full column set (prevents the phantom div from starting
    // too narrow on first render).
    measure();
    const rafId = requestAnimationFrame(measure);

    // Re-measure when the container itself resizes.
    const ro = new ResizeObserver(measure);
    ro.observe(bottomNode);

    // Re-measure when direct children resize (e.g. columns toggled).
    const childRo = new ResizeObserver(measure);
    Array.from(bottomNode.children).forEach(child => childRo.observe(child));

    return () => {
      cancelAnimationFrame(rafId);
      ro.disconnect();
      childRo.disconnect();
    };
  }, [showTopScrollbar, bottomNode, columns, data]);

  // Listener effect
  // Depends on `bottomNode` so it re-runs and re-attaches whenever the DOM
  // node is replaced. Uses a synchronous write (no rAF) so both thumbs update
  // in the same paint frame, avoiding the ghost-thumb artifact.
  useEffect(() => {
    if (!showTopScrollbar || !hasOverflow || !bottomNode) return;
    const top = topScrollbarRef.current;
    const bottom = bottomNode;
    if (!top) return;

    const onTopScroll = () => {
      if (isSyncingRef.current) return;
      isSyncingRef.current = true;
      bottom.scrollLeft = top.scrollLeft;
      isSyncingRef.current = false;
    };

    const onBottomScroll = () => {
      if (isSyncingRef.current) return;
      isSyncingRef.current = true;
      top.scrollLeft = bottom.scrollLeft;
      isSyncingRef.current = false;
    };

    // Non-passive listeners: assigning scrollLeft inside a passive listener
    // can be deferred to after the paint on some browsers (Safari), which
    // reintroduces the one-frame ghost. Non-passive (the default) ensures the
    // write happens synchronously within event dispatch, before the next paint.
    top.addEventListener('scroll', onTopScroll);
    bottom.addEventListener('scroll', onBottomScroll);

    return () => {
      top.removeEventListener('scroll', onTopScroll);
      bottom.removeEventListener('scroll', onBottomScroll);
    };
  }, [showTopScrollbar, hasOverflow, bottomNode]);

  // Assign a stable key per row so React can reconcile across filter/sort/search
  // changes instead of unmounting and remounting every row.
  const dataWithUniqueID = useMemo(
    () =>
      data?.map((item, idx) => ({
        ...item,
        key: `row-${item?._id ?? item?.identifier ?? idx}`,
      })),
    [data],
  );

  // sort data based on column sorting
  const accessor = useCallback((v: any) => v, []);

  // In controlled mode the parent owns the sort — skip the internal sort
  // entirely so we don't pay O(n log n) for data that is thrown away.
  const [{ data: tableData, orderBy, sortBy }, updateSort] = useTableSort({
    data: isControlled ? [] : dataWithUniqueID,
    accessor,
    orderBy: columns[0].property,
    isSortAscending: true,
  });
  // [size]: num of rows per page
  const [size, setSize] = useState(() =>
    hasPagination ? numRows[0] : data.length,
  );

  // [from]: current page number
  const [from, setFrom] = useState(0);

  // In controlled mode the parent already sorted the data server-side, so data
  // is displayed as-is. In uncontrolled mode the locally sorted copy is used.
  const displayData = isControlled ? dataWithUniqueID : tableData;

  // Sync size to data length when not paginated so TablePagination stays
  // consistent if the dataset grows or shrinks (e.g. after a filter reset).
  useEffect(() => {
    if (!hasPagination) setSize(data.length);
  }, [hasPagination, data.length]);

  // Derive the visible rows synchronously (no useState + useEffect round-trip)
  // so the table never renders a stale row set after a sort or filter change.
  const rows = useMemo(
    () =>
      hasPagination
        ? displayData.slice(from * size, from * size + size)
        : displayData,
    [hasPagination, displayData, from, size],
  );

  const showEmptyState = !isLoading && rows.length === 0 && emptyState != null;

  // When stickyHeader is enabled, position:sticky is applied to the thead
  // element itself rather than individual th cells.
  const stickyHeadProps = stickyHeader
    ? { position: 'sticky' as const, top: 0, zIndex: 1, bg: 'white' }
    : {};

  // react-window's measurement-driven output diverges from what the server
  // renders for the same inputs, so mount the virtualized body only on the
  // client. The server (and the first client render) emits a same-sized
  // placeholder; once mounted we swap in the real virtualized table.
  const [virtualizedMounted, setVirtualizedMounted] = useState(false);
  useEffect(() => {
    if (virtualized) setVirtualizedMounted(true);
  }, [virtualized]);

  // Parent owns both scrolls. Track its clientHeight (the visible viewport
  // size react-window uses to decide which items to render) and forward its
  // scrollTop into the list so the windowed range stays in sync as the user
  // scrolls.
  const virtualOuterRef = useRef<HTMLDivElement>(null);
  const virtualHeaderRef = useRef<HTMLDivElement>(null);
  const virtualListRef = useRef<VariableSizeList | null>(null);
  const [virtualListHeight, setVirtualListHeight] = useState(400);
  useEffect(() => {
    if (!virtualized || !virtualizedMounted) return;
    const outer = virtualOuterRef.current;
    if (!outer) return;
    const measure = () => {
      setVirtualListHeight(outer.clientHeight);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(outer);
    return () => ro.disconnect();
  }, [virtualized, virtualizedMounted]);

  useEffect(() => {
    if (!virtualized || !virtualizedMounted) return;
    const parent = virtualOuterRef.current;
    if (!parent) return;
    const onScroll = () => {
      const headerH = virtualHeaderRef.current?.offsetHeight ?? 0;
      // Items live below the header in the inner content, so list offset 0
      // corresponds to parent.scrollTop = headerH. Below that the list
      // shouldn't scroll at all.
      const offset = Math.max(0, parent.scrollTop - headerH);
      virtualListRef.current?.scrollTo(offset);
    };
    parent.addEventListener('scroll', onScroll, { passive: true });
    return () => parent.removeEventListener('scroll', onScroll);
  }, [virtualized, virtualizedMounted]);

  // Header row (shared between virtualized and non-virtualized renderers).
  // `rowAs`/`cellAs` differ between modes: native <tr>/<th> are only valid
  // inside a <table>, so the virtualized renderer uses divs with ARIA roles.
  const renderHeaderRow = (rowAs: any, cellAs: any) => (
    <Flex as={rowAs} role='row' flex='1' w='100%'>
      {columns.map(column => {
        const isSelected = isControlled
          ? column.property === controlledSortProperty
          : column.property === orderBy;
        const currentSortBy = isControlled
          ? controlledSortAsc
            ? 'ASC'
            : 'DESC'
          : sortBy;
        return (
          <Th
            key={`table-col-th-${column.property}`}
            as={cellAs}
            label={column.title}
            isSelected={isSelected}
            borderBottomColor={`${colorScheme}.200`}
            isSortable={column.isSortable}
            tableSortToggleProps={{
              isSelected,
              sortBy: currentSortBy as 'ASC' | 'DESC',
              handleToggle: (sortByAsc: boolean) => {
                if (isControlled) {
                  onControlledSort!(column.property, sortByAsc);
                } else {
                  updateSort(column.property, sortByAsc);
                }
              },
            }}
            {...column.props}
          />
        );
      })}
    </Flex>
  );

  /// Inner table markup
  const tableMarkup = (
    <ChakraTable
      role='table'
      aria-label={ariaLabel}
      aria-describedby='table-caption'
      aria-rowcount={rows.length}
    >
      {/* Note: keep for accessibility */}
      <VisuallyHidden id='table-caption' as='caption'>
        {caption}
      </VisuallyHidden>
      <Box as='thead' {...stickyHeadProps} {...tableHeadProps}>
        {renderHeaderRow('tr', 'th')}
      </Box>
      <Box as='tbody' {...tableBodyProps}>
        {showEmptyState ? (
          <Box as='tr' role='row'>
            <Box as='td' role='cell' colSpan={columns.length}>
              {emptyState}
            </Box>
          </Box>
        ) : (
          rows.map((row: any, idx: number) => (
            <Row
              as='tr'
              key={`table-tr-${row.key}`}
              flexDirection='row'
              borderColor='gray.100'
              {...(getTableRowProps && getTableRowProps(row, idx))}
            >
              <MemoRowCells
                row={row}
                columns={columns}
                getCells={getCells}
                isLoading={isLoading}
              />
            </Row>
          ))
        )}
      </Box>
    </ChakraTable>
  );

  const {
    maxHeight,
    overflowY,
    overflowX: _overflowX,
    ...remainingContainerProps
  } = (tableContainerProps || {}) as any;

  if (virtualized && !virtualizedMounted) {
    // SSR / pre-mount placeholder. Same outer box so the page doesn't jump
    // when the virtualized list takes over.
    return (
      <TableWrapper colorScheme={colorScheme} overflow='visible'>
        <div
          role='table'
          aria-label={ariaLabel}
          style={{
            height: maxHeight ?? '70vh',
            width: '100%',
          }}
        />
      </TableWrapper>
    );
  }

  if (virtualized) {
    return (
      <TableWrapper colorScheme={colorScheme} overflow='visible'>
        {/*
          Single horizontal scroll container. The outer div owns horizontal
          scroll for the entire table; header and virtualized body live
          inside it and scroll together.
        */}
        <div
          ref={virtualOuterRef}
          role='table'
          aria-label={ariaLabel}
          aria-describedby='table-caption'
          aria-rowcount={rows.length}
          style={{
            // Single scroll container — both axes scroll on this parent.
            overflow: showEmptyState ? 'hidden' : 'auto',
            height: maxHeight ?? '70vh',
            width: '100%',
            position: 'relative',
          }}
        >
          <VisuallyHidden id='table-caption' as='div'>
            {caption}
          </VisuallyHidden>
          {/*
            `min-width: max-content` forces this column to grow to the
            intrinsic width of its widest child (the header row, whose cells
            have explicit minW). Without it the row contents compress and
            there is nothing to scroll horizontally.
          */}
          <div
            style={{
              minWidth: 'max-content',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <Box
              as='div'
              role='rowgroup'
              ref={virtualHeaderRef}
              {...stickyHeadProps}
              {...tableHeadProps}
            >
              {renderHeaderRow('div', 'div')}
            </Box>
            {showEmptyState ? (
              <Box
                role='rowgroup'
                position='absolute'
                top='50%'
                left='50%'
                transform='translate(-50%, -50%)'
                {...tableBodyProps}
              >
                <Box role='row'>
                  <Box role='cell'>{emptyState}</Box>
                </Box>
              </Box>
            ) : (
              <VirtualizedBody
                rows={rows}
                columns={columns}
                getCells={getCells}
                getTableRowProps={getTableRowProps}
                isLoading={isLoading}
                height={virtualListHeight}
                tableBodyProps={tableBodyProps}
                listRef={virtualListRef}
              />
            )}
          </div>
        </div>

        {hasPagination && numRows && (
          <TablePagination
            total={dataWithUniqueID.length}
            size={size}
            setSize={setSize}
            from={from}
            setFrom={setFrom}
            pageSizeOptions={numRows}
            colorScheme='gray'
            __css={{ '>div': { py: 1 } }}
          />
        )}
      </TableWrapper>
    );
  }

  return (
    <Skeleton
      isLoaded={!isLoading}
      overflow='auto'
      minH={isLoading ? '500px' : 'unset'}
    >
      <TableWrapper colorScheme={colorScheme}>
        {/* Top scrollbar */}
        {/* Rendered only when showTopScrollbar is requested AND the table
            content is actually wider than the container. When there is no
            overflow the div is removed from the DOM entirely. */}
        {showTopScrollbar && hasOverflow && (
          <div
            ref={topScrollbarRef}
            style={{
              overflowX: 'auto',
              overflowY: 'hidden',
              height: '17px',
              width: '100%',
              paddingRight: `${verticalScrollbarWidth}px`,
              boxSizing: 'border-box',
            }}
          >
            {/* Phantom div (same width as the real scroll content so the top
                thumb size and travel distance match the bottom thumb exactly) */}
            <div
              style={{
                height: '1px',
                width: `${tableScrollWidth}px`,
              }}
            />
          </div>
        )}

        {/* Scroll container */}
        {showTopScrollbar ? (
          <div
            ref={bottomCallbackRef}
            style={{
              overflowX: 'auto',
              overflowY: overflowY ?? 'hidden',
              maxHeight: maxHeight,
              width: '100%',
            }}
          >
            <TableContainer
              {...remainingContainerProps}
              overflowX='visible'
              overflowY='visible'
            >
              {tableMarkup}
            </TableContainer>
          </div>
        ) : (
          <TableContainer {...tableContainerProps}>
            {tableMarkup}
          </TableContainer>
        )}

        {hasPagination && numRows && (
          <TablePagination
            total={dataWithUniqueID.length}
            size={size}
            setSize={setSize}
            from={from}
            setFrom={setFrom}
            pageSizeOptions={numRows}
            colorScheme='gray'
            __css={{ '>div': { py: 1 } }}
          />
        )}
      </TableWrapper>
    </Skeleton>
  );
};
