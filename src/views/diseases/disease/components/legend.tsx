import {
  Box,
  Flex,
  Heading,
  HeadingProps,
  HStack,
  Separator,
  Skeleton,
  Stack,
  StackProps,
  Text,
  TextProps,
} from '@chakra-ui/react';

/**
 * A container component for displaying a legend with a title and children elements.
 *
 * @param {Object} props - The props for the LegendContainer component.
 * @param {React.ReactNode} [props.children] - The child elements to be displayed within the legend.
 * @param {string} [props.title='Legend'] - The title of the legend. Defaults to 'Legend'.
 *
 * @returns {JSX.Element} A styled container with a title, a "Resources" label, and a list of children.
 */
export const LegendContainer = ({
  children,
  title = 'Legend',
  tableHeader = 'Resources',
  orientation = 'vertical',
  ...props
}: StackProps & {
  title?: string;
  tableHeader?: string;
  orientation?: 'horizontal' | 'vertical';
}) => {
  return (
    <Box>
      <LegendTitle>{title}</LegendTitle>
      <LegendTableHeader
        textAlign={orientation === 'vertical' ? 'start' : 'start'}
      >
        {tableHeader}
      </LegendTableHeader>
      {orientation === 'vertical' ? (
        <Stack
          flexDirection='column'
          separator={<Separator borderColor='gray.200' />}
          gap={1.5}
          my={2}
          {...props}
        >
          {children}
        </Stack>
      ) : (
        <Stack
          // A wrapping grid rather than a row: as a single row the last items
          // overflowed the column, and at lg ran into the Sources chart beside it.
          display={{ base: 'flex', md: 'grid' }}
          gridTemplateColumns='repeat(auto-fit, minmax(8rem, 1fr))'
          gap={{ base: 1.5, md: 6 }}
          my={2}
          {...props}
        >
          {children}
        </Stack>
      )}
    </Box>
  );
};

export const LegendTitle: React.FC<HeadingProps> = ({ children }) => {
  return (
    <Heading
      textTransform='uppercase'
      fontSize='xs'
      fontWeight='semibold'
      mb={1}
    >
      {children}
    </Heading>
  );
};

export const LegendTableHeader: React.FC<TextProps> = ({
  children,
  ...props
}) => {
  return (
    <Text
      borderBottom='1px solid'
      borderColor='gray.600'
      fontSize='12px'
      fontWeight='semibold'
      lineHeight='shorter'
      textAlign='end'
      textTransform='uppercase'
      pb={0.5}
      {...props}
    >
      {children}
    </Text>
  );
};

/**
 * A component that represents a legend item, typically used in a legend
 * to display a color swatch, a label, and an optional count.
 *
 * @param children - The content to display as the label of the legend item.
 * @param count - An optional number to display, formatted with locale-specific separators.
 * @param swatchBg - The background color of the swatch box. Defaults to `'gray.500'`.
 * @returns A styled horizontal stack containing a color swatch, label, and count.
 */
export const LegendItem = ({
  children,
  count,
  loading,
  swatchBg,
}: {
  children?: React.ReactNode;
  count?: number;
  loading?: boolean;
  swatchBg?: string;
}) => {
  return (
    <Skeleton
      loading={!!loading}
      width='100%'
      height={loading ? '20px' : 'unset'}
    >
      <HStack
        alignItems='flex-start'
        fontSize='xs'
        lineHeight='moderate'
        justifyContent='flex-start'
        gap={1.5}
        width='100%'
      >
        {swatchBg && (
          <Box width={4} height={4} flexShrink={0} bg={swatchBg} m={0.5} />
        )}
        <Flex flex={1}>{children}</Flex>
        {count && (
          <Text textAlign='end' fontSize='inherit'>
            {count?.toLocaleString()}
          </Text>
        )}
      </HStack>
    </Skeleton>
  );
};
