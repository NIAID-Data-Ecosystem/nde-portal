import { Skeleton, Text } from '@chakra-ui/react';
import React from 'react';
import { PROGRAM_VARIANT_LABELS } from 'src/components/resource-sections/components/type-banner';
import { ProgramCollection } from 'src/views/program-collections/helpers';

import { CompactCard } from '../compact-card';

interface ProgramInfoCardProps {
  data?: ProgramCollection | null;
  loading?: boolean;
}

// Card for program collections without a resource catalog. Links to the
// program's anchored entry on the program collections page.
export const ProgramInfoCard = ({
  data,
  loading = false,
}: ProgramInfoCardProps) => {
  const { id, term, sourceOrganization } = data || {};

  const title = sourceOrganization?.name || term;
  const description = sourceOrganization?.abstract;

  const linkProps = id ? { href: `/program-collections#${id}` } : undefined;

  return (
    <CompactCard.Base loading={loading}>
      <CompactCard.Banner
        label={PROGRAM_VARIANT_LABELS.info}
        type='ProgramInfo'
        programVariant='info'
        loading={loading}
      />

      <CompactCard.Header loading={loading}>
        {title && (
          <CompactCard.Title linkProps={linkProps}>{title}</CompactCard.Title>
        )}
      </CompactCard.Header>

      <CompactCard.Body>
        <Skeleton loading={loading} flex='1'>
          {description && (
            <Text lineHeight='short' lineClamp={9}>
              {description.trim()}
            </Text>
          )}
        </Skeleton>
      </CompactCard.Body>
    </CompactCard.Base>
  );
};
