import React from 'react';
import {
  Flex,
  FlexProps,
  StackProps,
  Tag,
  Text,
  VStack,
} from '@chakra-ui/react';
import {
  HasPart,
  IsBasisFor,
  IsPartOf,
  IsRelatedTo,
} from 'src/utils/api/types';
import { Link } from 'src/components/link';

interface RelatedResourceBlockProps extends StackProps {
  data: IsBasisFor | IsRelatedTo | IsPartOf | HasPart;
}

const formatType = (type: string) => {
  if (type.toLowerCase() === 'dataset') {
    return 'Dataset';
  } else if (type.toLowerCase() === 'resourcecatalog') {
    return 'Resource Catalog';
  } else if (type.toLowerCase() === 'computationaltool') {
    return 'Computational Tool';
  } else if (type.toLowerCase() === 'scholarlyarticle') {
    return 'Scholarly Article';
  } else if (type.toLowerCase() === 'creativework') {
    return 'Creative Work';
  } else if (type.toLowerCase() === 'videoobject') {
    return 'Video Object';
  } else if (type.toLowerCase() === 'website') {
    return 'Website';
  } else {
    return type;
  }
};

/**
 * A block component for displaying related resources.
 * It includes various properties such as label, DOI, PMID, etc.
 */
export const RelatedResourceBlock = ({
  data,
  ...props
}: RelatedResourceBlockProps) => {
  // Type of the resource: @type, additionalType
  const type = data?.['@type'] ? formatType(data['@type']) : undefined;
  const additionalType =
    'additionalType' in data && data?.additionalType?.name
      ? formatType(data.additionalType.name)
      : undefined;

  // Label: name or identifier or url
  // If name is not available, we use identifier or url
  // If identifier is not available, we use url
  const label = data?.name || data?.identifier || data?.url || '';
  // URL: _id or url
  // If _id is available, we prioritize the use of it to link to a record within the portal
  // If _id is not available, we use url which is an external link
  const linkProps =
    '_id' in data && data._id
      ? { href: `/resources?id=${data._id}`, isExternal: false }
      : data?.url
      ? { href: data.url, isExternal: true }
      : undefined;

  const authors =
    'author' in data && data.author
      ? Array.isArray(data.author)
        ? data.author.map((author: any) => author.name).join(', ')
        : data.author.name
      : undefined;

  // Identifiers: doi, pmid
  const doi = 'doi' in data && data?.doi;
  const pmid = 'pmid' in data && data?.pmid;

  return (
    <VStack
      alignItems='flex-start'
      fontSize='sm'
      px={2}
      py={2}
      spacing={1.5}
      w='100%'
      {...props}
    >
      {/* Label and URL if available */}
      {(label || type || additionalType) && (
        <RelatedResourceBlockItem label='' w='100%'>
          {(additionalType || label || type) && (
            <Text w='100%' lineHeight='short' fontWeight='medium'>
              {/* Label: name or identifier or url*/}
              {label && (
                <>
                  {linkProps ? (
                    <Link noOfLines={3} mr={1.5} display='unset' {...linkProps}>
                      {label}
                    </Link>
                  ) : (
                    <Text as='span' mr={1.5}>
                      {label}
                    </Text>
                  )}

                  {/* Alternate Name */}
                  {'alternateName' in data && data?.alternateName && (
                    <Text as='span' fontStyle='italic'>
                      ({data?.alternateName})
                    </Text>
                  )}
                </>
              )}
              {/* Type */}
              {type && (
                <Tag
                  size='sm'
                  colorScheme='primary'
                  borderRadius='full'
                  variant='subtle'
                  alignSelf='flex-end'
                >
                  {type}
                </Tag>
              )}

              {/* Additional Type */}
              {additionalType && (
                <Tag
                  size='sm'
                  colorScheme='primary'
                  borderRadius='full'
                  variant='subtle'
                  alignSelf='flex-end'
                >
                  {additionalType}
                </Tag>
              )}
            </Text>
          )}
        </RelatedResourceBlockItem>
      )}

      {/* Show identifiers if available, otherwise we show more datailed information like datePublished, authors and journal */}
      {doi || pmid ? (
        <RelatedResourceBlockItem label='Identifiers'>
          <VStack flexDirection='column' alignItems='flex-start' spacing={0.5}>
            {/* DOI */}
            {doi && (
              <Text as='span'>
                DOI:{' '}
                <Link
                  href={
                    doi.startsWith('http') || doi.includes('doi.org')
                      ? doi
                      : `https://doi.org/${doi}`
                  }
                  isExternal
                >
                  {doi}
                </Link>
              </Text>
            )}
            {/* PMID */}
            {pmid && (
              <Text as='span'>
                PMID:{' '}
                <Link
                  href={
                    pmid.startsWith('http') || pmid.includes('nih.gov')
                      ? pmid
                      : `https://pubmed.ncbi.nlm.nih.gov/${pmid}`
                  }
                  isExternal
                >
                  {pmid}
                </Link>
              </Text>
            )}
          </VStack>
        </RelatedResourceBlockItem>
      ) : (
        <>
          {/* Date Published */}
          {'datePublished' in data && data?.datePublished && (
            <RelatedResourceBlockItem label='Date Published'>
              <Text>{data?.datePublished}</Text>
            </RelatedResourceBlockItem>
          )}

          {/* Journal Name */}
          {'journalName' in data && data?.journalName && (
            <RelatedResourceBlockItem label='Journal'>
              <Text>{data?.journalName}</Text>
            </RelatedResourceBlockItem>
          )}

          {/* Authors */}
          {authors && (
            <RelatedResourceBlockItem label='Authors'>
              <Text>{authors}</Text>
            </RelatedResourceBlockItem>
          )}
        </>
      )}

      {/* Relationship */}
      {'relationship' in data && data?.relationship && (
        <RelatedResourceBlockItem label='Relationship'>
          <Text>{data?.relationship}</Text>
        </RelatedResourceBlockItem>
      )}

      {/* Citation */}
      {'citation' in data && data?.citation && (
        <RelatedResourceBlockItem label='Citation'>
          {data?.citation?.pmid && (
            <Text ml={1}>PMID: {data.citation.pmid}</Text>
          )}
          {data?.citation?.url && (
            <Link href={data.citation.url} isExternal ml={1}>
              {data.citation.url}
            </Link>
          )}
        </RelatedResourceBlockItem>
      )}

      {/* Source */}
      {'includedInDataCatalog' in data &&
        data?.includedInDataCatalog &&
        (data.includedInDataCatalog?.name ||
          data.includedInDataCatalog?.url) && (
          <RelatedResourceBlockItem label='Source'>
            {data.includedInDataCatalog?.url ? (
              <Link href={data.includedInDataCatalog.url}>
                {data.includedInDataCatalog.name ||
                  data.includedInDataCatalog.url}
              </Link>
            ) : (
              <Text>{data.includedInDataCatalog.name || ''}</Text>
            )}
          </RelatedResourceBlockItem>
        )}

      {/* hasPart */}
      {'hasPart' in data && data?.hasPart && data.hasPart?.identifier && (
        <RelatedResourceBlockItem label='Has Part'>
          <Text>{data.hasPart.identifier}</Text>
        </RelatedResourceBlockItem>
      )}

      {/* encodingFormat */}
      {'encodingFormat' in data && data?.encodingFormat && (
        <RelatedResourceBlockItem label='Encoding Format'>
          {Array.isArray(data.encodingFormat) ? (
            data.encodingFormat.map((format: string, index: number) => (
              <Text key={index} as='span'>
                {format}
                {index < data.encodingFormat!.length - 1 && ', '}
              </Text>
            ))
          ) : (
            <Text>{data.encodingFormat}</Text>
          )}
        </RelatedResourceBlockItem>
      )}
    </VStack>
  );
};

interface RelatedResourceBlockItemProps extends FlexProps {
  label: string;
}
/**
 * A block item component for displaying related resources.
 * It includes a label and children.
 */
const RelatedResourceBlockItem = ({
  label,
  children,
  ...props
}: RelatedResourceBlockItemProps) => {
  return (
    <Flex
      fontSize='xs'
      flexDirection='column'
      lineHeight='shorter'
      wordBreak='break-word'
      {...props}
    >
      {label && (
        <Text fontWeight='semibold' mb={0.5}>
          {label}
        </Text>
      )}
      {children}
    </Flex>
  );
};
