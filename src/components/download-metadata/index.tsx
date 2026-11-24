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
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { FaCircleExclamation, FaDownload } from 'react-icons/fa6';
import { FaXmark } from 'react-icons/fa6';
import { fetchAllSearchResults, Params } from 'src/utils/api';
import { formatAPIResource } from 'src/utils/api/helpers';
import { FormattedResource } from 'src/utils/api/types';
import { SHOW_XLSX_CUSTOM_VIEW_DOWNLOAD } from 'src/utils/feature-flags';

import { Disclaimer } from './components/Disclaimer';
import { DownloadArgs, downloadAsCsv, downloadAsJson } from './helpers';
import { downloadXlsxExport, prepareXlsxExport, XlsxColumnSpec } from './xlsx';

/*
 [COMPONENT INFO]: Download data button that gives JSON or CSV download options,
 plus an XLSX option mirroring a customized table view when `customViewExport`
 is provided.

 The format list is a `Menu`: it owns its own open state, so the button gets
 `aria-haspopup`/`aria-expanded`, the items are real `menuitem`s reachable by
 keyboard, and Escape / outside-click / focus-return are handled for us.
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

type DownloadDetails = { href?: string; download?: string } | null;

export interface DownloadOption {
  name: string;
  format: string;
  /** Builds the object URL + filename. Empty/null when there is no data. */
  fn: (
    data: DownloadArgs['dataObject'],
    exportFileName: DownloadArgs['downloadName'],
  ) => DownloadDetails | Promise<DownloadDetails>;
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
  /** Table view to export; adds the XLSX option to the menu when set. */
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
  options = DOWNLOAD_OPTIONS,
  maxW = '300px',
  progressWidth = '200px',
  customViewExport,
  ...props
}) => {
  const router = useRouter();

  // Options for download format and corresponding formatting functions.
  const [downloadFormat, setDownloadFormat] = useState<DownloadOption | null>(
    null,
  );
  // Label for the file-building phase that follows the fetch.
  const [buildStatus, setBuildStatus] = useState<string | null>(null);
  // Error raised while building the file (fetch errors come from useQuery).
  const [buildError, setBuildError] = useState<string | null>(null);
  // Read the table view at download time rather than when the option was
  // clicked, so the file reflects the columns shown when the data arrives.
  const customViewExportRef = useRef(customViewExport);
  customViewExportRef.current = customViewExport;

  // Memoized (it reads the view through the ref) so `downloadFormat` keeps a
  // stable identity across renders, like the hoisted `DOWNLOAD_OPTIONS`.
  const xlsxOption = useMemo<DownloadOption>(
    () => ({
      name: 'XLSX Format (Custom Result View)',
      format: 'xlsx',
      fn: async (data, exportFileName) => {
        const view = customViewExportRef.current;
        if (!view) return null;
        const records = Array.isArray(data) ? data : [data];
        const rows = records
          .map(record => formatAPIResource(record))
          .filter((resource): resource is FormattedResource => !!resource)
          .map(view.toRow);
        const prepared = prepareXlsxExport({
          sheetName: view.sheetName,
          columns: view.columns,
          rows,
        });
        // Downloads a .zip of several files when the rows don't fit in one.
        return downloadXlsxExport(prepared, exportFileName, {
          onProgress: (fileNumber, fileCount) =>
            setBuildStatus(
              fileCount > 1
                ? `Building file ${fileNumber} of ${fileCount}…`
                : 'Building file…',
            ),
        });
      },
    }),
    [],
  );

  const showXlsxOption = SHOW_XLSX_CUSTOM_VIEW_DOWNLOAD && !!customViewExport;
  const menuOptions = useMemo(
    () => (showXlsxOption ? [...options, xlsxOption] : options),
    [options, showXlsxOption, xlsxOption],
  );

  // Drives the trigger, the cancel button, the progress bar and the menu
  // highlight, so it is resolved once here instead of at each call site.
  const colorPalette = buttonProps?.colorPalette ?? DEFAULT_COLOR_PALETTE;

  const startDownload = (option: DownloadOption) => {
    setBuildError(null);
    setBuildStatus(null);
    setPercentComplete(0);
    setDownloadFormat(option);
  };

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
    setBuildStatus(null);
  }, []);

  // `percentComplete` is a number, so this must be coerced to a boolean before
  // it gates JSX — `0 && <x/>` renders a literal "0".
  const showProgress = !!downloadFormat || percentComplete > 0;

  const optionsByFormat = useMemo(
    () => new Map(menuOptions.map(option => [option.format, option])),
    [menuOptions],
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
          const details = await downloadFormat.fn(results, exportFileName);
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
        if (downloadFormat.format === 'xlsx') {
          setBuildError(
            'Something went wrong while building the XLSX file. Please try again, or download fewer results.',
          );
        }
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
      <Collapsible.Root open={!!error}>
        <Collapsible.Content>
          <Text fontSize='xs' fontStyle='italic' color='error'>
            <Icon as={FaCircleExclamation} color='error' mr={1} />
            Something went wrong with the metadata download. Please try again.
          </Text>
        </Collapsible.Content>
      </Collapsible.Root>
      <Collapsible.Root open={!!buildError}>
        <Collapsible.Content>
          <Text
            fontSize='xs'
            fontStyle='italic'
            color='error'
            maxW={maxW}
            role='alert'
          >
            <Icon as={FaCircleExclamation} color='error' mr={1} />
            {buildError}
          </Text>
        </Collapsible.Content>
      </Collapsible.Root>
      <Box maxW={maxW}>
        {showProgress && (
          <Flex flexDirection='column'>
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
            {buildStatus && (
              <Text
                fontSize='xs'
                color='text.placeholder'
                fontWeight='medium'
                role='status'
              >
                {buildStatus}
              </Text>
            )}
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
              startDownload(option);
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
                {menuOptions.map((option, idx) => (
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
      {downloadFormat?.format === 'xlsx' ? (
        // Shown right away, and kept while the files are built after fetching.
        <Disclaimer
          isFetching
          timeDelay={0}
          message='Note: XLSX downloads may be split into multiple files.'
        />
      ) : (
        <Disclaimer isFetching={isFetching} />
      )}
    </Flex>
  );
};
