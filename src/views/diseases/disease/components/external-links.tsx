import React, { useMemo } from 'react';
import { Image, Stack } from '@chakra-ui/react';
import { Link } from 'src/components/link';
import { SectionTitle } from '../layouts/section';
import { DiseasePageProps } from '../../types';

type TopicPageExternalLink = NonNullable<
  DiseasePageProps['attributes']['externalLinks']
>['data'][number]['attributes'];

interface ExternalLinkItemProps extends TopicPageExternalLink {}

export const ExternalLinkItem: React.FC<ExternalLinkItemProps> = ({
  label,
  image,
  isExternal,
  url,
}) => {
  return (
    <Stack alignItems='flex-start'>
      {image?.data && (
        <Image
          src={image.data.attributes.url}
          alt={image.data.attributes.alternativeText}
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
  externalLinks: DiseasePageProps['attributes']['externalLinks'];
}> = ({ externalLinks }) => {
  // Group by categories
  const externalLinksGroupedByCategory = useMemo(() => {
    return (externalLinks?.data || []).reduce((acc, link) => {
      const category =
        link.attributes.categories?.data[0]?.attributes.name || '';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(link);
      return acc;
    }, {} as Record<string, NonNullable<DiseasePageProps['attributes']['externalLinks']>['data']>);
  }, [externalLinks?.data]);

  return (
    <Stack spacing={6} mt={4}>
      {Object.entries(externalLinksGroupedByCategory).map(
        ([category, links]) => (
          <Stack key={category} spacing={1}>
            {category && <SectionTitle as='h4'>{category}</SectionTitle>}
            {links.map((link, index) => (
              <ExternalLinkItem key={index} {...link.attributes} />
            ))}
          </Stack>
        ),
      )}
    </Stack>
  );
};
