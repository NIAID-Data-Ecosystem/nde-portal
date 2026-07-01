import {
  Flex,
  FlexProps,
  HStack,
  Stack,
  Text,
  TextProps,
  VStack,
} from '@chakra-ui/react';
import { useRouter } from 'next/router';
import { BookmarkIconButton } from 'src/components/bookmark-buttons/icon-button';
import { Link } from 'src/components/link';
import { AI_ASSISTED_SEARCH_KC_LINK } from 'src/components/page-container/components/search/components/ai-toggle';
import { useAuth } from 'src/hooks/useAuth';
import { useUserData } from 'src/hooks/useUserData';
import { findSavedQueryIndex } from 'src/hooks/useUserData/helpers';
import { ENABLE_AUTH } from 'src/utils/feature-flags';
import {
  APPLY_DEFAULT_DATE_FILTER_KEY,
  APPLY_DEFAULT_DATE_PARAM,
} from 'src/views/search/config/defaultQuery';
import { SelectedFilterType } from '../filters';

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
  const router = useRouter();

  const { savedQueries, addSavedQuery, removeSavedQuery } = useUserData();

  // When the user has opted out of the default date range, persist that intent
  // as a reserved key inside the saved query's filters so it round-trips and
  // stays a distinct saved query. Used consistently for identity, add, and
  // remove so they always reference the same stored shape.
  const persistedFilters: Record<string, any> =
    router.query[APPLY_DEFAULT_DATE_PARAM] === 'false'
      ? { ...selectedFilters, [APPLY_DEFAULT_DATE_FILTER_KEY]: false }
      : selectedFilters;

  const isFavorited =
    findSavedQueryIndex(savedQueries, {
      query: querystring,
      filters: persistedFilters,
    }) !== -1;
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
      <Stack
        // Use row layout for "All Results" and column layout for other queries
        flexDirection={querystring === '__all__' ? 'row' : 'column'}
        spacing={1}
      >
        <SearchResultsHeading as='h1' fontSize='inherit' whiteSpace='nowrap'>
          {querystring === '__all__'
            ? 'Showing all results'
            : 'Showing results for: '}
        </SearchResultsHeading>
        {/* Query string */}
        <HStack spacing={1} width='100%' alignItems='flex-start'>
          {querystring !== '__all__' && (
            <Text color='text.heading' fontSize='inherit' fontWeight='medium'>
              {querystring.replaceAll('\\', '')}
            </Text>
          )}

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
                  ? removeSavedQuery({
                      query: querystring,
                      filters: persistedFilters,
                    })
                  : addSavedQuery({
                      query: querystring,
                      name: `${
                        querystring === '__all__' ? 'All results' : querystring
                      }`,
                      filters: persistedFilters,
                    });
              }}
            />
          )}
        </HStack>
      </Stack>
    </VStack>
  );
};
