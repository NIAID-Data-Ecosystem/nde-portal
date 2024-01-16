import { Button, ButtonProps, FlexProps, useClipboard } from '@chakra-ui/react';
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
}) => {
  const { onCopy, hasCopied } = useClipboard(metadataObject);

  return (
    <Button
      variant='solid'
      leftIcon={<FaCopy />}
      colorScheme='primary'
      onClick={onCopy}
      w='100%'
      px={{ base: 4, md: 6 }}
      {...buttonProps}
    >
      {hasCopied ? 'Metadata copied!' : 'Copy Metadata'}
    </Button>
  );
};
