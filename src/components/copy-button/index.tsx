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
  const { copy, copied } = useClipboard({ value: textToCopy });

  return (
    <Button
      variant='solid'
      colorPalette='primary'
      onClick={copy}
      {...buttonProps}
    >
      <FaCopy />
      {copied ? copiedText : buttonText}
    </Button>
  );
};

export const CopyIconButton = ({
  textToCopy,
  buttonText = 'Copy',
  copiedText = 'Copied!',
  buttonProps,
}: CopyButtonProps) => {
  const { copy, copied } = useClipboard({ value: textToCopy });

  return (
    <Tooltip content={copied ? copiedText : buttonText} closeOnClick={false}>
      <Button
        variant='ghost'
        colorPalette='gray'
        onClick={copy}
        aria-label={copied ? copiedText : buttonText}
        gap={1}
        size='sm'
        {...buttonProps}
      >
        <Icon>
          <FaRegCopy />
        </Icon>
        {copied ? copiedText : ''}
      </Button>
    </Tooltip>
  );
};
