import { Flex } from '@chakra-ui/react';

import { Link, LinkProps } from 'src/components/link';
import SITE_CONFIG from 'configs/site.config.json';
import { SiteConfig } from 'src/components/page-container/types';

const siteConfig = SITE_CONFIG as SiteConfig;

const ADVANCED_SEARCH_PATH = '/advanced-search';

/**
 * Link component to the advanced search page
 * @param props LinkProps
 * @returns JSX.Element
 */
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
