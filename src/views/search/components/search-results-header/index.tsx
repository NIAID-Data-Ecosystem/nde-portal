import { Text, TextProps, VStack } from '@chakra-ui/react';

export const SearchResultsHeading = ({ children, ...props }: TextProps) => {
  return (
    <Text fontSize='sm' fontWeight='normal' opacity='0.8' {...props}>
      {children}
    </Text>
  );
};

export const SearchResultsHeader = ({
  querystring,
}: {
  querystring: string;
}) => {
  return (
    <VStack alignItems='flex-start' spacing={1} fontSize='sm' flex={1}>
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
