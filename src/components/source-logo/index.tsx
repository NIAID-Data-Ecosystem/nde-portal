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
      spacing={[2, 4]}
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
          <Link target='_blank' href={source.url}>
            <Image
              objectFit='contain'
              objectPosition='left'
              fallback={
                <Flex minHeight='40px' color='text.heading' alignItems='center'>
                  <Text
                    borderBottom='none!important'
                    color='inherit!important'
                    fontSize='xl'
                    fontWeight='bold'
                    lineHeight='shorter'
                    _hover={{
                      borderBottom: 'none!important',
                    }}
                    _visited={{ color: 'inherit!important' }}
                  >
                    {source.name}
                  </Text>
                </Flex>
              }
              w='100%'
              h='40px'
              mr={4}
              src={logo}
              alt={`Click to open the source (${source.name}) in a new tab.`}
              {...imageProps}
            />
          </Link>
        ) : (
          <Image
            objectFit='contain'
            objectPosition='left'
            w='100%'
            h='40px'
            mr={4}
            src={logo}
            alt={`Logo for ${source.name}`}
            {...imageProps}
          />
        )
      ) : (
        <></>
      )}
      <Flex>
        {url ? (
          <Link href={url} isExternal lineHeight='shorter'>
            <Text fontSize='12px' lineHeight='short'>
              {type === 'ResourceCatalog'
                ? `Provided by ${source.name}`
                : `Indexed in ${source.name}`}
            </Text>
          </Link>
        ) : (
          <Text fontSize='12px' lineHeight='short'>
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
