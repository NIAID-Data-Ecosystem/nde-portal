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
import {SortOptions} from 'src/components/search-results-page';
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
  const total_pages = Math.ceil(total / selectedPerPage);

  if (!total_pages) {
    return null;
  }
  return (
    <StyledPagination
      id='pagination'
      bg='white'
      role='navigation'
      aria-label={ariaLabel}
      w='100%'
      justifyContent='center'
      p={[4, 0]}
    >
      <Flex w={['100%', 'unset']} justifyContent='center'>
        {/* Fade in transition */}
        <ScaleFade in={!!total} style={{width: '100%'}}>
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
            </Box>
            <StyledPaginationButton
              flex={1}
              isDisabled={selectedPage === total_pages}
              onClick={() => handleSelectedPage(selectedPage + 1)}
            >
              <VisuallyHidden>Next Page</VisuallyHidden>
              <Icon as={FaAngleRight} />
            </StyledPaginationButton>
            <StyledPaginationButton
              flex={1}
              isDisabled={selectedPage === total_pages}
              onClick={() => handleSelectedPage(total_pages)}
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
            {Array(total_pages)
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
        flexWrap='wrap'
        flexDirection={['column', 'row']}
      >
        {/* Total number of results */}
        <Box w={['100%', 'unset']}>
          <Heading
            as='h2'
            size='h6'
            d='flex'
            alignItems='baseline'
            fontWeight='semibold'
          >
            <span style={{fontSize: '1rem', marginLeft: '0.25rem'}}>
              {formatNumber(total)} Result{total !== 1 ? 's' : ''}
            </span>
          </Heading>
        </Box>

        {/* Sort/order dropdown */}
        <Flex flexDirection={['column', 'row']} w={['100%', 'unset']}>
          <Box mr={[0, 2]}>
            <label htmlFor='sorting-order-select' title='Sort order'></label>
            <Select
              id='sorting-order-select'
              aria-label='Select sort order'
              borderRadius='semi'
              bg='white'
              boxShadow='low'
              value={sortOrder}
              cursor='pointer'
              my={1}
              _hover={{boxShadow: 'md'}}
              onChange={e => handleSortOrder(e.target.value)}
              size={'lg'}
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
              cursor='pointer'
              boxShadow='low'
              value={selectedPerPage}
              my={1}
              size={'lg'}
              _hover={{boxShadow: 'md'}}
              onChange={e => handleSelectedPerPage(+e.target.value)}
            >
              {showPerPageOptions.map(option => {
                return (
                  <option key={option} value={option}>
                    {option} results
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
