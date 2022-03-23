import React from 'react';
import {Button, ButtonProps, Flex, Image} from 'nde-design-system';
import {ImageProps} from '@chakra-ui/image';

interface ExternalButtonProps extends ButtonProps {
  imageURL?: string | null;
  alt: string;
  imageProps?: ImageProps;
}
export const ExternalSourceButton: React.FC<ExternalButtonProps> = ({
  name,
  href,
  imageURL,
  alt,
  imageProps,
  ...props
}) => {
  return (
    <>
      {imageURL && (
        <Image
          h={'40px'}
          mr={2}
          src={imageURL}
          alt={alt}
          {...imageProps}
        ></Image>
      )}
      {href && (
        <Button
          isExternal
          href={href}
          variant={'outline'}
          colorScheme={'primary'}
          my={1}
          flex={1}
          whiteSpace='normal'
          size='md'
          {...props}
        >
          {name}
        </Button>
      )}
    </>
  );
};
