import React from 'react';
import {
  Box,
  Flex,
  Heading,
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
  FaChevronDown,
  FaAngleRight,
  FaAngleLeft,
  FaAngleDoubleRight,
  FaAngleDoubleLeft,
} from 'react-icons/fa';
import {SortOptions} from 'src/pages/search';
import {formatNumber} from 'src/utils/helpers';

interface PaginationProps
  extends Omit<
    DisplayResultsProps,
    'sortOptions' | 'sortOrder' | 'handleSortOrder'
  > {
  selectedPage: number;
  handleSelectedPage: (pageNumber: number) => void;
  ariaLabel: string;
}

export const Pagination: React.FC<PaginationProps> = ({
  selectedPage,
  handleSelectedPage,
  selectedPerPage,
  total,
  ariaLabel,
}) => {
  const total_pages = total && Math.ceil(total / selectedPerPage);

  return (
    <StyledPagination bg='white' role='navigation' aria-label={ariaLabel}>
      <Flex w='100%' justifyContent='center'>
        {/* Fade in transition */}
        <ScaleFade in={!!total}>
          <Flex>
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
        </ScaleFade>
      </Flex>
    </StyledPagination>
  );
};

interface DisplayResultsProps {
  // handle items per page view.
  selectedPerPage: number;
  handleSelectedPerPage: (pageNumber: number) => void;
  total: number;
  // handles sorting
  sortOrder: string;
  sortOptions: SortOptions[];
  handleSortOrder: (sort: string) => void;
}
export const DisplayResults: React.FC<DisplayResultsProps> = ({
  children,
  selectedPerPage,
  handleSelectedPerPage,
  total,
  sortOrder,
  sortOptions,
  handleSortOrder,
}) => {
  const showPerPageOptions = [10, 20, 30];
  return (
    <>
      <Flex
        w='100%'
        boxShadow='semi'
        borderBottom='2px solid'
        borderColor='gray.700'
        justifyContent='space-between'
        alignItems='end'
      >
        {/* Total number of results */}
        <Box>
          <Heading
            as='h2'
            size='h6'
            d='flex'
            alignItems='baseline'
            fontWeight='semibold'
          >
            {total ? (
              <span style={{fontSize: '1rem', marginLeft: '0.25rem'}}>
                {formatNumber(total)} Result{total > 1 ? 's' : ''}
              </span>
            ) : (
              ''
            )}
          </Heading>
        </Box>

        {/* Sort/order dropdown */}
        <Flex>
          <Box mr={2}>
            <label htmlFor='sorting-order-select' title='Sort order'></label>
            <Select
              id='sorting-order-select'
              aria-label='Select sort order'
              borderRadius='semi'
              bg='white'
              boxShadow='low'
              icon={<FaChevronDown />}
              iconSize='xs'
              value={sortOrder}
              cursor='pointer'
              my={1}
              _hover={{boxShadow: 'md'}}
              onChange={e => handleSortOrder(e.target.value)}
            >
              {sortOptions.map(option => {
                return (
                  <option
                    key={`${option.sortBy}-${option.orderBy}`}
                    value={`${option.orderBy === 'desc' ? '-' : ''}${
                      option.sortBy
                    }`}
                  >
                    {option.name}
                  </option>
                );
              })}
            </Select>
          </Box>
          {/* Show Per Page dropdown. */}
          <Box>
            <label htmlFor='show-per-page-select' title='Show per page'></label>
            <Select
              id='show-per-page-select'
              aria-label='Select show items per page'
              borderRadius='semi'
              bg='white'
              boxShadow='low'
              icon={<FaChevronDown />}
              iconSize='xs'
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
      </Flex>

      {children}
    </>
  );
};
