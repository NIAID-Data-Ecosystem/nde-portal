import React, { useCallback, useEffect, useState } from 'react';
import {
  Box,
  Button,
  ButtonProps,
  Collapse,
  Flex,
  FlexProps,
  ListItem,
  Text,
  UnorderedList,
  useDisclosure,
} from '@chakra-ui/react';
import { FaDownload } from 'react-icons/fa6';
import { useQuery, useQueryClient } from 'react-query';
import { Params, fetchAllSearchResults } from 'src/utils/api';
import { DownloadArgs, downloadAsCsv, downloadAsJson } from './helpers';
import dynamic from 'next/dynamic';

const DownloadMetadataProgress = dynamic(() =>
  import('./components/DownloadProgress').then(
    mod => mod.DownloadMetadataProgress,
  ),
);

// Options for download format and corresponding formatting functions.
export interface DownloadOption {
  name: string;
  format: string;
  fn: (
    data: DownloadArgs['dataObject'],
    exportFileName: DownloadArgs['downloadName'],
  ) => { href?: string; download?: string } | null;
}

/*
 [COMPONENT INFO]: Download data button that gives JSON or CSV download options.
*/
interface DownloadMetadataProps extends FlexProps {
  exportFileName: string;
  getQueryParams: () => Params;
  buttonProps?: ButtonProps;
}

export const DownloadMetadataButton: React.FC<DownloadMetadataProps> =
  React.memo(
    ({ getQueryParams, exportFileName, children, buttonProps, ...props }) => {
      // Toggle open/close a download format list.
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
      ] as DownloadOption[];
      const {
        isOpen: showOptions,
        onToggle: toggleOptions,
        onClose: closeOptions,
      } = useDisclosure();
      const params = getQueryParams();

      // Options for download format and corresponding formatting functions.
      const [downloadFormat, setDownloadFormat] =
        useState<DownloadOption | null>(null);

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
      } = useQuery<any | undefined, Error>(
        queryKey,
        ({ signal }) => {
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
                downloadFormat && downloadFormat?.format === 'csv'
                  ? true
                  : false,
            },
            signal,
            setPercentComplete,
          );
        },
        // Don't refresh everytime window is touched.
        {
          refetchOnWindowFocus: false,
          // cancel query when download format is not specified.
          enabled: !!downloadFormat,
          retry: false,
        },
      );
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
          href?: string;
          download?: string;
        }) => {
          if (!href || !download) return;
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
              const downloadDetails = downloadFormat.fn(
                results,
                exportFileName,
              );
              downloadDetails && initiateDownload(downloadDetails);
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
      }, [
        downloadFormat,
        exportFileName,
        fetchDownloadData,
        clearDownloadState,
      ]);

      const queryClient = useQueryClient();

      return (
        <Flex alignItems='flex-end' flexDirection='column' {...props}>
          {downloadFormat && (
            <DownloadMetadataProgress
              cancelQuery={() => {
                queryClient.cancelQueries(queryKey);
                clearDownloadState();
              }}
              downloadFormat={downloadFormat}
              error={error}
              isFetching={isFetching}
              percentComplete={percentComplete}
            />
          )}
          <Box position='relative'>
            <Button
              leftIcon={<FaDownload />}
              colorScheme='primary'
              onClick={toggleOptions}
              variant='outline'
              size='sm'
              w='100%'
              display={!!downloadFormat ? 'none' : 'flex'}
              {...buttonProps}
            >
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
              <Collapse in={showOptions}>
                <UnorderedList ml={0}>
                  {showOptions &&
                    options.map((option, idx) => {
                      return (
                        <ListItem
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
                              bg: `${buttonProps?.colorScheme || 'primary'}.50`,
                            }}
                            onClick={async () => {
                              closeOptions();
                              setPercentComplete(0);
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
    },
  );
