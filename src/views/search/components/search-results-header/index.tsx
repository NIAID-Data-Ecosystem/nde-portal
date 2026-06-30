import {
  Flex,
  FlexProps,
  HStack,
  Text,
  TextProps,
  VStack,
} from '@chakra-ui/react';
import { BookmarkIconButton } from 'src/components/bookmark-buttons/icon-button';
import { Link } from 'src/components/link';
import { AI_ASSISTED_SEARCH_KC_LINK } from 'src/components/page-container/components/search/components/ai-toggle';
import { useAuth } from 'src/hooks/useAuth';
import { useUserData } from 'src/hooks/useUserData';
import { ENABLE_AUTH } from 'src/utils/feature-flags';
import { SelectedFilterType } from '../filters';

/**
 * Stringify a value with object keys sorted recursively, so that two
 * structurally-equal filter objects compare equal regardless of key order.
 * Array order is preserved (it is meaningful for filters such as
 * `date: [start, end, ...]`).
 */
const stableStringify = (value: unknown): string => {
  if (Array.isArray(value)) {
    return `[${value.map(stableStringify).join(',')}]`;
  }
  if (value && typeof value === 'object') {
    const entries = Object.keys(value as Record<string, unknown>)
      .sort()
      .map(
        key =>
          `${JSON.stringify(key)}:${stableStringify(
            (value as Record<string, unknown>)[key],
          )}`,
      );
    return `{${entries.join(',')}}`;
  }
  return JSON.stringify(value) ?? 'null';
};

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
  selectedFilters,
}: {
  querystring: string;
  showAIBanner: boolean | null;
  selectedFilters: SelectedFilterType;
}) => {
  const { user, login } = useAuth();

  const { savedQueries, addSavedQuery, removeSavedQuery } = useUserData();

  const favoriteIndex = savedQueries.findIndex(
    search =>
      search.query === querystring &&
      stableStringify(search.filters) === stableStringify(selectedFilters),
  );
  const isFavorited = favoriteIndex !== -1;
  return (
    <VStack alignItems='flex-start' spacing={1} fontSize='sm' flex={1}>
      {showAIBanner && (
        <AIBanner>
          <Text lineHeight='short'>
            AI-assisted search is active. Results are limited to the top 1,000
            most relevant matches. Applying any filter or changing tabs triggers
            a new search, so result counts may change.{' '}
            <Link
              href={AI_ASSISTED_SEARCH_KC_LINK}
              color='inherit'
              _hover={{ color: 'inherit' }}
              _visited={{ color: 'inherit' }}
            >
              See documentation for more details.
            </Link>
          </Text>
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
        <HStack spacing={1} width='100%' alignItems='flex-start'>
          <Text color='text.heading' fontSize='inherit' fontWeight='medium'>
            {querystring.replaceAll('\\', '')}
          </Text>

          {ENABLE_AUTH && (
            <BookmarkIconButton
              aria-label={
                isFavorited
                  ? 'Remove bookmark for this search'
                  : 'Bookmark this search'
              }
              isFavorited={isFavorited}
              onClick={() => {
                if (!user) {
                  login();
                  return;
                }
                return isFavorited
                  ? removeSavedQuery(favoriteIndex)
                  : addSavedQuery({
                      query: querystring,
                      name: `Search: ${querystring}`,
                      filters: selectedFilters,
                    });
              }}
            />
          )}
        </HStack>
      )}
    </VStack>
  );
};
