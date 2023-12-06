import React, { useEffect, useState } from 'react';
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
  useBreakpointValue,
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
  // id for main element
  id: string;
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
  children?: React.ReactNode;
}

// Max pages returned from the API.
export const MAX_PAGES = 10000;

export const Pagination: React.FC<PaginationProps> = ({
  id,
  ariaLabel,
  isLoading,
  selectedPage,
  selectedPerPage,
  total,
  handleSelectedPage,
  children,
}) => {
  const showPageDropdown = useBreakpointValue(
    { base: true, md: false },
    { ssr: false },
  );

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

  // Function to generate options with two before and after the selected value
  const generateOptions = (selectedVal: number) => {
    let start = Math.max(1, selectedVal - 2);
    let end = start + 4 <= totalPages ? start + 4 : totalPages;
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  };

  const options = generateOptions(selectedPage);

  // If no results, don't display pagination options
  if (!total) {
    return null;
  }
  return (
    <StyledPagination
      id={id}
      aria-label={ariaLabel}
      role='navigation'
      bg='white'
      w='100%'
      p={2}
      px={4}
      flexDirection='column'
      justifyContent='center'
      alignItems='center'
      overflow='unset'
    >
      {/* Sort component */}
      {children}

      <Flex w={['100%', 'unset']} justifyContent='center'>
        {/* Fade in transition */}
        <ScaleFade
          in={!!totalPages}
          style={{ width: '100%', display: 'flex', justifyContent: 'center' }}
        >
          <Flex w={['100%', 'unset']} alignItems='center'>
            <StyledPaginationButton
              isDisabled={selectedPage - 1 === 0}
              onClick={() => handleSelectedPage(1)}
            >
              <VisuallyHidden>First Page</VisuallyHidden>
              <Icon as={FaAngleDoubleLeft} />
            </StyledPaginationButton>
            <StyledPaginationButton
              isDisabled={selectedPage - 1 === 0}
              onClick={() => handleSelectedPage(selectedPage - 1)}
            >
              <VisuallyHidden>Previous page</VisuallyHidden>
              <Icon as={FaAngleLeft} />
            </StyledPaginationButton>

            {/* Mobile */}
            {showPageDropdown ? (
              <Select
                p={1}
                onChange={e => handleSelectedPage(+e.target.value)}
                size='md'
                cursor='pointer'
                value={selectedPage}
              >
                {options.map((option, i) => {
                  return (
                    <option key={i} value={option}>
                      {option}
                    </option>
                  );
                })}
              </Select>
            ) : (
              <Flex>
                <StyledPaginationButtonGroup>
                  {options.map((currentPage, i) => {
                    return (
                      <PaginationButton
                        key={currentPage}
                        isActive={currentPage === selectedPage}
                        onClick={() => handleSelectedPage(currentPage)}
                      >
                        {currentPage}
                      </PaginationButton>
                    );
                  })}
                </StyledPaginationButtonGroup>
                {totalPages > 5 && selectedPage < totalPages - 1 && (
                  <>
                    <Flex alignItems='flex-end' mx={4} color='primary.600'>
                      ...
                    </Flex>
                    <PaginationButton
                      isActive={totalPages === selectedPage}
                      onClick={() => {
                        handleSelectedPage(totalPages);
                      }}
                    >
                      {totalPages}
                    </PaginationButton>
                  </>
                )}
              </Flex>
            )}
            <StyledPaginationButton
              isDisabled={selectedPage === totalPages}
              onClick={() => handleSelectedPage(selectedPage + 1)}
            >
              <VisuallyHidden>Next Page</VisuallyHidden>
              <Icon as={FaAngleRight} />
            </StyledPaginationButton>
            <StyledPaginationButton
              isDisabled={selectedPage === totalPages}
              onClick={() => handleSelectedPage(totalPages)}
            >
              <VisuallyHidden>Last Page</VisuallyHidden>
              <Icon as={FaAngleDoubleRight} />
            </StyledPaginationButton>
          </Flex>
        </ScaleFade>
      </Flex>
    </StyledPagination>
  );
};
