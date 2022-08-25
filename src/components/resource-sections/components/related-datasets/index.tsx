import React from 'react';
import {
  Box,
  Card,
  Collapse,
  Heading,
  Link,
  SkeletonText,
  Tag,
} from 'nde-design-system';
import { FormattedResource } from 'src/utils/api/types';
import NextLink from 'next/link';
import { getTypeColor } from '../type-banner';
import { formatType } from 'src/utils/api/helpers';

interface RelatedDatasetsProps {
  isRelatedTo: FormattedResource['isRelatedTo'];
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
  isLoading,
  isRelatedTo,
}) => {
  /* Hide section if not loading and no data. */
  const isEmpty = !isLoading && (!isRelatedTo || !isRelatedTo.length);

  return (
    <>
      <Collapse in={!isEmpty}>
        <CardContainer heading='Related Datasets'>
          {new Array(isRelatedTo?.length || 3).fill('').map((_, i) => {
            const data = isRelatedTo?.[i] || null;

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
                    <NextLink
                      href={{
                        pathname: '/resources/',
                        query: { id: data.identifier },
                      }}
                      passHref
                    >
                      <Link isExternal wordBreak='break-word' fontSize='xs'>
                        {data.name || data.identifier}
                      </Link>
                    </NextLink>
                  </Box>
                )}
              </SkeletonText>
            );
          })}
        </CardContainer>
      </Collapse>
    </>
  );
};

export default RelatedDatasets;
