import React, { useEffect, useState } from 'react';
import { Flex, Icon, Select, VisuallyHidden } from '@chakra-ui/react';
import {
  FaAngleRight,
  FaAngleLeft,
  FaAnglesRight,
  FaAnglesLeft,
} from 'react-icons/fa6';
import { PaginationButton, PaginationButtonGroup } from './components/buttons';
import { useMediaQuery } from 'usehooks-ts';

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
}

// Max pages returned from the API.
export const MAX_PAGES = 10000;

export const Pagination: React.FC<PaginationProps> = React.memo(
  ({
    id,
    ariaLabel,
    isLoading,
    selectedPage,
    selectedPerPage,
    total,
    handleSelectedPage,
  }) => {
    const [totalPages, setTotalPages] = useState(10);

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
    const isLargerThanMd = useMediaQuery('(min-width: 48em)');

    return (
      <Flex
        id={id}
        as='nav'
        role='navigation'
        aria-label={ariaLabel}
        alignItems='center'
        justifyContent='center'
        px={{ base: 0, sm: 4 }}
        w='100%'
      >
        <VisuallyHidden>
          <h2>Pagination</h2>
        </VisuallyHidden>
        <Flex w={['100%', 'unset']} justifyContent='center'>
          <PaginationButton
            isDisabled={selectedPage - 1 === 0}
            onClick={() => handleSelectedPage(1)}
            display={{ base: 'none', sm: 'flex' }}
          >
            <VisuallyHidden>First Page</VisuallyHidden>
            <Icon as={FaAnglesLeft} />
          </PaginationButton>
          <PaginationButton
            isDisabled={selectedPage - 1 === 0}
            onClick={() => handleSelectedPage(selectedPage - 1)}
          >
            <VisuallyHidden>Previous page</VisuallyHidden>
            <Icon as={FaAngleLeft} />
          </PaginationButton>

          {/* Mobile */}
          <Select
            borderColor='gray.200'
            cursor='pointer'
            display={{ base: 'block', md: 'none' }}
            onChange={e => handleSelectedPage(+e.target.value)}
            p={1}
            size='md'
            value={selectedPage}
          >
            {options.map((option, idx) => {
              return (
                <option key={idx} value={option}>
                  {option}
                </option>
              );
            })}
          </Select>
          {isLargerThanMd && (
            <Flex display={{ base: 'none', md: 'flex' }}>
              <PaginationButtonGroup>
                {options.map(currentPage => {
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
              </PaginationButtonGroup>
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
          <PaginationButton
            isDisabled={selectedPage === totalPages}
            onClick={() => handleSelectedPage(selectedPage + 1)}
          >
            <VisuallyHidden>Next Page</VisuallyHidden>
            <Icon as={FaAngleRight} />
          </PaginationButton>
          <PaginationButton
            isDisabled={selectedPage === totalPages}
            onClick={() => handleSelectedPage(totalPages)}
            display={{ base: 'none', sm: 'flex' }}
          >
            <VisuallyHidden>Last Page</VisuallyHidden>
            <Icon as={FaAnglesRight} />
          </PaginationButton>
        </Flex>
      </Flex>
    );
  },
);
