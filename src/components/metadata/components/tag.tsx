import React from 'react';
import { Icon, Tag, Text, BoxProps, TagLabel } from '@chakra-ui/react';
import { FaExternalLinkSquareAlt } from 'react-icons/fa';
import Tooltip from 'src/components/tooltip';
import { Link } from 'src/components/link';

interface MetadataWithTagProps extends BoxProps {
  label?: string;
  value: string;
  url?: string | null;
  colorScheme?: string;
  tooltipLabel?: string;
}

export const MetadataWithTag = ({
  label,
  url,
  value,
  colorScheme = 'gray',
  tooltipLabel,
}: MetadataWithTagProps) => {
  return (
    <Tooltip label={tooltipLabel} fontSize='12px'>
      <Tag
        size='sm'
        variant='subtle'
        alignItems='center'
        fontSize='13px'
        colorScheme={colorScheme}
        lineHeight='shorter'
      >
        <TagLabel>
          <Text as='span' fontWeight='semibold' mr={2}>
            {label} |
          </Text>
          {url ? (
            <Link
              href={url}
              target='_blank'
              alignItems='center'
              borderBottom='none'
              sx={{
                color: 'inherit',
                '#tag-value': { textDecoration: 'underline' },
              }}
              _visited={{ color: 'inherit' }}
              _hover={{
                color: 'inherit',
                '#tag-value': { textDecoration: 'none' },
              }}
            >
              <Text id='tag-value'>{value}</Text>
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
        </TagLabel>
      </Tag>
    </Tooltip>
  );
};
