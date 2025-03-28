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

/**
 * A block component for displaying related resources.
 * It includes various properties such as label, DOI, PMID, etc.
 */
export const RelatedResourceBlock = ({
  data,
  ...props
}: RelatedResourceBlockProps) => {
  const type = data?.['@type'];
  const additionalType = 'additionalType' in data && data?.additionalType?.name;
  const label = data?.name || data?.identifier || data?.url;
  const authors =
    'author' in data && data.author
      ? Array.isArray(data.author)
        ? data.author.map((author: any) => author.name).join(', ')
        : data.author.name
      : undefined;

  const doi = 'doi' in data && data?.doi;
  const pmid = 'pmid' in data && data?.pmid;

  return (
    <VStack
      alignItems='flex-start'
      fontSize='sm'
      px={2}
      py={2}
      spacing={1.5}
      {...props}
    >
      {/* Label and URL if available */}
      {(label || type || additionalType) && (
        <RelatedResourceBlockItem label=''>
          {(additionalType || label || type) && (
            <Text>
              {/* Label: name or identifier or url*/}
              {label && (
                <Text as='span' mr={1.5} lineHeight='short' fontWeight='medium'>
                  {data?.url ? (
                    <Link href={data.url} isExternal>
                      {label}
                    </Link>
                  ) : (
                    <>{label}</>
                  )}

                  {/* Alternate Name */}
                  {'alternateName' in data && data?.alternateName && (
                    <Text as='span' fontStyle='italic'>
                      ({data?.alternateName})
                    </Text>
                  )}
                </Text>
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
