import React from 'react';
import {
  Box,
  Flex,
  Icon,
  IconButton,
  Text,
  TooltipProps,
} from 'nde-design-system';
import { MetadataIcon } from 'src/components/icon';
import { getMetadataTheme } from 'src/components/icon/helpers';
import Tooltip from 'src/components/tooltip';
import { FaInfo } from 'react-icons/fa';

interface MetadataBlockProps {
  id: string;
  label: string;
  property: string;
  isDisabled: boolean;
  children?: React.ReactNode;
  bg?: string;
  colorScheme?: string;
  tooltipLabel?: TooltipProps['label'];
}

// Themed block for metadata
export const MetadataBlock = ({
  isDisabled,
  id,
  label,
  property,
  children,
  bg,
  colorScheme,
  tooltipLabel,
}: MetadataBlockProps) => {
  return (
    <Box
      flexDirection='column'
      color={`${isDisabled ? 'niaid.placeholder' : 'text.body'}`}
    >
      <Flex alignItems='center'>
        <Flex alignItems='center' px={1} mb={0.5} flex={1}>
          <MetadataIcon
            id={id}
            title={property}
            glyph={property}
            fill={
              isDisabled
                ? 'gray.500'
                : bg || `${getMetadataTheme(property) || colorScheme}.500`
            }
            isDisabled={isDisabled}
            boxSize={4}
            mr={1}
          />
          <Text
            mx={1}
            fontSize='13px'
            fontWeight='medium'
            letterSpacing='wide'
            textTransform='uppercase'
            color='inherit'
            whiteSpace={['unset', 'nowrap']}
          >
            {label}
          </Text>
        </Flex>

        {tooltipLabel && (
          <Tooltip label={tooltipLabel}>
            <Flex
              minW={4}
              minH={4}
              ml={2}
              p={1}
              _hover={{
                div: {
                  bg: 'gray.800',
                  borderColor: 'gray.800',
                  color: 'white',
                },
              }}
            >
              <IconButton
                as='div'
                cursor='pointer'
                aria-label={`Tooltip for ${property}.`}
                isRound
                icon={<Icon as={FaInfo} boxSize='0.75rem' p={0.5} />}
                variant='outline'
                colorScheme='gray'
                borderColor={isDisabled ? 'gray.500' : 'gray.600'}
                color={isDisabled ? 'gray.500' : 'gray.600'}
              />
            </Flex>
          </Tooltip>
        )}
      </Flex>

      <Box
        mb={2}
        py={0.5}
        bg={isDisabled ? 'gray.500' : bg || `${getMetadataTheme(property)}.300`}
        borderRadius='semi'
      />

      <Box px={0.5} fontSize='xs' mx={1} lineHeight='short'>
        {isDisabled ? <></> : children}
      </Box>
    </Box>
  );
};
