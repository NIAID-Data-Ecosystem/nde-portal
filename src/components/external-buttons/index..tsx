import React from 'react';
import { LinkProps, Image, Link, Text } from 'nde-design-system';
import { ImageProps } from '@chakra-ui/image';
import { assetPrefix } from 'next.config';

interface ExternalButtonProps extends LinkProps {
  src?: string | null;
  alt: string;
  imageProps?: ImageProps;
  ariaLabel?: string;
  name?: string;
  sourceHref?: string | null;
}
export const ExternalSourceButton: React.FC<ExternalButtonProps> = ({
  name,
  href,
  src,
  alt,
  ariaLabel,
  imageProps,
  sourceHref,
  ...props
}) => {
  const SourceImage = () => (
    <Image
      h='40px'
      mr={2}
      mb={[2, 2, 0]}
      src={`${assetPrefix}${src}`}
      alt={alt}
      {...imageProps}
    />
  );
  return (
    <>
      {/* Link to repository if url exists */}
      {src &&
        (sourceHref ? (
          <Link href={sourceHref} target='_blank'>
            <SourceImage />
          </Link>
        ) : (
          <SourceImage />
        ))}
      {!href && (
        <Text color='gray.800' fontWeight='semibold' w='100%'>
          {name || undefined}
        </Text>
      )}
      {/* resource specific url in source repository. */}
      {href && (
        <Link isExternal href={href} flex={1} whiteSpace='normal' {...props}>
          {name}
        </Link>
      )}
    </>
  );
};
