import {
  Button,
  Collapsible,
  Flex,
  FlexProps,
  Icon,
  Progress,
  Text,
} from '@chakra-ui/react';
import dynamic from 'next/dynamic';
import React from 'react';
import { FaCircleExclamation, FaXmark } from 'react-icons/fa6';

import { DownloadArgs } from '../helpers';

const Disclaimer = dynamic(() =>
  import('./Disclaimer').then(mod => mod.Disclaimer),
);

/*
 [COMPONENT INFO]: Download data button that gives JSON or CSV download options.
*/
export interface DownloadOption {
  name: string;
  format: string;
  fn: (
    data: DownloadArgs['dataObject'],
    exportFileName: DownloadArgs['downloadName'],
  ) => { href?: string; download?: string } | null;
}
interface DownloadMetadataProgressProps extends FlexProps {
  cancelQuery: () => void;
  downloadFormat: DownloadOption | null;
  error: Error | null;
  isFetching: boolean;
  percentComplete: number;
}

export const DownloadMetadataProgress: React.FC<DownloadMetadataProgressProps> =
  React.memo(
    ({ cancelQuery, downloadFormat, error, isFetching, percentComplete }) => {
      return (
        <Flex alignItems='flex-end' flexDirection='column' mb={2}>
          {/* Error */}
          <Collapsible.Root open={!!error}>
            <Collapsible.Content>
              <Text fontSize='xs' fontStyle='italic' color='error'>
                <Icon color='error' mr={1} asChild>
                  <FaCircleExclamation />
                </Icon>
                Something went wrong with the metadata download. Please try
                again.
              </Text>
            </Collapsible.Content>
          </Collapsible.Root>
          {isFetching && <Disclaimer isFetching={isFetching} />}
          <Flex maxW='300px'>
            {downloadFormat || percentComplete ? (
              <Flex flexDirection='column'>
                <Flex w='200px' alignItems='center'>
                  <Progress.Root
                    w='100%'
                    striped
                    value={percentComplete}
                    colorPalette='primary'
                    animated
                  >
                    <Progress.Track>
                      <Progress.Range />
                    </Progress.Track>
                  </Progress.Root>
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
                <Button
                  colorPalette='gray'
                  onClick={cancelQuery}
                  variant='outline'
                  size='xs'
                  fontWeight='normal'
                >
                  cancel
                  <FaXmark />
                </Button>
              </Flex>
            ) : (
              <></>
            )}
          </Flex>
        </Flex>
      );
    },
  );
