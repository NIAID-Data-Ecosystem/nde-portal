import React from 'react';
import {
  Box,
  Button,
  ButtonProps,
  Flex,
  Heading,
  Icon,
  Pagination as StyledPagination,
  PaginationButton,
  PaginationButton as StyledPaginationButton,
  PaginationButtonGroup as StyledPaginationButtonGroup,
  Select,
  Skeleton,
  Text,
} from 'nde-design-system';
import {VisuallyHidden} from '@chakra-ui/react';
import {
  FaChevronDown,
  FaAngleRight,
  FaAngleLeft,
  FaAngleDoubleRight,
  FaAngleDoubleLeft,
} from 'react-icons/fa';

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
  const showPerPageOptions = [10, 20, 30];
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
          {/* Total number of results */}
          <Box>
            <Heading
              as={'h2'}
              size={'h6'}
              d={'flex'}
              alignItems='baseline'
              fontWeight={'semibold'}
            >
              {total}
              <span style={{fontSize: '1rem', marginLeft: '0.25rem'}}>
                Result{total > 0 ? 's' : ''}
              </span>
            </Heading>
          </Box>

          {/* Show Per Page dropdown. */}
          <Box>
            <label htmlFor='show-per-page-select' title='Show per page'></label>
            <Select
              id='show-per-page-select'
              aria-label='Select show items per page'
              borderRadius={'semi'}
              bg={'white'}
              boxShadow={'low'}
              icon={<FaChevronDown />}
              iconSize={'xs'}
              value={selectedPerPage}
              cursor='pointer'
              my={1}
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

      {/* Pagination Tabs */}

      <StyledPagination bg='white'>
        <Flex w='100%' justifyContent='center'>
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
          <StyledPaginationButtonGroup>
            {Array(total_pages)
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
          <StyledPaginationButton
            isDisabled={selectedPage === total_pages}
            onClick={() => handleSelectedPage(selectedPage + 1)}
          >
            <VisuallyHidden>Next Page</VisuallyHidden>
            <Icon as={FaAngleRight} />
          </StyledPaginationButton>
          <StyledPaginationButton
            isDisabled={selectedPage === total_pages}
            onClick={() => handleSelectedPage(total_pages)}
          >
            <VisuallyHidden>Last Page</VisuallyHidden>
            <Icon as={FaAngleDoubleRight} />
          </StyledPaginationButton>
        </Flex>
      </StyledPagination>
    </>
  );
};

export default Pagination;
