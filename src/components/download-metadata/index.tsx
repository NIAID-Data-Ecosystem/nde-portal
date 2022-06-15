import {
  Box,
  Button,
  ButtonProps,
  Collapse,
  ListItem,
  Text,
  UnorderedList,
  useDisclosure,
} from 'nde-design-system';
import React from 'react';
import { FaDownload } from 'react-icons/fa';
import { downloadAsCsv, downloadAsJson } from './helpers';

interface DownloadMetadataProps extends ButtonProps {
  metadata: { [key: string]: any };
  exportName: string;
}

export const DownloadMetadata: React.FC<DownloadMetadataProps> = ({
  exportName,
  metadata,
  children,
  colorScheme = 'primary',
  variant = 'solid',
  isLoading,
}) => {
  const { isOpen, onToggle, onClose } = useDisclosure();
  const options = [
    {
      name: 'JSON Format',
      props: downloadAsJson(metadata, exportName), // add id
    },
    {
      name: 'CSV Format',
      props: downloadAsCsv(metadata, exportName), // add id
    },
  ];
  return (
    <Box position='relative'>
      <Button
        leftIcon={<FaDownload />}
        colorScheme={colorScheme}
        onClick={onToggle}
        variant={variant}
        isLoading={isLoading}
      >
        {children}
      </Button>
      <Box
        zIndex={1000}
        position='absolute'
        w='100%'
        boxShadow='base'
        borderRadius='semi'
        bg='white'
      >
        <Collapse in={isOpen} animateOpacity>
          <UnorderedList ml={0}>
            {options.map((option, i) => {
              return (
                <ListItem
                  key={i}
                  borderBottom={i < options.length - 1 ? '1px solid' : 'none'}
                  borderColor='page.alt'
                >
                  <Box
                    as='a'
                    w='100%'
                    d='block'
                    px={4}
                    py={2}
                    _hover={{ bg: `${colorScheme}.50` }}
                    onClick={onClose}
                    {...option.props}
                  >
                    <Text fontWeight='semibold'>{option.name}</Text>
                  </Box>
                </ListItem>
              );
            })}
          </UnorderedList>
        </Collapse>
      </Box>
    </Box>
  );
};
