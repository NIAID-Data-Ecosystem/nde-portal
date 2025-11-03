import { Skeleton, Text } from '@chakra-ui/react';
import React from 'react';
import { DiseasePageProps } from 'src/views/diseases/types';
import { TAB_LABELS } from 'src/views/search/config/tabs';

import { CompactCard } from '../compact-card';

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
    <CompactCard.Base isLoading={isLoading}>
      <CompactCard.Banner
        label={TAB_LABELS.DISEASE_OVERVIEW}
        type='Disease'
        isLoading={isLoading}
      />

      <CompactCard.Header isLoading={isLoading}>
        {title && (
          <CompactCard.Title linkProps={linkProps}>{title}</CompactCard.Title>
        )}
      </CompactCard.Header>

      <CompactCard.Body>
        <Skeleton loading={isLoading} flex='1' fontSize='xs' lineHeight='short'>
          {/* Description (if present) */}
          {description ? (
            <>
              <Text lineClamp={6} fontSize='inherit' lineHeight='inherit'>
                {description}
              </Text>
              <Text fontSize='inherit' lineHeight='inherit' marginTop={7}>
                {invitation}
              </Text>
            </>
          ) : (
            <Text fontSize='inherit' lineHeight='inherit'>
              {invitation}
            </Text>
          )}
        </Skeleton>
      </CompactCard.Body>
    </CompactCard.Base>
  );
};
