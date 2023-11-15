import {
  Box,
  Button,
  ButtonProps,
  Flex,
  FlexProps,
  useClipboard,
} from 'nde-design-system';
import React from 'react';
import { FaCopy } from 'react-icons/fa';

/*
 [COMPONENT INFO]: Button that copies string to clipboard.
*/

interface CopyMetadataProps extends FlexProps {
  metadataObject: string;
  buttonProps?: ButtonProps;
}

export const CopyMetadata: React.FC<CopyMetadataProps> = ({
  metadataObject,
  buttonProps,
  ...props
}) => {
  const { onCopy, hasCopied } = useClipboard(metadataObject);

  return (
    <Flex alignItems='flex-end' flexDirection='column' {...props}>
      <Box position='relative' w='100%'>
        {/* Simple button with */}
        <Button
          leftIcon={<FaCopy />}
          colorScheme='primary'
          onClick={onCopy}
          variant='solid'
          w='100%'
          px={{ base: 4, md: 6 }}
          {...buttonProps}
        >
          {hasCopied ? 'Metadata copied!' : 'Copy Metadata'}
        </Button>
      </Box>
    </Flex>
  );
};
