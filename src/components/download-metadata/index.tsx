import {
  Box,
  Button,
  ButtonProps,
  Flex,
  FlexProps,
  HStack,
  Icon,
  List,
  Progress,
  Text,
  useDisclosure,
} from '@chakra-ui/react';
import { sendGTMEvent } from '@next/third-parties/google';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/router';
import React, { useCallback, useEffect, useState } from 'react';
import { FaCircleExclamation, FaDownload } from 'react-icons/fa6';
import { FaXmark } from 'react-icons/fa6';
import { fetchAllSearchResults, Params } from 'src/utils/api';

import { Disclaimer } from './components/Disclaimer';
import { DownloadArgs, downloadAsCsv, downloadAsJson } from './helpers';

/*
 [COMPONENT INFO]: Download data button that gives JSON or CSV download options.
*/

interface DownloadMetadataProps extends FlexProps {
  exportFileName: string;
  params: Params;
  buttonProps?: ButtonProps;
}

const trackDownloadEvent = (params: {
  label: string;
  event: string;
  value: string;
}) => sendGTMEvent(params);

export const DownloadMetadata: React.FC<DownloadMetadataProps> = ({
  params,
  exportFileName,
  children,
  buttonProps,
  ...props
}) => {
  // Toggle open/close a download format list.
  const { open, onToggle, onClose } = useDisclosure();
  const router = useRouter();

  // Options for download format and corresponding formatting functions.
  const [downloadFormat, setDownloadFormat] = useState<any | null>(null);

  const options = [
    {
      name: 'JSON Format',
      format: 'json',
      fn: (
        data: DownloadArgs['dataObject'],
        exportFileName: DownloadArgs['downloadName'],
      ) => downloadAsJson(data, exportFileName),
    },
    {
      name: 'CSV Format',
      format: 'csv',
      fn: (
        data: DownloadArgs['dataObject'],
        exportFileName: DownloadArgs['downloadName'],
      ) => downloadAsCsv(data, exportFileName),
    },
  ];

  // Detect if query has change by using the stringified params as a query key.
  const [queryKey, setQueryKey] = useState(['all-search-results', params]);

  useEffect(() => {
    const newKey = ['all-search-results', params];
    if (JSON.stringify(newKey) !== JSON.stringify(queryKey)) {
      setQueryKey(newKey);
    }
  }, [queryKey, params]);
  const {
    error,
    refetch: fetchDownloadData,
    isFetching,
  } = useQuery<any | undefined, Error>({
    queryKey,
    queryFn: ({ signal }) => {
      return fetchAllSearchResults(
        {
          q: params.q,
          extra_filter: params.extra_filter,
          sort: params.sort,
          fields: params.fields,
          advancedSearch: params.advancedSearch,
          use_metadata_score: params.use_metadata_score,
          // creates a column for each nested field for csv.
          dotfield:
            downloadFormat && downloadFormat?.format === 'csv' ? true : false,
        },
        signal,
        setPercentComplete,
      );
    },
    refetchOnWindowFocus: false,
    // Only enable query when download format is specified.
    enabled: !!downloadFormat,
    retry: false,
  });
  // Percent complete for download progress bar.
  const [percentComplete, setPercentComplete] = useState(0);

  const clearDownloadState = useCallback(() => {
    setPercentComplete(0);
    setDownloadFormat(null);
  }, []);

  useEffect(() => {
    let downloadTimeoutId: NodeJS.Timeout;

    // Function to trigger the download process.
    const initiateDownload = ({
      href,
      download,
    }: {
      href: string;
      download: string;
    }) => {
      const downloadLink = document.createElement('a');
      downloadLink.href = href;
      downloadLink.setAttribute('download', download);
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);

      downloadTimeoutId = setTimeout(clearDownloadState, 2000);
    };

    // Function to retrieve data and process it for downloading.
    const processDownloadData = async (): Promise<void> => {
      if (!downloadFormat?.fn) return;

      try {
        const response = await fetchDownloadData();
        const results = response.data?.results;
        if (results) {
          const downloadDetails = downloadFormat.fn(results, exportFileName);
          initiateDownload(downloadDetails);
        }
      } catch (error) {
        console.error('Error in data fetching for download:', error);
      }
    };

    processDownloadData();

    // Cleanup function to clear the download timeout.
    return () => {
      if (downloadTimeoutId) clearTimeout(downloadTimeoutId);
    };
  }, [downloadFormat, exportFileName, fetchDownloadData, clearDownloadState]);

  const queryClient = useQueryClient();

  return (
    <Flex alignItems='flex-end' flexDirection='column' {...props}>
      {/* Error */}
      {!!error && (
        <Text fontSize='xs' fontStyle='italic' color='error.default'>
          <Icon as={FaCircleExclamation} color='error.default' mr={1}></Icon>
          Something went wrong with the metadata download. Please try again.
        </Text>
      )}

      <Box maxW='300px'>
        {downloadFormat || percentComplete ? (
          <Flex flexDirection='column'>
            <Flex w='200px' alignItems='center'>
              <Progress.Root
                animated
                striped
                colorPalette='primary'
                width='100%'
                value={percentComplete || null}
              >
                <HStack gap='5'>
                  <Progress.Track flex={1}>
                    <Progress.Range />
                  </Progress.Track>
                  <Progress.ValueText color='page.placeholder'>
                    {percentComplete}%
                  </Progress.ValueText>
                </HStack>
              </Progress.Root>
            </Flex>
          </Flex>
        ) : (
          <></>
        )}

        {isFetching ? (
          // cancel query
          <Button
            colorPalette='primary'
            onClick={() => {
              queryClient.cancelQueries({ queryKey });
              clearDownloadState();
            }}
            variant='solid'
            size='sm'
            {...buttonProps}
          >
            <FaXmark />
            Cancel
          </Button>
        ) : (
          <Box position='relative'>
            <Button
              colorPalette='primary'
              onClick={onToggle}
              variant='solid'
              size='sm'
              loading={isFetching}
              loadingText='Downloading'
              w='100%'
              {...buttonProps}
            >
              <FaDownload />
              {children}
            </Button>
            <Box
              zIndex='dropdown'
              position='absolute'
              w='100%'
              boxShadow='base'
              borderRadius='semi'
              bg='white'
            >
              {open && (
                <List.Root as='ul' ml={0}>
                  {options.map((option, idx) => {
                    return (
                      <List.Item
                        key={option.name}
                        borderBottom={
                          idx < options.length - 1 ? '1px solid' : 'none'
                        }
                        borderColor='page.alt'
                      >
                        <Box
                          as='a'
                          w='100%'
                          display='block'
                          px={4}
                          py={2}
                          cursor='pointer'
                          _hover={{
                            bg: `${buttonProps?.colorPalette || 'primary'}.50`,
                          }}
                          onClick={async () => {
                            trackDownloadEvent({
                              label: `Download Metadata: From ${router.pathname}`,
                              event: 'download_metadata_click',
                              value: `downloadFormat: ${option.format}`,
                            });
                            onClose();
                            setPercentComplete(0);
                            setDownloadFormat(option);
                          }}
                        >
                          <Text fontWeight='semibold'>{option.name}</Text>
                        </Box>
                      </List.Item>
                    );
                  })}
                </List.Root>
              )}
            </Box>
          </Box>
        )}
      </Box>
      <Disclaimer isFetching={isFetching} />
    </Flex>
  );
};
