import {
  Box,
  BoxProps,
  Flex,
  Image,
  ImageProps,
  Stack,
  StackProps,
  Text,
} from '@chakra-ui/react';
import { Link } from 'src/components/link';
import { FormattedResource, IncludedInDataCatalog } from 'src/utils/api/types';
import { getRepositoryImage } from 'src/utils/helpers';

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

// Wrapper container for the source logos.
interface SourceLogoWrapperProps extends StackProps {}
export const SourceLogoWrapper = ({
  children,
  ...props
}: SourceLogoWrapperProps) => {
  return (
    <Stack
      alignItems='flex-start'
      flexDirection='row'
      flexWrap='wrap'
      my={0}
      spacing={[2, 4]}
      py={[2, 0]}
      {...props}
    >
      {children}
    </Stack>
  );
};

type SourceWithLogo = IncludedInDataCatalog & {
  logo?: string | null;
};

interface SourceLogoProps extends BoxProps {
  imageProps?: ImageProps;
  source: SourceWithLogo;
  type?: FormattedResource['@type'];
  url?: string | null;
}

// Individual source logo component.
export const SourceLogo = ({
  imageProps,
  source,
  type,
  url,
  ...props
}: SourceLogoProps) => {
  const logo = getRepositoryImage(source.name);

  return (
    <Box key={source.name} maxW={{ base: '200px', sm: '250px' }} {...props}>
      {logo ? (
        source.url ? (
          <Link target='_blank' href={source.url}>
            <Image
              objectFit='contain'
              objectPosition='left'
              fallbackSrc='/assets/resources/empty-source.png'
              w='100%'
              h='40px'
              mr={4}
              src={logo}
              alt={`Click to open the source (${source.name}) in a new tab.`}
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
            src={logo}
            alt={`Logo for ${source.name}`}
            {...imageProps}
          />
        )
      ) : (
        <></>
      )}
      <Flex>
        {url ? (
          <Link href={url} isExternal lineHeight='shorter'>
            <Text fontSize='12px' lineHeight='short'>
              {type === 'ResourceCatalog'
                ? `Provided by ${source.name}`
                : `Indexed in ${source.name}`}
            </Text>
          </Link>
        ) : (
          <Text fontSize='12px' lineHeight='short'>
            {type === 'ResourceCatalog'
              ? `Provided by ${source.name}`
              : `Indexed in ${source.name}`}
          </Text>
        )}
      </Flex>
    </Box>
  );
};
