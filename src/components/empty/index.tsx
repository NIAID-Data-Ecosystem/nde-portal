import React from 'react';
import { Flex, FlexProps, Heading, Image } from 'nde-design-system';
import { assetPrefix } from 'next.config';

interface EmptyProps extends FlexProps {
  imageUrl?: string;
  imageAlt?: string;
  message?: string;
}

// Empty state display component.
const Empty: React.FC<EmptyProps> = ({
  children,
  imageAlt,
  imageUrl,
  message,
  ...rest
}) => {
  return (
    <Flex
      w='100%'
      h='100%'
      alignItems='center'
      justifyContent='center'
      {...rest}
    >
      <Flex direction='column' alignItems='center'>
        {imageUrl && (
          <Image
            boxSize='100px'
            objectFit='contain'
            src={`${imageUrl}`}
            alt={imageAlt}
          />
        )}
        <Heading as={'h2'} fontFamily='body' mt={4}>
          {message}
        </Heading>
        {children}
      </Flex>
    </Flex>
  );
};

export default Empty;
