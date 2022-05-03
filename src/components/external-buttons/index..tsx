import React from 'react';
import {Button, LinkProps, Image, Link, Text} from 'nde-design-system';
import {ImageProps} from '@chakra-ui/image';
import {assetPrefix} from 'next.config';

interface ExternalButtonProps extends LinkProps {
  imageURL?: string | null;
  alt: string;
  imageProps?: ImageProps;
  ariaLabel?: string;
  name?: string;
}
export const ExternalSourceButton: React.FC<ExternalButtonProps> = ({
  name,
  href,
  imageURL,
  alt,
  ariaLabel,
  imageProps,
  ...props
}) => {
  return (
    <>
      {imageURL && (
        <Image
          h='40px'
          mr={2}
          mb={[2, 2, 0]}
          src={`${assetPrefix}${imageURL}`}
          alt={alt}
          {...imageProps}
        ></Image>
      )}
      {!href && (
        <Text color='gray.800' fontWeight='semibold' w='100%'>
          {name || undefined}
        </Text>
      )}
      {href && (
        <Link isExternal href={href} flex={1} whiteSpace='normal' {...props}>
          {name}
        </Link>
      )}
    </>
  );
};
