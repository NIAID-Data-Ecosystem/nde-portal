import {
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

const LOGO_HEIGHT = ['20px', '20px', '30px'];

// Wrapper container for the source logos.
type SourceLogoWrapperProps = StackProps;

const Wrapper = (props: SourceLogoWrapperProps) => (
  <Stack
    flexDirection='row'
    justifyContent={['space-between', 'flex-start']}
    flexWrap='wrap'
    gap={[2, 4]}
    {...props}
  />
);

type SourceWithLogo = IncludedInDataCatalog;
// Shown in place of the logo when no image file exists for the source.
const Fallback = ({ name }: { name: SourceWithLogo['name'] }) => (
  <Flex minHeight={LOGO_HEIGHT} alignItems='center'>
    <Text
      fontSize={['md', 'md', 'xl']}
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

interface SourceLogoProps extends StackProps {
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
  const label = `${type === 'ResourceCatalog' ? 'Provided by' : 'Indexed in'} ${
    source.name
  }`;

  const logoImage = logo ? (
    <ImageWithFallback
      objectFit='contain'
      objectPosition='left'
      w='100%'
      h={LOGO_HEIGHT}
      src={logo}
      alt={
        source.url
          ? `Click to open the source (${source.name}) in a new tab.`
          : `Logo for ${source.name}`
      }
      fallback={<Fallback name={source.name} />}
      {...imageProps}
    />
  ) : null;

  return (
    <Stack minWidth='150px' maxW={['200px', '250px']} gap={1} {...props}>
      {logoImage && source.url ? (
        <Link target='_blank' href={source.url} variant='unstyled'>
          {logoImage}
        </Link>
      ) : (
        logoImage
      )}

      {url ? (
        <Link href={url} isExternal lineHeight='moderate' fontSize='xs'>
          {label}
        </Link>
      ) : (
        <Text fontSize='xs' lineHeight='moderate'>
          {label}
        </Text>
      )}
    </Stack>
  );
};

export const SourceLogo = { Wrapper, Component };
