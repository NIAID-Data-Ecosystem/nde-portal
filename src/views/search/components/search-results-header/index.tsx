import { Flex, Text, TextProps, VStack } from '@chakra-ui/react';
import Banner from 'src/components/banner';
import { Link } from 'src/components/link';
import { FlexProps } from 'styled-system';

export const SearchResultsHeading = ({ children, ...props }: TextProps) => {
  return (
    <Text fontSize='sm' fontWeight='normal' opacity='0.8' {...props}>
      {children}
    </Text>
  );
};

const AIBanner: React.FC<FlexProps> = ({
  colorScheme = 'primary',
  children,
  ...rest
}: {
  colorScheme: string;
  children: React.ReactNode;
}) => {
  return (
    <Flex
      bg={`${colorScheme}.100`}
      borderRadius='semi'
      color={`${colorScheme}.600`}
      flex={1}
      fontWeight='medium'
      lineHeight='shorter'
      width='100%'
      px={4}
      py={2}
      {...rest}
    >
      {children}
    </Flex>
  );
};
export const SearchResultsHeader = ({
  querystring,
}: {
  querystring: string;
}) => {
  return (
    <VStack alignItems='flex-start' spacing={1} fontSize='sm' flex={1}>
      {/* <AIBanner>  AI-assisted search is active.{' '}
      <Link color='inherit' mx={1} _hover={{ color: 'inherit' }}>
        See documentation for more details.
      </Link></AIBanner> */}
      {/* Heading: Showing results for... */}
      <SearchResultsHeading as='h1' fontSize='inherit'>
        {querystring === '__all__'
          ? 'Showing all results'
          : 'Showing results for: '}
      </SearchResultsHeading>
      {/* Query string */}
      {querystring !== '__all__' && (
        <Text color='text.heading' fontSize='inherit' fontWeight='medium'>
          {querystring.replaceAll('\\', '')}
        </Text>
      )}
    </VStack>
  );
};
