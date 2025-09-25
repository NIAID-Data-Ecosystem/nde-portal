import React from 'react';
import { Text } from '@chakra-ui/react';
import { DiseasePageProps } from 'src/views/diseases/types';
import { Skeleton } from 'src/components/skeleton';
import { BaseCompactCard } from '../base-compact-card';
import { DisplayHTMLContent } from 'src/components/html-content';

interface DiseaseOverviewCardProps {
  data?: DiseasePageProps | null;
  isLoading?: boolean;
}

export const DiseaseOverviewCard = ({
  data,
  isLoading = false,
}: DiseaseOverviewCardProps) => {
  const { title, description, slug } = data || {};

  if (!isLoading && !slug) {
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
    <BaseCompactCard
      isLoading={isLoading}
      title={title || ''}
      linkProps={linkProps}
      typeBannerProps={{
        type: 'DiseaseOverview',
      }}
    >
      <Skeleton isLoaded={!isLoading} flex='1'>
        {/* Description (if present) */}
        {description ? (
          <>
            <DisplayHTMLContent
              noOfLines={6}
              content={description}
              fontSize='xs'
              lineHeight='short'
              reactMarkdownProps={{
                disallowedElements: ['a'],
              }}
            />
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
    </BaseCompactCard>
  );
};
