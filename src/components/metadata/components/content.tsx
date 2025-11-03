import { Box, Flex, Icon, Image, Text } from '@chakra-ui/react';
import { FaSquareArrowUpRight } from 'react-icons/fa6';
import { Link } from 'src/components/link';

import { MetadataItem } from '../helpers';
import { MetadataButtonGroup, OntologyButton, SearchButton } from './buttons';
import { MetadataWithTag } from './tag';

interface MetadataContentProps extends Omit<MetadataItem, 'key'> {
  includeSearch?: boolean;
  includeOntology?: boolean;
  colorPalette?: string;
}
export const MetadataContent = ({
  name,
  colorPalette,
  img,
  scientificName,
  tags,
  url,
  includeSearch,
  includeOntology,
  ontologyProps,
  searchProps,
}: MetadataContentProps) => {
  return (
    <Flex
      flex={1}
      alignItems='flex-start'
      justifyContent='space-between'
      flexWrap='wrap'
      w='100%'
    >
      <Box flex={1} fontSize='xs' lineHeight='short' minW='130px' mx={0.5}>
        {scientificName && <Text fontWeight='semibold'>{scientificName}</Text>}
        <Flex>
          {img && (
            <Image
              my={1}
              mr={2}
              width='auto'
              height={5}
              src={img.src}
              alt={img.alt}
            />
          )}
          {name &&
            (url ? (
              <Link
                href={url}
                target='_blank'
                alignItems='center'
                isExternal
                flex={1}
              >
                {name}
              </Link>
            ) : (
              <Text fontWeight='normal' wordBreak='break-word' w='100%'>
                {name}
              </Text>
            ))}
        </Flex>
        {tags &&
          tags.map((tag, idx) => (
            <MetadataWithTag key={idx} colorPalette={colorPalette} {...tag} />
          ))}
      </Box>
      {((includeSearch && searchProps) ||
        (includeOntology && ontologyProps)) && (
        <MetadataButtonGroup>
          {includeSearch && searchProps && <SearchButton {...searchProps} />}
          {includeOntology && ontologyProps && (
            <OntologyButton {...ontologyProps} />
          )}
        </MetadataButtonGroup>
      )}
    </Flex>
  );
};
