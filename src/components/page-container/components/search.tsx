import {
  Flex,
  FlexProps,
  FormControl,
  FormLabel,
  HStack,
  Icon,
  Stack,
  Switch,
  SwitchProps,
  Tag,
  TagLabel,
  TagProps,
  Text,
  TooltipProps,
} from '@chakra-ui/react';
import { FaRegCircleQuestion } from 'react-icons/fa6';
import {
  Search as SearchWithDropdown,
  SearchBarWithDropdownProps,
} from 'src/components/search-bar';
import SCHEMA_DEFINITIONS from 'configs/schema-definitions.json';
import { Link, LinkProps } from 'src/components/link';
import SITE_CONFIG from 'configs/site.config.json';
import { SiteConfig } from '../types';
import Tooltip from 'src/components/tooltip';
import { useLocalStorage } from 'usehooks-ts';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

const siteConfig = SITE_CONFIG as SiteConfig;

const Wrapper: React.FC<FlexProps> = ({ children, ...rest }) => {
  return (
    <Flex
      justifyContent='center'
      px={{ base: 4, sm: 4, lg: 6, xl: '5vw' }}
      borderBottom='1px solid'
      borderColor='gray.100'
      {...rest}
    >
      <Stack gap={1} flexDirection='column' py={4} flex={1} maxW='2600px'>
        {children}
      </Stack>
    </Flex>
  );
};

const Input: React.FC<Partial<SearchBarWithDropdownProps>> = ({
  placeholder = 'Search for resources',
  ariaLabel = 'Search for resources',
  ...rest
}) => {
  return (
    <SearchWithDropdown.Input
      placeholder={placeholder}
      ariaLabel={ariaLabel}
      size='md'
      showOptionsMenu
      showSearchHistory
      optionMenuProps={{
        buttonProps: {
          borderRadius: 'full',
          colorScheme: 'primary',
        },
        label: 'Type',
        description: SCHEMA_DEFINITIONS['type'].abstract['Dataset'],
        showSelectAll: true,
        options: [
          {
            name: 'Computational Tool Repository',
            value: 'ComputationalTool',
            property: '@type',
          },
          {
            name: 'Dataset Repository',
            value: 'Dataset',
            property: '@type',
          },
          {
            name: 'Resource Catalog',
            value: 'ResourceCatalog',
            property: '@type',
          },
        ],
      }}
      {...rest}
    />
  );
};

const ADVANCED_SEARCH_PATH = '/advanced-search';

export const AdvancedSearchLink: React.FC<LinkProps> = props => {
  return (
    <Flex justifyContent='flex-end' flex={1}>
      <Link
        href={ADVANCED_SEARCH_PATH}
        color='primary.600'
        colorScheme='primary'
        fontSize='sm'
        fontWeight='medium'
        lineHeight='shorter'
        _visited={{ color: 'primary.600' }}
        _hover={{ color: 'primary.400' }}
        {...props}
      >
        {siteConfig.pages[ADVANCED_SEARCH_PATH]?.nav?.label ||
          'Advanced Search'}
      </Link>
    </Flex>
  );
};

interface AIToggleProps extends SwitchProps {
  label?: string;
  tagProps?: TagProps;
  tooltipProps?: TooltipProps;
  tooltipContent?: React.ReactNode;
}

export const AI_ASSISTED_SEARCH_KC_LINK =
  '/knowledge-center/ai-assisted-search';
const DEFAULT_AI_TOOLTIP_CONTENT = (
  <Text fontSize='sm'>
    AI-assisted search uses AI to interpret your query and suggest more relevant
    results. Turn off to see results matched only to your exact keywords. This
    tool does not act as a chatbot.{' '}
    <Link href={AI_ASSISTED_SEARCH_KC_LINK} fontSize='inherit'>
      Read more here
    </Link>
    .
  </Text>
);
export const AIToggle: React.FC<AIToggleProps> = ({
  id = 'ai-search',
  label = 'AI-assisted search',
  colorScheme = 'primary',
  tagProps,
  tooltipProps,
  tooltipContent = DEFAULT_AI_TOOLTIP_CONTENT,
  ...rest
}) => {
  const router = useRouter();

  // Store the whether AI search is enabled in local storage.
  const [enableAiSearch, setEnableAiSearch] = useLocalStorage<boolean>(
    'enableAISearch',
    false,
    { initializeWithValue: false },
  );

  // Keep the AI toggle synchronized with the URL when appropriate.
  useEffect(() => {
    if (!router.isReady) return;

    const useAiSearchValue = router.query.use_ai_search;

    /**
     * On the `/search` page, the URL query parameter is the single source of truth.
     * - If `use_ai_search=true`, AI search is enabled.
     * - If `use_ai_search` is missing or anything else, AI search is disabled.
     *
     * This ensures that when a user navigates to a search results page via links
     * that do NOT include the `use_ai_search` flag, the AI toggle correctly shows OFF,
     * even if they previously had AI enabled in a different session.
     *
     * This prevents UI/results mismatch where:
     *    - results are non-AI (because URL omitted the flag)
     *    - but toggle incorrectly shows ON (because localStorage remembered it)
     */
    if (router.pathname === '/search') {
      setEnableAiSearch(useAiSearchValue === 'true');
      return;
    }

    /**
     * On all other routes, DO NOT override the user’s saved preference from localStorage.
     *
     * However, if a URL explicitly includes `use_ai_search`, honor it.
     * This allows pages like:
     *    /something?use_ai_search=true
     * to intentionally preset the toggle.
     */
    if (typeof useAiSearchValue === 'string') {
      setEnableAiSearch(useAiSearchValue === 'true');
    }
  }, [
    router.isReady,
    router.query.use_ai_search,
    router.pathname,
    setEnableAiSearch,
  ]);

  const handleToggle = (checked: boolean) => {
    setEnableAiSearch(checked);

    // Keep url query parameters in sync. Remove this if you don't want instant updates of results (i.e want to press search before ai-enabled results appear).
    const { use_ai_search, ...rest } = router.query;
    const nextQuery = checked ? { ...rest, use_ai_search: 'true' } : rest;

    router.replace({ pathname: router.pathname, query: nextQuery }, undefined, {
      shallow: true,
    });
  };

  return (
    <FormControl
      as={HStack}
      fontSize='sm'
      fontWeight='semibold'
      width='unset'
      flex={1}
      minWidth='300px'
    >
      <Switch
        id={id}
        colorScheme={colorScheme}
        isChecked={enableAiSearch}
        onChange={e => handleToggle(e.target.checked)}
        {...rest}
      />
      <Tooltip
        label={tooltipContent}
        hasArrow
        gutter={4}
        pointerEvents='all'
        closeDelay={600}
        closeOnClick={false}
        {...tooltipProps}
      >
        <Flex alignItems='center' gap={2} cursor='help'>
          <FormLabel
            htmlFor={id}
            mb='0'
            me='0'
            display='flex'
            fontSize='inherit'
            fontWeight='inherit'
            gap={1}
          >
            {label}
            <Icon
              as={FaRegCircleQuestion}
              boxSize={4}
              color='page.placeholder'
            />
          </FormLabel>
          {enableAiSearch && (
            <Tag
              variant='subtle'
              borderRadius='full'
              color={`${colorScheme}.500`}
              colorScheme={colorScheme}
              fontWeight='inherit'
              {...tagProps}
            >
              <TagLabel>Active</TagLabel>
            </Tag>
          )}
        </Flex>
      </Tooltip>
    </FormControl>
  );
};

export const Search = {
  Wrapper,
  Input,
  AdvancedSearchLink,
  AIToggle,
};
