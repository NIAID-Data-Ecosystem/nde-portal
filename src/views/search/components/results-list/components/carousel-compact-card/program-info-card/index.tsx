import React from 'react';
import { Text } from '@chakra-ui/react';
import { Skeleton } from 'src/components/skeleton';
import { PROGRAM_VARIANT_LABELS } from 'src/components/resource-sections/components/type-banner';
import { ProgramCollection } from 'src/views/program-collections/helpers';
import { CompactCard } from '../compact-card';

interface ProgramInfoCardProps {
  data?: ProgramCollection | null;
  isLoading?: boolean;
}

// Card for program collections without a resource catalog. Links to the
// program's anchored entry on the program collections page.
export const ProgramInfoCard = ({
  data,
  isLoading = false,
}: ProgramInfoCardProps) => {
  const { id, term, sourceOrganization } = data || {};

  const title = sourceOrganization?.name || term;
  const description =
    sourceOrganization?.abstract || sourceOrganization?.description;

  const linkProps = id ? { href: `/program-collections#${id}` } : undefined;

  return (
    <CompactCard.Base isLoading={isLoading}>
      <CompactCard.Banner
        label={PROGRAM_VARIANT_LABELS.info}
        type='ProgramInfo'
        programVariant='info'
        isLoading={isLoading}
      />

      <CompactCard.Header isLoading={isLoading}>
        {title && (
          <CompactCard.Title linkProps={linkProps}>{title}</CompactCard.Title>
        )}
      </CompactCard.Header>

      <CompactCard.Body>
        <Skeleton isLoaded={!isLoading} flex='1'>
          {description && (
            <Text fontSize='xs' lineHeight='short' noOfLines={9}>
              {description.trim()}
            </Text>
          )}
        </Skeleton>
      </CompactCard.Body>
    </CompactCard.Base>
  );
};
