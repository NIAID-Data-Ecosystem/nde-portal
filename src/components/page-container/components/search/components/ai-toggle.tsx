import {
  Flex,
  FormControl,
  FormLabel,
  HStack,
  Icon,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverArrow,
  PopoverBody,
  Switch,
  SwitchProps,
  Tag,
  TagLabel,
  TagProps,
  Text,
  TooltipProps,
  useDisclosure,
  PopoverProps,
} from '@chakra-ui/react';
import { FaRegCircleQuestion } from 'react-icons/fa6';
import { Link } from 'src/components/link';
import { useLocalStorage } from 'usehooks-ts';
import { useRouter } from 'next/router';
import { useEffect, useRef } from 'react';

const HOVER_OPEN_DELAY = 200; // ms before showing
const HOVER_CLOSE_DELAY = 120; // ms before hiding

// Knowledge center link for AI-assisted search documentation.
export const AI_ASSISTED_SEARCH_KC_LINK =
  '/knowledge-center/ai-assisted-search';

const DEFAULT_AI_TOOLTIP_CONTENT = (
  <Text fontSize='xs' fontWeight='normal' lineHeight='short'>
    AI-assisted search uses AI to interpret your query and suggest more relevant
    results. Turn off to see results matched only to your exact keywords. This
    tool does not act as a chatbot.{' '}
    <Link href={AI_ASSISTED_SEARCH_KC_LINK} fontSize='inherit'>
      Read more here
    </Link>
    .
  </Text>
);

interface AIToggleTooltipProps
  extends Omit<PopoverProps, 'children' | 'content'> {
  children: React.ReactNode;
  content?: React.ReactNode | null;
}

// [NOTE]: This can be replaced with Chakra's v3 Tooltip which has the interactive prop to handle clickable content within the tooltip.
const AIToggleTooltip: React.FC<AIToggleTooltipProps> = ({
  children,
  content,
  ...tooltipProps
}) => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  const openTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimers = () => {
    if (openTimeoutRef.current) {
      clearTimeout(openTimeoutRef.current);
      openTimeoutRef.current = null;
    }
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
  };

  const handleMouseEnter = () => {
    clearTimers();
    openTimeoutRef.current = setTimeout(() => {
      onOpen();
    }, HOVER_OPEN_DELAY);
  };

  const handleMouseLeave = () => {
    clearTimers();
    closeTimeoutRef.current = setTimeout(() => {
      onClose();
    }, HOVER_CLOSE_DELAY);
  };

  return (
    <Popover
      isOpen={isOpen}
      onOpen={onOpen}
      onClose={onClose}
      closeOnBlur
      {...tooltipProps}
    >
      <PopoverTrigger>
        <Flex
          alignItems='center'
          cursor='help'
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {children}
        </Flex>
      </PopoverTrigger>

      <PopoverContent
        maxW='sm'
        _focus={{ boxShadow: 'md' }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <PopoverArrow />
        <PopoverBody>{content}</PopoverBody>
      </PopoverContent>
    </Popover>
  );
};

interface AIToggleLabelProps {
  id: string;
  label: string;
  colorScheme?: string;
  enableAiSearch: boolean;
  tagProps?: TagProps;
}

export const AIToggleLabel = ({
  id,
  label,
  colorScheme,
  enableAiSearch,
  tagProps,
}: AIToggleLabelProps) => {
  return (
    <Flex alignItems='center' gap={2}>
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
        <Icon as={FaRegCircleQuestion} boxSize={4} color='page.placeholder' />
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
  );
};

interface AIToggleProps extends SwitchProps {
  label?: string;
  tagProps?: TagProps;
  tooltipProps?: TooltipProps;
  tooltipContent?: React.ReactNode;
}

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
      <AIToggleTooltip
        content={tooltipContent}
        hasArrow
        gutter={4}
        pointerEvents='all'
        closeDelay={600}
        closeOnClick={false}
        {...tooltipProps}
      >
        <AIToggleLabel
          id={id}
          label={label}
          colorScheme={colorScheme}
          enableAiSearch={enableAiSearch}
          tagProps={tagProps}
        />
      </AIToggleTooltip>
    </FormControl>
  );
};
