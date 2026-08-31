import type { AlertRootProps } from '@chakra-ui/react';
import { Flex, FlexProps, Stack } from '@chakra-ui/react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import { Alert } from 'src/components/alert';
import { toAlertStatus } from 'src/components/alert/utils';
import { Footer } from 'src/components/footer';
import { useMDXComponents } from 'src/components/mdx/hooks/useMDXComponents';
import { Navigation } from 'src/components/navigation-bar';
import { SHOW_AI_ASSISTED_SEARCH } from 'src/utils/feature-flags';

import { useBreadcrumbs } from '../hooks/useBreadcrumbs';
import { Breadcrumbs } from './breadcrumbs';
import { LoginErrorBanner } from './login-error-banner';
import { Search } from './search';
import { SeoMetaFields, SeoMetaFieldsProps } from './seo-meta-fields';

/** The Strapi notices API returns states uppercased, e.g. `WARNING`. */
export type NoticeState = Uppercase<
  NonNullable<AlertRootProps['status']> & string
>;

export interface NoticeProps {
  id: number | string;
  heading: string;
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
  const MDXComponents = useMDXComponents();

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
              <Alert
                id='banner-environment-notice'
                title='This is the staging version of the NIAID Data Ecosystem Discovery
            Portal.'
                status='info'
              >
                <ReactMarkdown
                  rehypePlugins={[rehypeRaw, remarkGfm]}
                  components={MDXComponents}
                >
                  {`Currently using the: <a href="${process.env.NEXT_PUBLIC_API_URL}/metadata" target="_blank">${apiEnvironment} API</a>`}
                </ReactMarkdown>
              </Alert>
            )}
            {/* <!-- Banner for service warnings and notices --> */}
            {notices &&
              notices.map(notice => (
                <Alert
                  key={notice.id}
                  id={`banner-${notice.id}-notice`}
                  title={notice.heading}
                  status={toAlertStatus(notice.state)}
                >
                  {notice?.description && (
                    <ReactMarkdown
                      rehypePlugins={[rehypeRaw, remarkGfm]}
                      components={MDXComponents}
                    >
                      {notice.description}
                    </ReactMarkdown>
                  )}
                </Alert>
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
