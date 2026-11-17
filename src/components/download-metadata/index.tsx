import {
  Box,
  Button,
  ButtonProps,
  Collapse,
  Flex,
  FlexProps,
  Icon,
  ListItem,
  Progress,
  Text,
  UnorderedList,
  useDisclosure,
} from '@chakra-ui/react';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { FaDownload, FaCircleExclamation } from 'react-icons/fa6';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Params, fetchAllSearchResults } from 'src/utils/api';
import { DownloadArgs, downloadAsCsv, downloadAsJson } from './helpers';
import { XlsxColumnSpec, downloadAsXlsx } from './xlsx';
import { formatAPIResource } from 'src/utils/api/helpers';
import { FormattedResource } from 'src/utils/api/types';
import { SHOW_XLSX_CUSTOM_VIEW_DOWNLOAD } from 'src/utils/feature-flags';
import { Disclaimer } from './components/Disclaimer';
import { FaXmark } from 'react-icons/fa6';
import { encodeString } from 'src/utils/querystring-helpers';
import { sendGTMEvent } from '@next/third-parties/google';
import { useRouter } from 'next/router';

/*
 [COMPONENT INFO]: Download data button that gives JSON or CSV download options,
 plus an XLSX option mirroring a customized table view when `customViewExport`
 is provided.
*/

/**
 * Describes the table view to export as XLSX: the visible columns, in order,
 * and how to turn a formatted API record into the row those columns read.
 */
export interface CustomViewExport {
  sheetName: string;
  columns: XlsxColumnSpec[];
  toRow: (resource: FormattedResource) => Record<string, unknown>;
}

interface DownloadMetadataProps extends FlexProps {
  exportFileName: string;
  params: Params;
  buttonProps?: ButtonProps;
  customViewExport?: CustomViewExport;
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
  customViewExport,
  ...props
}) => {
  // Toggle open/close a download format list.
  const { isOpen, onToggle, onClose } = useDisclosure();
  const router = useRouter();

  // Options for download format and corresponding formatting functions.
  const [downloadFormat, setDownloadFormat] = useState<any | null>(null);

  // Read the table view at download time rather than when the option was
  // clicked, so the file reflects the columns shown when the data arrives.
  const customViewExportRef = useRef(customViewExport);
  customViewExportRef.current = customViewExport;

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
    ...(SHOW_XLSX_CUSTOM_VIEW_DOWNLOAD && customViewExport
      ? [
          {
            name: 'XLSX Format (Custom Result View)',
            format: 'xlsx',
            fn: (
              data: DownloadArgs['dataObject'],
              exportFileName: DownloadArgs['downloadName'],
            ) => {
              const view = customViewExportRef.current;
              if (!view) return null;
              const records = Array.isArray(data) ? data : [data];
              const rows = records
                .map(record => formatAPIResource(record))
                .filter((resource): resource is FormattedResource => !!resource)
                .map(view.toRow);
              return downloadAsXlsx(
                { sheetName: view.sheetName, columns: view.columns, rows },
                exportFileName,
              );
            },
          },
        ]
      : []),
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
          const downloadDetails = await downloadFormat.fn(
            results,
            exportFileName,
          );
          if (downloadDetails?.href && downloadDetails?.download) {
            initiateDownload(downloadDetails);
          } else {
            clearDownloadState();
          }
        }
      } catch (error) {
        console.error('Error in data fetching for download:', error);
        // Don't leave the progress bar running if building the file failed.
        clearDownloadState();
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
      <Collapse in={!!error}>
        <Text fontSize='xs' fontStyle='italic' color='status.error'>
          <Icon as={FaCircleExclamation} color='status.error' mr={1}></Icon>
          Something went wrong with the metadata download. Please try again.
        </Text>
      </Collapse>

      <Box maxW='300px'>
        {downloadFormat || percentComplete ? (
          <Flex flexDirection='column'>
            <Flex w='200px' alignItems='center'>
              <Progress
                w='100%'
                hasStripe
                value={percentComplete}
                colorScheme='primary'
                isIndeterminate={percentComplete === 0}
                isAnimated
              />
              <Text
                fontSize='xs'
                color='page.placeholder'
                textAlign='end'
                fontWeight='medium'
                ml={1}
              >
                {percentComplete}%
              </Text>
            </Flex>
          </Flex>
        ) : (
          <></>
        )}

        {isFetching ? (
          // cancel query
          <Button
            leftIcon={<FaXmark />}
            colorScheme='primary'
            onClick={() => {
              queryClient.cancelQueries({ queryKey });
              clearDownloadState();
            }}
            variant='solid'
            size='xs'
            fontSize='12px'
            {...buttonProps}
          >
            cancel
          </Button>
        ) : (
          <Box position='relative'>
            <Button
              leftIcon={<FaDownload />}
              colorScheme='primary'
              onClick={onToggle}
              variant='solid'
              size='sm'
              isLoading={isFetching}
              loadingText='Downloading'
              w='100%'
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
              <Collapse in={isOpen} animateOpacity>
                <UnorderedList ml={0}>
                  {options.map((option, idx) => {
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
                      </ListItem>
                    );
                  })}
                </UnorderedList>
              </Collapse>
            </Box>
          </Box>
        )}
      </Box>
      <Disclaimer isFetching={isFetching} />
    </Flex>
  );
};
