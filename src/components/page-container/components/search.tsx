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
import { useState } from 'react';

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
          my: 2,
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

export const AdvancedSearchLink: React.FC<LinkProps> = props => {
  return (
    <Link
      href='/advanced-search'
      colorScheme='primary'
      fontSize='sm'
      fontWeight='medium'
      lineHeight='shorter'
      _visited={{ color: 'primary.400' }}
      {...props}
    >
      {siteConfig.pages['/advanced-search']?.nav?.label || 'Advanced Search'}
    </Link>
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
  tooltipContent = (
    <>
      <Text fontSize='sm'>
        AI-assisted search uses AI to interpret your query and suggest more
        relevant results. Turn off to see results matched only to your exact
        keywords. This tool does not act as a chatbot.{' '}
        <Link href='/knowledge-center/' fontSize='inherit'>
          Read more here
        </Link>
        .
      </Text>
    </>
  ),
  ...rest
}) => {
  const [isChecked, setChecked] = useState(false);
  return (
    <HStack
      as={FormControl}
      fontSize='sm'
      fontWeight='semibold'
      width='unset'
      flex={1}
    >
      <Switch
        id={id}
        colorScheme={colorScheme}
        isChecked={isChecked}
        onChange={e => setChecked(e.target.checked)}
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
      </Tooltip>
      {isChecked && (
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
    </HStack>
  );
};

export const Search = {
  Wrapper,
  Input,
  AdvancedSearchLink,
  AIToggle,
};
