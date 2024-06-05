import React from 'react';
import { Flex, FlexProps, Icon, IconButton, Text } from '@chakra-ui/react';
import { FaSitemap } from 'react-icons/fa6';
import Tooltip from 'src/components/tooltip';

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
