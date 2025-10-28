import { HStack, StackSeparator, Text } from '@chakra-ui/react';
import { Link } from 'src/components/link';
import { MetadataCompatibilitySourceBadge } from 'src/components/metadata-compatibility-source-badge';
import { MetadataSource } from 'src/hooks/api/types';
import type { SourceResponse } from 'src/pages/sources';

import { SourceSchema } from './schema';

export const ReleaseDatesDetails = ({
  label,
  date,
}: {
  label: string;
  date?: SourceResponse['dateModified'];
}) => {
  return (
    <Text fontSize='xs' fontWeight='semibold' color='text.body'>
      {label}:{' '}
      <Text as='span' fontWeight='normal'>
        {date
          ? new Date(date).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })
          : 'N/A'}
      </Text>
    </Text>
  );
};

interface CardContentProps extends SourceResponse {
  metadataCompatibilityData?:
    | MetadataSource['sourceInfo']['metadata_completeness']
    | null;
}
export const CardContent = ({
  dateCreated,
  dateModified,
  description,
  metadataCompatibilityData,
  name,
  schema,
  url,
}: CardContentProps) => {
  return (
    <>
      {/* Release dates */}
      <HStack separator={<StackSeparator borderColor='gray.100' />}>
        <ReleaseDatesDetails label='Latest Release' date={dateModified} />
        <ReleaseDatesDetails label=' First Released' date={dateCreated} />
      </HStack>

      {/* Description */}
      {description && <Text lineHeight='tall'>{description}</Text>}

      {/* Link to source's website */}
      {url && (
        <Link href={url} isExternal>
          {`${name} website`}
        </Link>
      )}

      {/* Metadata Compatibility Badge */}
      {metadataCompatibilityData && (
        <MetadataCompatibilitySourceBadge data={metadataCompatibilityData} />
      )}

      {/* Schema Properties Table */}
      {schema && <SourceSchema name={name} schema={schema} />}
    </>
  );
};
