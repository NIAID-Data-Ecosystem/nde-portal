import { Box, Image, Stack } from '@chakra-ui/react';
import { sendGTMEvent } from '@next/third-parties/google';
import React, { useMemo } from 'react';
import { Link } from 'src/components/link';

import { DiseasePageProps } from '../../types';
import { SectionTitle } from '../layouts/section';

type TopicPageExternalLink = NonNullable<
  DiseasePageProps['externalLinks']
>[number];

interface ExternalLinkItemProps extends TopicPageExternalLink {
  handleGATracking: (event: { label: string; url: string }) => void;
}

export const ExternalLinkItem: React.FC<ExternalLinkItemProps> = ({
  label,
  image,
  isExternal,
  url,
  handleGATracking,
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

      <Link
        href={url}
        isExternal={isExternal}
        onClick={() => handleGATracking({ label, url })}
      >
        {label}
      </Link>
    </Stack>
  );
};

export const ExternalLinksSection: React.FC<{
  externalLinks: DiseasePageProps['externalLinks'];
  topic: DiseasePageProps['topic'];
}> = ({ externalLinks, topic }) => {
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
    <Stack mt={4} gap={6}>
      {Object.entries(externalLinksGroupedByCategory).map(
        ([category, links]) => (
          <Box key={category}>
            {category && <SectionTitle as='h4'>{category}</SectionTitle>}
            <Stack key={category} gap={2}>
              {links.map((link, index) => (
                <ExternalLinkItem
                  key={index}
                  handleGATracking={({ label, url }) =>
                    sendGTMEvent({
                      event: 'disease_to_external',
                      label,
                      category: topic + ' ' + category, // link topic + category
                      value: url,
                    })
                  }
                  {...link}
                />
              ))}
            </Stack>
          </Box>
        ),
      )}
    </Stack>
  );
};
