import {
  Box,
  Divider,
  Flex,
  Heading,
  HeadingProps,
  HStack,
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
        textAlign={orientation === 'vertical' ? 'end' : 'start'}
      >
        {tableHeader}
      </LegendTableHeader>
      {orientation === 'vertical' ? (
        <Stack
          flexDirection='column'
          divider={<Divider borderColor='gray.200' />}
          spacing={1.5}
          my={2}
          {...props}
        >
          {children}
        </Stack>
      ) : (
        <Stack
          flexDirection={{ base: 'column', md: 'row' }}
          spacing={{ base: 1.5, md: 8 }}
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
      borderColor='page.placeholder'
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
  isLoading,
  swatchBg,
}: {
  children?: React.ReactNode;
  count?: number;
  isLoading?: boolean;
  swatchBg?: string;
}) => {
  return (
    <Skeleton
      isLoaded={!isLoading}
      width='100%'
      height={isLoading ? '20px' : 'unset'}
    >
      <HStack
        alignItems='flex-start'
        fontSize='xs'
        lineHeight='short'
        justifyContent='flex-start'
        spacing={1.5}
        width='100%'
      >
        {swatchBg && <Box width={4} height={4} bg={swatchBg} m={0.5} />}
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
