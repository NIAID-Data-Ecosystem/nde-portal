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
    <Button bg={isActive ? 'red.900' : 'primary.500'} {...props}>
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
      <Flex bg={'white'} w={'100%'}>
        {/* No previous page if selected is first page */}
        <PageButton
          isDisabled={selectedPage - 1 === 0}
          onClick={() => handleSelectedPage(selectedPage - 1)}
        >
          Prev
        </PageButton>
        {Array(total_pages)
          .fill(0)
          .map((_, i) => {
            const page_number = i + 1;
            const props = {
              isActive: page_number === selectedPage,
              onClick: () => handleSelectedPage(page_number),
            };

            // Always display first and last page buttons.
            if (page_number === 1 || page_number === total_pages) {
              return (
                <PageButton key={page_number} {...props}>
                  {page_number}
                </PageButton>
              );
            }

            // If total pages are less than five we can just display them all.
            if (total_pages < 5) {
              return (
                <PageButton key={page_number} {...props}>
                  {page_number}
                </PageButton>
              );
            }

            // Display only three consecutive page buttons otherwise.
            if (
              page_number === selectedPage - 1 ||
              page_number === selectedPage ||
              page_number === selectedPage + 1
            ) {
              return (
                <>
                  {page_number === selectedPage - 1 && '...'}
                  <PageButton key={page_number} {...props}>
                    {page_number}
                  </PageButton>
                  {page_number === selectedPage + 1 && '...'}
                </>
              );
            }
          })}
        {/* No next page if selected is last page */}
        <PageButton
          isDisabled={selectedPage === total_pages}
          onClick={() => handleSelectedPage(selectedPage + 1)}
        >
          Next
        </PageButton>
        pagination
      </Flex>
    </>
  );
};

export default Pagination;
