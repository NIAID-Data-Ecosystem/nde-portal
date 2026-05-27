import { Button, ButtonProps, Icon, useClipboard } from '@chakra-ui/react';
import { FaCopy, FaRegCopy } from 'react-icons/fa6';
import Tooltip from '../tooltip';

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

export const CopyIconButton = ({
  textToCopy,
  buttonText = 'Copy',
  copiedText = 'Copied!',
  buttonProps,
}: CopyButtonProps) => {
  const { onCopy, hasCopied } = useClipboard(textToCopy);

  return (
    <Tooltip label={hasCopied ? copiedText : buttonText} closeOnClick={false}>
      <Button
        variant='ghost'
        colorScheme='gray'
        onClick={onCopy}
        aria-label={hasCopied ? copiedText : buttonText}
        gap={2}
        size='sm'
        {...buttonProps}
      >
        <Icon as={FaRegCopy} />
        {hasCopied ? copiedText : ''}
      </Button>
    </Tooltip>
  );
};
