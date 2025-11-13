import {
  ButtonGroup,
  Icon,
  IconButton,
  Pagination as ChakraPagination,
  PaginationRootProps,
  Text,
  useBreakpointValue,
} from '@chakra-ui/react';
import React, { useEffect, useState } from 'react';
import {
  FaAngleLeft,
  FaAngleRight,
  FaAnglesLeft,
  FaAnglesRight,
} from 'react-icons/fa6';

/*
 [COMPONENT]: Pagination
 Provides paginated navigation for search results.
 Automatically adjusts the visible page count based on the total result size
 and highlights the currently selected page.
*/

interface PaginationProps extends PaginationRootProps {
  // [Accesibility]: Unique identifier for the root pagination element (<nav/>).
  id: string;
  // [Accesibility]: Label for the navigation element.
  ariaLabel: string;
  // Whether data is currently loading.
  isLoading: boolean;
  // Currently selected page (1-based index).
  selectedPage: number;
  // Number of items displayed per page.
  selectedPerPage: number;
  // Total number of available results.
  total: number;
  // Callback for when the user selects a new page.
  handleSelectedPage: (pageNumber: number) => void;
}

// Maximum number of results supported by the API.
export const MAX_RESULTS = 10000;

export const Pagination: React.FC<PaginationProps> = React.memo(
  ({
    colorPalette = 'primary',
    id,
    ariaLabel,
    isLoading,
    selectedPage,
    selectedPerPage,
    total,
    handleSelectedPage,
    ...rest
  }) => {
    // Determines whether the layout should use desktop-style pagination.
    const isLargerThanMd =
      useBreakpointValue({ base: false, md: true }) ?? false;

    // Internal pagination count, clamped to MAX_RESULTS if necessary.
    const [count, setCount] = useState(total);

    useEffect(() => {
      !isLoading && setCount(Math.min(total, MAX_RESULTS));
    }, [isLoading, total]);

    return (
      <ChakraPagination.Root
        id={id}
        aria-label={ariaLabel}
        colorPalette={colorPalette}
        count={count}
        pageSize={selectedPerPage}
        page={selectedPage}
        onPageChange={e => handleSelectedPage(e.page)}
        {...rest}
      >
        <ButtonGroup variant='ghost' size='sm'>
          {/* Navigate to the first page. */}
          <ChakraPagination.Item
            asChild
            type='page'
            value={1}
            disabled={selectedPage === 1}
          >
            <IconButton>
              <Icon as={FaAnglesLeft} />
            </IconButton>
          </ChakraPagination.Item>

          {/* Navigate to the previous page. */}
          <ChakraPagination.PrevTrigger asChild>
            <IconButton>
              <Icon as={FaAngleLeft} />
            </IconButton>
          </ChakraPagination.PrevTrigger>

          {/*
            On desktop: show individual page buttons with ellipsis when needed.
            On mobile: show a compact "Page X of Y" label.
          */}
          {isLargerThanMd ? (
            <ChakraPagination.Items
              render={page => (
                <IconButton variant={{ base: 'ghost', _selected: 'outline' }}>
                  {page.value.toLocaleString()}
                </IconButton>
              )}
              ellipsis={<Text color={`${colorPalette}.fg`}>...</Text>}
            />
          ) : (
            <ChakraPagination.PageText />
          )}

          {/* Navigate to the next page. */}
          <ChakraPagination.NextTrigger asChild>
            <IconButton>
              <Icon as={FaAngleRight} />
            </IconButton>
          </ChakraPagination.NextTrigger>

          {/* Navigate to the last page. */}
          <ChakraPagination.Item
            asChild
            type='page'
            value={Math.ceil(count / selectedPerPage)}
            disabled={selectedPage === Math.ceil(count / selectedPerPage)}
          >
            <IconButton>
              <Icon as={FaAnglesRight} />
            </IconButton>
          </ChakraPagination.Item>
        </ButtonGroup>
      </ChakraPagination.Root>
    );
  },
);
