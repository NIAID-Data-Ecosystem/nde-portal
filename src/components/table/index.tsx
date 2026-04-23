import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { uniqueId } from 'lodash';
import {
  Box,
  Skeleton,
  Table as ChakraTable,
  Tr,
  VisuallyHidden,
  HTMLChakraProps,
  TableContainerProps,
} from '@chakra-ui/react';
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
}

// Constants for table configuration.
// [NUM_ROWS]: num of rows per page
const NUM_ROWS = [5, 10, 50, 100];

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
    setBottomNode(node); // triggers effects that depend on the node
  }, []);

  const [tableScrollWidth, setTableScrollWidth] = useState(0);
  const [verticalScrollbarWidth, setVerticalScrollbarWidth] = useState(0);

  // Measurement effect
  // Depends on `bottomNode` so it re-runs whenever the DOM node is replaced
  // (pagination, remount) as well as when columns or data change.
  useEffect(() => {
    if (!showTopScrollbar || !bottomNode) return;

    const measure = () => {
      setTableScrollWidth(bottomNode.scrollWidth);
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
    if (!showTopScrollbar || !bottomNode) return;
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
  }, [showTopScrollbar, bottomNode]);

  // create unique id for each row
  const dataWithUniqueID = useMemo(
    () =>
      data?.map((item, idx) => ({
        ...item,
        key: uniqueId(`row-${item?.identifier || idx}`),
      })),
    [data],
  );

  // sort data based on column sorting
  const accessor = useCallback((v: any) => v, []);

  const [{ data: tableData, orderBy, sortBy }, updateSort] = useTableSort({
    data: dataWithUniqueID,
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

  // [rows]: all rows to display
  const [rows, setRows] = useState(displayData);

  useEffect(() => {
    setSize(hasPagination ? size : data.length);
    // update rows to display based on current page number and num of rows per page
    setRows(
      hasPagination
        ? displayData.slice(from * size, from * size + size)
        : displayData,
    );
  }, [displayData, size, from, data.length, hasPagination, numRows]);

  // When stickyHeader is enabled, position:sticky is applied to the thead
  // element itself rather than individual th cells.
  const stickyHeadProps = stickyHeader
    ? { position: 'sticky' as const, top: 0, zIndex: 1, bg: 'white' }
    : {};

  // Inner table markup
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
        <Tr role='row' flex='1' display='flex' w='100%'>
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
        </Tr>
      </Box>
      <Box as='tbody' {...tableBodyProps}>
        {rows.map((row: any, idx: number) => (
          <Row
            as='tr'
            key={`table-tr-${row.key}`}
            flexDirection='row'
            borderColor='gray.100'
            {...(getTableRowProps && getTableRowProps(row, idx))}
          >
            {columns.map(column => (
              <Cell
                key={`table-td-${row.key}-${column.property}`}
                as='td'
                role='cell'
                alignItems='center'
                sx={{ '>div': { my: 0 } }}
                {...column.props}
              >
                {/* generate the cells */}
                {getCells({ column, data: row, isLoading })}
              </Cell>
            ))}
          </Row>
        ))}
      </Box>
    </ChakraTable>
  );

  const {
    maxHeight,
    overflowY,
    overflowX: _overflowX,
    ...remainingContainerProps
  } = (tableContainerProps || {}) as any;

  return (
    <Skeleton
      isLoaded={!isLoading}
      overflow='auto'
      minH={isLoading ? '500px' : 'unset'}
    >
      <TableWrapper colorScheme={colorScheme}>
        {/* Top scrollbar (optional) */}
        {showTopScrollbar && (
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
                width: tableScrollWidth > 0 ? `${tableScrollWidth}px` : '100%',
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
