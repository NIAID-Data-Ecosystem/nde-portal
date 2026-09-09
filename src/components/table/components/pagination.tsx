import {
  Center,
  ColorPalette,
  Flex,
  IconButton,
  NativeSelect,
  Separator,
  Stack,
  StackProps,
  Text,
  useSlotRecipe,
} from '@chakra-ui/react';
import React from 'react';
import {
  FaAngleLeft,
  FaAngleRight,
  FaAnglesLeft,
  FaAnglesRight,
} from 'react-icons/fa6';
import { PageCombobox } from 'src/components/page-combobox';

// Based on NIAID's Table Styles
// https://designsystem.niaid.nih.gov/components/atoms

// Format number with thousands separator
const formatNumber = (number: number, separator = ',') => {
  return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, separator);
};

export interface TablePaginationProps extends StackProps {
  /**
   * Total number of data.
   */
  total: number;

  /**
   * Number of rows to display on each page.
   */
  size: number;

  /**
   * Update the number of rows to display
   */
  setSize: (n: number) => void;

  /**
   * Page number on which to start.
   */
  from: number;

  /**
   * Update page number on which to start.
   */
  setFrom: (n: number) => void;

  /**
   * Color palette for table. Defaults to gray.
   */
  colorPalette?: ColorPalette;

  /**
   * Options for number of rows to show per page.
   */
  pageSizeOptions: number[];

  /**
   * Optional setting for when the number of pages to display is different than the total number of results. (i.e. more than 10 000)
   */
  numPages?: number;

  /**
   * Loading state for loading indicator.
   */
  loading?: boolean;
}

export const TablePagination: React.FC<TablePaginationProps> = ({
  total,
  size,
  setSize,
  from,
  setFrom,
  pageSizeOptions,
  colorPalette = 'gray',
  loading,
  numPages: totalPages,
  ...props
}) => {
  // `pagination` is not part of Chakra's table anatomy — see
  // src/theme/slot-recipes/table-shell.slot-recipe.ts.
  const recipe = useSlotRecipe({ key: 'tableShell' });
  const styles = recipe();
  const numPages =
    totalPages !== undefined ? totalPages : Math.ceil(total / size);

  const ArrowButton = ({
    ariaLabel,
    icon,
    disabled,
    handleClick,
  }: {
    ariaLabel: string;
    icon: React.ReactElement;
    disabled: boolean;
    handleClick: () => void;
  }) => {
    return (
      <IconButton
        colorPalette={colorPalette}
        size='sm'
        aria-label={ariaLabel}
        variant='outline'
        disabled={disabled}
        onClick={handleClick}
        mx={0.5}
        display={['none', 'flex']}
      >
        {icon}
      </IconButton>
    );
  };

  return (
    <Stack colorPalette={colorPalette} css={styles.pagination} {...props}>
      <Flex
        p={4}
        bg='bg.alt'
        w='100%'
        justifyContent='space-between'
        flexDirection={['column', 'row']}
      >
        {/* Select options for displaying per page rows */}
        <Flex pb={[4, 0]} flex={[1, 'unset']} flexDirection={['column', 'row']}>
          <Text fontSize='sm'>Rows per page: </Text>
          {/*
          The width is explicit because the recipe makes the root `width: 100%`
          while the field keeps `minWidth: 0`. Inside this shrink-to-fit flex
          row that resolves to min-content, collapsing the select onto the 2rem
          of padding reserved for its indicator and clipping the value away.
          */}
          <NativeSelect.Root flexShrink={0} mx={[0, 2]} size='sm' width='5rem'>
            <NativeSelect.Field
              value={size}
              onChange={e => {
                setSize(+e.currentTarget.value);
                setFrom(0);
              }}
              cursor='pointer'
              bg='white'
              aria-label='Select number of rows per page'
            >
              {pageSizeOptions.map((pageSizeOption, i) => {
                return (
                  <option key={i} value={pageSizeOption}>
                    {pageSizeOption}
                  </option>
                );
              })}
            </NativeSelect.Field>
            <NativeSelect.Indicator />
          </NativeSelect.Root>
        </Flex>

        {/* Navigation for pages. */}
        <Flex flex={[1, 'unset']} flexDirection={['column', 'row']}>
          <ArrowButton
            icon={<FaAnglesLeft />}
            ariaLabel='Go to first page.'
            disabled={from === 0}
            handleClick={() => setFrom(0)}
          ></ArrowButton>
          <ArrowButton
            icon={<FaAngleLeft />}
            ariaLabel='Go to previous page.'
            disabled={from === 0}
            handleClick={() => setFrom(from - 1)}
          ></ArrowButton>
          {/*
          `from` is a 0-based page index here, while PageCombobox works in
          1-based page numbers, so both directions convert at this boundary.
          */}
          <PageCombobox
            // Matches the white "rows per page" select beside it on `bg.alt`.
            inputProps={{ bg: 'white' }}
            mx={[0, 4]}
            my={[2, 0]}
            onPageChange={page => setFrom(page - 1)}
            page={from + 1}
            totalPages={numPages}
            width='5rem'
          />
          <ArrowButton
            icon={<FaAngleRight />}
            ariaLabel='Go to next page.'
            disabled={from + 1 === numPages}
            handleClick={() => setFrom(from + 1)}
          ></ArrowButton>
          <ArrowButton
            icon={<FaAnglesRight />}
            ariaLabel='Go to last page.'
            disabled={from + 1 === numPages}
            handleClick={() => setFrom(numPages - 1)}
          ></ArrowButton>
        </Flex>
      </Flex>
      {/* Display of what is currently showing. */}
      <Flex
        alignItems='center'
        justifyContent='flex-end'
        w='100%'
        bg='white'
        p={4}
      >
        <Text fontSize='sm'>
          Page {formatNumber(from + 1)} of {formatNumber(numPages)}
        </Text>
        <Center display={'flex'} h='20px' mx={2}>
          <Separator orientation='vertical' />
        </Center>
        <Text fontSize='sm'>
          {formatNumber(total)} {total > 1 ? 'items' : 'item'}
        </Text>
      </Flex>
    </Stack>
  );
};
