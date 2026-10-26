import { Grid, GridItem, VStack } from '@chakra-ui/react';
import SCHEMA_DEFINITIONS from 'configs/schema-definitions.json';
import { uniqueId } from 'lodash';
import React from 'react';
import { SchemaDefinitions } from 'scripts/generate-schema-definitions/types';
import type { FormattedResource } from 'src/utils/api/types';

import { SectionHeader } from '../section';
import { RelatedResourceBlock } from './components/block';
import { RelatedResourceSectionWrapper } from './components/section';

const schema = SCHEMA_DEFINITIONS as SchemaDefinitions;

// Adding trailing comma explicitly tells TypeScript that this is not JSX but rather a generic declaration
const hasValidProperties = <T,>(
  items: Array<T | null | undefined> | null | undefined,
  properties: (keyof T)[],
) => {
  return (
    Array.isArray(items) &&
    items.some(item => properties.some(prop => Boolean(item?.[prop])))
  );
};

export const RelatedResources = ({
  data,
}: {
  data?: Pick<
    FormattedResource,
    '@type' | 'hasPart' | 'isBasisFor' | 'isPartOf' | 'isRelatedTo'
  >;
}) => {
  const type = data?.['@type'] || 'Dataset';

  const hasIsBasisFor = hasValidProperties(data?.isBasisFor, [
    'doi',
    'identifier',
    'name',
    'url',
  ]);
  const hasIsRelatedTo = hasValidProperties(data?.isRelatedTo, [
    'identifier',
    'name',
    'url',
  ]);

  const hasIsPartOf = hasValidProperties(data?.isPartOf, [
    'identifier',
    'name',
    'url',
  ]);

  const hasHasPart = hasValidProperties(data?.hasPart, [
    'identifier',
    'name',
    'url',
  ]);
  return (
    <VStack className='related-resource' gap={6}>
      {/* Side-by-side: isBasisFor | isRelatedTo  */}
      {(hasIsBasisFor || hasIsRelatedTo) && (
        <Grid
          gridAutoFlow={{ base: 'row', xl: 'column' }}
          templateRows='auto 1fr'
          templateColumns={{
            base: 'repeat(auto-fit, minmax(350px, 1fr))',
            xl: 'repeat(auto-fit, minmax(300px, 1fr))',
          }}
          rowGap={{ base: 4, xl: 2 }}
          columnGap={{ base: 4, xl: 6 }}
          width='100%'
          alignItems='stretch'
        >
          {/* Is Basis For Content */}
          {hasIsBasisFor && (
            <>
              <GridItem colSpan={1}>
                <SectionHeader
                  title='Basis For'
                  subtitle={schema['isBasisFor']['description']?.[type]}
                />
              </GridItem>
              <GridItem colSpan={1}>
                <RelatedResourceSectionWrapper>
                  {data?.isBasisFor?.map((item, index) => (
                    <RelatedResourceBlock
                      key={uniqueId(
                        `isBasisFor-${
                          item['name'] || item['identifier'] || index
                        }`,
                      )}
                      data={item}
                    />
                  ))}
                </RelatedResourceSectionWrapper>
              </GridItem>
            </>
          )}

          {/* Is Related To Content */}
          {hasIsRelatedTo && (
            <>
              <GridItem colSpan={1}>
                <SectionHeader
                  title='Related To'
                  subtitle={schema['isRelatedTo']['description']?.[type]}
                />
              </GridItem>
              <GridItem colSpan={1}>
                <RelatedResourceSectionWrapper>
                  {data?.isRelatedTo?.map((item, index) => (
                    <RelatedResourceBlock
                      key={uniqueId(
                        `isRelatedTo-${
                          item['name'] || item['identifier'] || index
                        }`,
                      )}
                      data={item}
                    />
                  ))}
                </RelatedResourceSectionWrapper>
              </GridItem>
            </>
          )}
        </Grid>
      )}
      {/* Side-by-side: isPartOf | hasPartOf  */}
      {(hasIsPartOf || hasHasPart) && (
        <Grid
          gridAutoFlow={{ base: 'row', xl: 'column' }}
          templateRows='auto 1fr'
          templateColumns={{
            base: 'repeat(auto-fit, minmax(350px, 1fr))',
            xl: 'repeat(auto-fit, minmax(300px, 1fr))',
          }}
          rowGap={{ base: 4, xl: 2 }}
          columnGap={{ base: 4, xl: 6 }}
          width='100%'
          alignItems='stretch'
        >
          {/* Is Part Of Content */}
          {hasIsPartOf && (
            <>
              <GridItem colSpan={1} width='100%'>
                <SectionHeader
                  title='Part Of'
                  subtitle={schema['isPartOf']['description']?.[type]}
                />
              </GridItem>
              <GridItem colSpan={1}>
                <RelatedResourceSectionWrapper>
                  {data?.isPartOf?.map((item, index) => (
                    <RelatedResourceBlock
                      key={uniqueId(
                        `isPartOf-${
                          item['name'] || item['identifier'] || index
                        }`,
                      )}
                      data={item}
                    />
                  ))}
                </RelatedResourceSectionWrapper>
              </GridItem>
            </>
          )}

          {/* Is Related To Content */}
          {hasHasPart && (
            <>
              <GridItem colSpan={1}>
                <SectionHeader
                  title='Has Part'
                  subtitle={schema['hasPart']['description']?.[type]}
                />
              </GridItem>
              <GridItem colSpan={1}>
                <RelatedResourceSectionWrapper>
                  {data?.hasPart?.map((item, index) => {
                    return (
                      <RelatedResourceBlock
                        key={uniqueId(
                          `hasPart-${
                            item['name'] || item['identifier'] || index
                          }`,
                        )}
                        data={item}
                      />
                    );
                  })}
                </RelatedResourceSectionWrapper>
              </GridItem>
            </>
          )}
        </Grid>
      )}
    </VStack>
  );
};
