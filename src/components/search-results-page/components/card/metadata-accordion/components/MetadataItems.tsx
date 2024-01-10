import React from 'react';
import {
  Flex,
  Icon,
  IconButton,
  Link,
  Tag,
  Text,
  FlexProps,
  BoxProps,
} from 'nde-design-system';
import Tooltip from 'src/components/tooltip';
import { FaExternalLinkSquareAlt, FaSitemap } from 'react-icons/fa';

interface MetadataWithTagProps extends BoxProps {
  url?: string | null;
  value: string;
  colorScheme?: string;
}

export const MetadataWithTag = ({
  url,
  value,
  colorScheme = 'gray',
}: MetadataWithTagProps) => {
  return (
    <Tag
      size='sm'
      variant='subtle'
      alignItems='center'
      px={1.5}
      fontSize='13px'
      colorScheme={colorScheme}
      lineHeight='shorter'
    >
      {url ? (
        <Link href={url} target='_blank' alignItems='center'>
          <Text>{value}</Text>
          <Icon
            as={FaExternalLinkSquareAlt}
            boxSize={2.5}
            ml={1}
            color='gray.800'
          />
        </Link>
      ) : (
        value
      )}
    </Tag>
  );
};

interface MetadataWithTaxonomyProps extends FlexProps {
  url?: string | null;
  value: string;
}

export const MetadataWithTaxonomy = ({
  url,
  value,
  ...props
}: MetadataWithTaxonomyProps) => {
  return url ? (
    <Flex flex={1} {...props}>
      <Text fontSize='inherit' lineHeight='inherit'>
        {value}
      </Text>
      <Tooltip label='See taxonomy information.'>
        <a href={url} target='_blank'>
          <IconButton
            aria-label='See taxonomy information.'
            variant='outline'
            colorScheme='gray'
            mx={2}
            px={1.5}
            py={1}
            icon={<Icon as={FaSitemap} fontSize='12px' />}
          />
        </a>
      </Tooltip>
    </Flex>
  ) : (
    <Text fontSize='inherit' lineHeight='inherit'>
      {value}
    </Text>
  );
};
