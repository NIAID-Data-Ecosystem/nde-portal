import React from 'react';
import {
  Box,
  BoxProps,
  Flex,
  Link,
  ListIcon,
  ListItem,
  SimpleGrid,
  Text,
  TextProps,
  UnorderedList,
} from 'nde-design-system';
import { FormattedResource } from 'src/utils/api/types';
import LoadingSpinner from 'src/components/loading';
import NextLink from 'next/link';
import { IconType } from 'react-icons';

interface BasedOn extends BoxProps {
  isLoading: boolean;
  isBasedOn?: FormattedResource['isBasedOn'];
  icon?: IconType;
}

interface StyledText extends TextProps {
  title?: string;
}
export const StyledText = ({ title, children, ...props }: StyledText) => {
  return (
    <Text fontSize='sm' lineHeight='short' {...props}>
      {title && (
        <Text fontSize='xs' fontWeight='semibold' color='gray.700'>
          {title}
        </Text>
      )}{' '}
      {children || '-'}
    </Text>
  );
};

const BasedOn: React.FC<BasedOn> = ({
  isLoading,
  isBasedOn,
  icon,
  ...props
}) => {
  if (isLoading) {
    return <LoadingSpinner isLoading={isLoading} />;
  }

  if (!isBasedOn || isBasedOn.length === 0) {
    return (
      <Box overflow='auto'>
        <Text>No data available.</Text>
      </Box>
    );
  }
  return (
    <Box maxH='400px' overflowY='auto' w='100%' p={4} {...props}>
      <UnorderedList ml={0}>
        <SimpleGrid
          gridTemplateColumns={{
            base: 'repeat(1, minmax(0, 1fr))',
            sm: `repeat(${
              isBasedOn.length > 5 ? 'auto-fit' : 1
            }, minmax(min(100%, max(200px, 100%/2)),1fr))`,
            lg: `repeat(${
              isBasedOn.length > 5 ? 'auto-fit' : 1
            }, minmax(min(100%, max(200px, 100%/4)),1fr))`,
          }}
        >
          {isBasedOn.map((basedOn, i) => {
            const {
              _id,
              abstract,
              additionalType,
              citation,
              datePublished,
              description,
              doi,
              identifier,
              name,
              pmid,
              url,
            } = basedOn;

            return (
              <ListItem
                key={i}
                m={
                  // responsive margin height based on number of properties present.
                  Object.keys(basedOn).length > 4 ? 4 : 1
                }
                display='flex'
                p={{ base: 0, sm: 2, md: 2 }}
                px={{ base: 0, sm: 2, md: 4 }}
                boxShadow='xs'
                borderRadius='semi'
              >
                {icon && (
                  <ListIcon as={icon} color='primary.400' m={1} ml={0} />
                )}
                {/* title (contains url if available) */}
                <Box ml={1} w='100%'>
                  {(identifier || name) && (
                    <>
                      {_id ? (
                        <NextLink
                          href={{
                            pathname: '/resources/',
                            query: { id: _id },
                          }}
                          passHref
                        >
                          <Link>
                            <StyledText>{name || identifier}</StyledText>
                          </Link>
                        </NextLink>
                      ) : (
                        <StyledText
                          fontWeight='semibold'
                          fontFamily='text.heading'
                        >
                          {url ? (
                            <Link href={url} isExternal>
                              {name || url}
                            </Link>
                          ) : (
                            <>{name || identifier} </>
                          )}
                        </StyledText>
                      )}
                    </>
                  )}

                  {(pmid || doi) && (
                    <Flex>
                      {pmid && (
                        <StyledText title='PMID:' mr={2}>
                          {pmid || '-'}
                        </StyledText>
                      )}
                      {doi && (
                        <StyledText title='DOI:' mr={2}>
                          {doi || '-'}
                        </StyledText>
                      )}
                    </Flex>
                  )}

                  {(additionalType?.name || additionalType?.url) && (
                    <StyledText title='Type:'>
                      {additionalType.url ? (
                        <Link href={url} isExternal>
                          {additionalType.name || additionalType.url}
                        </Link>
                      ) : (
                        <>{additionalType.name} </>
                      )}
                    </StyledText>
                  )}

                  {datePublished && (
                    <StyledText title='Date Published:'>
                      {datePublished || '-'}
                    </StyledText>
                  )}

                  {abstract && (
                    <StyledText title='Abstract:'>{abstract || '-'}</StyledText>
                  )}

                  {description && (
                    <StyledText title='Description:'>
                      {description || '-'}
                    </StyledText>
                  )}

                  {citation && (
                    <StyledText title='Citation:'>{citation || '-'}</StyledText>
                  )}
                  {/* if _id field is used as a title link we display the source url here. */}
                  {_id && url && (
                    <StyledText title='Source URL:' color='gray.700'>
                      <Link href={url} isExternal wordBreak='break-all'>
                        {url || '-'}
                      </Link>
                    </StyledText>
                  )}
                </Box>
              </ListItem>
            );
          })}
        </SimpleGrid>
      </UnorderedList>
    </Box>
  );
};

export default BasedOn;
