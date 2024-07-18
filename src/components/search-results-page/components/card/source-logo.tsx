import {
  Box,
  BoxProps,
  Flex,
  Image,
  ImageProps,
  Stack,
  Text,
} from '@chakra-ui/react';
import { Link } from 'src/components/link';
import { FormattedResource } from 'src/utils/api/types';
import { getRepositoryImage } from 'src/utils/helpers';

interface SourceLogoProps extends BoxProps {
  imageProps?: ImageProps;
  sources: {
    logo: string | null;
    '@type'?: string | null | undefined;
    name: string;
    url?: string | null | undefined;
    versionDate?: string | null | undefined;
  }[];
  url?: FormattedResource['url'];
}

export const getSourceDetails = (
  sources: FormattedResource['includedInDataCatalog'],
) => {
  const sources2Array = sources
    ? Array.isArray(sources)
      ? sources
      : [sources]
    : [];
  return sources2Array.map(source => ({
    ...source,
    logo: getRepositoryImage(source.name),
  }));
};

export const SourceLogo = ({
  imageProps,
  sources,
  url,
  ...props
}: SourceLogoProps) => {
  return (
    sources &&
    sources.length > 0 && (
      <Stack
        alignItems='flex-start'
        flexDirection='row'
        flexWrap='wrap'
        my={0}
        spacing={[2, 4]}
        py={[2, 0]}
        {...props}
      >
        {sources.map(source => {
          const source_logo = getRepositoryImage(source.name);

          return (
            <Box key={source.name} maxW={{ base: '200px', sm: '250px' }}>
              {source_logo ? (
                source.url ? (
                  <Link target='_blank' href={source.url}>
                    <Image
                      objectFit='contain'
                      objectPosition='left'
                      fallbackSrc='/assets/resources/empty-source.png'
                      w='100%'
                      h='40px'
                      mr={4}
                      src={source_logo}
                      alt={`Logo for ${source.name}`}
                      {...imageProps}
                    />
                  </Link>
                ) : (
                  <Image
                    objectFit='contain'
                    objectPosition='left'
                    w='100%'
                    h='40px'
                    mr={4}
                    src={source_logo}
                    alt={`Logo for ${source.name}`}
                    {...imageProps}
                  />
                )
              ) : (
                <></>
              )}
              <Flex>
                {url ? (
                  <Link
                    href={url! || source.url!}
                    isExternal
                    lineHeight='shorter'
                  >
                    <Text fontSize='12px' lineHeight='short'>
                      Provided by {source.name}
                    </Text>
                  </Link>
                ) : (
                  <Text fontSize='12px' lineHeight='short'>
                    Provided by {source.name}
                  </Text>
                )}
              </Flex>
            </Box>
          );
        })}

        {/* {sdPublisher && (
              <Box>
                <Text
                  fontSize='xs'
                  fontWeight='medium'
                  lineHeight='short'
                >
                  Original Source
                  <br />
                  <Text
                    as='span'
                    fontSize='xs'
                    fontStyle='italic'
                    lineHeight='short'
                  >
                    {sdPublisher?.map((publisher, i) => {
                      return publisher?.url ? (
                        <Link key={i} href={publisher.url} isExternal>
                          {publisher.name}
                        </Link>
                      ) : (
                        publisher.name || publisher.identifier
                      );
                    })}
                  </Text>
                </Text>
              </Box>
            )} */}
      </Stack>
    )
  );
};
