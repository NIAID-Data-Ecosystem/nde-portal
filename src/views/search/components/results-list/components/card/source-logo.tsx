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
import { useState } from 'react';
import { Link, LinkProps } from 'src/components/link';
import { FormattedResource, IncludedInDataCatalog } from 'src/utils/api/types';
import { getRepositoryImage } from 'src/utils/helpers';

export const getSourceDetails = (
  sources: FormattedResource['includedInDataCatalog'],
) => {
  const sourcesArray = Array.isArray(sources)
    ? sources
    : sources
    ? [sources]
    : [];

  return sourcesArray.map(source => ({
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
      gap={[2, 4]}
      py={[2, 0]}
      {...props}
    >
      {children}
    </Stack>
  );
};

interface WithLinkProps extends Omit<LinkProps, 'href'> {
  href?: string | null;
}

export const WithLink = ({
  children,
  href,
  isExternal,
  ...props
}: WithLinkProps) => {
  if (!href) return <>{children}</>;

  return (
    <Link
      variant='noline'
      href={href}
      target={isExternal ? '_blank' : '_self'}
      {...props}
    >
      {children}
    </Link>
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
  const logoImageSrc = getRepositoryImage(source.name);
  const [hasError, setHasError] = useState(false);
  const showImage = logoImageSrc && !hasError;

  const sourceText =
    type === 'ResourceCatalog'
      ? `Provided by ${source.name}`
      : `Indexed in ${source.name}`;

  return (
    <Box maxW={{ base: '200px', sm: '350px' }} {...props}>
      <WithLink href={source.url || ''} isExternal>
        {showImage ? (
          <Image
            objectFit='contain'
            objectPosition='left'
            onError={() => setHasError(true)}
            w='100%'
            h='40px'
            mr={4}
            src={logoImageSrc}
            alt={`Click to open the source (${source.name}) in a new tab.`}
            {...imageProps}
          />
        ) : (
          <>
            {/* Fallback content */}
            <Flex minHeight='40px' alignItems='center'>
              <Text
                color='text.heading'
                fontSize='xl'
                fontWeight='bold'
                lineHeight='shorter'
              >
                {source.name}
              </Text>
            </Flex>
          </>
        )}
      </WithLink>
      {url ? (
        <Link href={url} isExternal fontSize='12px' lineHeight='short'>
          {sourceText}
        </Link>
      ) : (
        <Text fontSize='12px' lineHeight='short'>
          {sourceText}
        </Text>
      )}
    </Box>
  );
};
