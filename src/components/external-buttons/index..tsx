import React from 'react';
import {Button, ButtonProps, Image} from 'nde-design-system';
import {ImageProps} from '@chakra-ui/image';

interface ExternalButtonProps extends ButtonProps {
  imageURL?: string | null;
  alt: string;
  imageProps?: ImageProps;
  ariaLabel?: string;
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
        <Image h='40px' mr={2} src={imageURL} alt={alt} {...imageProps}></Image>
      )}
      {href && (
        <Button
          isExternal
          href={href}
          variant='outline'
          colorScheme='primary'
          my={1}
          flex={1}
          whiteSpace='normal'
          size='md'
          aria-label={ariaLabel}
          {...props}
        >
          {name}
        </Button>
      )}
    </>
  );
};
