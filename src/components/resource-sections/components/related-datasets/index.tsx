import React from 'react';
import {
  Box,
  Flex,
  Card,
  Collapse,
  Heading,
  SkeletonText,
  Text,
  Stack,
} from '@chakra-ui/react';
import NextLink from 'next/link';
import { ScrollContainer } from 'src/components/scroll-container';
import { ResourceData } from 'src/pages/resources';
import { Link } from 'src/components/link';

interface CardContainerProps {
  heading: string;
  children: React.ReactNode;
}

/* Card for related datasets section */
export const CardContainer: React.FC<CardContainerProps> = ({
  children,
  heading,
}) => {
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

interface RelatedDatasetsProps {
  isLoading: boolean;
  relatedDatasets: ResourceData['relatedDatasets'];
}
const RelatedDatasets: React.FC<RelatedDatasetsProps> = ({
  isLoading,
  relatedDatasets,
}) => {
  /* Hide section if not loading and no data. */
  const isEmpty = !isLoading && (!relatedDatasets || !relatedDatasets.length);

  return (
    <>
      <Collapse in={!isEmpty}>
        <CardContainer heading='Related Datasets'>
          <ScrollContainer maxH={400} pr={4} py={2}>
            <Stack spacing={4}>
              {new Array(relatedDatasets?.length || 3)
                .fill('')
                .map((_, idx) => {
                  const dataset = relatedDatasets?.[idx];
                  return (
                    <SkeletonText
                      key={idx}
                      isLoaded={!isLoading}
                      color='white'
                      fadeDuration={1}
                    >
                      {dataset && (
                        <Flex lineHeight='short' flexDirection='column'>
                          {dataset._id ? (
                            <NextLink
                              href={{
                                pathname: '/resources/',
                                query: { id: dataset._id },
                              }}
                              passHref
                            >
                              <Link
                                as='span'
                                wordBreak='break-word'
                                fontSize='xs'
                                noOfLines={3}
                              >
                                {dataset.name}
                              </Link>
                            </NextLink>
                          ) : (
                            <Text
                              wordBreak='break-word'
                              fontSize='xs'
                              noOfLines={3}
                            >
                              {dataset.name}
                            </Text>
                          )}
                        </Flex>
                      )}
                    </SkeletonText>
                  );
                })}
            </Stack>
          </ScrollContainer>
        </CardContainer>
      </Collapse>
    </>
  );
};

export default RelatedDatasets;
