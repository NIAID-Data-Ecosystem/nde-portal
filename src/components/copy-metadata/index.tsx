import { Button, ButtonProps, FlexProps } from '@chakra-ui/react';
import React from 'react';
import { FaCopy } from 'react-icons/fa6';
import { useCopyToClipboard } from 'usehooks-ts';

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
  const [copiedText, copy] = useCopyToClipboard();

  return (
    <Button
      variant='solid'
      leftIcon={<FaCopy />}
      colorScheme='primary'
      onClick={() => copy(metadataObject)}
      w='100%'
      px={{ base: 4, md: 6 }}
      {...buttonProps}
    >
      {copiedText ? 'Metadata copied!' : 'Copy Metadata'}
    </Button>
  );
};
