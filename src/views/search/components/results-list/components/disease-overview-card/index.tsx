import React, { useMemo } from 'react';
import { Text } from '@chakra-ui/react';
import { DiseasePageProps } from 'src/views/diseases/types';
import { Skeleton } from 'src/components/skeleton';
import { BaseCompactCard } from '../base-compact-card';

interface DiseaseOverviewCardProps {
  data?: DiseasePageProps | null;
  isLoading?: boolean;
}

interface ProcessedDescription {
  cleanedDescription: string;
  invitation: string;
  hasContent: boolean;
}

const MARKDOWN_LINK_REGEX = /\[([^\]]*)\]\(([^)]*)\)/g;

const processDescription = (
  description: string | undefined,
  title: string | undefined,
): ProcessedDescription => {
  if (!description?.trim()) {
    return {
      cleanedDescription: '',
      invitation: title
        ? `Learn about ${title} resources in the NIAID Data Ecosystem.`
        : '',
      hasContent: false,
    };
  }

  // Remove all markdown links and clean up whitespace
  const cleanedDescription = description
    .replace(MARKDOWN_LINK_REGEX, '')
    .replace(/\s+/g, ' ')
    .trim();

  const invitation = title
    ? `Learn about ${title} resources in the NIAID Data Ecosystem.`
    : '';

  return {
    cleanedDescription,
    invitation,
    hasContent: Boolean(cleanedDescription || invitation),
  };
};

export const DiseaseOverviewCard = ({
  data,
  isLoading = false,
}: DiseaseOverviewCardProps) => {
  const { title, description, slug } = data || {};

  const processedContent = useMemo(
    () => processDescription(description, title),
    [description, title],
  );

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

  return (
    <BaseCompactCard
      isLoading={isLoading}
      title={title || ''}
      linkProps={linkProps}
      typeBannerProps={{
        type: 'DiseaseOverview',
      }}
    >
      {/* Description */}
      <Skeleton isLoaded={!isLoading} flex='1'>
        {processedContent.hasContent && (
          <>
            {processedContent.cleanedDescription && (
              <Text fontSize='xs' lineHeight='short' noOfLines={6}>
                {processedContent.cleanedDescription}
              </Text>
            )}
            {processedContent.invitation && (
              <Text
                fontSize='xs'
                lineHeight='short'
                marginTop={processedContent.cleanedDescription ? 7 : 0}
              >
                {processedContent.invitation}
              </Text>
            )}
          </>
        )}
      </Skeleton>
    </BaseCompactCard>
  );
};
