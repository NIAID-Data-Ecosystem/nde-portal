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
import { DownloadArgs, downloadAsCsv, downloadAsJson } from './helpers';

interface DownloadMetadataProps extends ButtonProps {
  exportName: string;
  loadMetadata: () => Promise<any>;
}

export const DownloadMetadata: React.FC<DownloadMetadataProps> = ({
  exportName,
  loadMetadata,
  children,
  colorScheme = 'primary',
  variant = 'solid',
  isLoading,
}) => {
  const { isOpen, onToggle, onClose } = useDisclosure();

  const options = [
    {
      name: 'JSON Format',
      fn: (
        data: DownloadArgs['dataObject'],
        exportName: DownloadArgs['downloadName'],
      ) => downloadAsJson(data, exportName),
    },
    {
      name: 'CSV Format',
      fn: (
        data: DownloadArgs['dataObject'],
        exportName: DownloadArgs['downloadName'],
      ) => downloadAsCsv(data, exportName),
    },
  ];

  const retrieveMetadata = async (callbackFn: any) => {
    await loadMetadata().then(res => {
      const { href, download } = callbackFn(res, exportName);
      return downloadMetadata({ href, download });
    });
  };

  const downloadMetadata = ({
    href,
    download,
  }: {
    href: string;
    download: string;
  }) => {
    const link = document.createElement('a');
    link.href = href;
    link.setAttribute('download', download);
    document.body.appendChild(link);
    link.click();
    link?.parentNode?.removeChild(link);
  };

  return (
    <Box position='relative'>
      <Button
        leftIcon={<FaDownload />}
        colorScheme={colorScheme}
        onClick={onToggle}
        variant={variant}
        isLoading={isLoading}
        loadingText='Downloading'
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
                    cursor='pointer'
                    _hover={{ bg: `${colorScheme}.50` }}
                    onClick={async () => {
                      onClose();
                      retrieveMetadata(option.fn);
                    }}
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
