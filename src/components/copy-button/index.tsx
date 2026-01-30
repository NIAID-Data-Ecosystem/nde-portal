import { Button, ButtonProps, useClipboard } from '@chakra-ui/react';
import { FaCopy } from 'react-icons/fa6';

/*
 [COMPONENT INFO]: Reusable button that copies a string to clipboard.
*/

interface CopyButtonProps {
  textToCopy: string;
  buttonText?: string;
  copiedText?: string;
  buttonProps?: ButtonProps;
}

export const CopyButton = ({
  textToCopy,
  buttonText = 'Copy',
  copiedText = 'Copied!',
  buttonProps,
}: CopyButtonProps) => {
  const { onCopy, hasCopied } = useClipboard(textToCopy);

  return (
    <Button
      variant='solid'
      leftIcon={<FaCopy />}
      colorScheme='primary'
      onClick={onCopy}
      {...buttonProps}
    >
      {hasCopied ? copiedText : buttonText}
    </Button>
  );
};
