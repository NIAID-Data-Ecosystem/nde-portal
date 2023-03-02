import React from 'react';
import {
  Box,
  Button,
  Flex,
  Heading,
  Icon,
  Image,
  LinkProps,
  Stack,
} from 'nde-design-system';
import { ImageProps } from '@chakra-ui/image';
import { assetPrefix } from 'next.config';
import { FaArrowRight } from 'react-icons/fa';

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
  colorScheme = 'secondary',
  ...props
}) => {
  const SourceImage = (props: any) => (
    <Image
      // h='50px'
      maxH='50px'
      src={`${assetPrefix || ''}${src}`}
      alt={alt}
      {...imageProps}
      {...props}
    />
  );
  return (
    <>
      <Stack
        w='100%'
        alignItems={['center', 'flex-start']}
        justifyContent='space-between'
        flexWrap='wrap'
        flexDirection={{ base: 'column', sm: 'row', lg: 'column' }}
      >
        {/* Link to repository if url exists */}
        {src &&
          (sourceHref ? (
            <Button
              href={sourceHref}
              target='_blank'
              px={4}
              py={4}
              variant='none'
            >
              <SourceImage />
            </Button>
          ) : (
            <Box p={2}>
              <SourceImage />
            </Box>
          ))}

        <Flex minW={{ base: 'unset', sm: '260px' }} justifyContent='center'>
          {href && (
            <Button
              px={[0]}
              py={[0]}
              alignItems='center'
              p={1}
              colorScheme={colorScheme}
              href={href}
              target='_blank'
              transition='0.2s linear'
              sx={{
                color: '#fff',
                '#button-arrow': {
                  px: 4,
                  transition: '0.2s ease-in-out',
                },
              }}
              _hover={{
                color: 'whiteAlpha.900',
                bg: 'secondary.600',
                '#button-arrow': {
                  px: 8,
                  transition: '0.2s ease-in-out',
                },
              }}
            >
              {' '}
              <Heading
                px={8}
                py={[2, 0]}
                color='inherit'
                fontSize='md'
                fontWeight='semibold'
                letterSpacing='wide'
              >
                {name}
              </Heading>
              <Box
                id='button-arrow'
                bg='whiteAlpha.600'
                borderRadius='semi'
                px={2}
                py={2}
                display={{ base: 'none', sm: 'block' }}
              >
                <Icon as={FaArrowRight}></Icon>
              </Box>
            </Button>
          )}
        </Flex>
      </Stack>
    </>
  );
};
