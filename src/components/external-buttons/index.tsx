import React from 'react';
import {
  Box,
  Button,
  Flex,
  Image,
  ImageProps,
  LinkProps,
  usePrefersReducedMotion,
} from 'nde-design-system';
import { FaArrowRight } from 'react-icons/fa';
import NextLink from 'next/link';

interface ExternalButtonProps extends LinkProps {
  src?: string | null;
  alt: string;
  imageProps?: ImageProps;
  name?: string;
  sourceHref?: string | null;
}
export const ExternalSourceButton: React.FC<ExternalButtonProps> = ({
  href,
  src,
  alt,
  imageProps,
  name,
  sourceHref,
  colorScheme = 'secondary',
}) => {
  const prefersReducedMotion = usePrefersReducedMotion();

  const SourceImage = (props: any) => (
    <Image
      width='auto'
      height='40px'
      maxH='40px'
      src={`${src}`}
      alt={alt}
      {...imageProps}
      {...props}
    />
  );
  return (
    <Box p={4}>
      {/* Link to repository if url exists */}
      {src &&
        (sourceHref ? (
          <NextLink href={sourceHref} target='_blank'>
            <SourceImage />
          </NextLink>
        ) : (
          <Box>
            <SourceImage />
          </Box>
        ))}
      {href ? (
        <Flex
          mt={2}
          sx={{
            svg: {
              transform: 'translateX(-2px)',
              transition: 'transform 0.2s ease-in-out',
            },
          }}
          _hover={{
            svg: prefersReducedMotion
              ? {}
              : {
                  transform: 'translateX(4px)',
                  transition: 'transform 0.2s ease-in-out',
                },
          }}
        >
          <NextLink href={href} target='_blank'>
            <Button
              colorScheme={colorScheme}
              size='md'
              rightIcon={<FaArrowRight />}
              mt={2}
            >
              {name || 'Access Data'}
            </Button>
          </NextLink>
        </Flex>
      ) : (
        <></>
      )}
    </Box>
  );
};
