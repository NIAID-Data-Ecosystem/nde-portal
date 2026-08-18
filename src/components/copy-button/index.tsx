/*
 MIGRATION NOTE: The following Chakra UI hooks have been removed.
 Please replace them with the suggested alternatives:

//   - useClipboard: Use react-use: useCopyToClipboard

 See: https://chakra-ui.com/docs/get-started/migration#hooks
*/
import { Button, ButtonProps, Icon } from '@chakra-ui/react';
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
      colorPalette='primary'
      onClick={onCopy}
      {...buttonProps}
    >
      <FaCopy />
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
        colorPalette='gray'
        onClick={onCopy}
        aria-label={hasCopied ? copiedText : buttonText}
        gap={1}
        size='sm'
        {...buttonProps}
      >
        <Icon asChild>
          <FaRegCopy />
        </Icon>
        {hasCopied ? copiedText : ''}
      </Button>
    </Tooltip>
  );
};
