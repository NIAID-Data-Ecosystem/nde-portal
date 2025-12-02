import { Flex, FlexProps, Text, TextProps, VStack } from '@chakra-ui/react';
import { Link } from 'src/components/link';
import { AI_ASSISTED_SEARCH_KC_LINK } from 'src/components/page-container';

export const SearchResultsHeading = ({ children, ...props }: TextProps) => {
  return (
    <Text fontSize='sm' fontWeight='normal' opacity='0.8' {...props}>
      {children}
    </Text>
  );
};

const AIBanner: React.FC<FlexProps & { colorScheme?: string }> = ({
  colorScheme = 'primary',
  children,
  ...rest
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
      px={2}
      py={2}
      {...rest}
    >
      {children}
    </Flex>
  );
};
export const SearchResultsHeader = ({
  querystring,
  showAIBanner,
}: {
  querystring: string;
  showAIBanner: boolean | null;
}) => {
  return (
    <VStack alignItems='flex-start' spacing={1} fontSize='sm' flex={1}>
      {showAIBanner && (
        <AIBanner>
          AI-assisted search is active.{' '}
          <Link
            href={AI_ASSISTED_SEARCH_KC_LINK}
            color='inherit'
            mx={1}
            _hover={{ color: 'inherit' }}
            _visited={{ color: 'inherit' }}
          >
            See documentation for more details.
          </Link>
        </AIBanner>
      )}
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
