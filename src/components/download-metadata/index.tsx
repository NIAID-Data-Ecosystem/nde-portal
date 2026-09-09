import {
  Box,
  Button,
  ButtonProps,
  Collapsible,
  Flex,
  FlexProps,
  Icon,
  Menu,
  Progress,
  Text,
} from '@chakra-ui/react';
import { sendGTMEvent } from '@next/third-parties/google';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { FaCircleExclamation, FaDownload } from 'react-icons/fa6';
import { FaXmark } from 'react-icons/fa6';
import { fetchAllSearchResults, Params } from 'src/utils/api';

import { Disclaimer } from './components/Disclaimer';
import { DownloadArgs, downloadAsCsv, downloadAsJson } from './helpers';

/*
 [COMPONENT INFO]: Download data button that gives JSON or CSV download options.

 The format list is a `Menu`: it owns its own open state, so the button gets
 `aria-haspopup`/`aria-expanded`, the items are real `menuitem`s reachable by
 keyboard, and Escape / outside-click / focus-return are handled for us.
*/

export interface DownloadOption {
  name: string;
  format: string;
  /** Builds the object URL + filename. Empty/null when there is no data. */
  fn: (
    data: DownloadArgs['dataObject'],
    exportFileName: DownloadArgs['downloadName'],
  ) => { href?: string; download?: string } | null;
}

/*
 Hoisted out of the render body: the array is referenced (via `downloadFormat`)
 from the download effect, so a fresh identity every render meant a fresh
 `downloadFormat` object too.
*/
export const DOWNLOAD_OPTIONS: DownloadOption[] = [
  { name: 'JSON Format', format: 'json', fn: downloadAsJson },
  { name: 'CSV Format', format: 'csv', fn: downloadAsCsv },
];

/** How long the completed progress bar stays up before the UI resets. */
const DOWNLOAD_RESET_DELAY_MS = 2000;

const DEFAULT_COLOR_PALETTE = 'primary';

interface DownloadMetadataProps extends FlexProps {
  exportFileName: string;
  params: Params;
  buttonProps?: ButtonProps;
  /** Download formats offered in the menu. */
  options?: DownloadOption[];
  /** Width of the download progress bar row. */
  progressWidth?: FlexProps['w'];
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
  options = DOWNLOAD_OPTIONS,
  maxW = '300px',
  progressWidth = '200px',
  ...props
}) => {
  const router = useRouter();

  // Options for download format and corresponding formatting functions.
  const [downloadFormat, setDownloadFormat] = useState<DownloadOption | null>(
    null,
  );

  // Drives the trigger, the cancel button, the progress bar and the menu
  // highlight, so it is resolved once here instead of at each call site.
  const colorPalette = buttonProps?.colorPalette ?? DEFAULT_COLOR_PALETTE;

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

  // `percentComplete` is a number, so this must be coerced to a boolean before
  // it gates JSX — `0 && <x/>` renders a literal "0".
  const showProgress = !!downloadFormat || percentComplete > 0;

  const optionsByFormat = useMemo(
    () => new Map(options.map(option => [option.format, option])),
    [options],
  );

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

      downloadTimeoutId = setTimeout(
        clearDownloadState,
        DOWNLOAD_RESET_DELAY_MS,
      );
    };

    // Function to retrieve data and process it for downloading.
    const processDownloadData = async (): Promise<void> => {
      if (!downloadFormat?.fn) return;

      try {
        const response = await fetchDownloadData();
        const results = response.data?.results;
        if (results) {
          const details = downloadFormat.fn(results, exportFileName);
          if (details?.href && details?.download) {
            initiateDownload({
              href: details.href,
              download: details.download,
            });
          } else {
            // Nothing to write out — reset rather than stall on the progress bar.
            clearDownloadState();
          }
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
      <Collapsible.Root open={!!error}>
        <Collapsible.Content>
          <Text fontSize='xs' fontStyle='italic' color='error'>
            <Icon color='error' mr={1}>
              <FaCircleExclamation />
            </Icon>
            Something went wrong with the metadata download. Please try again.
          </Text>
        </Collapsible.Content>
      </Collapsible.Root>
      <Box maxW={maxW}>
        {showProgress && (
          <Flex w={progressWidth} alignItems='center'>
            <Progress.Root
              w='100%'
              striped
              value={percentComplete}
              colorPalette={colorPalette}
              animated
            >
              <Progress.Track>
                <Progress.Range />
              </Progress.Track>
            </Progress.Root>
            <Text
              fontSize='xs'
              color='text.placeholder'
              textAlign='end'
              fontWeight='medium'
              ml={1}
            >
              {percentComplete}%
            </Text>
          </Flex>
        )}

        {isFetching ? (
          // cancel query
          <Button
            colorPalette={colorPalette}
            onClick={() => {
              queryClient.cancelQueries({ queryKey });
              clearDownloadState();
            }}
            variant='solid'
            size='xs'
            {...buttonProps}
          >
            <FaXmark />
            cancel
          </Button>
        ) : (
          <Menu.Root
            positioning={{ sameWidth: true }}
            onSelect={({ value }) => {
              const option = optionsByFormat.get(value);
              if (!option) return;

              trackDownloadEvent({
                label: `Download Metadata: From ${router.pathname}`,
                event: 'download_metadata_click',
                value: `downloadFormat: ${option.format}`,
              });
              setPercentComplete(0);
              setDownloadFormat(option);
            }}
          >
            <Menu.Trigger asChild>
              <Button
                colorPalette={colorPalette}
                variant='solid'
                size='sm'
                w='100%'
                {...buttonProps}
              >
                <FaDownload />
                {children}
              </Button>
            </Menu.Trigger>
            <Menu.Positioner>
              <Menu.Content colorPalette={colorPalette}>
                {options.map((option, idx) => (
                  <React.Fragment key={option.format}>
                    {idx > 0 && <Menu.Separator />}
                    <Menu.Item
                      value={option.format}
                      fontWeight='semibold'
                      _highlighted={{ bg: 'colorPalette.50' }}
                    >
                      {option.name}
                    </Menu.Item>
                  </React.Fragment>
                ))}
              </Menu.Content>
            </Menu.Positioner>
          </Menu.Root>
        )}
      </Box>
      <Disclaimer isFetching={isFetching} />
    </Flex>
  );
};
