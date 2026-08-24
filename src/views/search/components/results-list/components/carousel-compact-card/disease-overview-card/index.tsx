import React from 'react';
import { Text, Skeleton } from '@chakra-ui/react';
import { DiseasePageProps } from 'src/views/diseases/types';
import { CompactCard } from '../compact-card';
import { TAB_LABELS } from 'src/views/search/config/tabs';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';

interface DiseaseOverviewCardProps {
  data?: DiseasePageProps | null;
  loading?: boolean;
}

export const DiseaseOverviewCard = ({
  data,
  loading = false,
}: DiseaseOverviewCardProps) => {
  const { title, description, slug, topicEmphasizedDescription } = data || {};

  if (!loading && !slug) {
    console.warn(
      'DiseaseOverviewCard: Missing slug for disease overview card',
      {
        title: title || 'No title',
        description: description
          ? `${description.substring(0, 50)}...`
          : 'No description',
      },
    );
    return null;
  }

  const linkProps = slug
    ? {
        href: {
          pathname: '/diseases/[slug]',
          query: { slug },
        },
        as: `/diseases/${slug}`,
      }
    : undefined;

  const invitation = title
    ? `Learn about ${title} resources in the NIAID Data Ecosystem.`
    : `Learn about resources in the NIAID Data Ecosystem.`;

  return (
    <CompactCard.Base loading={loading}>
      <CompactCard.Banner
        label={TAB_LABELS.DISEASE_OVERVIEW}
        type='Disease'
        loading={loading}
      />
      <CompactCard.Header loading={loading}>
        {title && (
          <CompactCard.Title linkProps={linkProps}>{title}</CompactCard.Title>
        )}
      </CompactCard.Header>
      <CompactCard.Body>
        <Skeleton loading={loading} flex='1'>
          {/* Description (if present) */}
          {topicEmphasizedDescription || description ? (
            <>
              <Text as='div' lineClamp={6} fontSize='xs' lineHeight='short'>
                {topicEmphasizedDescription ? (
                  <ReactMarkdown rehypePlugins={[rehypeRaw, remarkGfm]}>
                    {topicEmphasizedDescription}
                  </ReactMarkdown>
                ) : (
                  <>{description}</>
                )}
              </Text>
              <Text fontSize='xs' lineHeight='short' marginTop={7}>
                {invitation}
              </Text>
            </>
          ) : (
            <Text fontSize='xs' lineHeight='short'>
              {invitation}
            </Text>
          )}
        </Skeleton>
      </CompactCard.Body>
    </CompactCard.Base>
  );
};
