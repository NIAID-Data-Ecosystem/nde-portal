import { Box, Flex, Icon, Image, Text } from '@chakra-ui/react';
import { MetadataItem } from '../helpers';
import { MetadataWithTag } from './tag';
import { MetadataButtonGroup, OntologyButton, SearchButton } from './buttons';
import { FaSquareArrowUpRight } from 'react-icons/fa6';
import { Link } from 'src/components/link';

interface MetadataContentProps extends Omit<MetadataItem, 'key'> {
  includeSearch?: boolean;
  includeOntology?: boolean;
  colorScheme?: string;
}
export const MetadataContent = ({
  name,
  colorScheme,
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
              <Link href={url} target='_blank' alignItems='center'>
                <Text wordBreak='break-word' w='100%'>
                  {name}
                </Text>
                <Icon
                  as={FaSquareArrowUpRight}
                  boxSize={2.5}
                  ml={1}
                  color='gray.800'
                />
              </Link>
            ) : (
              <Text fontWeight='normal' wordBreak='break-word' w='100%'>
                {name}
              </Text>
            ))}
        </Flex>
        {tags &&
          tags.map((tag, idx) => (
            <MetadataWithTag key={idx} colorScheme={colorScheme} {...tag} />
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
