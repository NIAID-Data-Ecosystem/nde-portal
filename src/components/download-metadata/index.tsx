import {
  Box,
  Button,
  ButtonProps,
  Collapse,
  Flex,
  Icon,
  ListItem,
  Text,
  UnorderedList,
  useDisclosure,
} from 'nde-design-system';
import React, { useEffect, useState } from 'react';
import { FaDownload, FaExclamationCircle } from 'react-icons/fa';
import { useQuery } from 'react-query';
import { fetchAllSearchResults } from 'src/utils/api';
import { DownloadArgs, downloadAsCsv, downloadAsJson } from './helpers';

/*
 [COMPONENT INFO]: Download data button that gives JSON or CSV download options.
*/

interface DownloadMetadataProps extends ButtonProps {
  exportName: string;
  params: any;
}

export const DownloadMetadata: React.FC<DownloadMetadataProps> = ({
  params,
  exportName,
  children,
  colorScheme = 'primary',
  variant = 'solid',
}) => {
  const [downloadFormat, setDownloadFormat] = useState<any | null>(null);

  // Toggle open/close a download format list.
  const { isOpen, onToggle, onClose } = useDisclosure();

  // Options for download format and corresponding formatting functions.
  const options = [
    {
      name: 'JSON Format',
      format: 'json',
      fn: (
        data: DownloadArgs['dataObject'],
        exportName: DownloadArgs['downloadName'],
      ) => downloadAsJson(data, exportName),
    },
    {
      name: 'CSV Format',
      format: 'csv',
      fn: (
        data: DownloadArgs['dataObject'],
        exportName: DownloadArgs['downloadName'],
      ) => downloadAsCsv(data, exportName),
    },
  ];

  // Get all data for download
  const { error, refetch, isFetching } = useQuery<any | undefined, Error>(
    [
      'all-search-results',
      {
        ...params,
      },
    ],
    () => {
      return fetchAllSearchResults({
        ...params,
        // creates a column for each nested field for csv.
        dotfield: downloadFormat.format === 'csv',
      });
    },
    // Don't refresh everytime window is touched.
    { refetchOnWindowFocus: false, enabled: false },
  );

  useEffect(() => {
    // Prepare data from download based on format.
    const retrieveMetadata = async () => {
      if (!downloadFormat || !downloadFormat?.fn) {
        return null;
      }
      await refetch()
        .then(response => response.data?.results)
        .then(res => {
          const { href, download } = downloadFormat.fn(res, exportName);
          return downloadMetadata({ href, download });
        });
    };

    // Create anchor tag and simulate click to download data.
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
      // Remove anchor tag once download is initiated and reset download format.
      link?.parentNode?.removeChild(link);
      setDownloadFormat(null);
    };

    retrieveMetadata();
    return () => {};
  }, [downloadFormat, exportName, refetch]);

  return (
    <Flex alignItems='flex-end' pb={4} flexDirection='column'>
      <Collapse in={isFetching}>
        <Text fontSize='xs' fontStyle='italic'>
          Note: Large sets of metadata may take along time to download.
        </Text>
      </Collapse>
      <Collapse in={!!error}>
        <Text fontSize='xs' fontStyle='italic' color='status.error'>
          <Icon as={FaExclamationCircle} color='status.error' mr={1}></Icon>
          Something went wrong with the metadata download. Please try again.
        </Text>
      </Collapse>
      <Box position='relative'>
        {/* Simple button with */}
        <Button
          leftIcon={<FaDownload />}
          colorScheme={colorScheme}
          onClick={onToggle}
          variant={variant}
          isLoading={isFetching}
          loadingText='Downloading'
        >
          {children}
        </Button>

        {/* Pop out list of download format options. */}
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
                        setDownloadFormat(option);
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
    </Flex>
  );
};
