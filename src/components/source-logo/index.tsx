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
import { useEffect, useState } from 'react';
import { Link } from 'src/components/link';
import { FormattedResource, IncludedInDataCatalog } from 'src/utils/api/types';

import { getSourceImagePath } from './helpers';

// Wrapper container for the source logos.
interface SourceLogoWrapperProps extends StackProps {}

const Wrapper = ({ children, ...props }: SourceLogoWrapperProps) => {
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

type SourceWithLogo = IncludedInDataCatalog & {
  logo?: string | null;
};

// Shown in place of the logo when no image file exists for the source.
const Fallback = ({ name }: { name: SourceWithLogo['name'] }) => (
  <Flex minHeight='40px' alignItems='center'>
    <Text
      fontSize='xl'
      lineHeight='shorter'
      color='text.heading'
      fontWeight='bold'
    >
      {name}
    </Text>
  </Flex>
);

interface SourceLogoImageProps extends ImageProps {
  fallback: React.ReactNode;
}

// Chakra v3 dropped Image's `fallback` prop, so track the load error ourselves
// and swap in the fallback content when the source has no matching image file.
const ImageWithFallback = ({
  fallback,
  onError,
  src,
  alt,
  ...props
}: SourceLogoImageProps) => {
  const [hasError, setHasError] = useState(false);

  // Give a new src a fresh attempt at loading.
  useEffect(() => setHasError(false), [src]);

  if (!src || hasError) {
    return <>{fallback}</>;
  }

  return (
    <Image
      src={src}
      alt={alt}
      {...props}
      onError={event => {
        setHasError(true);
        onError?.(event);
      }}
    />
  );
};

interface SourceLogoProps extends BoxProps {
  imageProps?: ImageProps;
  source: SourceWithLogo;
  type?: FormattedResource['@type'];
  url?: string | null;
}

// Individual source logo component.
const Component = ({
  imageProps,
  source,
  type,
  url,
  ...props
}: SourceLogoProps) => {
  const logo = getSourceImagePath(source.name);

  return (
    <Box key={source.name} maxW={{ base: '200px', sm: '250px' }} {...props}>
      {logo ? (
        source.url ? (
          <Link target='_blank' href={source.url} variant='unstyled'>
            <ImageWithFallback
              objectFit='contain'
              objectPosition='left'
              w='100%'
              h='40px'
              mr={4}
              src={logo}
              alt={`Click to open the source (${source.name}) in a new tab.`}
              fallback={<Fallback name={source.name} />}
              {...imageProps}
            />
          </Link>
        ) : (
          <ImageWithFallback
            objectFit='contain'
            objectPosition='left'
            w='100%'
            h='40px'
            mr={4}
            src={logo}
            alt={`Logo for ${source.name}`}
            fallback={<Fallback name={source.name} />}
            {...imageProps}
          />
        )
      ) : (
        <></>
      )}
      <Flex bg='#fff'>
        {url ? (
          <Link href={url} isExternal lineHeight='shorter'>
            <Text fontSize='12px' lineHeight='moderate'>
              {type === 'ResourceCatalog'
                ? `Provided by ${source.name}`
                : `Indexed in ${source.name}`}
            </Text>
          </Link>
        ) : (
          <Text fontSize='12px' lineHeight='moderate'>
            {type === 'ResourceCatalog'
              ? `Provided by ${source.name}`
              : `Indexed in ${source.name}`}
          </Text>
        )}
      </Flex>
    </Box>
  );
};

export const SourceLogo = { Wrapper, Component };
