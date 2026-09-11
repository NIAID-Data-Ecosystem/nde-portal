import {
  Field,
  HStack,
  Icon,
  Switch,
  Tag,
  Text,
  TooltipRootProps,
} from '@chakra-ui/react';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { FaRegCircleQuestion } from 'react-icons/fa6';
import { Link } from 'src/components/link';
import Tooltip from 'src/components/tooltip';
import { useUserData } from 'src/hooks/useUserData';
import { useLocalStorage } from 'usehooks-ts';

// Knowledge center link for AI-assisted search documentation.
export const AI_ASSISTED_SEARCH_KC_LINK =
  '/knowledge-center/ai-assisted-search';

const DEFAULT_AI_TOOLTIP_CONTENT = (
  <>
    AI-assisted search uses AI to interpret your query and suggest more relevant
    results. Turn off to see results matched only to your exact keywords. This
    tool does not act as a chatbot.{' '}
    <Link href={AI_ASSISTED_SEARCH_KC_LINK} fontSize='inherit'>
      Read more here
    </Link>
    .
  </>
);

interface AIToggleProps extends Switch.RootProps {
  label?: string;
  tagProps?: Tag.RootProps;
  popoverProps?: TooltipRootProps;
  tooltipContent?: React.ReactNode;
}

export const AIToggle: React.FC<AIToggleProps> = ({
  id = 'ai-search',
  label = 'AI-assisted search',
  colorPalette = 'primary',
  tagProps,
  popoverProps,
  tooltipContent = DEFAULT_AI_TOOLTIP_CONTENT,
  ...rest
}) => {
  const router = useRouter();
  const { preferences } = useUserData();

  // Store the whether AI search is enabled in local storage.
  const [enableAiSearch, setEnableAiSearch] = useLocalStorage<boolean>(
    'enableAISearch',
    false, // default to false if no preference is set
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
     * On all other routes, an explicit URL flag wins.
     * This allows pages like:
     *    /something?use_ai_search=true
     * to intentionally preset the toggle.
     */
    if (typeof useAiSearchValue === 'string') {
      setEnableAiSearch(useAiSearchValue === 'true');
      return;
    }

    /**
     * Otherwise, fall back to the user's saved account preference.
     * `ai_toggle_preference` loads asynchronously from the user's profile;
     * including it in the dependencies re-applies the toggle once it resolves.
     */
    setEnableAiSearch(preferences.ai_toggle_preference);
  }, [
    router.isReady,
    router.query.use_ai_search,
    router.pathname,
    preferences.ai_toggle_preference,
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
    <HStack gap={1} alignItems='center'>
      <Switch.Root
        id={id}
        checked={enableAiSearch}
        onCheckedChange={e => handleToggle(e.checked)}
        colorPalette={colorPalette}
        {...rest}
      >
        <Switch.HiddenInput />
        <Switch.Control>
          <Switch.Thumb />
        </Switch.Control>
        <Tooltip content={tooltipContent} interactive>
          <Switch.Label>
            <HStack gap={1} cursor='help' alignItems='flex-start' my={1}>
              <Text>AI-assisted search</Text>
              <Icon
                color='text.placeholder'
                lineHeight='1em'
                display='inline-block'
              >
                <FaRegCircleQuestion />
              </Icon>
            </HStack>
          </Switch.Label>
        </Tooltip>
      </Switch.Root>
      {enableAiSearch && (
        <Tag.Root
          variant='subtle'
          borderRadius='full'
          color={`${colorPalette}.500`}
          colorPalette={colorPalette}
          fontWeight='inherit'
          {...tagProps}
        >
          <Tag.Label>Active</Tag.Label>
        </Tag.Root>
      )}
    </HStack>
  );
};
