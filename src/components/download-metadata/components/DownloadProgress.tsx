import React from 'react';
import {
  Button,
  Collapse,
  Flex,
  FlexProps,
  Icon,
  Progress,
  Text,
} from '@chakra-ui/react';
import { FaCircleExclamation, FaXmark } from 'react-icons/fa6';
import dynamic from 'next/dynamic';
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
          <Collapse in={!!error}>
            <Text fontSize='xs' fontStyle='italic' color='error.default'>
              <Icon
                as={FaCircleExclamation}
                color='error.default'
                mr={1}
              ></Icon>
              Something went wrong with the metadata download. Please try again.
            </Text>
          </Collapse>

          {isFetching && <Disclaimer isFetching={isFetching} />}
          <Flex maxW='300px'>
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
                <Button
                  rightIcon={<FaXmark />}
                  colorScheme='gray'
                  onClick={cancelQuery}
                  variant='outline'
                  size='xs'
                  fontWeight='normal'
                >
                  cancel
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
