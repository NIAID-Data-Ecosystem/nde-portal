import React, { useMemo } from 'react';
import { Image, Stack } from '@chakra-ui/react';
import { Link } from 'src/components/link';
import { SectionTitle } from '../layouts/section';
import { DiseasePageProps } from '../../types';

type TopicPageExternalLink = NonNullable<
  DiseasePageProps['externalLinks']
>[number];

interface ExternalLinkItemProps extends TopicPageExternalLink {}

export const ExternalLinkItem: React.FC<ExternalLinkItemProps> = ({
  label,
  image,
  isExternal,
  url,
}) => {
  return (
    <Stack alignItems='flex-start'>
      {image && (
        <Image
          src={`${process.env.NEXT_PUBLIC_STRAPI_API_URL}${image.url}`}
          alt={image.alternativeText}
          maxHeight='100px'
        />
      )}

      <Link href={url} isExternal={isExternal}>
        {label}
      </Link>
    </Stack>
  );
};

export const ExternalLinksSection: React.FC<{
  externalLinks: DiseasePageProps['externalLinks'];
}> = ({ externalLinks }) => {
  // Group by categories
  const externalLinksGroupedByCategory = useMemo(() => {
    return (externalLinks || []).reduce((acc, link) => {
      const categoryName = link.categories?.[0]?.name || '';
      if (!acc[categoryName]) {
        acc[categoryName] = [];
      }
      acc[categoryName].push(link);
      return acc;
    }, {} as Record<string, NonNullable<DiseasePageProps['externalLinks']>>);
  }, [externalLinks]);

  return (
    <Stack spacing={6} mt={4}>
      {Object.entries(externalLinksGroupedByCategory).map(
        ([category, links]) => (
          <Stack key={category} spacing={1}>
            {category && <SectionTitle as='h4'>{category}</SectionTitle>}
            {links.map((link, index) => (
              <ExternalLinkItem key={index} {...link} />
            ))}
          </Stack>
        ),
      )}
    </Stack>
  );
};
