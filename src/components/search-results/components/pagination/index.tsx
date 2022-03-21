import React from 'react';
import {
  Box,
  Button,
  ButtonProps,
  Flex,
  Heading,
  Skeleton,
  Text,
} from 'nde-design-system';
import {Select} from '@chakra-ui/react';
import {FaChevronRight} from 'react-icons/fa';

interface PageButtonProps extends ButtonProps {
  isActive?: boolean;
  pageValue?: number;
}

const PageButton: React.FC<PageButtonProps> = ({
  children,
  pageValue,
  isActive,
  ...props
}) => {
  return (
    <Button bg={isActive ? 'red.900' : 'primary.500'} px={3} py={2} {...props}>
      {children}
    </Button>
  );
};

interface PaginationProps {
  selectedPage: number;
  handleSelectedPage: (pageNumber: number) => void;
  selectedPerPage: number;
  handleSelectedPerPage: (pageNumber: number) => void;
  total: number;
}

// [TO DO]: Extract this logic to UI lib
const Pagination: React.FC<PaginationProps> = ({
  selectedPage,
  handleSelectedPage,
  selectedPerPage,
  handleSelectedPerPage,
  total,
}) => {
  const showPerPageOptions = [2, 10, 20, 30];
  const total_pages = Math.ceil(total / selectedPerPage);

  return (
    <>
      {total && (
        <Flex
          w={'100%'}
          boxShadow={'semi'}
          borderBottom={'2px solid'}
          borderColor={'gray.700'}
          justifyContent={['space-between']}
          alignItems='end'
        >
          <Heading
            as={'h2'}
            size={'h5'}
            d={'flex'}
            alignItems='baseline'
            fontWeight={'semibold'}
          >
            {total}
            <span style={{fontSize: '1rem', marginLeft: '0.25rem'}}>
              Result{total > 0 ? 's' : ''}
            </span>
          </Heading>
          <Box>
            <label htmlFor='show-per-page-select' title='Show per page'>
              <Text>Show per page </Text>
            </label>
            <Select
              id='show-per-page-select'
              aria-label='Select show items per page'
              borderRadius={'semi'}
              bg={'white'}
              boxShadow={'low'}
              icon={<FaChevronRight />}
              iconSize={'xs'}
              value={selectedPerPage}
              _hover={{boxShadow: 'md'}}
              onChange={e => handleSelectedPerPage(+e.target.value)}
            >
              {showPerPageOptions.map(option => {
                return (
                  <option key={option} value={option}>
                    {option}
                  </option>
                );
              })}
            </Select>
          </Box>
        </Flex>
      )}
      <Flex bg={'white'} w={'100%'} justifyContent={'space-around'}>
        {/* No previous page if selected is first page */}
        <PageButton
          isDisabled={selectedPage - 1 === 0}
          onClick={() => handleSelectedPage(selectedPage - 1)}
        >
          Prev
        </PageButton>
        <Flex>
          {Array(total_pages)
            .fill(0)
            .map((_, i) => {
              const currentPage = i + 1;
              const props = {
                isActive: currentPage === selectedPage,
                onClick: () => handleSelectedPage(currentPage),
              };

              // Always display first and last page buttons.
              if (currentPage === 1 || currentPage === total_pages) {
                return (
                  <PageButton
                    key={
                      currentPage === 1
                        ? `first-${currentPage}`
                        : `last-${currentPage}`
                    }
                    {...props}
                  >
                    {currentPage}
                  </PageButton>
                );
              }

              // If total pages are less than five we can just display them all.
              if (total_pages < 5) {
                return (
                  <PageButton key={currentPage} {...props}>
                    {currentPage}
                  </PageButton>
                );
              }

              // Display only three consecutive page buttons otherwise.

              if (
                currentPage === selectedPage - 1 ||
                currentPage === selectedPage ||
                currentPage === selectedPage + 1
              ) {
                return (
                  <React.Fragment key={currentPage}>
                    {currentPage === selectedPage - 1 && '...'}
                    <PageButton {...props}>{currentPage}</PageButton>
                    {currentPage === selectedPage + 1 && '...'}
                  </React.Fragment>
                );
              }
            })}
        </Flex>
        {/* No next page if selected is last page */}
        <PageButton
          isDisabled={selectedPage === total_pages}
          onClick={() => handleSelectedPage(selectedPage + 1)}
        >
          Next
        </PageButton>
      </Flex>
    </>
  );
};

export default Pagination;
