import React, {useEffect, useState} from 'react';
import {
  Box,
  Flex,
  Icon,
  Pagination as StyledPagination,
  PaginationButton,
  PaginationButton as StyledPaginationButton,
  PaginationButtonGroup as StyledPaginationButtonGroup,
  ScaleFade,
  Select,
  VisuallyHidden,
} from 'nde-design-system';
import {
  FaAngleRight,
  FaAngleLeft,
  FaAngleDoubleRight,
  FaAngleDoubleLeft,
} from 'react-icons/fa';

/*
 [COMPONENT INFO]: Pagination
 Handles pagination for search results. Updates pages count based on the total results and the currently selected page.
*/

interface PaginationProps {
  //  aria-label for nav element.
  ariaLabel: string;
  // Status of data loading.
  isLoading: boolean;
  // API page index
  selectedPage: number;
  // Number of items to display in a page
  selectedPerPage: number;
  // Total number of results for given query
  total: number;
  // Handler fn on page change.
  handleSelectedPage: (pageNumber: number) => void;
}

// Max pages returned from the API.
export const MAX_PAGES = 10000;

export const Pagination: React.FC<PaginationProps> = ({
  ariaLabel,
  isLoading,
  selectedPage,
  selectedPerPage,
  total,
  handleSelectedPage,
  children,
}) => {
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    setTotalPages(prev => {
      if (!total) {
        return prev;
      }
      const total_pages = Math.ceil(total / selectedPerPage);
      // max pages allotted by api
      const max = Math.floor(
        (MAX_PAGES - selectedPerPage) / selectedPerPage + 1,
      );

      // If the number of pages exceed the number of allotted pages by the api we return the max allotted by the api.
      const pages = total_pages > max ? max : total_pages;

      if (!isLoading && pages !== prev) {
        return pages;
      }
      return prev;
    });
  }, [total, isLoading, selectedPerPage]);

  return (
    <StyledPagination
      id='pagination'
      bg='white'
      role='navigation'
      aria-label={ariaLabel}
      w='100%'
      justifyContent='center'
      p={4}
      flexDirection='column'
    >
      {/* Sort component */}
      {children}

      <Flex w={['100%', 'unset']} justifyContent='center'>
        {/* Fade in transition */}
        <ScaleFade in={!!totalPages} style={{width: '100%'}}>
          <Flex w={['100%', 'unset']} alignItems={'center'}>
            <StyledPaginationButton
              flex={1}
              isDisabled={selectedPage - 1 === 0}
              onClick={() => handleSelectedPage(1)}
            >
              <VisuallyHidden>First Page</VisuallyHidden>
              <Icon as={FaAngleDoubleLeft} />
            </StyledPaginationButton>

            <StyledPaginationButton
              flex={1}
              isDisabled={selectedPage - 1 === 0}
              onClick={() => handleSelectedPage(selectedPage - 1)}
            >
              <VisuallyHidden>Previous page</VisuallyHidden>
              <Icon as={FaAngleLeft} />
            </StyledPaginationButton>
            <Box display={['none', 'block']}>
              <StyledPaginationButtonGroup>
                {Array(
                  selectedPage < totalPages - 5
                    ? selectedPage + 5
                    : selectedPage + (totalPages - selectedPage),
                )
                  .fill('')
                  .map((_, i) => {
                    const currentPage = i + 1;
                    return (
                      <PaginationButton
                        key={i}
                        isActive={currentPage === selectedPage}
                        onClick={() => handleSelectedPage(currentPage)}
                      >
                        {i + 1}
                      </PaginationButton>
                    );
                  })}
              </StyledPaginationButtonGroup>
            </Box>
            <StyledPaginationButton
              flex={1}
              isDisabled={selectedPage === totalPages}
              onClick={() => handleSelectedPage(selectedPage + 1)}
            >
              <VisuallyHidden>Next Page</VisuallyHidden>
              <Icon as={FaAngleRight} />
            </StyledPaginationButton>
            <StyledPaginationButton
              flex={1}
              isDisabled={selectedPage === totalPages}
              onClick={() => handleSelectedPage(totalPages)}
            >
              <VisuallyHidden>Last Page</VisuallyHidden>
              <Icon as={FaAngleDoubleRight} />
            </StyledPaginationButton>
          </Flex>
          <Select
            display={{sm: 'none'}}
            p={1}
            onChange={e => handleSelectedPage(+e.target.value)}
            size='lg'
            cursor='pointer'
            value={selectedPage}
          >
            {Array(totalPages)
              .fill('')
              .map((_, i) => {
                const currentPage = i + 1;
                return (
                  <option key={i} value={currentPage}>
                    {i + 1}
                  </option>
                );
              })}
          </Select>
        </ScaleFade>
      </Flex>
    </StyledPagination>
  );
};
