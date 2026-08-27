import { Box, Flex, FlexProps, Stack } from '@chakra-ui/react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useMemo } from 'react';
import { AlertBanner } from 'src/components/alert';
import { Footer } from 'src/components/footer';
import { Navigation } from 'src/components/navigation-bar';
import { SHOW_AI_ASSISTED_SEARCH } from 'src/utils/feature-flags';

import { useBreadcrumbs } from '../hooks/useBreadcrumbs';
import { Banner, BannerState, toBannerState } from './banner';
import { Breadcrumbs } from './breadcrumbs';
import { LoginErrorBanner } from './login-error-banner';
import { Search } from './search';
import { SeoMetaFields, SeoMetaFieldsProps } from './seo-meta-fields';

/** The Strapi notices API returns states uppercased, e.g. `WARNING`. */
export type NoticeState = Uppercase<BannerState>;

export interface NoticeProps {
  id: number | string;
  label: string;
  description?: string | null;
  state: NoticeState;
  affectedRepository?: string | null;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string | null;
  isActive: boolean;
}

interface PageContainerProps extends FlexProps {
  meta: SeoMetaFieldsProps;
  includeSearchBar?: boolean;
  breadcrumbsTitle?: string; // optional title for breadcrumbs, if not provided will use the site config
}

export const PageContainer: React.FC<PageContainerProps> = ({
  children,
  meta,
  breadcrumbsTitle,
  includeSearchBar = false,
  ...props
}) => {
  const breadcrumbs = useBreadcrumbs(breadcrumbsTitle);
  // Fetch Notices from STRAPI API.
  const isProd = process.env.NEXT_PUBLIC_APP_ENV === 'production';
  const { data: notices } = useQuery<NoticeProps[]>({
    queryKey: ['notices'],
    queryFn: async () => {
      try {
        const status = isProd ? 'published' : 'draft';

        const { data } = await axios.get(
          `${process.env.NEXT_PUBLIC_STRAPI_API_URL}/api/notices?populate=*&status=${status}`,
        );
        return (data?.data || []).filter(
          (notice: NoticeProps) => notice.isActive,
        );
      } catch (err: any) {
        throw err.response;
      }
    },
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  const apiEnvironment = useMemo(() => {
    const url = process.env.NEXT_PUBLIC_API_URL || '';
    if (url.includes('api-staging')) return 'Staging';
    if (url.includes('api.data')) return 'Production';
    return 'Development';
  }, []);

  return (
    <>
      {/* Meta fields for SEO */}
      <SeoMetaFields {...meta} />
      <Flex
        as='main'
        w='100%'
        flexDirection='column'
        minW='300px'
        overflow='hidden'
      >
        <Navigation />

        {/*Page content has margin-top to compensate for fixed nav bar. */}
        <Flex
          id='pagebody'
          position='relative'
          flexDirection='column'
          {...props}
        >
          <Stack gap='1px' bg='gray.100'>
            {/* <!-- Banner for failed OAuth login attempts --> */}
            <LoginErrorBanner />
            {/* <!-- Banner for dev and staging instance --> */}
            {!isProd && (
              <AlertBanner
                id='banner-environment-notice'
                title='This is the staging version of the NIAID Data Ecosystem Discovery
            Portal.'
                description={`Currently using the: <a href="${process.env.NEXT_PUBLIC_API_URL}/metadata" target="_blank">${apiEnvironment} API</a>`}
                state='info'
              />
            )}
            {/* <!-- Banner for service warnings and notices --> */}
            {notices &&
              notices.map(notice => (
                <AlertBanner
                  key={notice.id}
                  id={`banner-${notice.id}-notice`}
                  title={notice.label}
                  description={notice.description}
                  state={toBannerState(notice.state)}
                />
              ))}
          </Stack>

          {/* <!-- Breadcrumbs --> */}
          <Breadcrumbs segments={breadcrumbs} />

          {/* <!-- Search bar for datasets across site --> */}
          {/* {includeSearchBar && <SearchBarSection />} */}
          {includeSearchBar && (
            <Search.Wrapper>
              <Flex
                justifyContent='space-between'
                alignItems='baseline'
                flexWrap='wrap'
                gap={2}
              >
                {SHOW_AI_ASSISTED_SEARCH && <Search.AIToggle />}
                <Search.AdvancedSearchLink />
              </Flex>
              <Search.Input />
            </Search.Wrapper>
          )}

          {children}
          <Footer />
        </Flex>
      </Flex>
    </>
  );
};
