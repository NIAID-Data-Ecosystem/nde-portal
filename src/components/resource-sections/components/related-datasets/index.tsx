import React from 'react';
import {
  Box,
  Card,
  Collapse,
  Heading,
  Link,
  SkeletonText,
  Tag,
  Text,
} from 'nde-design-system';
import { FormattedResource } from 'src/utils/api/types';
import NextLink from 'next/link';
import { getTypeColor } from '../type-banner';
import { formatType } from 'src/utils/api/helpers';

interface RelatedDatasetsProps {
  isRelatedTo: FormattedResource['isRelatedTo'];
  includedInDataCatalog?: FormattedResource['includedInDataCatalog'];
  isLoading: boolean;
}

interface CardContainerProps {
  heading: string;
}

/* Card for related datasets section */
const CardContainer: React.FC<CardContainerProps> = ({ children, heading }) => {
  return (
    <Card flex={1} ml={[0, 0, 4]} my={2} sx={{ '>*': { p: [2, 4, 4, 6] } }}>
      <Box w='100%'>
        <Heading
          as='h2'
          size='sm'
          fontWeight='semibold'
          borderBottom='0.5px solid'
          borderColor='niaid.placeholder'
        >
          {heading}
        </Heading>

        {children}
      </Box>
    </Card>
  );
};

const RelatedDatasets: React.FC<RelatedDatasetsProps> = ({
  includedInDataCatalog,
  isLoading,
  isRelatedTo,
}) => {
  /* Hide section if not loading and no data. */
  const isEmpty = !isLoading && (!isRelatedTo || !isRelatedTo.length);

  return (
    <>
      <Collapse in={!isEmpty}>
        <CardContainer heading='Related Datasets'>
          <Box h='400px' overflow='auto'>
            {new Array(isRelatedTo?.length || 3).fill('').map((_, i) => {
              const data = isRelatedTo?.[i] || null;
              console.log('HI', data);
              return (
                <SkeletonText
                  key={i}
                  isLoaded={!isLoading}
                  color='white'
                  fadeDuration={1}
                  mt={6}
                >
                  {data && (
                    <Box lineHeight='short'>
                      {data['@type'] && (
                        <Tag bg={getTypeColor(data['@type'])} size='sm' mr={2}>
                          {formatType(data['@type'])}
                        </Tag>
                      )}
                      {data._id ? (
                        <NextLink
                          href={{
                            pathname: '/resources/',
                            query: { id: data._id },
                          }}
                          passHref
                        >
                          <Link isExternal wordBreak='break-word' fontSize='xs'>
                            {data.name || data.identifier}
                          </Link>
                        </NextLink>
                      ) : (
                        <>
                          {/* use identifier to find portal url. */}
                          {data.identifier && includedInDataCatalog?.name ? (
                            <NextLink
                              href={{
                                pathname: '/resources/',
                                query: {
                                  id: `${includedInDataCatalog.name}_${data.identifier}`,
                                },
                              }}
                              passHref
                            >
                              <Link
                                isExternal
                                wordBreak='break-word'
                                fontSize='xs'
                              >
                                {data.name || data.identifier}
                              </Link>
                            </NextLink>
                          ) : (
                            <Text wordBreak='break-word' fontSize='xs'>
                              {data.name || data.identifier}
                            </Text>
                          )}
                        </>
                      )}
                    </Box>
                  )}
                </SkeletonText>
              );
            })}
          </Box>
        </CardContainer>
      </Collapse>
    </>
  );
};

export default RelatedDatasets;
