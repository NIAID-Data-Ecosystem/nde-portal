import { Button, ButtonProps, FlexProps, useClipboard } from '@chakra-ui/react';
import React from 'react';
import { FaCopy } from 'react-icons/fa6';

/*
 [COMPONENT INFO]: Button that copies [metadataObject] as string to clipboard.
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
      size='sm'
      leftIcon={<FaCopy />}
      colorScheme='primary'
      onClick={onCopy}
      {...buttonProps}
    >
      {hasCopied ? 'Metadata copied!' : 'Copy'}
    </Button>
  );
};
